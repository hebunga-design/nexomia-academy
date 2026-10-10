// Voix professionnelles : génération des audios des phrases par un service de synthèse vocale.
// Prestataires : ElevenLabs (ELEVENLABS_API_KEY) ou Google Cloud Text-to-Speech (GOOGLE_TTS_API_KEY).
// Les audios générés sont enregistrés comme des enregistrements normaux : l'équipe peut toujours
// les remplacer par une voix humaine dans le Studio.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { one, all, run, audit, AUDIO_DIR } = require("./db");

function provider() {
  if (process.env.ELEVENLABS_API_KEY) return "elevenlabs";
  if (process.env.GOOGLE_TTS_API_KEY) return "google";
  return null;
}

// Voix par rôle : A (femme), B (homme), N (narration).
const ELEVEN_DEFAULT = { A: "21m00Tcm4TlvDq8ikWAM", B: "pNInz6obpgDQGcFmaJgB", N: "EXAVITQu4vr4xnSDxMaL" };
const GOOGLE_VOICES = {
  "en-GB": { A: "en-GB-Neural2-A", B: "en-GB-Neural2-B", N: "en-GB-Neural2-C" },
  "en-US": { A: "en-US-Neural2-F", B: "en-US-Neural2-D", N: "en-US-Neural2-C" },
  "pt-BR": { A: "pt-BR-Neural2-A", B: "pt-BR-Neural2-B", N: "pt-BR-Neural2-C" },
  "pt-PT": { A: "pt-PT-Wavenet-A", B: "pt-PT-Wavenet-B", N: "pt-PT-Wavenet-D" },
  "fr-FR": { A: "fr-FR-Neural2-A", B: "fr-FR-Neural2-B", N: "fr-FR-Neural2-C" },
  "es-ES": { A: "es-ES-Neural2-A", B: "es-ES-Neural2-B", N: "es-ES-Neural2-C" },
  "sw-KE": { A: "sw-KE-Standard-A", B: "sw-KE-Standard-B", N: "sw-KE-Standard-A" },
};

async function synthElevenLabs(text, lang, speaker) {
  const voice = process.env[`ELEVENLABS_VOICE_${speaker}`] || ELEVEN_DEFAULT[speaker] || ELEVEN_DEFAULT.A;
  const base = process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io";
  const res = await fetch(`${base}/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2", voice_settings: { stability: 0.55, similarity_boost: 0.75 } }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw Object.assign(new Error(`ElevenLabs HTTP ${res.status}`), { status: res.status, body: (await res.text().catch(() => "")).slice(0, 200) });
  return Buffer.from(await res.arrayBuffer());
}
async function synthGoogle(text, lang, speaker) {
  const voices = GOOGLE_VOICES[lang] || GOOGLE_VOICES[Object.keys(GOOGLE_VOICES).find((k) => k.startsWith(lang.slice(0, 2)))] || null;
  const voice = voices ? { languageCode: lang, name: voices[speaker] || voices.A } : { languageCode: lang };
  const base = process.env.GOOGLE_TTS_BASE_URL || "https://texttospeech.googleapis.com";
  const res = await fetch(`${base}/v1/text:synthesize?key=${encodeURIComponent(process.env.GOOGLE_TTS_API_KEY)}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: { text }, voice, audioConfig: { audioEncoding: "MP3", speakingRate: 0.95, sampleRateHertz: 24000, effectsProfileId: ["handset-class-device"] } }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw Object.assign(new Error(`Google TTS HTTP ${res.status}`), { status: res.status, body: (await res.text().catch(() => "")).slice(0, 200) });
  const j = await res.json();
  return Buffer.from(j.audioContent, "base64");
}
function synth(text, lang, speaker) { return provider() === "elevenlabs" ? synthElevenLabs(text, lang, speaker) : synthGoogle(text, lang, speaker); }

function missing(courseId) {
  return all(`SELECT s.id, s.text, s.speaker, c.lang FROM sentences s JOIN lessons l ON l.id = s.lesson_id JOIN courses c ON c.id = l.course_id
              WHERE c.id = ? AND s.audio_file IS NULL ORDER BY l.position, s.position`, courseId);
}
function status() {
  const courses = all(`SELECT c.id, c.title, c.lang, COUNT(s.id) AS total, SUM(CASE WHEN s.audio_file IS NOT NULL THEN 1 ELSE 0 END) AS done, SUM(LENGTH(CASE WHEN s.audio_file IS NULL THEN s.text END)) AS chars
                       FROM courses c JOIN lessons l ON l.course_id = c.id JOIN sentences s ON s.lesson_id = l.id GROUP BY c.id ORDER BY c.id`);
  return { provider: provider(), job: { ...job, errors: job.errors.slice(-5) }, courses: courses.map((c) => ({ ...c, chars: c.chars || 0 })) };
}

const job = { running: false, course: null, done: 0, total: 0, failed: 0, errors: [], started_at: null, finished_at: null, stopped: false };
async function runJob(courseId, userId) {
  if (job.running) throw new Error("Une génération est déjà en cours.");
  if (!provider()) throw new Error("Aucun service de voix n’est configuré.");
  const list = missing(courseId);
  const c = one("SELECT title FROM courses WHERE id = ?", courseId);
  Object.assign(job, { running: true, course: c ? c.title : courseId, done: 0, total: list.length, failed: 0, errors: [], started_at: new Date().toISOString(), finished_at: null, stopped: false });
  audit(userId, "tts.start", { course: courseId, sentences: list.length, provider: provider() });
  (async () => {
    let consecutive = 0;
    for (const s of list) {
      if (job.stopped) break;
      try {
        const buf = await synth(s.text, s.lang, ["A", "B", "N"].includes(s.speaker) ? s.speaker : "A");
        if (buf.length < 500) throw new Error("Audio vide");
        const name = crypto.randomBytes(16).toString("hex") + ".mp3";
        fs.writeFileSync(path.join(AUDIO_DIR, name), buf);
        // Ne pas écraser un enregistrement ajouté entre-temps par l'équipe.
        const r = run("UPDATE sentences SET audio_file = ? WHERE id = ? AND audio_file IS NULL", name, s.id);
        if (!r.changes) fs.unlinkSync(path.join(AUDIO_DIR, name));
        job.done++; consecutive = 0;
      } catch (e) {
        job.failed++; consecutive++;
        job.errors.push(`${e.message}${e.body ? " · " + e.body : ""}`);
        console.error(`[tts] phrase ${s.id} : ${e.message}`);
        if (e.status === 401 || e.status === 403 || e.status === 402 || consecutive >= 5) { job.errors.push("Génération arrêtée : vérifie la clé, le crédit ou les droits du compte de voix."); break; }
        await new Promise((r) => setTimeout(r, e.status === 429 ? 5000 : 800));
      }
    }
    job.running = false; job.finished_at = new Date().toISOString();
    audit(userId, "tts.end", { course: courseId, done: job.done, failed: job.failed });
    console.log(`[tts] ${job.course} : ${job.done} audios générés, ${job.failed} échecs`);
  })();
  return status();
}
function stopJob() { job.stopped = true; return status(); }

module.exports = { provider, status, runJob, stopJob };
