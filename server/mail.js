// E-mails de NEXOMIA Academy : bienvenue, certificat, mot de passe oublié et bilan hebdomadaire.
// Envoi par l'API HTTPS de Brevo (BREVO_API_KEY) ou de Resend (RESEND_API_KEY).
// Expéditeur : MAIL_FROM, par exemple « NEXOMIA Academy <academy@nexomia360.com> ».
const crypto = require("node:crypto");
const { one, all, run, getSetting, setSetting, audit } = require("./db");
const L = require("./learning");

function provider() {
  if (process.env.BREVO_API_KEY) return "brevo";
  if (process.env.RESEND_API_KEY) return "resend";
  return null;
}
function sender() {
  const raw = process.env.MAIL_FROM || "NEXOMIA Academy <academy@nexomia360.com>";
  const m = raw.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1] || "NEXOMIA Academy", email: m[2] } : { name: "NEXOMIA Academy", email: raw.trim() };
}
const baseUrl = () => (process.env.PUBLIC_URL || "https://academy.nexomia360.com").replace(/\/$/, "");

// Lien de désinscription signé (sans connexion nécessaire).
function secret() {
  let s = getSetting("mail:secret", null);
  if (!s) { s = crypto.randomBytes(32).toString("hex"); setSetting("mail:secret", s); }
  return s;
}
const unsubToken = (userId) => crypto.createHmac("sha256", secret()).update("unsub:" + userId).digest("base64url").slice(0, 32);
const unsubUrl = (userId) => `${baseUrl()}/desabonnement/${userId}/${unsubToken(userId)}`;
function checkUnsub(userId, token) {
  const a = Buffer.from(unsubToken(userId)), b = Buffer.from(String(token || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function send({ to, name, subject, html, text, userId }) {
  const p = provider();
  if (!p) return { sent: false, reason: "not_configured" };
  const from = sender();
  const headers = userId ? { "List-Unsubscribe": `<${unsubUrl(userId)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined;
  let res;
  try {
    if (p === "brevo") {
      res = await fetch((process.env.BREVO_BASE_URL || "https://api.brevo.com") + "/v3/smtp/email", {
        method: "POST", headers: { "api-key": process.env.BREVO_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ sender: from, to: [{ email: to, name: name || to }], subject, htmlContent: html, textContent: text, headers, replyTo: process.env.MAIL_REPLY_TO ? { email: process.env.MAIL_REPLY_TO } : undefined }),
        signal: AbortSignal.timeout(20000),
      });
    } else {
      res = await fetch((process.env.RESEND_BASE_URL || "https://api.resend.com") + "/emails", {
        method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: `${from.name} <${from.email}>`, to: [to], subject, html, text, headers, reply_to: process.env.MAIL_REPLY_TO || undefined }),
        signal: AbortSignal.timeout(20000),
      });
    }
  } catch (e) { console.error(`[mail] ${p} : ${e.message}`); return { sent: false, reason: "network" }; }
  if (!res.ok) { const body = (await res.text().catch(() => "")).slice(0, 200); console.error(`[mail] ${p} HTTP ${res.status} ${body}`); return { sent: false, reason: `HTTP ${res.status}`, detail: body }; }
  return { sent: true };
}

// ---------- Mise en page ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const first = (n) => String(n || "").trim().split(/\s+/)[0] || "";
function layout({ preheader, title, body, cta, ctaUrl, userId }) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:#F3F6F2;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#16232E">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader || "")}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F6F2;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:4px 4px 16px"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
  <td style="width:28px;height:28px;background:#2F7D32;border-radius:7px"></td><td style="width:8px"></td>
  <td style="font-weight:800;font-size:18px;letter-spacing:.02em;color:#1E2D3B">NEXOMIA <span style="font-weight:600;color:#56646E;font-size:12px;letter-spacing:.14em">ACADEMY</span></td></tr></table></td></tr>
<tr><td style="background:#FFFFFF;border:1px solid #D3DDD2;border-radius:18px;padding:28px 26px">
  <h1 style="margin:0 0 14px;font-size:24px;line-height:1.2;color:#1E2D3B">${esc(title)}</h1>
  ${body}
  ${cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px"><tr><td style="background:#2F7D32;border-radius:12px"><a href="${esc(ctaUrl)}" style="display:inline-block;padding:13px 22px;color:#FFFFFF;font-weight:700;text-decoration:none;font-size:16px">${esc(cta)}</a></td></tr></table>` : ""}
</td></tr>
<tr><td style="padding:16px 8px;font-size:12px;line-height:1.5;color:#56646E;text-align:center">
  NEXOMIA SARL · Lubumbashi, République démocratique du Congo · <a href="${baseUrl()}" style="color:#56646E">${baseUrl().replace(/^https?:\/\//, "")}</a><br>
  ${userId ? `Tu reçois cet e-mail car tu suis un cours sur NEXOMIA Academy. <a href="${unsubUrl(userId)}" style="color:#56646E">Ne plus recevoir le bilan</a>` : ""}
</td></tr></table></td></tr></table></body></html>`;
}
const p = (t) => `<p style="margin:0 0 12px;font-size:16px;line-height:1.6">${t}</p>`;
const stat = (v, l) => `<td align="center" style="padding:12px 6px;background:#E7EEE6;border-radius:12px"><div style="font-size:24px;font-weight:800;color:#1E2D3B">${v}</div><div style="font-size:12px;color:#56646E">${l}</div></td>`;

// ---------- Messages ----------
async function sendWelcome(user) {
  const html = layout({ preheader: "Ta première leçon t'attend, et elle est gratuite.", title: `Bienvenue, ${first(user.name)} !`, userId: null,
    body: p("Ton compte NEXOMIA Academy est prêt. Voici comment bien démarrer :")
      + `<ol style="margin:0 0 12px;padding-left:20px;font-size:16px;line-height:1.7"><li>Passe le <b>test de niveau</b> (10 minutes) pour commencer au bon endroit.</li><li>Fais ta <b>première leçon gratuite</b> : écoute, répète, puis fais les exercices.</li><li>Reviens un peu chaque jour : ta série et tes points te suivent.</li></ol>`
      + p("Chaque lundi, tu recevras ton bilan de la semaine pour suivre tes progrès."),
    cta: "Passer le test de niveau", ctaUrl: `${baseUrl()}/#/test-niveau/anglais` });
  return send({ to: user.email, name: user.name, subject: "Bienvenue sur NEXOMIA Academy", html, text: `Bienvenue ${first(user.name)} ! Ton compte NEXOMIA Academy est prêt. Passe le test de niveau : ${baseUrl()}/#/test-niveau/anglais` });
}
async function sendCertificate(user, cert, courseTitle) {
  const url = `${baseUrl()}/#/certificat/${cert.code}`;
  const html = layout({ preheader: "Ton certificat est prêt à télécharger.", title: `Félicitations, ${first(user.name)} !`, userId: user.id,
    body: p(`Tu as validé toutes les leçons du niveau <b>${esc(cert.module)}</b> en ${esc(courseTitle)}. C'est une vraie étape.`)
      + p(`Ton certificat NEXOMIA est prêt. Tu peux le télécharger en PDF et le partager : il porte le code <b style="font-family:monospace">${esc(cert.code)}</b>, que n'importe quel employeur peut vérifier en ligne.`),
    cta: "Voir mon certificat", ctaUrl: url });
  return send({ to: user.email, name: user.name, subject: `Ton certificat ${cert.module.split("·")[0].trim()} est prêt`, html, text: `Félicitations ! Ton certificat ${cert.module} est prêt : ${url}`, userId: user.id });
}
async function sendReset(user, token) {
  const url = `${baseUrl()}/#/reinitialiser/${token}`;
  const html = layout({ preheader: "Lien valable 48 heures.", title: "Choisis un nouveau mot de passe", userId: null,
    body: p(`Bonjour ${esc(first(user.name))}, tu as demandé à changer ton mot de passe NEXOMIA Academy.`) + p("Le lien ci-dessous est valable 48 heures et ne fonctionne qu'une seule fois.")
      + p(`<span style="color:#56646E;font-size:14px">Si ce n'est pas toi, ignore cet e-mail : ton mot de passe actuel reste valable. L'équipe NEXOMIA ne te demandera jamais ton mot de passe ni ton code Mobile Money.</span>`),
    cta: "Choisir mon nouveau mot de passe", ctaUrl: url });
  return send({ to: user.email, name: user.name, subject: "Ton nouveau mot de passe NEXOMIA Academy", html, text: `Choisis ton nouveau mot de passe (lien valable 48 h) : ${url}` });
}

async function sendGift(orderId) {
  const o = one("SELECT o.id, o.gift_to, u.id AS uid, u.name, u.email FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = ?", orderId);
  const g = one("SELECT code, courses FROM gift_codes WHERE order_id = ?", orderId);
  if (!o || !g) return { sent: false };
  const titles = JSON.parse(g.courses).map((id) => (one("SELECT title FROM courses WHERE id = ?", id) || {}).title).filter(Boolean).join(", ");
  const url = `${baseUrl()}/#/cadeau/${g.code}`;
  const html = layout({ preheader: "Ton code cadeau est prêt à être envoyé.", title: "Merci pour ton cadeau !", userId: null,
    body: p(`${esc(first(o.name))}, ton abonnement offert${o.gift_to ? ` à <b>${esc(o.gift_to)}</b>` : ""} est payé : <b>${esc(titles)}</b>, un mois.`)
      + `<div style="margin:6px 0 16px;padding:18px;border-radius:14px;background:#E3F0D9;text-align:center"><div style="font-size:12px;letter-spacing:.14em;color:#56646E">CODE CADEAU</div><div style="font-family:monospace;font-size:24px;font-weight:800;color:#1E2D3B;margin-top:4px">${esc(g.code)}</div></div>`
      + p("Envoie ce lien à la personne : elle crée son compte gratuit, et son mois de cours démarre dès qu’elle active le code.")
      + p(`<a href="${url}" style="color:#2F7D32;word-break:break-all">${url}</a>`)
      + p(`<span style="color:#56646E;font-size:14px">Merci : chaque abonnement soutient aussi nos actions auprès des jeunes vulnérables.</span>`),
    cta: "Voir mon cadeau", ctaUrl: url });
  return send({ to: o.email, name: o.name, subject: "Ton code cadeau NEXOMIA Academy", html, text: `Merci ! Code cadeau : ${g.code}. Lien à envoyer : ${url}` });
}

// Bilan de la semaine écoulée (7 derniers jours).
function weeklyData(u) {
  const xpWeek = one("SELECT COALESCE(SUM(amount),0) AS x FROM xp_events WHERE user_id = ? AND day >= date('now','-6 days')", u.id).x;
  const lessonsWeek = one("SELECT COUNT(*) AS n FROM progress WHERE user_id = ? AND completed_at >= datetime('now','-7 days')", u.id).n;
  const minutes = Math.round(one("SELECT COALESCE(SUM(seconds),0) AS s FROM listening WHERE user_id = ? AND day >= date('now','-6 days')", u.id).s / 60);
  const set = L.activeDays(u.id), streak = L.streakOf(set);
  const certs = all("SELECT ce.module, ce.code, c.title FROM certificates ce JOIN courses c ON c.id = ce.course_id WHERE ce.user_id = ? AND ce.issued_at >= datetime('now','-7 days')", u.id);
  const reviews = L.reviewCounts(u.id);
  const next = one(`SELECT l.id, l.title, l.module, c.title AS course FROM lessons l JOIN courses c ON c.id = l.course_id
      LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ?
      WHERE c.status = 'published' AND p.completed_at IS NULL AND l.course_id IN (SELECT l2.course_id FROM progress p2 JOIN lessons l2 ON l2.id = p2.lesson_id WHERE p2.user_id = ?)
      ORDER BY (SELECT MAX(p3.updated_at) FROM progress p3 JOIN lessons l3 ON l3.id = p3.lesson_id WHERE p3.user_id = ? AND l3.course_id = l.course_id) DESC, l.position LIMIT 1`, u.id, u.id, u.id);
  const total = one("SELECT COUNT(*) AS n FROM progress WHERE user_id = ? AND completed_at IS NOT NULL", u.id).n;
  return { xpWeek, lessonsWeek, minutes, streak, certs, reviews, next, total, active: set.size > 0 };
}
async function sendWeekly(user) {
  const d = weeklyData(user);
  const good = d.xpWeek > 0;
  const nextUrl = d.next ? `${baseUrl()}/#/lecon/${d.next.id}` : `${baseUrl()}/#/cours`;
  const body = p(good ? `Bravo ${esc(first(user.name))}, voici ce que tu as accompli ces 7 derniers jours :` : `${esc(first(user.name))}, ta semaine a été calme sur NEXOMIA Academy. Dix minutes suffisent pour reprendre le fil :`)
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="6" style="margin:4px 0 14px"><tr>${stat(d.xpWeek, "points")}${stat(d.lessonsWeek, d.lessonsWeek > 1 ? "leçons validées" : "leçon validée")}${stat(d.streak, d.streak > 1 ? "jours de suite" : "jour de suite")}${stat(d.minutes, "min d'écoute")}</tr></table>`
    + (d.certs.length ? p(`🎓 <b>Nouveau certificat :</b> ${d.certs.map((c) => `${esc(c.title)} · ${esc(c.module)}`).join(", ")}. <a href="${baseUrl()}/#/certificat/${d.certs[0].code}" style="color:#2F7D32">Le télécharger</a>`) : "")
    + (d.reviews.due ? p(`🧠 <b>${d.reviews.due} mot${d.reviews.due > 1 ? "s" : ""} à réviser</b> pour ne pas les oublier. <a href="${baseUrl()}/#/revision" style="color:#2F7D32">Réviser en 2 minutes</a>`) : "")
    + (d.next ? p(`▶️ <b>Ta prochaine leçon :</b> ${esc(d.next.title)}${d.next.module ? ` (${esc(d.next.module)})` : ""}, ${esc(d.next.course)}.`) : "")
    + p(`<span style="color:#56646E;font-size:14px">Depuis ton inscription : ${d.total} leçon${d.total > 1 ? "s" : ""} validée${d.total > 1 ? "s" : ""}. Chaque petite séance compte.</span>`);
  const html = layout({ preheader: good ? `${d.xpWeek} points cette semaine. Continue !` : "Dix minutes pour reprendre le fil.", title: good ? "Ton bilan de la semaine" : "On garde le rythme ?", body, cta: d.next ? "Continuer ma leçon" : "Choisir un cours", ctaUrl: nextUrl, userId: user.id });
  const text = `Ton bilan NEXOMIA Academy : ${d.xpWeek} points, ${d.lessonsWeek} leçon(s), ${d.streak} jour(s) de suite, ${d.minutes} min d'écoute. Continuer : ${nextUrl}\nNe plus recevoir le bilan : ${unsubUrl(user.id)}`;
  return send({ to: user.email, name: user.name, subject: good ? `Ton bilan : ${d.xpWeek} points cette semaine` : "Ta leçon t'attend sur NEXOMIA Academy", html, text, userId: user.id });
}

// Envoi groupé du lundi (une fois par semaine), aux apprenants actifs ces 60 derniers jours ou inscrits depuis moins de 30 jours.
const isoWeek = (d = new Date()) => { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return `${t.getUTCFullYear()}-W${String(Math.ceil(((t - y) / 864e5 + 1) / 7)).padStart(2, "0")}`; };
const job = { running: false, sent: 0, failed: 0, total: 0, week: null, finished_at: null };
function recipients() {
  return all(`SELECT id, name, email FROM users u WHERE suspended = 0 AND email_progress = 1 AND (
      created_at >= datetime('now','-30 days')
      OR EXISTS (SELECT 1 FROM xp_events x WHERE x.user_id = u.id AND x.day >= date('now','-60 days'))
      OR EXISTS (SELECT 1 FROM listening li WHERE li.user_id = u.id AND li.day >= date('now','-60 days')))`);
}
async function runWeekly(force) {
  if (job.running || !provider()) return job;
  const week = isoWeek();
  if (!force && getSetting("mail:weekly", null) === week) return job;
  setSetting("mail:weekly", week);
  const list = recipients();
  Object.assign(job, { running: true, sent: 0, failed: 0, total: list.length, week, finished_at: null });
  for (const u of list) {
    const r = await sendWeekly(u).catch(() => ({ sent: false }));
    if (r.sent) { job.sent++; run("UPDATE users SET last_weekly = datetime('now') WHERE id = ?", u.id); } else job.failed++;
    await new Promise((res) => setTimeout(res, 250));
  }
  job.running = false; job.finished_at = new Date().toISOString();
  audit(null, "mail.weekly", { week, sent: job.sent, failed: job.failed });
  console.log(`[mail] bilan ${week} : ${job.sent} envoyés, ${job.failed} échecs`);
  return job;
}
// Le lundi à partir de 6 h UTC (8 h à Lubumbashi).
function startScheduler() {
  const tick = () => { const n = new Date(); if (n.getUTCDay() === 1 && n.getUTCHours() >= 6) runWeekly(false).catch((e) => console.error("[mail]", e.message)); };
  setTimeout(tick, 60e3); setInterval(tick, 15 * 60e3);
}
function status() { return { provider: provider(), from: sender(), recipients: recipients().length, lastWeek: getSetting("mail:weekly", null), job }; }

module.exports = { sendGift, provider, send, sendWelcome, sendCertificate, sendReset, sendWeekly, runWeekly, startScheduler, status, checkUnsub, unsubUrl };
