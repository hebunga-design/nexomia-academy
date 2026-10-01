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
const testModeEnabled = () => process.env.PAYMENTS_TEST_MODE !== "false" && !flexpayEnabled();
function providerName() { return flexpayEnabled() ? "flexpay" : testModeEnabled() ? "test" : "none"; }

const METHODS = { mpesa: "M-Pesa", airtel: "Airtel Money", orange: "Orange Money", card: "Carte bancaire" };

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
  if (o.status === "pending" && o.provider === "flexpay") {
    const recent = o.last_check && Date.now() - new Date(o.last_check).getTime() < 4000;
    if (!recent) o = await verifyWithFlexpay(o);
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
    if (!flexpayEnabled()) return;
    const since = new Date(Date.now() - 48 * 3600e3).toISOString().replace("T", " ").slice(0, 19);
    for (const o of all("SELECT * FROM orders WHERE status = 'pending' AND provider = 'flexpay' AND created_at > ? LIMIT 50", since)) {
      await verifyWithFlexpay(o);
    }
    run("UPDATE orders SET status = 'cancelled', provider_message = 'Expirée sans confirmation' WHERE status = 'pending' AND created_at <= ?", since);
  }, 5 * 60e3).unref();
}

module.exports = { addOneMonth, activeEnd, activeSubs, createOrder, orderStatus, publicOrder, markPaid, failOrder, verifyWithFlexpay, startReconciliation, providerName, flexpayEnabled, testModeEnabled, METHODS };
