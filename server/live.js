// Cours en direct : sessions (dates, horaires, lien de visioconférence) réservées aux abonnés actifs du cours.
// Dès qu'un apprenant obtient l'accès (paiement, code cadeau, bourse), il reçoit automatiquement le lien par e-mail.
const { one, all, run } = require("./db");

const today = () => new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10); // date de Lubumbashi (UTC+2)
const current = (courseId) => all("SELECT * FROM live_sessions WHERE course_id = ? AND active = 1 AND ends_on >= ? ORDER BY starts_on", courseId, today());
const hasSub = (userId, courseId) => !!one("SELECT 1 FROM periods WHERE user_id = ? AND course_id = ? AND end_at > ? LIMIT 1", userId, courseId, new Date().toISOString());

async function notifyUser(userId, courseId) {
  const Mail = require("./mail");
  if (!Mail.provider() || !hasSub(userId, courseId)) return 0;
  const u = one("SELECT id, name, email, suspended FROM users WHERE id = ?", userId);
  if (!u || u.suspended) return 0;
  let n = 0;
  for (const s of current(courseId)) {
    if (one("SELECT 1 FROM live_notified WHERE session_id = ? AND user_id = ?", s.id, u.id)) continue;
    const r = await Mail.sendLive(u, s).catch(() => ({ sent: false }));
    if (r.sent) { run("INSERT OR IGNORE INTO live_notified(session_id, user_id) VALUES(?, ?)", s.id, u.id); n++; }
  }
  return n;
}
// Après une attribution d'accès : envoi en arrière-plan, sans bloquer le paiement.
function onAccess(userId, courseIds) { setImmediate(async () => { for (const c of courseIds) { try { await notifyUser(userId, c); } catch {} } }); }

// Envoi à tous les abonnés actifs qui ne l'ont pas encore reçu (ou à tous si resend).
async function notifyAll(sessionId, { resend = false } = {}) {
  const Mail = require("./mail");
  const s = one("SELECT * FROM live_sessions WHERE id = ?", sessionId);
  if (!s) return { sent: 0, total: 0 };
  if (!Mail.provider()) return { sent: 0, total: 0, error: "not_configured" };
  if (resend) run("DELETE FROM live_notified WHERE session_id = ?", s.id);
  const users = all(`SELECT DISTINCT u.id, u.name, u.email FROM periods p JOIN users u ON u.id = p.user_id
    WHERE p.course_id = ? AND p.end_at > ? AND u.suspended = 0
    AND NOT EXISTS (SELECT 1 FROM live_notified n WHERE n.session_id = ? AND n.user_id = u.id)`, s.course_id, new Date().toISOString(), s.id);
  let sent = 0;
  for (const u of users) {
    const r = await Mail.sendLive(u, s).catch(() => ({ sent: false }));
    if (r.sent) { run("INSERT OR IGNORE INTO live_notified(session_id, user_id) VALUES(?, ?)", s.id, u.id); sent++; }
  }
  return { sent, total: users.length };
}
const subscribersCount = (courseId) => (one("SELECT COUNT(DISTINCT user_id) AS n FROM periods WHERE course_id = ? AND end_at > ?", courseId, new Date().toISOString()) || {}).n || 0;

module.exports = { today, current, hasSub, notifyUser, onAccess, notifyAll, subscribersCount };
