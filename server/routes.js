// Routes de l'API NEXOMIA Academy.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { one, all, run, tx, audit, setSetting, AUDIO_DIR } = require("./db");
const { createRouter, readJson, readBody, send, serveFile, HttpError } = require("./http");
const A = require("./auth");
const B = require("./billing");
const C = require("./content");
const { pricing, totalFor, validatePricing } = require("./pricing");
const L = require("./learning");
const Mail = require("./mail");
const PLACEMENT = { anglais: require("./courses/anglais/placement") };

const r = createRouter();
const ok = (ctx, body, status = 200) => send(ctx.res, status, body);
const nowIso = () => new Date().toISOString();

// ---------- Accès ----------
function isStaff(user) { return A.can(user, "creator"); }
function hasAccess(user, lesson) {
  if (lesson.position === 1) return true;                      // première leçon gratuite
  if (!user) return false;
  if (isStaff(user)) return true;
  return !!B.activeEnd(user.id, lesson.course_id);
}
function courseVisible(user, c) { return c && (c.status === "published" || isStaff(user)); }

// ---------- Santé ----------
r.get("/health", (ctx) => ok(ctx, { ok: true, time: nowIso() }));

// ---------- Comptes ----------
r.get("/api/me", (ctx) => ok(ctx, { user: ctx.user, payments: B.providerName(), methods: B.availableMethods() }));
r.post("/api/auth/register", async (ctx) => {
  A.throttle("reg:" + ctx.ip, 10);
  const b = await readJson(ctx.req);
  const id = A.register(b);
  A.createSession(ctx.res, id, ctx.secure);
  Mail.sendWelcome(one("SELECT id, name, email FROM users WHERE id = ?", id)).catch(() => {});
  ok(ctx, { user: one("SELECT id, name, email, phone, role FROM users WHERE id = ?", id) }, 201);
});
r.post("/api/auth/login", async (ctx) => {
  const b = await readJson(ctx.req);
  A.throttle("login:" + ctx.ip + ":" + String(b.email || "").toLowerCase());
  const id = A.login(b);
  A.createSession(ctx.res, id, ctx.secure);
  ok(ctx, { user: one("SELECT id, name, email, phone, role FROM users WHERE id = ?", id) });
});
r.post("/api/auth/logout", (ctx) => { A.destroySession(ctx.req, ctx.res, ctx.secure); ok(ctx, { ok: true }); });
// Mot de passe oublié : la réponse est toujours la même, pour ne pas révéler quelles adresses existent.
r.post("/api/auth/forgot", async (ctx) => {
  A.throttle("forgot:" + ctx.ip, 5, 60 * 60e3);
  const b = await readJson(ctx.req);
  const email = String(b.email || "").trim().toLowerCase();
  if (!Mail.provider()) return ok(ctx, { ok: true, mail: false });
  A.throttle("forgot:" + email, 3, 60 * 60e3);
  const u = one("SELECT id, name, email, suspended FROM users WHERE email = ?", email);
  if (u && !u.suspended) { const token = A.createResetToken(u.id); Mail.sendReset(u, token).catch(() => {}); audit(u.id, "reset_requested"); }
  ok(ctx, { ok: true, mail: true });
});
function unsubPage(ctx, okk) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NEXOMIA Academy</title></head>
  <body style="margin:0;font-family:Segoe UI,Helvetica,Arial,sans-serif;background:#F3F6F2;color:#16232E;display:grid;place-items:center;min-height:100vh;padding:20px">
  <div style="max-width:440px;background:#fff;border:1px solid #D3DDD2;border-radius:18px;padding:28px;text-align:center">
  <h1 style="font-size:22px;margin:0 0 10px">${okk ? "C’est noté" : "Lien invalide"}</h1>
  <p style="line-height:1.6;color:#56646E">${okk ? "Tu ne recevras plus le bilan hebdomadaire de NEXOMIA Academy. Tu peux le réactiver à tout moment depuis « Mon parcours »." : "Ce lien de désinscription n’est pas valable. Tu peux gérer tes e-mails depuis « Mon parcours »."}</p>
  <a href="/#/parcours" style="display:inline-block;margin-top:12px;background:#2F7D32;color:#fff;padding:12px 18px;border-radius:12px;text-decoration:none;font-weight:700">Mon parcours</a></div></body></html>`;
  ctx.res.writeHead(okk ? 200 : 400, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }); ctx.res.end(html);
}
function doUnsub(ctx) {
  const id = Number(ctx.params.id), okk = Mail.checkUnsub(id, ctx.params.token);
  if (okk) { run("UPDATE users SET email_progress = 0 WHERE id = ?", id); audit(id, "mail.unsubscribe"); }
  return okk;
}
r.get("/desabonnement/:id/:token", (ctx) => unsubPage(ctx, doUnsub(ctx)));
r.post("/desabonnement/:id/:token", (ctx) => { const okk = doUnsub(ctx); ok(ctx, { ok: okk }, okk ? 200 : 400); });
r.post("/api/auth/reset", async (ctx) => {
  A.throttle("reset:" + ctx.ip, 10);
  const b = await readJson(ctx.req);
  const id = A.useResetToken(b.token, b.password);
  A.createSession(ctx.res, id, ctx.secure);
  ok(ctx, { ok: true });
});

// Récupération du compte administrateur, sans e-mail : active seulement si la variable
// ADMIN_RECOVERY_CODE (12 caractères au moins) est définie dans Railway. À supprimer après usage.
r.post("/api/auth/admin-recover", async (ctx) => {
  A.throttle("recover:" + ctx.ip, 5, 60 * 60e3);
  const code = process.env.ADMIN_RECOVERY_CODE || "";
  if (code.length < 12) throw new HttpError(403, "La récupération n’est pas activée. Ajoute la variable ADMIN_RECOVERY_CODE dans Railway, puis réessaie.");
  const b = await readJson(ctx.req);
  const email = String(b.email || "").trim().toLowerCase();
  const admins = (process.env.ADMIN_EMAILS || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  const h = (x) => crypto.createHash("sha256").update(String(x)).digest();
  if (!admins.includes(email) || !crypto.timingSafeEqual(h(b.code || ""), h(code))) {
    audit(null, "admin_recover_failed", { email });
    throw new HttpError(401, "Adresse ou code de récupération incorrect.");
  }
  if (String(b.password || "").length < 8) throw new HttpError(400, "Le mot de passe doit contenir au moins 8 caractères.");
  const u = one("SELECT id FROM users WHERE email = ?", email);
  if (!u) throw new HttpError(404, "Aucun compte avec cette adresse. Inscris-toi d’abord avec cette adresse.");
  run("UPDATE users SET pass_hash = ?, role = 'admin', suspended = 0 WHERE id = ?", A.hashPassword(b.password), u.id);
  run("DELETE FROM sessions WHERE user_id = ?", u.id);
  audit(u.id, "admin_recovered");
  A.createSession(ctx.res, u.id, ctx.secure);
  ok(ctx, { ok: true });
});

// ---------- Catalogue ----------
r.get("/api/catalog", (ctx) => {
  const subs = ctx.user ? new Map(B.activeSubs(ctx.user.id).map((s) => [s.course_id, s.end_at])) : new Map();
  const done = ctx.user ? all("SELECT l.course_id, COUNT(*) AS n FROM progress p JOIN lessons l ON l.id = p.lesson_id WHERE p.user_id = ? AND p.completed_at IS NOT NULL GROUP BY l.course_id", ctx.user.id) : [];
  const doneMap = new Map(done.map((d) => [d.course_id, d.n]));
  const courses = all(`SELECT c.id, c.slug, c.domain, c.title, c.code, c.big, c.level, c.lang, c.description, c.color,
      (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lessons,
      (SELECT COALESCE(SUM(duration_min),0) FROM lessons l WHERE l.course_id = c.id) AS minutes,
      (SELECT id FROM lessons l WHERE l.course_id = c.id ORDER BY position LIMIT 1) AS first_lesson,
      (SELECT ROUND(AVG(rating), 1) FROM course_reviews r WHERE r.course_id = c.id AND r.hidden = 0) AS rating,
      (SELECT COUNT(*) FROM course_reviews r WHERE r.course_id = c.id AND r.hidden = 0) AS reviews
    FROM courses c WHERE c.status = 'published' ORDER BY c.published_at, c.id`)
    .map((c) => ({ ...c, subscribed_until: subs.get(c.id) || null, completed: doneMap.get(c.id) || 0 }));
  ok(ctx, { courses, pricing: pricing() });
});
r.get("/api/courses/:slug", (ctx) => {
  const c = one("SELECT * FROM courses WHERE slug = ?", ctx.params.slug);
  if (!courseVisible(ctx.user, c)) throw new HttpError(404, "Cours introuvable.");
  const lessons = all("SELECT id, position, title, duration_min, course_id, module FROM lessons WHERE course_id = ? ORDER BY position", c.id).map((l) => {
    const p = ctx.user ? one("SELECT completed_at, best_score FROM progress WHERE user_id = ? AND lesson_id = ?", ctx.user.id, l.id) : null;
    return { ...l, locked: !hasAccess(ctx.user, l), completed: !!(p && p.completed_at), score: p ? p.best_score : null };
  });
  const certificates = ctx.user ? all("SELECT code, module FROM certificates WHERE user_id = ? AND course_id = ?", ctx.user.id, c.id) : [];
  ok(ctx, { course: { ...c, created_by: undefined, reviewed_by: undefined, subscribed_until: ctx.user ? B.activeEnd(ctx.user.id, c.id) : null }, lessons, certificates, placement_test: !!PLACEMENT[c.slug] });
});
r.get("/api/lessons/:id", (ctx) => {
  const l = one("SELECT * FROM lessons WHERE id = ?", Number(ctx.params.id));
  if (!l) throw new HttpError(404, "Leçon introuvable.");
  const c = one("SELECT * FROM courses WHERE id = ?", l.course_id);
  if (!courseVisible(ctx.user, c)) throw new HttpError(404, "Leçon introuvable.");
  const lessons = all("SELECT id, position, title, module FROM lessons WHERE course_id = ? ORDER BY position", c.id);
  const meta = { course: { id: c.id, slug: c.slug, title: c.title, code: c.code, lang: c.lang, color: c.color, status: c.status }, lessons, position: l.position };
  if (!hasAccess(ctx.user, l)) return send(ctx.res, 402, { locked: true, lesson: { id: l.id, title: l.title, position: l.position }, ...meta });
  const full = C.lessonFull(l.id);
  const p = ctx.user ? one("SELECT completed_at, best_score, last_sentence FROM progress WHERE user_id = ? AND lesson_id = ?", ctx.user.id, l.id) : null;
  ok(ctx, { lesson: full, progress: p, subscribed_until: ctx.user ? B.activeEnd(ctx.user.id, c.id) : null, ...meta });
});

// Audio : protégé par les mêmes règles d'accès que la leçon ; prise en charge des requêtes partielles.
r.get("/api/audio/:file", (ctx) => {
  const f = ctx.params.file;
  if (!/^[a-f0-9]{32}\.(mp3|m4a|aac|ogg|opus|wav|webm)$/.test(f)) throw new HttpError(404, "Audio introuvable.");
  const s = one("SELECT s.lesson_id FROM sentences s WHERE s.audio_file = ? LIMIT 1", f);
  if (!s) throw new HttpError(404, "Audio introuvable.");
  const l = one("SELECT * FROM lessons WHERE id = ?", s.lesson_id);
  const c = one("SELECT status FROM courses WHERE id = ?", l.course_id);
  if (!courseVisible(ctx.user, c) || !hasAccess(ctx.user, l)) throw new HttpError(403, "Abonne-toi à ce cours pour écouter cet audio.");
  if (!serveFile(ctx.req, ctx.res, path.join(AUDIO_DIR, f), { cache: "private, max-age=604800" })) throw new HttpError(404, "Audio introuvable.");
});

// ---------- Progression ----------
r.post("/api/progress", async (ctx) => {
  A.requireUser(ctx);
  const b = await readJson(ctx.req);
  const l = one("SELECT * FROM lessons WHERE id = ?", Number(b.lessonId));
  if (!l || !hasAccess(ctx.user, l)) throw new HttpError(403, "Leçon non accessible.");
  const score = Math.max(0, Math.min(100, Math.round(Number(b.score) || 0)));
  const passed = b.completed === true && score >= 80;
  run(`INSERT INTO progress(user_id, lesson_id, best_score, completed_at, last_sentence, updated_at) VALUES(?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET best_score = MAX(best_score, excluded.best_score),
       completed_at = COALESCE(completed_at, excluded.completed_at), last_sentence = excluded.last_sentence, updated_at = datetime('now')`,
    ctx.user.id, l.id, score, passed ? nowIso() : null, Math.max(0, Number(b.lastSentence) || 0));
  let xp = 0, cert = null;
  if (b.completed === true) {
    const correct = Math.max(0, Math.min(20, Math.round(Number(b.correct) || 0)));
    xp = L.lessonXp(ctx.user.id, l.id, correct, passed);
    L.addToReview(ctx.user.id, l.id, all("SELECT term FROM vocab WHERE lesson_id = ?", l.id).map((v) => v.term));
    if (passed) cert = L.maybeCertificate(ctx.user, l);
    if (cert && ctx.user.email_progress) Mail.sendCertificate(ctx.user, cert, one("SELECT title FROM courses WHERE id = ?", l.course_id).title).catch(() => {});
  }
  ok(ctx, { passed, threshold: 80, xp, certificate: cert, today: L.xpOn(ctx.user.id, L.today()), goal: ctx.user.daily_goal });
});
r.post("/api/listening", async (ctx) => {
  A.requireUser(ctx);
  const b = await readJson(ctx.req);
  const sec = Math.max(0, Math.min(600, Math.round(Number(b.seconds) || 0)));
  if (sec) run(`INSERT INTO listening(user_id, day, seconds) VALUES(?, date('now'), ?) ON CONFLICT(user_id, day) DO UPDATE SET seconds = MIN(seconds + excluded.seconds, 86400)`, ctx.user.id, sec);
  ok(ctx, { ok: true });
});
r.get("/api/me/dashboard", (ctx) => {
  A.requireUser(ctx);
  const u = ctx.user.id;
  const seconds = one("SELECT COALESCE(SUM(seconds),0) AS s FROM listening WHERE user_id = ?", u).s;
  const completed = one("SELECT COUNT(*) AS n FROM progress WHERE user_id = ? AND completed_at IS NOT NULL", u).n;
  // Série : jours consécutifs d'activité (écoute ou exercices), à partir d'aujourd'hui (ou d'hier).
  const set = L.activeDays(u); const days = [...set];
  const streak = L.streakOf(set), best = L.bestStreak(set), xp = L.totalXp(u);
  const weekStart = new Date(); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
  const week = days.filter((x) => x >= weekStart.toISOString().slice(0, 10)).length;
  const courses = all(`SELECT c.id, c.slug, c.title, c.color,
      (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS total,
      (SELECT COUNT(*) FROM progress p JOIN lessons l ON l.id = p.lesson_id WHERE l.course_id = c.id AND p.user_id = ? AND p.completed_at IS NOT NULL) AS done,
      (SELECT MAX(p.updated_at) FROM progress p JOIN lessons l ON l.id = p.lesson_id WHERE l.course_id = c.id AND p.user_id = ?) AS last
    FROM courses c WHERE c.status = 'published' AND (EXISTS (SELECT 1 FROM progress p JOIN lessons l ON l.id = p.lesson_id WHERE l.course_id = c.id AND p.user_id = ?) OR EXISTS (SELECT 1 FROM periods pe WHERE pe.course_id = c.id AND pe.user_id = ?))
    ORDER BY last DESC`, u, u, u, u);
  let next = null;
  for (const c of courses) {
    const l = one(`SELECT l.id, l.title, l.position, l.duration_min FROM lessons l LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ? WHERE l.course_id = ? AND p.completed_at IS NULL ORDER BY l.position LIMIT 1`, u, c.id);
    if (l) { next = { ...l, course: c.title, course_slug: c.slug, locked: !hasAccess(ctx.user, { ...l, course_id: c.id }) }; break; }
  }
  const last7 = Array.from({ length: 7 }, (_, i) => { const x = new Date(); x.setUTCDate(x.getUTCDate() - (6 - i)); const day = x.toISOString().slice(0, 10); return { day, xp: L.xpOn(u, day), active: set.has(day) }; });
  ok(ctx, { minutes: Math.round(seconds / 60), completed, streak, best, week, courses, next, subs: B.activeSubs(u),
    xp, today: L.xpOn(u, L.today()), goal: ctx.user.daily_goal, last7, badges: L.badgesOf(u, { xp, best }),
    certificates: L.certificatesOf(u), board: L.weeklyBoard(u), reviews: L.reviewCounts(u), placement: ctx.user.placement });
});

// ---------- Profil d'apprentissage ----------
r.put("/api/me/profile", async (ctx) => {
  A.requireUser(ctx);
  const b = await readJson(ctx.req);
  const goal = [10, 20, 30, 50].includes(Number(b.daily_goal)) ? Number(b.daily_goal) : ctx.user.daily_goal;
  const motive = ["travail", "etudes", "voyage", "entreprise", "culture"].includes(b.motive) ? b.motive : ctx.user.motive;
  const lang = ["fr", "en"].includes(b.ui_lang) ? b.ui_lang : ctx.user.ui_lang;
  const ep = typeof b.email_progress === "boolean" ? (b.email_progress ? 1 : 0) : (ctx.user.email_progress ? 1 : 0);
  run("UPDATE users SET daily_goal = ?, motive = ?, ui_lang = ?, email_progress = ?, onboarded = CASE WHEN ? THEN 1 ELSE onboarded END WHERE id = ?", goal, motive, lang, ep, b.onboarded ? 1 : 0, ctx.user.id);
  ok(ctx, { ok: true, daily_goal: goal, motive, ui_lang: lang, email_progress: !!ep });
});

// Prononciation : quelques points par leçon et par jour quand l'apprenant s'entraîne au micro.
r.post("/api/me/speak", async (ctx) => {
  A.requireUser(ctx);
  const b = await readJson(ctx.req);
  const l = one("SELECT * FROM lessons WHERE id = ?", Number(b.lessonId));
  if (!l || !hasAccess(ctx.user, l)) throw new HttpError(403, "Leçon non accessible.");
  const good = Math.max(0, Math.min(20, Math.round(Number(b.good) || 0)));
  const xp = good >= 3 ? L.award(ctx.user.id, "speak", `${l.id}:${L.today()}`, 5 + good) : 0;
  ok(ctx, { xp });
});

// ---------- Commentaires des leçons et avis des cours ----------
const shortName = (n) => { const p = String(n).trim().split(/\s+/); return p[0] + (p[1] ? " " + p[1][0].toUpperCase() + "." : ""); };
const cleanBody = (t, max) => String(t || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
function publicComment(c, me) {
  return { id: c.id, parent_id: c.parent_id, body: c.body, created_at: c.created_at, hidden: !!c.hidden,
    author: shortName(c.name), staff: A.can({ role: c.role }, "coach"), mine: !!me && me.id === c.user_id };
}
r.get("/api/lessons/:id/comments", (ctx) => {
  const l = one("SELECT * FROM lessons WHERE id = ?", Number(ctx.params.id));
  if (!l) throw new HttpError(404, "Leçon introuvable.");
  const mod = A.can(ctx.user, "coach");
  const rows = all(`SELECT c.*, u.name, u.role FROM comments c JOIN users u ON u.id = c.user_id WHERE c.lesson_id = ? ${mod ? "" : "AND c.hidden = 0"} ORDER BY c.created_at`, l.id);
  ok(ctx, { comments: rows.map((c) => publicComment(c, ctx.user)), canModerate: mod });
});
r.post("/api/lessons/:id/comments", async (ctx) => {
  A.requireUser(ctx);
  A.throttle("comment:" + ctx.user.id, 10, 10 * 60e3);
  const l = one("SELECT * FROM lessons WHERE id = ?", Number(ctx.params.id));
  if (!l || !hasAccess(ctx.user, l)) throw new HttpError(403, "Leçon non accessible.");
  const b = await readJson(ctx.req);
  const body = cleanBody(b.body, 1000);
  if (body.length < 2) throw new HttpError(400, "Écris ton message avant de l’envoyer.");
  let parent = null;
  if (b.parent_id) { const p = one("SELECT id, parent_id FROM comments WHERE id = ? AND lesson_id = ?", Number(b.parent_id), l.id); if (!p) throw new HttpError(404, "Message introuvable."); parent = p.parent_id || p.id; }
  const id = Number(run("INSERT INTO comments(lesson_id, user_id, parent_id, body) VALUES(?, ?, ?, ?)", l.id, ctx.user.id, parent, body).lastInsertRowid);
  const c = one("SELECT c.*, u.name, u.role FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?", id);
  ok(ctx, { comment: publicComment(c, ctx.user) }, 201);
});
r.del("/api/comments/:id", (ctx) => {
  A.requireUser(ctx);
  const c = one("SELECT * FROM comments WHERE id = ?", Number(ctx.params.id));
  if (!c) throw new HttpError(404, "Message introuvable.");
  if (c.user_id !== ctx.user.id && !A.can(ctx.user, "coach")) throw new HttpError(403, "Tu ne peux supprimer que tes propres messages.");
  run("DELETE FROM comments WHERE id = ?", c.id);
  if (c.user_id !== ctx.user.id) audit(ctx.user.id, "comment.delete", { id: c.id });
  ok(ctx, { ok: true });
});
r.put("/api/comments/:id/hidden", async (ctx) => {
  A.requireRole("coach")(ctx);
  const b = await readJson(ctx.req);
  run("UPDATE comments SET hidden = ? WHERE id = ?", b.hidden ? 1 : 0, Number(ctx.params.id));
  audit(ctx.user.id, b.hidden ? "comment.hide" : "comment.show", { id: Number(ctx.params.id) });
  ok(ctx, { ok: true });
});

r.get("/api/courses/:slug/reviews", (ctx) => {
  const c = one("SELECT id FROM courses WHERE slug = ?", ctx.params.slug);
  if (!c) throw new HttpError(404, "Cours introuvable.");
  const rows = all("SELECT cr.*, u.name FROM course_reviews cr JOIN users u ON u.id = cr.user_id WHERE cr.course_id = ? AND cr.hidden = 0 ORDER BY cr.updated_at DESC LIMIT 50", c.id);
  const stats = one("SELECT COUNT(*) AS n, AVG(rating) AS avg FROM course_reviews WHERE course_id = ? AND hidden = 0", c.id);
  const dist = [1, 2, 3, 4, 5].map((k) => one("SELECT COUNT(*) AS n FROM course_reviews WHERE course_id = ? AND hidden = 0 AND rating = ?", c.id, k).n);
  const mine = ctx.user ? one("SELECT rating, body FROM course_reviews WHERE course_id = ? AND user_id = ?", c.id, ctx.user.id) : null;
  const eligible = !!ctx.user && !!one("SELECT 1 FROM progress p JOIN lessons l ON l.id = p.lesson_id WHERE p.user_id = ? AND l.course_id = ? AND p.completed_at IS NOT NULL", ctx.user.id, c.id);
  ok(ctx, { reviews: rows.map((x) => ({ id: x.id, rating: x.rating, body: x.body, author: shortName(x.name), updated_at: x.updated_at, mine: !!ctx.user && x.user_id === ctx.user.id })),
    count: stats.n, average: stats.avg ? Math.round(stats.avg * 10) / 10 : null, dist, mine, eligible });
});
r.post("/api/courses/:slug/reviews", async (ctx) => {
  A.requireUser(ctx);
  A.throttle("review:" + ctx.user.id, 10, 60 * 60e3);
  const c = one("SELECT id FROM courses WHERE slug = ?", ctx.params.slug);
  if (!c) throw new HttpError(404, "Cours introuvable.");
  if (!one("SELECT 1 FROM progress p JOIN lessons l ON l.id = p.lesson_id WHERE p.user_id = ? AND l.course_id = ? AND p.completed_at IS NOT NULL", ctx.user.id, c.id))
    throw new HttpError(403, "Termine au moins une leçon de ce cours pour donner ton avis.");
  const b = await readJson(ctx.req);
  const rating = Math.round(Number(b.rating));
  if (!(rating >= 1 && rating <= 5)) throw new HttpError(400, "Choisis une note de 1 à 5 étoiles.");
  run(`INSERT INTO course_reviews(course_id, user_id, rating, body) VALUES(?, ?, ?, ?)
       ON CONFLICT(course_id, user_id) DO UPDATE SET rating = excluded.rating, body = excluded.body, updated_at = datetime('now')`, c.id, ctx.user.id, rating, cleanBody(b.body, 800));
  ok(ctx, { ok: true });
});
r.get("/api/admin/feedback", (ctx) => {
  A.requireRole("coach")(ctx);
  const comments = all(`SELECT c.id, c.body, c.hidden, c.created_at, c.parent_id, u.name, u.email, l.id AS lesson_id, l.title AS lesson, co.title AS course
    FROM comments c JOIN users u ON u.id = c.user_id JOIN lessons l ON l.id = c.lesson_id JOIN courses co ON co.id = l.course_id ORDER BY c.created_at DESC LIMIT 100`);
  const reviews = all(`SELECT cr.id, cr.rating, cr.body, cr.hidden, cr.updated_at, u.name, u.email, co.title AS course
    FROM course_reviews cr JOIN users u ON u.id = cr.user_id JOIN courses co ON co.id = cr.course_id ORDER BY cr.updated_at DESC LIMIT 100`);
  ok(ctx, { comments, reviews });
});
// Boîte à suggestions : privée entre l'apprenant et l'équipe.
const SUG_CATS = ["cours", "amelioration", "probleme", "autre"];
r.get("/api/me/suggestions", (ctx) => {
  A.requireUser(ctx);
  ok(ctx, { suggestions: all("SELECT id, category, body, status, reply, created_at, updated_at FROM suggestions WHERE user_id = ? ORDER BY id DESC LIMIT 30", ctx.user.id) });
});
r.post("/api/suggestions", async (ctx) => {
  A.requireUser(ctx);
  A.throttle("sugg:" + ctx.user.id, 6, 60 * 60e3);
  const b = await readJson(ctx.req);
  const body = cleanBody(b.body, 2000);
  if (body.length < 5) throw new HttpError(400, "Décris ta suggestion en quelques mots.");
  const cat = SUG_CATS.includes(b.category) ? b.category : "autre";
  run("INSERT INTO suggestions(user_id, category, body, page) VALUES(?, ?, ?, ?)", ctx.user.id, cat, body, String(b.page || "").slice(0, 120));
  ok(ctx, { ok: true }, 201);
});
r.get("/api/admin/suggestions", (ctx) => {
  A.requireRole("coach")(ctx);
  ok(ctx, { suggestions: all(`SELECT s.*, u.name, u.email, u.phone FROM suggestions s LEFT JOIN users u ON u.id = s.user_id ORDER BY CASE s.status WHEN 'new' THEN 0 WHEN 'review' THEN 1 ELSE 2 END, s.id DESC LIMIT 200`) });
});
r.put("/api/admin/suggestions/:id", async (ctx) => {
  A.requireRole("coach")(ctx);
  const b = await readJson(ctx.req);
  const s0 = one("SELECT * FROM suggestions WHERE id = ?", Number(ctx.params.id));
  if (!s0) throw new HttpError(404, "Suggestion introuvable.");
  const status = ["new", "review", "done", "declined"].includes(b.status) ? b.status : s0.status;
  const reply = b.reply !== undefined ? cleanBody(b.reply, 1500) : s0.reply;
  run("UPDATE suggestions SET status = ?, reply = ?, updated_at = datetime('now') WHERE id = ?", status, reply, s0.id);
  ok(ctx, { ok: true });
});
r.put("/api/admin/reviews/:id/hidden", async (ctx) => {
  A.requireRole("coach")(ctx);
  const b = await readJson(ctx.req);
  run("UPDATE course_reviews SET hidden = ? WHERE id = ?", b.hidden ? 1 : 0, Number(ctx.params.id));
  audit(ctx.user.id, b.hidden ? "review.hide" : "review.show", { id: Number(ctx.params.id) });
  ok(ctx, { ok: true });
});

// ---------- Test de niveau ----------
r.get("/api/placement/:slug", (ctx) => {
  const qs = PLACEMENT[ctx.params.slug];
  const c = one("SELECT id, title, lang FROM courses WHERE slug = ? AND status = 'published'", ctx.params.slug);
  if (!qs || !c) throw new HttpError(404, "Pas de test de niveau pour ce cours.");
  const starts = all("SELECT module, MIN(position) AS position, id, title FROM lessons WHERE course_id = ? AND module <> '' GROUP BY module ORDER BY position", c.id)
    .map((x) => ({ level: x.module.split("·")[0].trim(), module: x.module, lesson_id: one("SELECT id FROM lessons WHERE course_id = ? AND position = ?", c.id, x.position).id }));
  ok(ctx, { course: c, questions: qs, starts });
});
r.post("/api/me/placement", async (ctx) => {
  A.requireUser(ctx);
  const b = await readJson(ctx.req);
  if (!PLACEMENT[b.slug] || !/^(A1|A2|B1|B2|C1|C2)$/.test(b.level)) throw new HttpError(400, "Résultat invalide.");
  const p = { ...ctx.user.placement, [b.slug]: { level: b.level, score: Math.max(0, Math.min(100, Math.round(Number(b.score) || 0))), at: nowIso() } };
  run("UPDATE users SET placement = ? WHERE id = ?", JSON.stringify(p), ctx.user.id);
  const xp = L.award(ctx.user.id, "placement", b.slug, 30);
  ok(ctx, { ok: true, placement: p, xp });
});

// ---------- Certificats (vérification publique) ----------
r.get("/api/certificates/:code", (ctx) => {
  const c = L.certificate(ctx.params.code);
  if (!c) throw new HttpError(404, "Aucun certificat ne correspond à ce code.");
  ok(ctx, { certificate: c });
});

// ---------- Révisions ----------
r.get("/api/me/reviews", (ctx) => { A.requireUser(ctx); ok(ctx, { items: L.dueReviews(ctx.user.id), counts: L.reviewCounts(ctx.user.id) }); });
r.post("/api/me/reviews", async (ctx) => {
  A.requireUser(ctx);
  const b = await readJson(ctx.req);
  const results = Array.isArray(b.results) ? b.results.slice(0, 50) : [];
  let known = 0;
  for (const x of results) if (L.gradeReview(ctx.user.id, Number(x.lesson_id), String(x.item || ""), !!x.knew) && x.knew) known++;
  const xp = results.length ? L.award(ctx.user.id, "review", L.today(), 5 + known * 2) : 0;
  ok(ctx, { ok: true, xp, counts: L.reviewCounts(ctx.user.id) });
});

// ---------- Abonnements et paiements ----------
r.get("/api/pricing", (ctx) => { const p = pricing(); ok(ctx, { ...p, examples: [1, 2, 3, 4].map((n) => ({ n, total: totalFor(n, p) })), provider: B.providerName() }); });
r.post("/api/orders", async (ctx) => {
  A.requireUser(ctx);
  A.throttle("order:" + ctx.user.id, 12, 10 * 60e3);
  const b = await readJson(ctx.req);
  ok(ctx, await B.createOrder(ctx.user, b, ctx.baseUrl), 201);
});
r.get("/api/orders/:ref", async (ctx) => { A.requireUser(ctx); ok(ctx, await B.orderStatus(ctx.user, ctx.params.ref)); });
r.get("/api/me/orders", (ctx) => {
  A.requireUser(ctx);
  ok(ctx, { orders: all("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 30", ctx.user.id).map(B.publicOrder), subs: B.activeSubs(ctx.user.id) });
});
// Mode test uniquement : simule la réponse du prestataire.
r.post("/api/orders/:ref/test-result", async (ctx) => {
  A.requireUser(ctx);
  const o = one("SELECT * FROM orders WHERE ref = ? AND user_id = ?", ctx.params.ref, ctx.user.id);
  if (!o || o.provider !== "test" || !B.testModeEnabled()) throw new HttpError(404, "Commande introuvable.");
  const b = await readJson(ctx.req);
  if (b.result === "success") B.markPaid(o.id, "test"); else B.failOrder(o.id, "Paiement refusé (simulation).");
  ok(ctx, await B.orderStatus(ctx.user, o.ref));
});
// Notification pawaPay : on ne croit jamais le contenu, on revérifie le statut auprès de pawaPay.
r.post("/api/payments/pawapay/callback", async (ctx) => {
  const b = await readJson(ctx.req).catch(() => ({}));
  const depositId = b && (b.depositId || (b.data && b.data.depositId));
  if (depositId) {
    const o = one("SELECT * FROM orders WHERE provider = 'pawapay' AND provider_order = ?", String(depositId));
    if (o) { try { await B.verifyWithPawapay(o); } catch (e) { console.error("callback pawapay", e.message); } }
  }
  ok(ctx, { received: true });
});
// Notification FlexPay : son contenu n'est jamais cru tel quel, on revérifie auprès de FlexPay.
r.post("/api/payments/flexpay/callback", async (ctx) => {
  const b = await readJson(ctx.req).catch(() => ({}));
  const ref = b.reference || b.ref;
  const o = ref ? one("SELECT * FROM orders WHERE ref = ?", String(ref)) : (b.orderNumber ? one("SELECT * FROM orders WHERE provider_order = ?", String(b.orderNumber)) : null);
  if (o) {
    if (!o.provider_order && b.orderNumber) run("UPDATE orders SET provider_order = ? WHERE id = ?", String(b.orderNumber), o.id);
    await B.verifyWithFlexpay(one("SELECT * FROM orders WHERE id = ?", o.id));
  }
  ok(ctx, { received: true });
});

// ---------- Studio ----------
const creator = A.requireRole("creator");
const reviewer = A.requireRole("reviewer");
function studioCourse(ctx, id) {
  const c = one("SELECT * FROM courses WHERE id = ?", Number(id));
  if (!c) throw new HttpError(404, "Cours introuvable.");
  if (!A.can(ctx.user, "reviewer") && c.created_by !== ctx.user.id) throw new HttpError(403, "Ce cours appartient à un autre créateur.");
  if (!A.can(ctx.user, "reviewer") && (c.status === "published" || c.status === "review")) throw new HttpError(409, c.status === "review" ? "Ce cours est en revue : attends la décision du responsable pédagogique." : "Ce cours est publié : seul un responsable pédagogique peut le modifier.");
  return c;
}
r.get("/api/studio/meta", (ctx) => { creator(ctx); ok(ctx, { langs: C.LANGS, domains: [...new Set(Object.keys(C.DOMAIN_COLORS).concat(all("SELECT DISTINCT domain FROM courses").map((d) => d.domain)))], templates: ["Langue", "Compétence pratique", "Entrepreneuriat", "Audio seul"] }); });
r.get("/api/studio/courses", (ctx) => {
  creator(ctx);
  const rows = A.can(ctx.user, "reviewer")
    ? all("SELECT c.*, u.name AS author, (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lessons FROM courses c LEFT JOIN users u ON u.id = c.created_by ORDER BY CASE c.status WHEN 'review' THEN 0 WHEN 'draft' THEN 1 WHEN 'published' THEN 2 ELSE 3 END, c.updated_at DESC")
    : all("SELECT c.*, u.name AS author, (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lessons FROM courses c LEFT JOIN users u ON u.id = c.created_by WHERE c.created_by = ? ORDER BY c.updated_at DESC", ctx.user.id);
  ok(ctx, { courses: rows });
});
r.post("/api/studio/courses", async (ctx) => {
  creator(ctx);
  const b = await readJson(ctx.req);
  const title = String(b.title || "").trim().slice(0, 80);
  const domain = String(b.domain || "").trim().slice(0, 40);
  if (!title || !domain) throw new HttpError(400, "Indique un titre et un domaine.");
  const lang = C.LANGS[b.lang] ? b.lang : "fr-FR";
  const slug = C.uniqueSlug(title);
  const big = (title.replace(/[^\p{L}]/gu, "").slice(0, 2) || "Nx");
  const code = (b.code ? String(b.code) : title.slice(0, 2).toUpperCase() + "-01").slice(0, 12);
  const res = run(`INSERT INTO courses(slug, domain, title, code, big, level, lang, template, description, color, status, created_by) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
    slug, domain, title, code, big[0].toUpperCase() + (big[1] || "").toLowerCase(), String(b.level || "").slice(0, 40), lang, String(b.template || "Langue").slice(0, 40), String(b.description || "").slice(0, 400), C.DOMAIN_COLORS[domain] || "#5C7A3A", ctx.user.id);
  const id = Number(res.lastInsertRowid);
  if (b.lessonTitle || b.lines) C.addLesson(id, { title: b.lessonTitle, goal: b.goal, lines: b.lines });
  audit(ctx.user.id, "course_created", { id, title });
  ok(ctx, { id }, 201);
});
r.get("/api/studio/courses/:id", (ctx) => {
  creator(ctx);
  const c = one("SELECT * FROM courses WHERE id = ?", Number(ctx.params.id));
  if (!c || (!A.can(ctx.user, "reviewer") && c.created_by !== ctx.user.id)) throw new HttpError(404, "Cours introuvable.");
  const lessons = all("SELECT id FROM lessons WHERE course_id = ? ORDER BY position", c.id).map((l) => C.lessonFull(l.id));
  ok(ctx, { course: c, lessons, editable: A.can(ctx.user, "reviewer") || c.status === "draft" });
});
r.put("/api/studio/courses/:id", async (ctx) => {
  creator(ctx);
  const c = studioCourse(ctx, ctx.params.id);
  const b = await readJson(ctx.req);
  const lang = C.LANGS[b.lang] ? b.lang : c.lang;
  run("UPDATE courses SET title = ?, domain = ?, level = ?, lang = ?, template = ?, description = ?, updated_at = datetime('now') WHERE id = ?",
    String(b.title || c.title).slice(0, 80), String(b.domain || c.domain).slice(0, 40), String(b.level ?? c.level).slice(0, 40), lang, String(b.template || c.template).slice(0, 40), String(b.description ?? c.description).slice(0, 400), c.id);
  ok(ctx, { ok: true });
});
r.post("/api/studio/courses/:id/lessons", async (ctx) => {
  creator(ctx);
  const c = studioCourse(ctx, ctx.params.id);
  const b = await readJson(ctx.req);
  if (!C.parseLines(b.lines).length) throw new HttpError(400, "Ajoute au moins une phrase.");
  const id = C.addLesson(c.id, { title: b.title, goal: b.goal, lines: b.lines, module: b.module, notes: b.notes });
  run("UPDATE courses SET updated_at = datetime('now') WHERE id = ?", c.id);
  ok(ctx, { id }, 201);
});
r.put("/api/studio/lessons/:id", async (ctx) => {
  creator(ctx);
  const l = one("SELECT * FROM lessons WHERE id = ?", Number(ctx.params.id));
  if (!l) throw new HttpError(404, "Leçon introuvable.");
  studioCourse(ctx, l.course_id);
  const b = await readJson(ctx.req);
  const sents = C.parseLines(b.lines);
  if (!sents.length) throw new HttpError(400, "Ajoute au moins une phrase.");
  tx(() => {
    run("UPDATE lessons SET title = ?, goal = ?, duration_min = ?, module = ?, notes = ? WHERE id = ?", String(b.title || l.title).slice(0, 120), String(b.goal ?? l.goal).slice(0, 300), Math.max(1, Math.min(120, Number(b.duration_min) || l.duration_min)), String(b.module ?? l.module).slice(0, 60), String(b.notes ?? l.notes).slice(0, 3000), l.id);
    // Phrases inchangées : on garde le vocabulaire et les exercices rédigés à la main.
    const before = all("SELECT speaker, text, translation FROM sentences WHERE lesson_id = ? ORDER BY position", l.id);
    const same = before.length === sents.length && before.every((s, i) => s.text === sents[i].text && s.translation === sents[i].translation && s.speaker === sents[i].speaker);
    if (!same) C.writeLessonContent(l.id, { sentences: sents, vocab: sents.slice(0, 4).map((s) => ({ term: s.text, meaning: s.translation })), questions: C.autoQuestions(sents) });
  });
  ok(ctx, { lesson: C.lessonFull(l.id) });
});
r.del("/api/studio/lessons/:id", (ctx) => {
  creator(ctx);
  const l = one("SELECT * FROM lessons WHERE id = ?", Number(ctx.params.id));
  if (!l) throw new HttpError(404, "Leçon introuvable.");
  studioCourse(ctx, l.course_id);
  tx(() => {
    run("DELETE FROM lessons WHERE id = ?", l.id);
    all("SELECT id FROM lessons WHERE course_id = ? ORDER BY position", l.course_id).forEach((x, i) => run("UPDATE lessons SET position = ? WHERE id = ?", i + 1, x.id));
  });
  ok(ctx, { ok: true });
});
const AUDIO_TYPES = { "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/aac": "aac", "audio/ogg": "ogg", "audio/opus": "opus", "audio/wav": "wav", "audio/x-wav": "wav", "audio/wave": "wav", "audio/webm": "webm" };
r.put("/api/studio/sentences/:id/audio", async (ctx) => {
  creator(ctx);
  const s = one("SELECT s.*, l.course_id FROM sentences s JOIN lessons l ON l.id = s.lesson_id WHERE s.id = ?", Number(ctx.params.id));
  if (!s) throw new HttpError(404, "Phrase introuvable.");
  studioCourse(ctx, s.course_id);
  const ext = AUDIO_TYPES[String(ctx.req.headers["content-type"] || "").split(";")[0].trim()];
  if (!ext) throw new HttpError(415, "Format audio non pris en charge. Utilise MP3, M4A, OGG, WAV ou WEBM.");
  const buf = await readBody(ctx.req, 8 * 1024 * 1024);
  if (buf.length < 500) throw new HttpError(400, "Le fichier audio semble vide.");
  const name = crypto.randomBytes(16).toString("hex") + "." + ext;
  fs.writeFileSync(path.join(AUDIO_DIR, name), buf);
  run("UPDATE sentences SET audio_file = ? WHERE id = ?", name, s.id);
  audit(ctx.user.id, "audio_uploaded", { sentence: s.id, bytes: buf.length });
  ok(ctx, { audio: `/api/audio/${name}`, bytes: buf.length });
});
r.del("/api/studio/sentences/:id/audio", (ctx) => {
  creator(ctx);
  const s = one("SELECT s.*, l.course_id FROM sentences s JOIN lessons l ON l.id = s.lesson_id WHERE s.id = ?", Number(ctx.params.id));
  if (!s) throw new HttpError(404, "Phrase introuvable.");
  studioCourse(ctx, s.course_id);
  run("UPDATE sentences SET audio_file = NULL WHERE id = ?", s.id);
  ok(ctx, { ok: true });
});
r.post("/api/studio/courses/:id/submit", (ctx) => {
  creator(ctx);
  const c = studioCourse(ctx, ctx.params.id);
  if (!one("SELECT 1 FROM lessons WHERE course_id = ?", c.id)) throw new HttpError(400, "Ajoute au moins une leçon avant de soumettre.");
  run("UPDATE courses SET status = 'review', review_note = NULL, updated_at = datetime('now') WHERE id = ?", c.id);
  audit(ctx.user.id, "course_submitted", { id: c.id });
  ok(ctx, { status: "review" });
});
r.post("/api/studio/courses/:id/decision", async (ctx) => {
  reviewer(ctx);
  const c = one("SELECT * FROM courses WHERE id = ?", Number(ctx.params.id));
  if (!c) throw new HttpError(404, "Cours introuvable.");
  const b = await readJson(ctx.req);
  const map = { publish: "published", reject: "draft", archive: "archived", unpublish: "draft" };
  const status = map[b.action];
  if (!status) throw new HttpError(400, "Action inconnue.");
  if (status === "published" && !one("SELECT 1 FROM lessons WHERE course_id = ?", c.id)) throw new HttpError(400, "Un cours sans leçon ne peut pas être publié.");
  run("UPDATE courses SET status = ?, review_note = ?, reviewed_by = ?, updated_at = datetime('now'), published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, datetime('now')) ELSE published_at END WHERE id = ?",
    status, b.note ? String(b.note).slice(0, 500) : null, ctx.user.id, status, c.id);
  audit(ctx.user.id, "course_" + b.action, { id: c.id, note: b.note || null });
  ok(ctx, { status });
});

// ---------- Administration ----------
const admin = A.requireRole("admin");
// E-mails
r.get("/api/admin/mail", (ctx) => { admin(ctx); ok(ctx, Mail.status()); });
r.post("/api/admin/mail/test", async (ctx) => {
  admin(ctx);
  const b = await readJson(ctx.req);
  const me = one("SELECT id, name, email FROM users WHERE id = ?", ctx.user.id);
  const fn = { weekly: Mail.sendWeekly, welcome: Mail.sendWelcome }[b.kind] || Mail.sendWeekly;
  const r0 = await fn(me);
  if (!r0.sent) throw new HttpError(400, r0.reason === "not_configured" ? "Aucun service d’envoi n’est configuré." : `Envoi refusé par le service (${r0.reason}). ${r0.detail || ""}`);
  ok(ctx, { ok: true, to: me.email });
});
r.post("/api/admin/mail/weekly", async (ctx) => {
  admin(ctx);
  if (!Mail.provider()) throw new HttpError(400, "Aucun service d’envoi n’est configuré.");
  Mail.runWeekly(true).catch(() => {});
  audit(ctx.user.id, "mail.weekly.manual");
  ok(ctx, Mail.status());
});

// Voix professionnelles
const TTS = require("./tts");
r.get("/api/admin/tts", (ctx) => { admin(ctx); ok(ctx, TTS.status()); });
r.post("/api/admin/tts", async (ctx) => {
  admin(ctx);
  const b = await readJson(ctx.req);
  if (b.stop) return ok(ctx, TTS.stopJob());
  if (!one("SELECT 1 FROM courses WHERE id = ?", Number(b.courseId))) throw new HttpError(404, "Cours introuvable.");
  try { ok(ctx, await TTS.runJob(Number(b.courseId), ctx.user.id)); } catch (e) { throw new HttpError(400, e.message); }
});
r.get("/api/admin/overview", (ctx) => {
  admin(ctx);
  const now = nowIso();
  ok(ctx, {
    users: one("SELECT COUNT(*) AS n FROM users").n,
    activeSubscribers: one("SELECT COUNT(DISTINCT user_id) AS n FROM periods WHERE end_at > ?", now).n,
    activeSubscriptions: one("SELECT COUNT(*) AS n FROM (SELECT user_id, course_id FROM periods GROUP BY user_id, course_id HAVING MAX(end_at) > ?)", now).n,
    revenue30: one("SELECT COALESCE(SUM(amount_usd),0) AS s FROM orders WHERE status = 'paid' AND provider != 'test' AND paid_at > ?", new Date(Date.now() - 30 * 864e5).toISOString()).s,
    pendingOrders: one("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'").n,
    lessonsCompleted: one("SELECT COUNT(*) AS n FROM progress WHERE completed_at IS NOT NULL").n,
    listeningHours: Math.round(one("SELECT COALESCE(SUM(seconds),0) AS s FROM listening").s / 360) / 10,
    inReview: one("SELECT COUNT(*) AS n FROM courses WHERE status = 'review'").n,
    payments: B.providerName(),
    pricing: pricing(),
  });
});
r.get("/api/admin/users", (ctx) => {
  admin(ctx);
  const q = "%" + String(ctx.query.get("q") || "").trim() + "%";
  const rows = all(`SELECT id, name, email, phone, role, suspended, created_at,
      (SELECT COUNT(*) FROM (SELECT course_id FROM periods p WHERE p.user_id = users.id GROUP BY course_id HAVING MAX(end_at) > ?)) AS subs
    FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY id DESC LIMIT 100`, nowIso(), q, q);
  ok(ctx, { users: rows, roles: A.ROLES });
});
r.put("/api/admin/users/:id", async (ctx) => {
  admin(ctx);
  const b = await readJson(ctx.req);
  const u = one("SELECT * FROM users WHERE id = ?", Number(ctx.params.id));
  if (!u) throw new HttpError(404, "Utilisateur introuvable.");
  if (b.role !== undefined) {
    if (!A.ROLES.includes(b.role)) throw new HttpError(400, "Rôle inconnu.");
    if (u.id === ctx.user.id && b.role !== "admin") throw new HttpError(400, "Tu ne peux pas retirer ton propre rôle d’administrateur.");
    run("UPDATE users SET role = ? WHERE id = ?", b.role, u.id);
  }
  if (b.suspended !== undefined) {
    if (u.id === ctx.user.id) throw new HttpError(400, "Tu ne peux pas suspendre ton propre compte.");
    run("UPDATE users SET suspended = ? WHERE id = ?", b.suspended ? 1 : 0, u.id);
    if (b.suspended) run("DELETE FROM sessions WHERE user_id = ?", u.id);
  }
  audit(ctx.user.id, "user_updated", { id: u.id, role: b.role, suspended: b.suspended, reason: b.reason || null });
  ok(ctx, { ok: true });
});
r.post("/api/admin/users/:id/reset-link", (ctx) => {
  admin(ctx);
  const u = one("SELECT id FROM users WHERE id = ?", Number(ctx.params.id));
  if (!u) throw new HttpError(404, "Utilisateur introuvable.");
  const token = A.createResetToken(u.id);
  audit(ctx.user.id, "reset_link_created", { id: u.id });
  ok(ctx, { url: `${ctx.baseUrl}/#/reinitialiser/${token}`, expires_hours: 48 });
});
// Bourse NEXOMIA : accès offert d'un mois à un cours, tracé dans le journal.
r.post("/api/admin/users/:id/grant", async (ctx) => {
  admin(ctx);
  const b = await readJson(ctx.req);
  const u = one("SELECT id FROM users WHERE id = ?", Number(ctx.params.id));
  const c = one("SELECT id FROM courses WHERE id = ? AND status = 'published'", Number(b.courseId));
  if (!u || !c) throw new HttpError(404, "Utilisateur ou cours introuvable.");
  const cur = B.activeEnd(u.id, c.id); const start = cur || nowIso();
  run("INSERT INTO periods(user_id, course_id, order_id, start_at, end_at, source) VALUES(?, ?, NULL, ?, ?, 'bourse')", u.id, c.id, start, B.addOneMonth(start));
  audit(ctx.user.id, "scholarship_granted", { user: u.id, course: c.id, reason: b.reason || null });
  ok(ctx, { ok: true });
});
r.get("/api/admin/orders", (ctx) => {
  admin(ctx);
  const rows = all("SELECT o.*, u.name AS user_name, u.email AS user_email FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.id DESC LIMIT 100");
  ok(ctx, { orders: rows.map((o) => ({ ...B.publicOrder(o), user: o.user_name, email: o.user_email, phone: o.phone })) });
});
r.post("/api/admin/orders/:ref/verify", async (ctx) => {
  admin(ctx);
  const o = one("SELECT * FROM orders WHERE ref = ?", ctx.params.ref);
  if (!o) throw new HttpError(404, "Commande introuvable.");
  ok(ctx, B.publicOrder(await B.verifyOrder(o)));
});
r.put("/api/admin/pricing", async (ctx) => {
  admin(ctx);
  const b = await readJson(ctx.req);
  const p = { tiers: (b.tiers || []).map(Number), extra: Number(b.extra), currency: "USD" };
  const err = validatePricing(p);
  if (err) throw new HttpError(400, err);
  setSetting("pricing", p);
  audit(ctx.user.id, "pricing_updated", p);
  ok(ctx, { pricing: p });
});

module.exports = r;
