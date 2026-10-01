// Catalogue de départ : publié automatiquement au premier démarrage si la base est vide.
const { one, run, tx } = require("./db");
const { addLesson, DOMAIN_COLORS } = require("./content");

const S = (speaker, text, translation = "") => ({ speaker, text, translation });
const Q = (say, prompt, options, answer, explanation) => ({ say, prompt, options, answer, explanation });

const COURSES = [
  { slug: "anglais", code: "EN-A1", big: "En", domain: "Langues", title: "Anglais", level: "Débutant · A1", lang: "en-GB", template: "Langue",
    description: "Se présenter, parler de son travail, échanger avec des clients en Zambie, en Afrique du Sud ou en ligne.",
    lessons: [
      { title: "Se présenter", duration_min: 12, goal: "Tu sais maintenant te présenter en anglais.",
        sentences: [S("A", "Hello! My name is Amani.", "Bonjour ! Je m’appelle Amani."), S("B", "Hi Amani, I’m Grace. Nice to meet you.", "Salut Amani, moi c’est Grace. Enchantée."), S("A", "Nice to meet you too. Where are you from?", "Enchanté aussi. Tu viens d’où ?"), S("B", "I’m from Lubumbashi. And you?", "Je viens de Lubumbashi. Et toi ?"), S("A", "I’m from Kinshasa. I’m a graphic designer.", "Je viens de Kinshasa. Je suis graphiste."), S("B", "Great! I’m learning English for my work.", "Super ! J’apprends l’anglais pour mon travail.")],
        vocab: [{ term: "Nice to meet you", meaning: "Enchanté(e)" }, { term: "Where are you from?", meaning: "Tu viens d’où ?" }, { term: "I’m learning", meaning: "J’apprends" }, { term: "my work", meaning: "mon travail" }],
        questions: [Q("Where are you from?", "Qu’as-tu entendu ?", ["Tu viens d’où ?", "Comment tu t’appelles ?", "Où travailles-tu ?"], 0, "« Where are you from? » sert à demander l’origine de quelqu’un."), Q("I’m learning English for my work.", "Pourquoi Grace apprend-elle l’anglais ?", ["Pour voyager", "Pour son travail", "Pour ses études"], 1, "« for my work » signifie « pour mon travail ».")] },
      { title: "Parler de son métier", duration_min: 15, goal: "Tu sais maintenant présenter ton métier en anglais.",
        sentences: [S("A", "What do you do?", "Qu’est-ce que tu fais dans la vie ?"), S("B", "I create logos and posters for small businesses.", "Je crée des logos et des affiches pour les petites entreprises."), S("A", "That sounds interesting. Do you work online?", "Ça a l’air intéressant. Tu travailles en ligne ?"), S("B", "Yes, I have clients in Zambia and South Africa.", "Oui, j’ai des clients en Zambie et en Afrique du Sud.")],
        vocab: [{ term: "What do you do?", meaning: "Que fais-tu ?" }, { term: "small businesses", meaning: "petites entreprises" }, { term: "online", meaning: "en ligne" }],
        questions: [Q("Do you work online?", "Qu’as-tu entendu ?", ["Tu travailles en ligne ?", "Tu travailles le matin ?", "Tu aimes ton travail ?"], 0, "« online » signifie « en ligne ».")] },
      { title: "Fixer un rendez-vous", duration_min: 12, goal: "Tu sais proposer et confirmer un rendez-vous en anglais.",
        sentences: [S("A", "Are you free on Monday?", "Es-tu libre lundi ?"), S("B", "Monday is difficult. What about Tuesday?", "Lundi, c’est difficile. Et mardi ?"), S("A", "Tuesday at ten o’clock is perfect.", "Mardi à dix heures, c’est parfait."), S("B", "Great, see you on Tuesday.", "Super, à mardi.")] },
    ] },
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
  return true;
}

module.exports = { seedIfEmpty };
