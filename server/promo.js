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
const EXPLAINER = `Bonjour, et bienvenue chez NEXOMIA ! NEXOMIA est une entreprise congolaise, basée à Lubumbashi, fondée par Héritier Ebunga Muloko. Notre mission est simple : rendre la langue et le numérique accessibles à tous. Parce qu'ils ouvrent des portes : un premier emploi, un client à l'étranger, une bourse d'études. Nous faisons trois choses. Premièrement : NEXOMIA Academy, notre école en ligne. Tu y apprends l'anglais, du niveau débutant jusqu'à la maîtrise, avec quatre-vingt-dix-neuf leçons. Chaque leçon, c'est un dialogue avec de vraies voix, la grammaire expliquée en français, des exercices corrigés, et la prononciation au micro. Il y a aussi des leçons d'anglais professionnel : les mines, la douane, la santé, la banque, la logistique. Et d'autres cours : le portugais, le design graphique, la création de contenu, les bases du numérique, et vendre ses services. Tu commences par un test de niveau, tu avances leçon après leçon, et à la fin de chaque niveau, tu passes un examen et tu reçois un certificat à ton nom, vérifiable en ligne par un employeur. La première leçon de chaque cours est gratuite. Ensuite, c'est cinq dollars par cours et par mois, payés directement avec ton téléphone : M-Pesa, Airtel Money ou Orange Money. Il y a aussi des cours en direct avec un formateur, comme notre formation accélérée d'anglais en vingt et un jours : le lundi, le mercredi et le vendredi, de dix-neuf heures à vingt heures trente. Et chaque dimanche, notre club d'anglais est gratuit et ouvert à tous. Deuxièmement : la solidarité. NEXOMIA travaille avec des jeunes vulnérables de Lubumbashi : des orphelins, des jeunes sans emploi. Chaque abonnement finance nos visites de terrain et nos activités avec eux. Tu peux même offrir un mois de cours à un jeune qui ne peut pas se l'offrir : il reçoit un code cadeau. Troisièmement : les services pour les entreprises et les organisations. Nous créons des sites web et des applications, rapides même sur une connexion modeste. Nous intégrons le paiement par Mobile Money. Nous construisons des plateformes de formation, et nous hébergeons et maintenons vos outils. Et nous formons vos équipes : l'anglais professionnel par métier, et les outils numériques au travail. NEXOMIA, c'est apprendre, entreprendre, et se connecter au monde, depuis le Katanga. Pour commencer, va sur academy point nexomia trois cent soixante point com. Pour nous écrire sur WhatsApp : zéro neuf sept, zéro huit quatre, vingt, zéro sept. Ou par e-mail : headoffice arobase nexomia trois cent soixante point com. NEXOMIA : apprends, produis, transmets. À très bientôt !`;
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
// Audio de présentation de NEXOMIA (voix + musique en fond, en boucle, fondu final).
const explainerFile = () => path.join(DIR, "nexomia-presentation.mp3");
async function buildExplainer() {
  const out = explainerFile(), voice = path.join(DIR, "presentation-voice.mp3"), music = path.join(BASE, "music-loop.mp3");
  if (fs.existsSync(out)) { status.presentation = status.presentation || "prête"; return; }
  try {
    const T = require("./tts");
    if (!fs.existsSync(voice)) fs.writeFileSync(voice, await T.synthElevenLabs(EXPLAINER, "fr", "m", T.HERO_VOICE, "eleven_multilingual_v2"));
    const dur = Number((await sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", voice])).trim());
    const total = dur + 4;
    const f = `[0:a]adelay=2500|2500,volume=1.25,apad,asplit=2[v][sc];[1:a]volume=0.4[m];[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=500[md];[md][v]amix=inputs=2:duration=first:normalize=0,atrim=0:${total.toFixed(2)},afade=t=out:st=${(total - 3).toFixed(2)}:d=3,alimiter=limit=0.95[a]`;
    await sh("ffmpeg", ["-y", "-loglevel", "error", "-i", voice, "-stream_loop", "-1", "-i", music, "-filter_complex", f, "-map", "[a]", "-t", total.toFixed(2), "-c:a", "libmp3lame", "-b:a", "160k", out]);
    status.presentation = `prête · ${Math.round(total)} s`;
    console.log(`[promo] présentation ${status.presentation}`);
  } catch (e) { status.presentation = `erreur : ${e.message}`; console.error(`[promo] présentation : ${e.message}`); }
}
async function buildAll() { await build(); await buildExplainer(); }
module.exports = { build: buildAll, status, outFile, explainerFile };
