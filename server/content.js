// Création et lecture du contenu pédagogique (utilisé par le Studio et par l'amorçage).
const { one, all, run, tx } = require("./db");

const DOMAIN_COLORS = { "Langues": "#2F7D32", "Numérique": "#1E2D3B", "Design et création": "#4E8B5A", "Entrepreneuriat": "#3A566B" };
const LANGS = { "en-GB": "Anglais (Royaume-Uni)", "en-US": "Anglais (États-Unis)", "pt-BR": "Portugais (Brésil)", "pt-PT": "Portugais (Portugal)", "fr-FR": "Français", "sw-KE": "Swahili", "es-ES": "Espagnol", "ln-CD": "Lingala" };

function slugify(s) {
  return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "cours";
}
function uniqueSlug(base) {
  let s = slugify(base), i = 2;
  while (one("SELECT 1 FROM courses WHERE slug = ?", s)) s = `${slugify(base)}-${i++}`;
  return s;
}

// "phrase | traduction" par ligne ; préfixe facultatif "A:" / "B:" / "N:" pour la voix.
function parseLines(text) {
  return String(text || "").split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 80).map((l, i) => {
    let speaker = null;
    const m = l.match(/^([ABN])\s*:\s*(.*)$/);
    if (m) { speaker = m[1]; l = m[2]; }
    const [t, tr = ""] = l.split("|").map((x) => x.trim());
    return { speaker: speaker || (i % 2 ? "B" : "A"), text: t.slice(0, 400), translation: tr.slice(0, 400) };
  }).filter((x) => x.text);
}

function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

function autoQuestions(sents) {
  const withTr = sents.filter((s) => s.translation);
  const qs = withTr.slice(0, 3).map((s) => {
    const wrong = shuffle(withTr.filter((o) => o.translation !== s.translation).map((o) => o.translation)).slice(0, 2);
    const opts = shuffle([s.translation, ...wrong]);
    return { say: s.text, prompt: "Qu’as-tu entendu ?", options: opts, answer: opts.indexOf(s.translation), explanation: `« ${s.text} » signifie « ${s.translation} ».` };
  }).filter((q) => q.options.length >= 2);
  if (!qs.length && sents.length) qs.push({ say: sents[0].text, prompt: "As-tu bien compris la première phrase ?", options: ["Oui, je l’ai comprise", "Je veux la réécouter"], answer: 0, explanation: "Réécoute autant de fois que nécessaire, c’est ainsi qu’on progresse." });
  return qs;
}

// Remplace le contenu d'une leçon. Les audios déjà enregistrés sont conservés
// pour les phrases dont le texte n'a pas changé.
function writeLessonContent(lessonId, { sentences, vocab, questions }) {
  const old = all("SELECT text, audio_file FROM sentences WHERE lesson_id = ?", lessonId);
  const keep = new Map(old.filter((o) => o.audio_file).map((o) => [o.text, o.audio_file]));
  run("DELETE FROM sentences WHERE lesson_id = ?", lessonId);
  sentences.forEach((s, i) => run("INSERT INTO sentences(lesson_id, position, speaker, text, translation, audio_file) VALUES(?, ?, ?, ?, ?, ?)", lessonId, i + 1, s.speaker || "A", s.text, s.translation || "", s.audio_file || keep.get(s.text) || null));
  if (vocab) {
    run("DELETE FROM vocab WHERE lesson_id = ?", lessonId);
    vocab.forEach((v, i) => run("INSERT INTO vocab(lesson_id, position, term, meaning) VALUES(?, ?, ?, ?)", lessonId, i + 1, v.term, v.meaning || ""));
  }
  if (questions) {
    run("DELETE FROM questions WHERE lesson_id = ?", lessonId);
    questions.forEach((q, i) => run("INSERT INTO questions(lesson_id, position, say, prompt, options, answer, explanation) VALUES(?, ?, ?, ?, ?, ?, ?)", lessonId, i + 1, q.say, q.prompt, JSON.stringify(q.options), q.answer, q.explanation || ""));
  }
}

function addLesson(courseId, { title, goal, duration_min, lines, sentences, vocab, questions, module, notes }) {
  return tx(() => {
    const pos = (one("SELECT MAX(position) AS m FROM lessons WHERE course_id = ?", courseId).m || 0) + 1;
    const sents = sentences || parseLines(lines);
    const r = run("INSERT INTO lessons(course_id, position, title, duration_min, goal, module, notes) VALUES(?, ?, ?, ?, ?, ?, ?)", courseId, pos, String(title || `Leçon ${pos}`).slice(0, 120), duration_min || Math.max(3, sents.length * 2), String(goal || "").slice(0, 300), String(module || "").slice(0, 60), String(notes || "").slice(0, 3000));
    const id = Number(r.lastInsertRowid);
    writeLessonContent(id, {
      sentences: sents,
      vocab: vocab || sents.slice(0, 4).map((s) => ({ term: s.text, meaning: s.translation || "" })),
      questions: questions || autoQuestions(sents),
    });
    return id;
  });
}

function lessonFull(lessonId) {
  const l = one("SELECT * FROM lessons WHERE id = ?", lessonId);
  if (!l) return null;
  l.sentences = all("SELECT id, position, speaker, text, translation, audio_file FROM sentences WHERE lesson_id = ? ORDER BY position", lessonId)
    .map((s) => ({ ...s, audio: s.audio_file ? `/api/audio/${s.audio_file}` : null, audio_file: undefined }));
  l.vocab = all("SELECT term, meaning FROM vocab WHERE lesson_id = ? ORDER BY position", lessonId);
  l.questions = all("SELECT say, prompt, options, answer, explanation FROM questions WHERE lesson_id = ? ORDER BY position", lessonId).map((q) => ({ ...q, options: JSON.parse(q.options) }));
  return l;
}

module.exports = { DOMAIN_COLORS, LANGS, slugify, uniqueSlug, parseLines, autoQuestions, writeLessonContent, addLesson, lessonFull };
