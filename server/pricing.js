// Tarif dégressif par commande : prix total selon le nombre de cours payés ensemble.
// Par défaut : 1 cours = 5 USD, 2 cours = 8 USD, 3 cours = 12 USD, puis +4 USD par cours.
const { getSetting } = require("./db");

const DEFAULT_PRICING = { tiers: [5, 8, 12], extra: 4, currency: "USD" };

function pricing() {
  const p = getSetting("pricing", DEFAULT_PRICING);
  return { ...DEFAULT_PRICING, ...p };
}

function totalFor(n, p = pricing()) {
  if (n <= 0) return 0;
  const t = p.tiers;
  if (n <= t.length) return round(t[n - 1]);
  return round(t[t.length - 1] + (n - t.length) * p.extra);
}

const round = (x) => Math.round(x * 100) / 100;

// Répartit le total sur les cours (pour les reçus) ; la somme est exacte.
function splitTotal(n, total) {
  const base = Math.floor((total / n) * 100) / 100;
  const parts = Array(n).fill(base);
  parts[0] = round(total - base * (n - 1));
  return parts;
}

function validatePricing(p) {
  if (!Array.isArray(p.tiers) || p.tiers.length < 1 || p.tiers.length > 10) return "Indique entre 1 et 10 paliers.";
  if (p.tiers.some((x) => typeof x !== "number" || !(x > 0) || x > 1000)) return "Chaque palier doit être un montant positif.";
  for (let i = 1; i < p.tiers.length; i++) if (p.tiers[i] < p.tiers[i - 1]) return "Les paliers doivent être croissants.";
  if (typeof p.extra !== "number" || !(p.extra > 0)) return "Le prix par cours supplémentaire doit être positif.";
  return null;
}

module.exports = { pricing, totalFor, splitTotal, validatePricing, DEFAULT_PRICING };
