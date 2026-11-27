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

// Voix par type de personnage : f (femme), m (homme), f2 / m2 (deuxième voix), n (narration).
// Chaque leçon indique quel personnage (A, B, C, N…) utilise quel type de voix.
const ELEVEN_DEFAULT = { f: "21m00Tcm4TlvDq8ikWAM", m: "pNInz6obpgDQGcFmaJgB", f2: "EXAVITQu4vr4xnSDxMaL", m2: "ErXwobaYiN019PkySvjV", n: "MF3mGyEYCl7XYWbV9V6O" };
const GOOGLE_VOICES = {
  "en-GB": { f: "en-GB-Neural2-A", m: "en-GB-Neural2-B", f2: "en-GB-Neural2-C", m2: "en-GB-Neural2-D", n: "en-GB-Neural2-F" },
  "en-US": { f: "en-US-Neural2-F", m: "en-US-Neural2-D", f2: "en-US-Neural2-C", m2: "en-US-Neural2-A", n: "en-US-Neural2-H" },
  "pt-BR": { f: "pt-BR-Neural2-A", m: "pt-BR-Neural2-B", f2: "pt-BR-Neural2-C", m2: "pt-BR-Wavenet-B", n: "pt-BR-Neural2-C" },
  "pt-PT": { f: "pt-PT-Wavenet-A", m: "pt-PT-Wavenet-B", f2: "pt-PT-Wavenet-D", m2: "pt-PT-Wavenet-C", n: "pt-PT-Wavenet-D" },
  "fr-FR": { f: "fr-FR-Neural2-A", m: "fr-FR-Neural2-B", f2: "fr-FR-Neural2-C", m2: "fr-FR-Neural2-D", n: "fr-FR-Neural2-E" },
  "es-ES": { f: "es-ES-Neural2-A", m: "es-ES-Neural2-B", f2: "es-ES-Neural2-C", m2: "es-ES-Neural2-F", n: "es-ES-Neural2-E" },
  "sw-KE": { f: "sw-KE-Standard-A", m: "sw-KE-Standard-B", f2: "sw-KE-Standard-A", m2: "sw-KE-Standard-B", n: "sw-KE-Standard-A" },
};
const DEFAULT_ROLES = { A: "f", B: "m", N: "n" };
function voiceType(speaker, voicesJson) {
  let v = {}; try { v = JSON.parse(voicesJson || "{}"); } catch {}
  return v[speaker] || DEFAULT_ROLES[speaker] || "f";
}

async function synthElevenLabs(text, lang, speaker, voiceId, model) {
  const voice = voiceId || process.env[`ELEVENLABS_VOICE_${speaker.toUpperCase()}`] || ELEVEN_DEFAULT[speaker] || ELEVEN_DEFAULT.f;
  const base = process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io";
  const res = await fetch(`${base}/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: model || process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2", voice_settings: { stability: 0.55, similarity_boost: 0.75 } }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw Object.assign(new Error(`ElevenLabs HTTP ${res.status}`), { status: res.status, body: (await res.text().catch(() => "")).slice(0, 200) });
  return Buffer.from(await res.arrayBuffer());
}
async function synthGoogle(text, lang, speaker) {
  const voices = GOOGLE_VOICES[lang] || GOOGLE_VOICES[Object.keys(GOOGLE_VOICES).find((k) => k.startsWith(lang.slice(0, 2)))] || null;
  const voice = voices ? { languageCode: lang, name: voices[speaker] || voices.f } : { languageCode: lang };
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
  return all(`SELECT s.id, s.text, s.speaker, l.voices, c.lang FROM sentences s JOIN lessons l ON l.id = s.lesson_id JOIN courses c ON c.id = l.course_id
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
        const buf = await synth(s.text, s.lang, voiceType(s.speaker, s.voices));
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

// Phrases d'accueil (page d'accueil) : voix de Charlie, générées une seule fois puis servies à tous.
const HERO = {
  en: ["Hello! My name is Amani.", "Hi Amani, I’m Grace. Nice to meet you.", "I’m from Lubumbashi. And you?"],
  pt: ["Olá! Eu me chamo Amani.", "Prazer, eu sou a Grace.", "Eu sou de Lubumbashi, na RDC."],
};
const HERO_VOICE = process.env.ELEVENLABS_VOICE_HOME || "IKne3meq5aSn9XLyUdCD"; // Charlie
const HERO_DIR = path.join(AUDIO_DIR, "hero");
const heroFile = (lang, i) => path.join(HERO_DIR, `${HERO_VOICE}-${lang}-${i}.mp3`);
// Message de bienvenue en plusieurs langues (même voix). Le swahili et le lingala passent par le modèle v3 (plus de langues).
const WELCOME = {
  fr: ["Bienvenue chez NEXOMIA ! Nous sommes ravis que tu sois là. Chez nous, on parle plusieurs langues : apprends, pratique et grandis avec nous.", "eleven_multilingual_v2"],
  en: ["Welcome to NEXOMIA! We’re so happy you’re here. We speak many languages: learn, practise and grow with us.", "eleven_multilingual_v2"],
  sw: ["Karibu NEXOMIA! Tunafurahi sana kuwa uko hapa. Tunazungumza lugha nyingi: jifunze, fanya mazoezi na ukue pamoja nasi.", "eleven_v3"],
  ln: ["Boye malamu na NEXOMIA ! Tosepeli mingi denge ozali awa.", "eleven_v3"],
  zh: ["欢迎来到 NEXOMIA！我们很高兴你在这里。我们说多种语言：和我们一起学习、练习、成长。", "eleven_multilingual_v2"],
  pt: ["Bem-vindo à NEXOMIA! Estamos muito felizes por estares aqui. Falamos várias línguas: aprende, pratica e cresce connosco.", "eleven_multilingual_v2"],
  rn: ["Kaze muri NEXOMIA! Turanezerewe cane kuba uri ng'aha. Tuvuga indimi nyinshi: wige, wimenyereze kandi ukure hamwe natwe.", "eleven_v3"],
  lg: ["Tukwanirizza mu NEXOMIA! Tusanyuse nnyo okuba nti oli wano. Twogera ennimi nnyingi: yiga, weegezeemu era okule naffe.", "eleven_v3"],
  ur: ["نیکسومیا میں خوش آمدید! ہمیں بہت خوشی ہے کہ آپ یہاں ہیں۔ ہم کئی زبانیں بولتے ہیں: ہمارے ساتھ سیکھیں، مشق کریں اور آگے بڑھیں۔", "eleven_v3"],
  zu: ["Siyakwamukela ku-NEXOMIA! Sijabule kakhulu ukuthi ulapha. Sikhuluma izilimi eziningi: funda, zijwayeze futhi ukhule nathi.", "eleven_v3"],
  xh: ["Wamkelekile kwi-NEXOMIA! Sivuya kakhulu kuba ulapha. Sithetha iilwimi ezininzi: funda, uziqhelanise kwaye ukhule nathi.", "eleven_v3"],
  af: ["Welkom by NEXOMIA! Ons is baie bly dat jy hier is. Ons praat baie tale: leer, oefen en groei saam met ons.", "eleven_v3"],
  st: ["Rea o amohela ho NEXOMIA! Re thabile haholo hore ebe o mona. Re bua dipuo tse ngata: ithute, ikwetlise mme o hole le rona.", "eleven_v3"],
};
const welcomeFile = (lang) => path.join(HERO_DIR, `${HERO_VOICE}-welcome-${lang}${lang === "ln" ? "-v2" : ""}.mp3`);
async function ensureHero() {
  if (provider() !== "elevenlabs") return;
  fs.mkdirSync(HERO_DIR, { recursive: true });
  for (const [lang, lines] of Object.entries(HERO)) for (let i = 0; i < lines.length; i++) {
    if (fs.existsSync(heroFile(lang, i))) continue;
    try { const buf = await synthElevenLabs(lines[i], lang, "m", HERO_VOICE); if (buf.length > 500) fs.writeFileSync(heroFile(lang, i), buf); }
    catch (e) { console.error(`[tts] accueil ${lang}-${i} : ${e.message}`); return; }
  }  for (const [lang, [text, model]] of Object.entries(WELCOME)) {
    if (fs.existsSync(welcomeFile(lang))) continue;
    try { const buf = await synthElevenLabs(text, lang, "m", HERO_VOICE, model); if (buf.length > 500) fs.writeFileSync(welcomeFile(lang), buf); }
    catch (e) { console.error(`[tts] bienvenue ${lang} : ${e.message}${e.body ? " · " + e.body : ""}`); }
  }
}

module.exports = { provider, status, runJob, stopJob, ensureHero, heroFile, welcomeFile };
