// Motivation et suivi pédagogique : points, série, objectif du jour, badges,
// certificats par niveau et révisions espacées.
const crypto = require("node:crypto");
const { one, all, run } = require("./db");

const today = () => new Date().toISOString().slice(0, 10);

// Points : chaque événement n'est compté qu'une fois grâce à sa référence.
function award(userId, kind, ref, amount) {
  if (amount <= 0) return 0;
  const r = run("INSERT OR IGNORE INTO xp_events(user_id, kind, ref, amount) VALUES(?, ?, ?, ?)", userId, kind, String(ref), Math.round(amount));
  return r.changes ? Math.round(amount) : 0;
}
const totalXp = (u) => one("SELECT COALESCE(SUM(amount),0) AS x FROM xp_events WHERE user_id = ?", u).x;
const xpOn = (u, day) => one("SELECT COALESCE(SUM(amount),0) AS x FROM xp_events WHERE user_id = ? AND day = ?", u, day).x;

// Jours actifs : écoute ou points gagnés.
function activeDays(u) {
  return new Set([
    ...all("SELECT day FROM listening WHERE user_id = ? AND seconds > 0 AND day >= date('now','-400 days')", u).map((d) => d.day),
    ...all("SELECT DISTINCT day FROM xp_events WHERE user_id = ? AND day >= date('now','-400 days')", u).map((d) => d.day),
  ]);
}
function streakOf(set) {
  const iso = (x) => x.toISOString().slice(0, 10);
  let n = 0; const d = new Date();
  if (!set.has(iso(d))) d.setUTCDate(d.getUTCDate() - 1);
  while (set.has(iso(d))) { n++; d.setUTCDate(d.getUTCDate() - 1); }
  return n;
}
function bestStreak(set) {
  const days = [...set].sort(); let best = 0, cur = 0, prev = null;
  for (const d of days) { cur = prev && (Date.parse(d) - Date.parse(prev) === 864e5) ? cur + 1 : 1; best = Math.max(best, cur); prev = d; }
  return best;
}

// Points d'une série d'exercices : 2 par bonne réponse, +10 si validée (une fois par jour et par leçon),
// +20 la première fois qu'une leçon est validée.
function lessonXp(userId, lessonId, correct, passed) {
  let g = award(userId, "practice", `${lessonId}:${today()}`, correct * 2 + (passed ? 10 : 0));
  if (passed) g += award(userId, "lesson", lessonId, 20);
  return g;
}

// Certificat : délivré quand toutes les leçons d'un niveau sont validées.
function maybeCertificate(user, lesson) {
  if (!lesson.module) return null;
  const mod = all(`SELECT l.id, p.completed_at, p.best_score FROM lessons l LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ?
                   WHERE l.course_id = ? AND l.module = ?`, user.id, lesson.course_id, lesson.module);
  if (!mod.length || mod.some((m) => !m.completed_at)) return null;
  if (one("SELECT 1 FROM certificates WHERE user_id = ? AND course_id = ? AND module = ?", user.id, lesson.course_id, lesson.module)) return null;
  const code = "NX-" + crypto.randomBytes(5).toString("hex").toUpperCase();
  const avg = Math.round(mod.reduce((a, m) => a + (m.best_score || 0), 0) / mod.length);
  run("INSERT INTO certificates(code, user_id, course_id, module, name, lessons, avg_score) VALUES(?, ?, ?, ?, ?, ?, ?)", code, user.id, lesson.course_id, lesson.module, user.name, mod.length, avg);
  award(user.id, "certificate", code, 100);
  return { code, module: lesson.module };
}
function certificate(code) {
  return one(`SELECT ce.code, ce.module, ce.name, ce.lessons, ce.avg_score, ce.issued_at, c.title AS course, c.slug
              FROM certificates ce JOIN courses c ON c.id = ce.course_id WHERE ce.code = ?`, String(code || "").toUpperCase());
}
const certificatesOf = (u) => all(`SELECT ce.code, ce.module, ce.issued_at, c.title AS course FROM certificates ce JOIN courses c ON c.id = ce.course_id WHERE ce.user_id = ? ORDER BY ce.issued_at`, u);

// Badges calculés à partir de l'activité.
const BADGES = [
  ["first", "Premier pas", "Valider ta première leçon", (s) => s.lessons >= 1],
  ["ten", "Sur la lancée", "Valider 10 leçons", (s) => s.lessons >= 10],
  ["thirty", "Marathonien", "Valider 30 leçons", (s) => s.lessons >= 30],
  ["streak3", "Régulier", "3 jours de suite", (s) => s.best >= 3],
  ["streak7", "Une semaine pleine", "7 jours de suite", (s) => s.best >= 7],
  ["streak30", "Inarrêtable", "30 jours de suite", (s) => s.best >= 30],
  ["xp500", "500 points", "Gagner 500 points", (s) => s.xp >= 500],
  ["xp2000", "2 000 points", "Gagner 2 000 points", (s) => s.xp >= 2000],
  ["perfect", "Sans faute", "Obtenir 100 % à une leçon", (s) => s.perfect >= 1],
  ["placement", "Je connais mon niveau", "Passer le test de niveau", (s) => s.placement],
  ["cert", "Diplômé", "Obtenir un certificat de niveau", (s) => s.certs >= 1],
  ["review", "Bonne mémoire", "Faire 5 séances de révision", (s) => s.reviews >= 5],
];
function badgesOf(u, ctx) {
  const st = {
    lessons: one("SELECT COUNT(*) AS n FROM progress WHERE user_id = ? AND completed_at IS NOT NULL", u).n,
    perfect: one("SELECT COUNT(*) AS n FROM progress WHERE user_id = ? AND best_score = 100", u).n,
    certs: one("SELECT COUNT(*) AS n FROM certificates WHERE user_id = ?", u).n,
    reviews: one("SELECT COUNT(*) AS n FROM xp_events WHERE user_id = ? AND kind = 'review'", u).n,
    placement: !!one("SELECT 1 FROM xp_events WHERE user_id = ? AND kind = 'placement'", u),
    ...ctx,
  };
  return BADGES.map(([id, title, how, test]) => ({ id, title, how, earned: !!test(st) }));
}

// Classement amical de la semaine (prénom et initiale seulement).
function weeklyBoard(u) {
  const rows = all(`SELECT x.user_id, u.name, SUM(x.amount) AS xp FROM xp_events x JOIN users u ON u.id = x.user_id
                    WHERE x.day >= date('now', '-6 days') AND u.suspended = 0 GROUP BY x.user_id ORDER BY xp DESC LIMIT 10`);
  const short = (n) => { const p = String(n).trim().split(/\s+/); return p[0] + (p[1] ? " " + p[1][0].toUpperCase() + "." : ""); };
  const board = rows.map((r, i) => ({ rank: i + 1, name: short(r.name), xp: r.xp, me: r.user_id === u }));
  if (!board.some((b) => b.me)) {
    const mine = one("SELECT COALESCE(SUM(amount),0) AS xp FROM xp_events WHERE user_id = ? AND day >= date('now', '-6 days')", u).xp;
    if (mine > 0) board.push({ rank: null, name: "Toi", xp: mine, me: true });
  }
  return board;
}

// Révisions espacées (système de Leitner) : intervalles en jours selon la boîte.
const INTERVALS = [0, 1, 3, 7, 16, 35];
function addToReview(u, lessonId, items) {
  for (const it of items) run("INSERT OR IGNORE INTO reviews(user_id, item, lesson_id) VALUES(?, ?, ?)", u, String(it).slice(0, 400), lessonId);
}
function dueReviews(u, limit = 12) {
  return all(`SELECT r.item, r.lesson_id, r.box, v.meaning, c.lang FROM reviews r
              JOIN lessons l ON l.id = r.lesson_id JOIN courses c ON c.id = l.course_id
              LEFT JOIN vocab v ON v.lesson_id = r.lesson_id AND v.term = r.item
              WHERE r.user_id = ? AND r.due <= date('now') AND v.term IS NOT NULL
              ORDER BY r.box, r.due LIMIT ?`, u, limit);
}
function reviewCounts(u) {
  return {
    due: one("SELECT COUNT(*) AS n FROM reviews r JOIN vocab v ON v.lesson_id = r.lesson_id AND v.term = r.item WHERE r.user_id = ? AND r.due <= date('now')", u).n,
    total: one("SELECT COUNT(*) AS n FROM reviews WHERE user_id = ?", u).n,
    mastered: one("SELECT COUNT(*) AS n FROM reviews WHERE user_id = ? AND box >= 4", u).n,
  };
}
function gradeReview(u, lessonId, item, knew) {
  const r = one("SELECT box FROM reviews WHERE user_id = ? AND item = ? AND lesson_id = ?", u, item, lessonId);
  if (!r) return null;
  const box = knew ? Math.min(r.box + 1, INTERVALS.length - 1) : 0;
  const days = knew ? INTERVALS[box] : 0;
  run(`UPDATE reviews SET box = ?, due = date('now', ?), seen = seen + 1, wrong = wrong + ? WHERE user_id = ? AND item = ? AND lesson_id = ?`, box, `+${days} days`, knew ? 0 : 1, u, item, lessonId);
  return { box, days };
}

module.exports = { today, award, totalXp, xpOn, activeDays, streakOf, bestStreak, lessonXp, maybeCertificate, certificate, certificatesOf, badgesOf, weeklyBoard, addToReview, dueReviews, reviewCounts, gradeReview };
