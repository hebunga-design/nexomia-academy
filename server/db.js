// Base de données SQLite intégrée à Node.js (aucune dépendance externe).
// Le fichier vit dans DATA_DIR, monté sur un volume persistant en production.
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const AUDIO_DIR = path.join(DATA_DIR, "audio");
fs.mkdirSync(AUDIO_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, "nexomia.db"));
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT,
  pass_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner','mentor','coach','creator','reviewer','admin')),
  suspended INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS reset_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  big TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT '',
  lang TEXT NOT NULL DEFAULT 'fr-FR',
  template TEXT NOT NULL DEFAULT 'Langue',
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#2F7D32',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published','archived')),
  review_note TEXT,
  created_by INTEGER REFERENCES users(id),
  reviewed_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT
);
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 10,
  goal TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS sentences (
  id INTEGER PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  speaker TEXT NOT NULL DEFAULT 'A',
  text TEXT NOT NULL,
  translation TEXT NOT NULL DEFAULT '',
  audio_file TEXT
);
CREATE TABLE IF NOT EXISTS vocab (
  id INTEGER PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  term TEXT NOT NULL,
  meaning TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  say TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options TEXT NOT NULL,
  answer INTEGER NOT NULL,
  explanation TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS progress (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  best_score INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  last_sentence INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS listening (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  seconds INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  ref TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled')),
  amount_usd REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  method TEXT NOT NULL,
  phone TEXT,
  provider TEXT NOT NULL,
  provider_order TEXT,
  provider_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT,
  last_check TEXT
);
CREATE TABLE IF NOT EXISTS order_items (
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  unit_price REAL NOT NULL,
  PRIMARY KEY (order_id, course_id)
);
CREATE TABLE IF NOT EXISTS periods (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  order_id INTEGER REFERENCES orders(id),
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'payment',
  UNIQUE (order_id, course_id)
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  action TEXT NOT NULL,
  detail TEXT,
  at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id, position);
CREATE INDEX IF NOT EXISTS idx_sent_lesson ON sentences(lesson_id, position);
CREATE INDEX IF NOT EXISTS idx_periods_user ON periods(user_id, course_id, end_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, provider);
`);

// Migrations légères (colonnes ajoutées après la première version)
function ensureColumn(table, col, def) {
  if (!db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
}
ensureColumn("lessons", "module", "TEXT NOT NULL DEFAULT ''");
ensureColumn("lessons", "notes", "TEXT NOT NULL DEFAULT ''");

// Petits utilitaires
const one = (sql, ...p) => db.prepare(sql).get(...p);
const all = (sql, ...p) => db.prepare(sql).all(...p);
const run = (sql, ...p) => db.prepare(sql).run(...p);
function tx(fn) {
  db.exec("BEGIN IMMEDIATE");
  try { const r = fn(); db.exec("COMMIT"); return r; }
  catch (e) { try { db.exec("ROLLBACK"); } catch {} throw e; }
}
function getSetting(key, fallback) {
  const r = one("SELECT value FROM settings WHERE key = ?", key);
  return r ? JSON.parse(r.value) : fallback;
}
function setSetting(key, value) {
  run("INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", key, JSON.stringify(value));
}
function audit(userId, action, detail) {
  run("INSERT INTO audit(user_id, action, detail) VALUES(?, ?, ?)", userId ?? null, action, detail ? JSON.stringify(detail) : null);
}

module.exports = { db, one, all, run, tx, getSetting, setSetting, audit, DATA_DIR, AUDIO_DIR };
