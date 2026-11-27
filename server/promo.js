"use strict";
// Vidéos promo TikTok : vidéo + musique préparées (public/promo/base-N.mp4) + voix ElevenLabs (Charlie) mixée ici avec ffmpeg.
const fs = require("node:fs");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { AUDIO_DIR } = require("./db");

const DIR = path.join(AUDIO_DIR, "promo");
const BASE = path.join(__dirname, "..", "public", "promo");
const MAX = 33; // secondes disponibles pour la voix (vidéo de 34 s)
const SCRIPTS = {
  1: "Are you ready? C'est le grand retour ! Aujourd'hui, vendredi vingt-sept novembre, NEXOMIA Academy lance sa formation accélérée d'anglais. Vingt et un cours en direct avec un formateur, depuis ton téléphone. Lundi, mercredi et vendredi, de dix-neuf heures à vingt heures trente. Premier cours : ce soir, à dix-neuf heures. Seulement vingt places. Inscris-toi maintenant sur academy point nexomia trois cent soixante point com.",
  2: "Tu comprends l'anglais… mais tu as peur de parler ? Ce soir, ça change. À dix-neuf heures, NEXOMIA commence sa formation de vingt et un jours, pour débutants. Tu écoutes de vraies voix, tu répètes, et tu parles dès le premier jour. Et chaque dimanche à dix-neuf heures, notre club d'anglais est gratuit et ouvert à tous. Inscris-toi maintenant. Let's speak English, together!",
  3: "Dernière ligne droite ! Plus que quelques heures avant le début de la formation d'anglais NEXOMIA. Rendez-vous ce soir, à dix-neuf heures, en ligne. Abonne-toi, et le lien de la classe t'arrive automatiquement. Vingt places seulement pour ce groupe. Une question ? Écris-nous sur WhatsApp au zéro neuf sept, zéro huit quatre, vingt, zéro sept. NEXOMIA : apprends, produis, transmets. See you tonight!",
};
const status = {};
const sh = (cmd, args) => new Promise((ok, ko) => execFile(cmd, args, { timeout: 180000 }, (e, out, err) => (e ? ko(new Error(String(err || e.message).slice(-300))) : ok(String(out)))));
const outFile = (n) => path.join(DIR, `nexomia-formation-${n}.mp4`);

async function build() {
  fs.mkdirSync(DIR, { recursive: true });
  const T = require("./tts");
  for (const n of Object.keys(SCRIPTS)) {
    const base = path.join(BASE, `base-${n}.mp4`), voice = path.join(DIR, `voice-${n}.mp3`), out = outFile(n);
    try {
      if (!fs.existsSync(base)) { status[n] = "pas de vidéo de base"; continue; }
      if (fs.existsSync(out)) { status[n] = status[n] || "prête"; continue; }
      if (!fs.existsSync(voice)) fs.writeFileSync(voice, await T.synthElevenLabs(SCRIPTS[n], "fr", "m", T.HERO_VOICE, "eleven_multilingual_v2"));
      const dur = Number((await sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", voice])).trim());
      const tempo = dur > MAX ? Math.min(1.15, dur / MAX) : 1;
      const f = `[1:a]atempo=${tempo.toFixed(3)},adelay=500|500,volume=1.25,asplit=2[v][sc];[0:a]volume=0.55[m];[m][sc]sidechaincompress=threshold=0.04:ratio=6:attack=20:release=400[md];[md][v]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]`;
      await sh("ffmpeg", ["-y", "-loglevel", "error", "-i", base, "-i", voice, "-filter_complex", f, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
      status[n] = `prête · voix ${dur.toFixed(1)} s${tempo > 1 ? ` (accélérée ×${tempo.toFixed(2)})` : ""}`;
      console.log(`[promo] vidéo ${n} ${status[n]}`);
    } catch (e) { status[n] = `erreur : ${e.message}`; console.error(`[promo] vidéo ${n} : ${e.message}`); }
  }
}
module.exports = { build, status, outFile };
