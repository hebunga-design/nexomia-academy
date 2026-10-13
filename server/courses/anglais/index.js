// Cours d'anglais complet NEXOMIA, de A1 à C2.
// Augmenter VERSION à chaque modification du contenu : le serveur met alors à jour
// les leçons au démarrage (les abonnements et la progression sont conservés).
const LEVELS = [
  ["A1 · Débutant", require("./a1")],
  ["A2 · Élémentaire", require("./a2")],
  ["B1 · Intermédiaire", require("./b1")],
  ["B2 · Intermédiaire avancé", require("./b2")],
  ["C1 · Avancé", require("./c1")],
  ["C2 · Maîtrise", require("./c2")],
];

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
const lessons = LEVELS.flatMap(([module, list]) => list.map((l) => ({
  key: l.k || `${module.split("·")[0].trim().toLowerCase()}-${slug(l.t)}`, formerTitles: l.was || [],
  module, title: l.t, duration_min: l.d, goal: l.goal, notes: l.notes.trim(),
  sentences: l.s.map(S),
  vocab: l.v.map(([term, meaning]) => ({ term, meaning })),
  // L'extrait d'écoute pointe toujours vers une phrase entière du dialogue, pour profiter des voix enregistrées.
  questions: l.q.map((q) => { const full = l.s.find(([, t]) => t === q[0]) || l.s.find(([, t]) => t.includes(q[0])); return placeAnswer(full ? [full[1], ...q.slice(1)] : q, (qn++ * 7 + 1) % 5); }),
})));

module.exports = {
  VERSION: 2,
  slug: "anglais",
  meta: {
    code: "EN", level: "Tous niveaux · A1 à C2", lang: "en-GB",
    description: "Le parcours complet, du tout premier « Hello » jusqu’au discours en public : 44 leçons audio, de débutant (A1) à maîtrise (C2), avec grammaire expliquée en français, vocabulaire et exercices d’écoute.",
  },
  lessons,
};
