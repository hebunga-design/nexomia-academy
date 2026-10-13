// Cours d'anglais complet NEXOMIA, de A1 à C2.
// Augmenter VERSION à chaque modification du contenu : le serveur met alors à jour
// les leçons au démarrage (les abonnements et la progression sont conservés).
const fs = require("node:fs"), path = require("node:path");
const extra = (f) => (fs.existsSync(path.join(__dirname, f + ".js")) ? require("./" + f) : []);
const LEVELS = [
  ["A1 · Débutant", require("./a1"), extra("a1x")],
  ["A2 · Élémentaire", require("./a2"), extra("a2x")],
  ["B1 · Intermédiaire", require("./b1"), extra("b1x")],
  ["B2 · Intermédiaire avancé", require("./b2"), extra("b2x")],
  ["C1 · Avancé", require("./c1"), extra("c1x")],
  ["C2 · Maîtrise", require("./c2"), extra("c2x")],
  ["Pro · Anglais professionnel", [], extra("pro")],
].filter(([, base, more]) => base.length + more.length);

const S = ([speaker, text, translation]) => ({ speaker, text, translation });
// Place la bonne réponse à une position variée mais stable (même ordre à chaque démarrage).
function placeAnswer([say, prompt, options, answer, explanation], n) {
  const target = n % options.length;
  const right = options[answer];
  const rest = options.filter((_, i) => i !== answer);
  const opts = [...rest.slice(0, target), right, ...rest.slice(target)];
  return { say, prompt, options: opts, answer: target, explanation };
}
let qn = 0;
const slug = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// Insère les leçons supplémentaires après la leçon indiquée par « after » (clé), sinon à la fin du niveau.
function merge(module, base, more) {
  const keyOf = (l) => l.k || `${module.split("·")[0].trim().toLowerCase()}-${slug(l.t)}`;
  const out = base.slice(); let pending = more.slice(), guard = 0;
  while (pending.length && guard++ < 50) {
    pending = pending.filter((l) => {
      if (!l.after) { out.push(l); return false; }
      const i = out.findIndex((x) => keyOf(x) === l.after);
      if (i < 0) return true;
      out.splice(i + 1, 0, l); return false;
    });
  }
  if (pending.length) throw new Error(`Leçons non placées (${module}) : ${pending.map((l) => l.t + " après " + l.after).join(", ")}`);
  return out;
}
// Voix par personnage (f = femme, m = homme, f2 / m2 = deuxième voix, n = narration). Par défaut : A = f, B = m, N = n.
const VOICES = {
  "a1-se-presenter": { A: "m", B: "f" }, "a2-fixer-un-rendez-vous": { A: "m", B: "f" }, "b1-l-entretien-d-embauche": { A: "m", B: "f" },
  "c1-expressions-idiomatiques": { A: "m", B: "f" }, "c1-presenter-son-projet-le-pitch": { N: "m" }, "c1-le-courriel-formel": { N: "m" },
};
const lessons = LEVELS.flatMap(([module, base, more]) => merge(module, base, more).map((l) => ({
  key: l.k || `${module.split("·")[0].trim().toLowerCase()}-${slug(l.t)}`, formerTitles: l.was || [],
  voices: { A: "f", B: "m", N: "n", ...(VOICES[l.k || `${module.split("·")[0].trim().toLowerCase()}-${slug(l.t)}`] || {}), ...(l.voices || {}) },
  module, title: l.t, duration_min: l.d, goal: l.goal, notes: l.notes.trim(),
  sentences: l.s.map(S),
  vocab: l.v.map(([term, meaning]) => ({ term, meaning })),
  // L'extrait d'écoute pointe toujours vers une phrase entière du dialogue, pour profiter des voix enregistrées.
  questions: l.q.map((q) => { const full = l.s.find(([, t]) => t === q[0]) || l.s.find(([, t]) => t.includes(q[0])); return placeAnswer(full ? [full[1], ...q.slice(1)] : q, (qn++ * 7 + 1) % 5); }),
})));

module.exports = {
  VERSION: 5,
  slug: "anglais",
  meta: {
    code: "EN", level: "Tous niveaux · A1 à C2", lang: "en-GB",
    description: "Le parcours complet, du tout premier « Hello » jusqu’au discours en public : 96 leçons audio et histoires, de débutant (A1) à maîtrise (C2), plus un module d’anglais professionnel (mines, douane, santé, banque…), avec grammaire expliquée en français, vocabulaire et exercices d’écoute.",
  },
  lessons,
};
