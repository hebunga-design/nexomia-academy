// Abonnements par cours, commandes et paiements (mode test + FlexPay).
// Règle d'or : un abonnement n'est activé qu'après vérification serveur du statut
// définitif, du montant et de la devise auprès du prestataire. Une commande payée
// n'active qu'une seule période par cours, même si la confirmation arrive plusieurs fois.
const crypto = require("node:crypto");
const { one, all, run, tx, audit } = require("./db");
const { HttpError } = require("./http");
const { totalFor, splitTotal, pricing } = require("./pricing");

// ---------- Périodes ----------
function addOneMonth(iso) {
  const d = new Date(iso);
  const day = d.getUTCDate();
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()));
  const last = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
  t.setUTCDate(Math.min(day, last));
  return t.toISOString();
}
function activeEnd(userId, courseId) {
  const r = one("SELECT MAX(end_at) AS e FROM periods WHERE user_id = ? AND course_id = ?", userId, courseId);
  return r && r.e && r.e > new Date().toISOString() ? r.e : null;
}
function activeSubs(userId) {
  const now = new Date().toISOString();
  return all(`SELECT p.course_id, MAX(p.end_at) AS end_at, c.title, c.slug FROM periods p JOIN courses c ON c.id = p.course_id
              WHERE p.user_id = ? GROUP BY p.course_id HAVING MAX(p.end_at) > ? ORDER BY end_at`, userId, now);
}

// ---------- Prestataires ----------
const FLEX = {
  token: process.env.FLEXPAY_TOKEN || "",
  merchant: process.env.FLEXPAY_MERCHANT || "",
  // Adresses à confirmer avec FlexPay lors de l'ouverture du compte marchand.
  paymentUrl: process.env.FLEXPAY_PAYMENT_URL || "https://backend.flexpay.cd/api/rest/v1/paymentService",
  cardUrl: process.env.FLEXPAY_CARD_URL || "https://cardpayment.flexpay.cd/v1.1/pay",
  checkUrl: process.env.FLEXPAY_CHECK_URL || "https://backend.flexpay.cd/api/rest/v1/check/{orderNumber}",
};
const flexpayEnabled = () => !!(FLEX.token && FLEX.merchant);

// pawaPay (API v2) : Mobile Money uniquement. Prioritaire dès que le jeton est renseigné.
const PAWA = {
  token: process.env.PAWAPAY_TOKEN || "",
  base: (process.env.PAWAPAY_BASE_URL || (process.env.PAWAPAY_SANDBOX === "true" ? "https://api.sandbox.pawapay.io" : "https://api.pawapay.io")).replace(/\/$/, ""),
  message: (process.env.PAWAPAY_CUSTOMER_MESSAGE || "NEXOMIA Academy").replace(/[^A-Za-z0-9 ]/g, "").slice(0, 22),
};
const pawapayEnabled = () => !!PAWA.token;
const PAWA_PROVIDERS = { mpesa: "VODACOM_MPESA_COD", airtel: "AIRTEL_COD", orange: "ORANGE_COD" };
const PAWA_METHOD = Object.fromEntries(Object.entries(PAWA_PROVIDERS).map(([k, v]) => [v, k]));
const PAWA_FAILURES = {
  PAYER_NOT_FOUND: "Ce numéro n’a pas de compte Mobile Money actif chez cet opérateur.",
  PAYMENT_NOT_APPROVED: "Le paiement n’a pas été validé sur le téléphone.",
  PAYER_LIMIT_REACHED: "La limite de ton compte Mobile Money est atteinte.",
  INSUFFICIENT_BALANCE: "Solde insuffisant sur ton compte Mobile Money.",
  PAYMENT_IN_PROGRESS: "Un autre paiement est déjà en cours sur ce numéro. Réessaie dans quelques minutes.",
  INVALID_PHONE_NUMBER: "Ce numéro n’est pas valide pour cet opérateur.",
  INVALID_AMOUNT: "Montant refusé par l’opérateur.",
  AMOUNT_OUT_OF_BOUNDS: "Montant refusé par l’opérateur (hors limites).",
  INVALID_CURRENCY: "Cet opérateur n’accepte pas cette devise.",
  INVALID_PROVIDER: "Cet opérateur n’est pas disponible pour le moment.",
  PROVIDER_TEMPORARILY_UNAVAILABLE: "Le réseau de l’opérateur est momentanément indisponible. Réessaie plus tard.",
};
const pawaFailure = (fr) => (fr && (PAWA_FAILURES[fr.failureCode] || fr.failureMessage)) || "Le paiement n’a pas abouti.";

const testModeEnabled = () => process.env.PAYMENTS_TEST_MODE !== "false" && !flexpayEnabled() && !pawapayEnabled();
function providerName() { return pawapayEnabled() ? "pawapay" : flexpayEnabled() ? "flexpay" : testModeEnabled() ? "test" : "none"; }

const METHODS = { mpesa: "M-Pesa", airtel: "Airtel Money", orange: "Orange Money", card: "Carte bancaire" };
// Moyens proposés selon le prestataire actif (pawaPay ne prend pas la carte).
function availableMethods() { return providerName() === "pawapay" ? ["mpesa", "airtel", "orange"] : Object.keys(METHODS); }

async function pawaFetch(path, body) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 25000);
  try {
    const r = await fetch(PAWA.base + path, {
      method: body ? "POST" : "GET", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${PAWA.token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await r.text();
    let json = null; try { json = JSON.parse(text); } catch {}
    return { http: r.status, json };
  } finally { clearTimeout(t); }
}
// Montant au format pawaPay : pas de zéro final inutile ("5", "8.5").
const pawaAmount = (x) => String(Math.round(x * 100) / 100);

function normalizePhone(p) {
  let d = String(p || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0") && d.length === 10) d = "243" + d.slice(1);
  if (d.length === 9) d = "243" + d;
  if (!/^243\d{9}$/.test(d)) throw new HttpError(400, "Numéro invalide. Exemple : +243 81 234 5678.");
  return d;
}

async function flexFetch(url, body) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, {
      method: body ? "POST" : "GET", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${FLEX.token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await r.text();
    try { return JSON.parse(text); } catch { return { code: "1", message: `Réponse inattendue (${r.status})` }; }
  } finally { clearTimeout(t); }
}

// ---------- Commandes ----------
function newRef() { return "NX-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomBytes(3).toString("hex").toUpperCase(); }

async function createOrder(user, { courseIds, method, phone }, baseUrl) {
  const provider = providerName();
  if (provider === "none") throw new HttpError(503, "Les paiements ne sont pas encore ouverts. Réessaie bientôt.");
  if (!METHODS[method]) throw new HttpError(400, "Choisis un moyen de paiement.");
  if (!availableMethods().includes(method)) throw new HttpError(400, "La carte bancaire n’est pas encore disponible. Choisis M-Pesa, Airtel Money ou Orange Money.");
  const ids = [...new Set((courseIds || []).map(Number))].filter(Boolean);
  if (!ids.length) throw new HttpError(400, "Choisis au moins un cours.");
  if (ids.length > 20) throw new HttpError(400, "Trop de cours dans une même commande.");
  const courses = ids.map((id) => one("SELECT id, title FROM courses WHERE id = ? AND status = 'published'", id));
  if (courses.some((c) => !c)) throw new HttpError(400, "Un des cours choisis n’est plus disponible.");
  const tel = method === "card" ? null : normalizePhone(phone);
  // Le montant est toujours calculé ici, jamais reçu du navigateur.
  const p = pricing();
  const amount = totalFor(courses.length, p);
  const parts = splitTotal(courses.length, amount);
  const ref = newRef();
  const orderId = tx(() => {
    const r = run("INSERT INTO orders(ref, user_id, amount_usd, currency, method, phone, provider) VALUES(?, ?, ?, 'USD', ?, ?, ?)", ref, user.id, amount, method, tel, provider);
    const oid = Number(r.lastInsertRowid);
    courses.forEach((c, i) => run("INSERT INTO order_items(order_id, course_id, unit_price) VALUES(?, ?, ?)", oid, c.id, parts[i]));
    return oid;
  });
  audit(user.id, "order_created", { ref, amount, method, provider, courses: ids });

  if (provider === "pawapay") {
    // On enregistre l'identifiant de paiement AVANT d'appeler pawaPay (recommandation pawaPay).
    const depositId = crypto.randomUUID();
    let providerCode = PAWA_PROVIDERS[method];
    try {
      // Corrige l'opérateur si le numéro appartient à un autre réseau que celui choisi.
      const pred = await pawaFetch("/v2/predict-provider", { phoneNumber: tel });
      if (pred.json && PAWA_METHOD[pred.json.provider]) providerCode = pred.json.provider;
    } catch {}
    const realMethod = PAWA_METHOD[providerCode];
    run("UPDATE orders SET provider_order = ?, method = ? WHERE id = ?", depositId, realMethod, orderId);
    let resp;
    try {
      resp = await pawaFetch("/v2/deposits", {
        depositId, amount: pawaAmount(amount), currency: "USD", clientReferenceId: ref, customerMessage: PAWA.message,
        payer: { type: "MMO", accountDetails: { phoneNumber: tel, provider: providerCode } },
        metadata: [{ orderRef: ref }, { userId: String(user.id) }],
      });
    } catch {
      run("UPDATE orders SET provider_message = ? WHERE id = ?", "Réponse incertaine : vérification en cours", orderId);
      return { ref, amount, status: "pending", message: "Nous vérifions ton paiement. Ne relance pas de paiement pour le moment." };
    }
    const st = resp.json && resp.json.status;
    if (st === "ACCEPTED" || st === "DUPLICATE_IGNORED") {
      const note = realMethod !== method ? `Numéro ${METHODS[realMethod]} détecté. ` : "";
      const msg = `${note}Valide le paiement de ${amount} USD sur ton téléphone (${METHODS[realMethod]}). Cette page se met à jour toute seule.`;
      run("UPDATE orders SET provider_message = ? WHERE id = ?", msg, orderId);
      return { ref, amount, status: "pending", message: msg };
    }
    if (st === "REJECTED") {
      const msg = pawaFailure(resp.json.failureReason);
      failOrder(orderId, msg);
      audit(user.id, "pawapay_rejected", { ref, failure: resp.json.failureReason });
      throw new HttpError(400, msg);
    }
    // 5xx ou réponse inattendue : la commande reste en attente et sera vérifiée.
    run("UPDATE orders SET provider_message = ? WHERE id = ?", "Réponse incertaine : vérification en cours", orderId);
    return { ref, amount, status: "pending", message: "Nous vérifions ton paiement. Ne relance pas de paiement pour le moment." };
  }

  if (provider === "flexpay") {
    const callbackUrl = `${baseUrl}/api/payments/flexpay/callback`;
    try {
      if (method === "card") {
        const resp = await flexFetch(FLEX.cardUrl, {
          authorization: `Bearer ${FLEX.token}`, merchant: FLEX.merchant, reference: ref, amount: String(amount), currency: "USD",
          description: `NEXOMIA Academy - ${courses.map((c) => c.title).join(", ")}`,
          callback_url: callbackUrl, approve_url: `${baseUrl}/#/abonnements?ref=${ref}`, cancel_url: `${baseUrl}/#/abonnements?ref=${ref}`, decline_url: `${baseUrl}/#/abonnements?ref=${ref}`, home_url: `${baseUrl}/#/abonnements?ref=${ref}`,
        });
        if (String(resp.code) !== "0" || !resp.url) { failOrder(orderId, resp.message || "Paiement par carte indisponible."); throw new HttpError(502, resp.message || "Le paiement par carte est indisponible pour le moment."); }
        run("UPDATE orders SET provider_order = ? WHERE id = ?", resp.orderNumber || null, orderId);
        return { ref, amount, status: "pending", redirect: resp.url };
      }
      const resp = await flexFetch(FLEX.paymentUrl, { merchant: FLEX.merchant, type: "1", phone: tel, reference: ref, amount: String(amount), currency: "USD", callbackUrl });
      if (String(resp.code) !== "0") { failOrder(orderId, resp.message); throw new HttpError(502, resp.message || "Le paiement n’a pas pu être lancé. Réessaie."); }
      run("UPDATE orders SET provider_order = ?, provider_message = ? WHERE id = ?", resp.orderNumber || null, resp.message || null, orderId);
      return { ref, amount, status: "pending", message: "Valide le paiement sur ton téléphone." };
    } catch (e) {
      if (e instanceof HttpError) throw e;
      // Réponse incertaine (réseau) : la commande reste en attente et sera vérifiée.
      run("UPDATE orders SET provider_message = ? WHERE id = ?", "Réponse incertaine : vérification en cours", orderId);
      return { ref, amount, status: "pending", message: "Nous vérifions ton paiement. Ne relance pas de paiement pour le moment." };
    }
  }
  return { ref, amount, status: "pending", test: true };
}

function failOrder(orderId, message) {
  run("UPDATE orders SET status = 'failed', provider_message = ? WHERE id = ? AND status = 'pending'", message || null, orderId);
}

// Activation idempotente : seule la transition pending -> paid crée les périodes.
function markPaid(orderId, source = "payment") {
  return tx(() => {
    const now = new Date().toISOString();
    const r = run("UPDATE orders SET status = 'paid', paid_at = ? WHERE id = ? AND status = 'pending'", now, orderId);
    if (r.changes !== 1) return false;
    const o = one("SELECT user_id FROM orders WHERE id = ?", orderId);
    for (const it of all("SELECT course_id FROM order_items WHERE order_id = ?", orderId)) {
      const cur = activeEnd(o.user_id, it.course_id);
      const start = cur && cur > now ? cur : now; // renouvellement anticipé : on ajoute à la suite
      run("INSERT OR IGNORE INTO periods(user_id, course_id, order_id, start_at, end_at, source) VALUES(?, ?, ?, ?, ?, ?)", o.user_id, it.course_id, orderId, start, addOneMonth(start), source);
    }
    audit(o.user_id, "order_paid", { orderId, source });
    return true;
  });
}

async function verifyWithPawapay(order) {
  if (order.provider !== "pawapay" || order.status !== "pending" || !order.provider_order || !pawapayEnabled()) return order;
  run("UPDATE orders SET last_check = ? WHERE id = ?", new Date().toISOString(), order.id);
  let resp;
  try { resp = await pawaFetch(`/v2/deposits/${encodeURIComponent(order.provider_order)}`); } catch { return order; }
  const j = resp.json;
  if (!j) return order;
  if (j.status === "NOT_FOUND") {
    // Jamais reçu par pawaPay : après 15 minutes, on considère l'envoi comme échoué.
    const ageMin = (Date.now() - new Date(order.created_at.replace(" ", "T") + "Z").getTime()) / 60000;
    if (ageMin > 15) failOrder(order.id, "Le paiement n’a pas été transmis. Tu peux réessayer.");
    return one("SELECT * FROM orders WHERE id = ?", order.id);
  }
  const d = j.data;
  if (j.status !== "FOUND" || !d) return order;
  if (d.status === "COMPLETED") {
    const okAmount = Math.abs(Number(d.amount) - order.amount_usd) < 0.01;
    const okCur = String(d.currency).toUpperCase() === order.currency;
    if (okAmount && okCur && d.depositId === order.provider_order) {
      if (d.providerTransactionId) run("UPDATE orders SET provider_message = ? WHERE id = ?", `Transaction opérateur ${d.providerTransactionId}`, order.id);
      markPaid(order.id, "pawapay");
    } else {
      failOrder(order.id, "Montant ou devise différents : vérification manuelle requise.");
      audit(order.user_id, "order_mismatch", { ref: order.ref, data: d });
    }
  } else if (d.status === "FAILED") {
    failOrder(order.id, pawaFailure(d.failureReason));
  }
  return one("SELECT * FROM orders WHERE id = ?", order.id);
}

const verifyOrder = (o) => o.provider === "pawapay" ? verifyWithPawapay(o) : o.provider === "flexpay" ? verifyWithFlexpay(o) : Promise.resolve(o);

async function verifyWithFlexpay(order) {
  if (order.provider !== "flexpay" || order.status !== "pending") return order;
  if (!order.provider_order) return order;
  run("UPDATE orders SET last_check = ? WHERE id = ?", new Date().toISOString(), order.id);
  let resp;
  try { resp = await flexFetch(FLEX.checkUrl.replace("{orderNumber}", encodeURIComponent(order.provider_order))); }
  catch { return order; }
  const t = resp && resp.transaction;
  if (!t) return order;
  const sameRef = !t.reference || t.reference === order.ref;
  const sameAmount = t.amount === undefined || Math.abs(Number(t.amount) - order.amount_usd) < 0.01;
  const sameCur = !t.currency || String(t.currency).toUpperCase() === order.currency;
  if (String(t.status) === "0" && sameRef && sameAmount && sameCur) markPaid(order.id, "flexpay");
  else if (String(t.status) === "1") failOrder(order.id, resp.message || "Paiement refusé ou annulé.");
  else if (String(t.status) === "0") { failOrder(order.id, "Montant ou devise différents : vérification manuelle requise."); audit(order.user_id, "order_mismatch", { ref: order.ref, t }); }
  return one("SELECT * FROM orders WHERE id = ?", order.id);
}

async function orderStatus(user, ref) {
  let o = one("SELECT * FROM orders WHERE ref = ? AND user_id = ?", ref, user.id);
  if (!o) throw new HttpError(404, "Commande introuvable.");
  if (o.status === "pending" && (o.provider === "flexpay" || o.provider === "pawapay")) {
    const recent = o.last_check && Date.now() - new Date(o.last_check).getTime() < 4000;
    if (!recent) o = await verifyOrder(o);
  }
  return publicOrder(o);
}
function publicOrder(o) {
  const items = all("SELECT oi.course_id, oi.unit_price, c.title FROM order_items oi JOIN courses c ON c.id = oi.course_id WHERE oi.order_id = ?", o.id);
  return { ref: o.ref, status: o.status, amount: o.amount_usd, currency: o.currency, method: METHODS[o.method] || o.method, provider: o.provider, message: o.provider_message, created_at: o.created_at, paid_at: o.paid_at, items };
}

// Rapprochement périodique des paiements FlexPay en attente (48 h max).
function startReconciliation() {
  setInterval(async () => {
    if (!flexpayEnabled() && !pawapayEnabled()) return;
    const since = new Date(Date.now() - 48 * 3600e3).toISOString().replace("T", " ").slice(0, 19);
    for (const o of all("SELECT * FROM orders WHERE status = 'pending' AND provider IN ('flexpay','pawapay') AND created_at > ? LIMIT 50", since)) {
      try { await verifyOrder(o); } catch (e) { console.error("rapprochement", o.ref, e.message); }
    }
    run("UPDATE orders SET status = 'cancelled', provider_message = 'Expirée sans confirmation' WHERE status = 'pending' AND created_at <= ?", since);
  }, 2 * 60e3).unref();
}

module.exports = { addOneMonth, activeEnd, activeSubs, createOrder, orderStatus, publicOrder, markPaid, failOrder, verifyWithFlexpay, verifyWithPawapay, verifyOrder, startReconciliation, providerName, flexpayEnabled, pawapayEnabled, testModeEnabled, availableMethods, METHODS };
