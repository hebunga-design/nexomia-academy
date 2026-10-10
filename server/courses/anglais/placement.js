// Test de niveau d'anglais (original NEXOMIA) : 4 questions par niveau, de A1 à C2.
// say : phrase lue à voix haute (question d'écoute), facultatif.
module.exports = [
  // A1
  { level: "A1", prompt: "Complète : « My sister ___ a nurse. »", options: ["am", "is", "are"], answer: 1 },
  { level: "A1", say: "Where are you from?", prompt: "Qu’as-tu entendu ?", options: ["Où habites-tu ?", "Tu viens d’où ?", "Où vas-tu ?"], answer: 1 },
  { level: "A1", prompt: "Choisis la bonne phrase :", options: ["I have 25 years.", "I am 25 years old.", "I am 25 years."], answer: 1 },
  { level: "A1", prompt: "Complète : « He ___ to work by bus every day. »", options: ["go", "goes", "going"], answer: 1 },
  // A2
  { level: "A2", prompt: "Complète : « Yesterday I ___ my aunt in Likasi. »", options: ["visit", "visited", "have visited"], answer: 1 },
  { level: "A2", say: "Look! The children are playing outside.", prompt: "Que font les enfants ?", options: ["Ils jouent dehors", "Ils dorment", "Ils mangent dehors"], answer: 0 },
  { level: "A2", prompt: "Complète : « This phone is ___ than that one. »", options: ["more cheap", "cheaper", "cheapest"], answer: 1 },
  { level: "A2", prompt: "Complète : « ___ there a pharmacy near here? »", options: ["Is", "Are", "Does"], answer: 0 },
  // B1
  { level: "B1", prompt: "Complète : « I’ve lived in Lubumbashi ___ 2015. »", options: ["for", "since", "during"], answer: 1 },
  { level: "B1", prompt: "Complète : « If it rains tomorrow, we ___ at home. »", options: ["stay", "will stay", "would stay"], answer: 1 },
  { level: "B1", say: "You don’t have to come early tomorrow.", prompt: "Que signifie la phrase ?", options: ["Tu ne dois surtout pas venir tôt", "Tu n’es pas obligé de venir tôt", "Tu dois venir tôt"], answer: 1 },
  { level: "B1", prompt: "Que signifie « actually » ?", options: ["Actuellement", "En fait", "Finalement"], answer: 1 },
  // B2
  { level: "B2", prompt: "Complète : « The contract ___ by both parties last week. »", options: ["signed", "was signed", "has signed"], answer: 1 },
  { level: "B2", prompt: "Complète : « If I ___ earlier, I wouldn’t have missed the bus. »", options: ["left", "had left", "would leave"], answer: 1 },
  { level: "B2", prompt: "Complète : « She asked me where ___. »", options: ["did I live", "I lived", "do I live"], answer: 1 },
  { level: "B2", say: "Can we put the meeting off until Friday?", prompt: "Que demande la personne ?", options: ["D’annuler la réunion", "De reporter la réunion à vendredi", "D’avancer la réunion"], answer: 1 },
  // C1
  { level: "C1", prompt: "Complète : « Never ___ such a talented group. »", options: ["I have seen", "have I seen", "I saw"], answer: 1 },
  { level: "C1", prompt: "Que signifie « to cut corners » ?", options: ["Bâcler pour gagner du temps", "Prendre un raccourci", "Réduire les prix"], answer: 0 },
  { level: "C1", prompt: "Complète : « I look forward to ___ from you. »", options: ["hear", "hearing", "be heard"], answer: 1 },
  { level: "C1", prompt: "Complète : « ___ you need any help, please contact us. »", options: ["Should", "Would", "Unless"], answer: 0 },
  // C2
  { level: "C2", prompt: "Complète : « The rain seriously ___ sales last month. »", options: ["effected", "affected", "infected"], answer: 1 },
  { level: "C2", prompt: "Complète : « It is essential that every learner ___ registered. »", options: ["is", "be", "will be"], answer: 1 },
  { level: "C2", say: "Well, that didn’t go entirely according to plan.", prompt: "Comment comprendre cette phrase après un échec ?", options: ["Un léger souci", "Un euphémisme pour un vrai désastre", "Une réussite totale"], answer: 1 },
  { level: "C2", prompt: "Le locuteur sous-entend, l’auditeur…", options: ["implies", "infers", "inserts"], answer: 1 },
];
