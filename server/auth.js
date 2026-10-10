// Comptes et sessions : mots de passe hachés avec scrypt, jetons de session aléatoires
// stockés uniquement sous forme d'empreinte SHA-256, cookie HttpOnly.
const crypto = require("node:crypto");
const { one, run, audit } = require("./db");
const { HttpError, parseCookies } = require("./http");

const COOKIE = "nx_session";
const SESSION_DAYS = 30;
const ROLES = ["learner", "mentor", "coach", "creator", "reviewer", "admin"];
const RANK = { learner: 0, mentor: 1, coach: 2, creator: 3, reviewer: 4, admin: 5 };

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}
function verifyPassword(pw, stored) {
  const [alg, s, k] = String(stored).split("$");
  if (alg !== "scrypt") return false;
  const key = crypto.scryptSync(pw, Buffer.from(s, "base64"), 64, { N: 16384, r: 8, p: 1 });
  const ref = Buffer.from(k, "base64");
  return ref.length === key.length && crypto.timingSafeEqual(ref, key);
}
const sha = (t) => crypto.createHash("sha256").update(t).digest("hex");

function createSession(res, userId, secure) {
  const token = crypto.randomBytes(32).toString("base64url");
  const exp = new Date(Date.now() + SESSION_DAYS * 864e5);
  run("INSERT INTO sessions(token_hash, user_id, expires_at) VALUES(?, ?, ?)", sha(token), userId, exp.toISOString());
  res.setHeader("Set-Cookie", `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure ? "; Secure" : ""}`);
}
function destroySession(req, res, secure) {
  const t = parseCookies(req)[COOKIE];
  if (t) run("DELETE FROM sessions WHERE token_hash = ?", sha(t));
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`);
}
function currentUser(req) {
  const t = parseCookies(req)[COOKIE];
  if (!t) return null;
  const s = one(`SELECT u.id, u.name, u.email, u.phone, u.role, u.suspended, u.daily_goal, u.motive, u.placement, u.onboarded, u.ui_lang, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`, sha(t));
  if (!s || s.expires_at < new Date().toISOString() || s.suspended) return null;
  let placement = {}; try { placement = JSON.parse(s.placement || "{}"); } catch {}
  return { id: s.id, name: s.name, email: s.email, phone: s.phone, role: s.role, daily_goal: s.daily_goal, motive: s.motive, placement, onboarded: !!s.onboarded, ui_lang: s.ui_lang };
}

// Limitation simple des tentatives (en mémoire, par IP + identifiant)
const attempts = new Map();
function throttle(key, max = 8, windowMs = 15 * 60e3) {
  const now = Date.now();
  const a = (attempts.get(key) || []).filter((t) => now - t < windowMs);
  if (a.length >= max) throw new HttpError(429, "Trop de tentatives. Réessaie dans quelques minutes.");
  a.push(now); attempts.set(key, a);
}
setInterval(() => { const now = Date.now(); for (const [k, v] of attempts) if (!v.some((t) => now - t < 15 * 60e3)) attempts.delete(k); }, 10 * 60e3).unref();

const can = (user, role) => !!user && RANK[user.role] >= RANK[role];
function requireUser(ctx) { if (!ctx.user) throw new HttpError(401, "Connecte-toi pour continuer."); }
const requireRole = (role) => (ctx) => { requireUser(ctx); if (!can(ctx.user, role)) throw new HttpError(403, "Tu n’as pas accès à cette fonction."); };

function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 160; }

function register({ name, email, password, phone }) {
  name = String(name || "").trim(); email = String(email || "").trim().toLowerCase(); phone = String(phone || "").trim() || null;
  if (name.length < 2 || name.length > 80) throw new HttpError(400, "Indique ton nom (2 caractères au moins).");
  if (!validEmail(email)) throw new HttpError(400, "Adresse électronique invalide.");
  if (String(password || "").length < 8) throw new HttpError(400, "Le mot de passe doit contenir au moins 8 caractères.");
  if (one("SELECT 1 FROM users WHERE email = ?", email)) throw new HttpError(409, "Un compte existe déjà avec cette adresse. Connecte-toi.");
  const admins = (process.env.ADMIN_EMAILS || "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
  const role = admins.includes(email) ? "admin" : "learner";
  const r = run("INSERT INTO users(name, email, phone, pass_hash, role) VALUES(?, ?, ?, ?, ?)", name, email, phone, hashPassword(password), role);
  audit(Number(r.lastInsertRowid), "register", { role });
  return Number(r.lastInsertRowid);
}

function login({ email, password }) {
  email = String(email || "").trim().toLowerCase();
  const u = one("SELECT id, pass_hash, suspended FROM users WHERE email = ?", email);
  if (!u || !verifyPassword(String(password || ""), u.pass_hash)) throw new HttpError(401, "Adresse ou mot de passe incorrect.");
  if (u.suspended) throw new HttpError(403, "Ce compte est suspendu. Contacte l’équipe NEXOMIA.");
  return u.id;
}

function createResetToken(userId) {
  const token = crypto.randomBytes(24).toString("base64url");
  run("INSERT INTO reset_tokens(token_hash, user_id, expires_at) VALUES(?, ?, ?)", sha(token), userId, new Date(Date.now() + 48 * 3600e3).toISOString());
  return token;
}
function useResetToken(token, password) {
  if (String(password || "").length < 8) throw new HttpError(400, "Le mot de passe doit contenir au moins 8 caractères.");
  const r = one("SELECT user_id, expires_at, used FROM reset_tokens WHERE token_hash = ?", sha(String(token || "")));
  if (!r || r.used || r.expires_at < new Date().toISOString()) throw new HttpError(400, "Ce lien a expiré ou a déjà été utilisé. Demande un nouveau lien à l’équipe.");
  run("UPDATE users SET pass_hash = ? WHERE id = ?", hashPassword(password), r.user_id);
  run("UPDATE reset_tokens SET used = 1 WHERE token_hash = ?", sha(String(token)));
  run("DELETE FROM sessions WHERE user_id = ?", r.user_id);
  audit(r.user_id, "password_reset");
  return r.user_id;
}

module.exports = { hashPassword, verifyPassword, createSession, destroySession, currentUser, throttle, can, requireUser, requireRole, register, login, createResetToken, useResetToken, ROLES, RANK };
