// Catalogue de départ : publié automatiquement au premier démarrage si la base est vide.
const { one, all, run, tx, getSetting, setSetting, audit } = require("./db");
const { addLesson, writeLessonContent, DOMAIN_COLORS } = require("./content");
const EN = require("./courses/anglais");

const S = (speaker, text, translation = "") => ({ speaker, text, translation });
const Q = (say, prompt, options, answer, explanation) => ({ say, prompt, options, answer, explanation });

const COURSES = [
  { slug: "anglais", code: EN.meta.code, big: "En", domain: "Langues", title: "Anglais", level: EN.meta.level, lang: EN.meta.lang, template: "Langue",
    description: EN.meta.description, lessons: EN.lessons },
  { slug: "portugais", code: "PT-A1", big: "Pt", domain: "Langues", title: "Portugais", level: "Débutant · A1", lang: "pt-BR", template: "Langue",
    description: "Portugais du Brésil pour communiquer avec l’Angola, le Mozambique et le Brésil : commerce, voyage, travail.",
    lessons: [
      { title: "Apresentar-se", duration_min: 12, goal: "Tu sais maintenant te présenter en portugais.",
        sentences: [S("A", "Olá! Eu me chamo Amani.", "Bonjour ! Je m’appelle Amani."), S("B", "Prazer, eu sou a Grace.", "Enchantée, je suis Grace."), S("A", "De onde você é?", "D’où viens-tu ?"), S("B", "Eu sou de Lubumbashi, na RDC.", "Je suis de Lubumbashi, en RDC."), S("A", "Eu trabalho com design gráfico.", "Je travaille dans le design graphique."), S("B", "Que bom! Eu estou aprendendo português.", "Super ! J’apprends le portugais.")],
        vocab: [{ term: "Prazer", meaning: "Enchanté(e)" }, { term: "De onde você é?", meaning: "D’où viens-tu ?" }, { term: "Eu trabalho", meaning: "Je travaille" }, { term: "Que bom!", meaning: "Super !" }],
        questions: [Q("De onde você é?", "Qu’as-tu entendu ?", ["Comment vas-tu ?", "D’où viens-tu ?", "Où vas-tu ?"], 1, "« De onde você é? » demande l’origine de quelqu’un.")] },
      { title: "No mercado", duration_min: 12, goal: "Tu sais demander un prix et acheter au marché en portugais.",
        sentences: [S("A", "Bom dia! Quanto custa este tecido?", "Bonjour ! Combien coûte ce tissu ?"), S("B", "Custa dez dólares.", "Il coûte dix dollars."), S("A", "É um pouco caro. Pode fazer oito?", "C’est un peu cher. Vous pouvez faire huit ?"), S("B", "Tudo bem, oito dólares.", "D’accord, huit dollars.")] },
    ] },
  { slug: "design-graphique", code: "DG-01", big: "Dg", domain: "Design et création", title: "Design graphique", level: "Initiation", lang: "fr-FR", template: "Compétence pratique",
    description: "Créer des visuels professionnels sur téléphone et les vendre aux commerces de ton quartier.",
    lessons: [
      { title: "Les trois règles d’un bon visuel", duration_min: 10, goal: "Tu connais les trois règles d’un visuel qui se vend.",
        sentences: [S("N", "Un bon visuel se comprend en trois secondes."), S("N", "Première règle : un seul message par visuel."), S("N", "Deuxième règle : un contraste fort entre le texte et le fond."), S("N", "Troisième règle : de l’espace vide autour des éléments importants."), S("N", "Exercice : choisis une affiche dans ta rue et améliore-la avec ces trois règles.")],
        vocab: [{ term: "Contraste", meaning: "Différence de clarté entre deux couleurs" }, { term: "Hiérarchie", meaning: "Ordre de lecture des éléments" }, { term: "Espace vide", meaning: "Zone sans élément qui fait respirer le visuel" }],
        questions: [Q("Première règle : un seul message par visuel.", "Combien de messages principaux par visuel ?", ["Un seul", "Deux", "Autant que possible"], 0, "Un seul message rend le visuel clair et rapide à comprendre.")] },
      { title: "Choisir ses couleurs", duration_min: 10, goal: "Tu sais composer une palette de trois couleurs.",
        sentences: [S("N", "Une palette efficace compte trois couleurs."), S("N", "Une couleur principale, qui représente la marque."), S("N", "Une couleur neutre, pour le fond et le texte."), S("N", "Et une couleur d’accent, pour le bouton ou le prix.")] },
    ] },
  { slug: "creation-de-contenu", code: "CC-01", big: "Cc", domain: "Design et création", title: "Création de contenu", level: "Initiation", lang: "fr-FR", template: "Compétence pratique",
    description: "Filmer, écrire et publier du contenu qui attire des clients pour un commerce local.",
    lessons: [
      { title: "Raconter une histoire en 30 secondes", duration_min: 9, goal: "Tu sais construire une vidéo courte qui capte l’attention.",
        sentences: [S("N", "Une vidéo courte commence par une accroche dans les deux premières secondes."), S("N", "Ensuite, montre le problème que vit ton client."), S("N", "Puis montre la solution, en action."), S("N", "Termine par un appel clair : appelle, commande, viens nous voir.")],
        vocab: [{ term: "Accroche", meaning: "Ce qui retient l’attention au début" }, { term: "Appel à l’action", meaning: "Ce que tu demandes au spectateur de faire" }],
        questions: [Q("Une vidéo courte commence par une accroche dans les deux premières secondes.", "Que faut-il dans les deux premières secondes ?", ["Le logo", "Une accroche", "Le prix"], 1, "L’accroche décide si la personne continue à regarder.")] },
      { title: "Filmer avec son téléphone", duration_min: 9, goal: "Tu sais filmer une vidéo nette et lumineuse avec ton téléphone.",
        sentences: [S("N", "Nettoie l’objectif de ton téléphone avant chaque tournage."), S("N", "Filme face à la lumière du jour, jamais dos à une fenêtre."), S("N", "Tiens ton téléphone à deux mains, les coudes contre le corps.")] },
    ] },
  { slug: "bases-du-numerique", code: "NU-01", big: "Nu", domain: "Numérique", title: "Bases du numérique", level: "Initiation", lang: "fr-FR", template: "Compétence pratique",
    description: "Maîtriser son téléphone et son ordinateur pour travailler : courriel, documents, sécurité.",
    lessons: [
      { title: "Créer un mot de passe solide", duration_min: 8, goal: "Tu sais protéger tes comptes avec un mot de passe solide.",
        sentences: [S("N", "Un mot de passe solide est long, au moins douze caractères."), S("N", "Utilise une phrase que toi seul connais, par exemple trois mots et un chiffre."), S("N", "N’utilise jamais le même mot de passe pour deux comptes."), S("N", "Et ne donne jamais ton code Mobile Money à personne, même à un agent.")],
        vocab: [{ term: "Phrase de passe", meaning: "Plusieurs mots réunis en un mot de passe" }, { term: "Double authentification", meaning: "Un code en plus du mot de passe" }],
        questions: [Q("Un mot de passe solide est long, au moins douze caractères.", "Quelle longueur minimale est conseillée ?", ["6 caractères", "8 caractères", "12 caractères"], 2, "Plus un mot de passe est long, plus il est difficile à deviner.")] },
      { title: "Écrire un courriel professionnel", duration_min: 10, goal: "Tu sais écrire un courriel clair à un client.",
        sentences: [S("N", "Un bon objet résume ta demande en quelques mots."), S("N", "Commence par une salutation, puis va droit au but."), S("N", "Termine par la prochaine étape et ta signature avec ton numéro.")] },
    ] },
  { slug: "vendre-ses-services", code: "EP-01", big: "Ep", domain: "Entrepreneuriat", title: "Vendre ses services", level: "Initiation", lang: "fr-FR", template: "Entrepreneuriat",
    description: "Fixer un prix, trouver ses trois premiers clients et se faire payer par Mobile Money.",
    lessons: [
      { title: "Fixer son premier prix", duration_min: 11, goal: "Tu sais calculer un prix qui couvre tes coûts et ton temps.",
        sentences: [S("N", "Ton prix doit couvrir trois choses : tes coûts, ton temps et ta marge."), S("N", "Note combien d’heures te prend une prestation."), S("N", "Ajoute le coût de ta connexion, de ton matériel et de tes déplacements."), S("N", "Compare avec les prix du marché, puis annonce ton prix avec assurance.")],
        vocab: [{ term: "Marge", meaning: "Ce qui reste après les coûts" }, { term: "Prestation", meaning: "Un service rendu à un client" }],
        questions: [Q("Ton prix doit couvrir trois choses : tes coûts, ton temps et ta marge.", "Que doit couvrir ton prix ?", ["Seulement tes coûts", "Coûts, temps et marge", "Le prix du concurrent"], 1, "Sans marge, ton activité ne peut pas grandir.")] },
      { title: "Trouver ses trois premiers clients", duration_min: 11, goal: "Tu as une méthode pour trouver tes trois premiers clients.",
        sentences: [S("N", "Commence par ton entourage : famille, amis, voisins commerçants."), S("N", "Propose un premier travail à prix réduit, en échange d’un témoignage."), S("N", "Montre chaque réalisation sur ton statut WhatsApp, avec l’accord du client.")] },
    ] },
];

function seedIfEmpty() {
  if (one("SELECT COUNT(*) AS n FROM courses").n > 0) return false;
  tx(() => {
    for (const c of COURSES) {
      run(`INSERT INTO courses(slug, domain, title, code, big, level, lang, template, description, color, status, published_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', datetime('now'))`,
        c.slug, c.domain, c.title, c.code, c.big, c.level, c.lang, c.template, c.description, DOMAIN_COLORS[c.domain] || "#2F7D32");
    }
  });
  for (const c of COURSES) {
    const id = one("SELECT id FROM courses WHERE slug = ?", c.slug).id;
    for (const l of c.lessons) addLesson(id, l);
  }
  setSetting(`content:${EN.slug}`, EN.VERSION);
  return true;
}

// Met à jour un cours livré avec l'application quand sa version de contenu augmente.
// Les leçons existantes sont mises à jour sur place (mêmes identifiants), pour conserver
// la progression et les abonnements ; les audios enregistrés restent attachés aux phrases identiques.
function syncCourse(pack) {
  const key = `content:${pack.slug}`;
  if (getSetting(key, 0) >= pack.VERSION) return null;
  const c = one("SELECT id FROM courses WHERE slug = ?", pack.slug);
  if (!c) return null;
  tx(() => {
    run("UPDATE courses SET code = ?, level = ?, lang = ?, description = ?, updated_at = datetime('now') WHERE id = ?", pack.meta.code, pack.meta.level, pack.meta.lang, pack.meta.description, c.id);
    const existing = all("SELECT id FROM lessons WHERE course_id = ? ORDER BY position, id", c.id);
    pack.lessons.forEach((l, i) => {
      let id = existing[i] && existing[i].id;
      if (id) run("UPDATE lessons SET position = ?, title = ?, duration_min = ?, goal = ?, module = ?, notes = ? WHERE id = ?", i + 1, l.title, l.duration_min, l.goal, l.module, l.notes, id);
      else id = Number(run("INSERT INTO lessons(course_id, position, title, duration_min, goal, module, notes) VALUES(?, ?, ?, ?, ?, ?, ?)", c.id, i + 1, l.title, l.duration_min, l.goal, l.module, l.notes).lastInsertRowid);
      writeLessonContent(id, { sentences: l.sentences, vocab: l.vocab, questions: l.questions });
    });
    for (const extra of existing.slice(pack.lessons.length)) run("DELETE FROM lessons WHERE id = ?", extra.id);
    setSetting(key, pack.VERSION);
  });
  audit(null, "content.sync", { course: pack.slug, version: pack.VERSION, lessons: pack.lessons.length });
  return pack.lessons.length;
}

function syncBundledContent() { return syncCourse(EN); }

module.exports = { seedIfEmpty, syncBundledContent };
