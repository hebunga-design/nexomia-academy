// Cours en direct : sessions (dates, horaires, lien de visioconférence) réservées aux abonnés actifs du cours.
// Dès qu'un apprenant obtient l'accès (paiement, code cadeau, bourse), il reçoit automatiquement le lien par e-mail.
const { one, all, run, getSetting, setSetting } = require("./db");

const today = () => new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10); // date de Lubumbashi (UTC+2)
const current = (courseId) => all("SELECT * FROM live_sessions WHERE course_id = ? AND active = 1 AND ends_on >= ? ORDER BY starts_on", courseId, today());
const hasSub = (userId, courseId) => !!one("SELECT 1 FROM periods WHERE user_id = ? AND course_id = ? AND end_at > ? LIMIT 1", userId, courseId, new Date().toISOString());

// Places limitées : les premiers abonnés qui se présentent (ou reçoivent le lien) gardent leur place.
const seatsTaken = (sessionId) => (one("SELECT COUNT(*) AS n FROM live_seats WHERE session_id = ?", sessionId) || {}).n || 0;
function seatOf(userId, s) {
  if (s.free) return true;
  if (!s.places || s.places <= 0) return true;
  if (one("SELECT 1 FROM live_seats WHERE session_id = ? AND user_id = ?", s.id, userId)) return true;
  if (!hasSub(userId, s.course_id) || seatsTaken(s.id) >= s.places) return false;
  run("INSERT OR IGNORE INTO live_seats(session_id, user_id) VALUES(?, ?)", s.id, userId);
  return true;
}

async function notifyUser(userId, courseId) {
  const Mail = require("./mail");
  if (!Mail.provider() || !hasSub(userId, courseId)) return 0;
  const u = one("SELECT id, name, email, suspended FROM users WHERE id = ?", userId);
  if (!u || u.suspended) return 0;
  let n = 0;
  for (const s of current(courseId)) {
    if (one("SELECT 1 FROM live_notified WHERE session_id = ? AND user_id = ?", s.id, u.id)) continue;
    if (!seatOf(u.id, s)) continue;
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
    if (!seatOf(u.id, s)) continue;
    const r = await Mail.sendLive(u, s).catch(() => ({ sent: false }));
    if (r.sent) { run("INSERT OR IGNORE INTO live_notified(session_id, user_id) VALUES(?, ?)", s.id, u.id); sent++; }
  }
  return { sent, total: users.length };
}
const subscribersCount = (courseId) => (one("SELECT COUNT(DISTINCT user_id) AS n FROM periods WHERE course_id = ? AND end_at > ?", courseId, new Date().toISOString()) || {}).n || 0;

// Formation accélérée de 21 jours (débutants) : créée une seule fois au démarrage si aucune session n'existe,
// puis le lien est envoyé aux abonnés actifs (dans la limite des places).
function bootstrap() {
  if (getSetting("live:boot-21j", false)) return null;
  const c = one("SELECT id FROM courses WHERE slug = 'anglais'");
  if (!c) return null;
  const existing = one("SELECT * FROM live_sessions WHERE course_id = ? AND active = 1 AND ends_on >= ? ORDER BY starts_on LIMIT 1", c.id, today());
  let id;
  if (existing) { id = existing.id; if (!existing.places) run("UPDATE live_sessions SET places = 20 WHERE id = ?", id); }
  else {
    id = Number(run(`INSERT INTO live_sessions(course_id, title, level, starts_on, ends_on, schedule, link, notes, active, places) VALUES(?, ?, ?, ?, ?, ?, '', ?, 1, 20)`, c.id,
      "Formation accélérée d’anglais en 21 jours (débutants)", "A1 · Débutant", "2026-11-27", "2027-01-20",
      "Lundi, mercredi et vendredi : 19 h 00 – 20 h 30\nPas de cours les 25 décembre, 1er janvier et 4 janvier (jours fériés)",
      "Premier cours : vendredi 27 novembre à 19 h. Une leçon par cours, dans l’ordre des leçons A1 de l’application ; examen A1 le mercredi 20 janvier. Prévoir un cahier, des écouteurs et une bonne connexion. 20 places : les 20 premiers abonnés.").lastInsertRowid);
  }
  if (!one("SELECT 1 FROM live_sessions WHERE course_id = ? AND free = 1", c.id))
    run(`INSERT INTO live_sessions(course_id, title, level, starts_on, ends_on, schedule, link, notes, active, places, free) VALUES(?, ?, ?, ?, ?, ?, '', ?, 1, 0, 1)`, c.id,
      "Club d’anglais du dimanche : session de partage gratuite", "Tous niveaux", "2026-11-29", "2027-06-27",
      "Chaque dimanche : 19 h 00 – 20 h 30",
      "Gratuit et ouvert à tous les inscrits, abonnés ou non : on parle anglais, on joue et on partage ses progrès. Créez simplement un compte gratuit pour entrer dans la classe.");
  setSetting("live:boot-21j", id);
  setImmediate(() => notifyAll(id).catch(() => {}));
  return id;
}

module.exports = { today, current, hasSub, seatOf, seatsTaken, notifyUser, onAccess, notifyAll, subscribersCount, bootstrap };
