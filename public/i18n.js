/* NEXOMIA Academy — interface en anglais.
   L'interface est écrite en français ; quand l'apprenant choisit l'anglais, les textes
   d'interface sont remplacés à l'affichage. Le contenu des cours (dialogues, traductions,
   explications, exercices rédigés) n'est jamais modifié. */
(() => {
"use strict";
const D = {
  // Navigation et pied de page
  "Accueil": "Home", "Cours": "Courses", "Abonnements": "Subscriptions", "Abonner": "Subscribe", "Mon parcours": "My progress", "Parcours": "Progress",
  "Se connecter": "Log in", "Studio": "Studio", "Admin": "Admin",
  "· Former · Créer · Transformer · Lubumbashi, RDC": "· Train · Create · Transform · Lubumbashi, DRC",
  "Paiements : M-Pesa · Airtel Money · Orange Money · Carte": "Payments: M-Pesa · Airtel Money · Orange Money · Card",
  "Paiements : M-Pesa · Airtel Money · Orange Money": "Payments: M-Pesa · Airtel Money · Orange Money",
  "Navigation principale": "Main navigation", "Navigation": "Navigation", "Changer de thème": "Switch theme", "Se déconnecter": "Log out",
  "NEXOMIA Academy, accueil": "NEXOMIA Academy, home", "Langue": "Language", "Domaines": "Fields", "Niveaux": "Levels", "Vitesse": "Speed",
  "Aller au contenu": "Skip to content", "Changer la langue": "Change language",
  // Accueil
  "Apprends.": "Learn.", "Produis.": "Create.", "Transmets.": "Share.",
  "Des cours de langues et de compétences qui mènent à un vrai revenu. Tu écoutes de vraies voix, tu pratiques chaque jour et tu avances avec une équipe à tes côtés.": "Language and skills courses that lead to real income. You listen to real voices, practise every day and move forward with a team by your side.",
  "Créer mon compte gratuit": "Create my free account", "Voir les cours": "See the courses", "Continuer mon parcours": "Continue my progress",
  "Écoute ta première phrase": "Listen to your first sentence", "Anglais": "English", "Portugais": "Portuguese", "Écouter": "Listen",
  "Le cycle NEXOMIA": "The NEXOMIA cycle", "Ton parcours ne s’arrête pas à la dernière leçon": "Your journey doesn’t stop at the last lesson",
  "Apprendre": "Learn", "Cours, audios et exercices adaptés à ton niveau": "Courses, audio and exercises at your level",
  "Pratiquer": "Practise", "Projets réels, corrigés par un formateur": "Real projects, reviewed by a trainer",
  "Produire": "Produce", "Tes premiers clients, tes premiers revenus": "Your first clients, your first income",
  "Transmettre": "Pass it on", "Deviens mentor et forme à ton tour": "Become a mentor and train others",
  "Catalogue": "Catalogue", "Les compétences qui ouvrent des portes": "Skills that open doors", "Voir tous les cours": "See all courses",
  "Tarif": "Pricing", "par cours · par mois": "per course · per month", "par mois": "per month", "par mois pour ce cours": "per month for this course",
  "Tu paies uniquement les cours que tu suis, et c’est moins cher quand tu en prends plusieurs ensemble. La première leçon de chaque cours est gratuite.": "You only pay for the courses you take, and it’s cheaper when you take several together. The first lesson of every course is free.",
  "Tous les niveaux et toutes les leçons du cours choisi": "Every level and every lesson of the chosen course",
  "Audios téléchargeables pour écouter sans données": "Downloadable audio to listen without data",
  "Exercices corrigés et révisions": "Corrected exercises and reviews",
  "Accompagnement par l’équipe NEXOMIA et groupes de pratique": "Support from the NEXOMIA team and practice groups",
  "Sans engagement : tu renouvelles quand tu veux": "No commitment: renew whenever you want",
  "Choisir mes cours": "Choose my courses", "1re leçon gratuite": "1st lesson free",
  "Ce que tu obtiens": "What you get", "Une méthode complète, pensée pour ton téléphone": "A complete method, designed for your phone",
  "Comment ça marche": "How it works", "Questions fréquentes": "Frequently asked questions",
  "En bref": "At a glance", "leçons d’anglais": "English lessons", "tous les niveaux": "every level", "gratuite": "free", "à chaque niveau": "at every level", "Certificat": "Certificate", "1re leçon": "1st lesson",
  "Écoute de vraies conversations": "Listen to real conversations", "Des dialogues de la vie réelle, phrase par phrase, à la vitesse que tu veux, même écran verrouillé.": "Real-life dialogues, sentence by sentence, at the speed you want, even with the screen locked.",
  "Prononce chaque phrase au micro : les mots bien dits s’affichent en vert, les autres en rouge.": "Say each sentence into the mic: words you pronounce well turn green, the others red.",
  "Exercices variés": "Varied exercises", "Écoute, mots dans l’ordre, phrase à compléter et dictée : tu pratiques vraiment, pas seulement des QCM.": "Listening, word order, gap-fill and dictation: real practice, not just multiple choice.",
  "Les mots que tu oublies reviennent au bon moment. Ceux que tu maîtrises reviennent de plus en plus tard.": "Words you forget come back at the right time. Words you master come back less and less often.",
  "Test de niveau gratuit": "Free level test", "En 10 minutes, tu sais si tu commences en A1, B1 ou C1. Plus de temps perdu sur ce que tu sais déjà.": "In 10 minutes, find out whether you start at A1, B1 or C1. No more time wasted on what you already know.",
  "Certificat à chaque niveau": "A certificate at every level", "Un certificat NEXOMIA à ton nom, en PDF, vérifiable en ligne par n’importe quel employeur.": "A NEXOMIA certificate in your name, as a PDF, verifiable online by any employer.",
  "Anglais · du premier mot au discours": "English · from first word to public speaking", "Six niveaux, un seul abonnement": "Six levels, one subscription",
  "Se présenter, compter, acheter au marché": "Introduce yourself, count, shop at the market", "Raconter sa journée, téléphoner, comparer": "Describe your day, make calls, compare",
  "Parler de projets, entretien d’embauche": "Talk about plans, job interviews", "Négocier, défendre son opinion": "Negotiate, defend your opinion",
  "Pitch, courriel formel, nuances": "Pitch, formal email, nuance", "Humour, rhétorique, presse": "Humour, rhetoric, the press",
  "Passer le test de niveau gratuit": "Take the free level test", "Trois étapes, dix minutes par jour": "Three steps, ten minutes a day",
  "Crée ton compte gratuit": "Create your free account", "Choisis ton objectif et ton rythme, puis passe le test de niveau.": "Choose your goal and pace, then take the level test.",
  "Écoute, parle, pratique": "Listen, speak, practise", "Une leçon courte par jour, avec exercices corrigés et prononciation au micro.": "One short lesson a day, with corrected exercises and microphone pronunciation.",
  "Obtiens ton certificat": "Get your certificate", "Valide chaque niveau et partage ton certificat avec ton employeur.": "Pass each level and share your certificate with your employer.",
  "Tout ce qu’il faut savoir": "Everything you need to know", "Comment je paie ?": "How do I pay?",
  "Avec M-Pesa, Airtel Money ou Orange Money. Tu reçois une demande sur ton téléphone et tu la valides avec ton code secret. NEXOMIA ne te demande jamais ton code.": "With M-Pesa, Airtel Money or Orange Money. You get a request on your phone and approve it with your secret code. NEXOMIA never asks for your code.",
  "Est-ce que je peux essayer avant de payer ?": "Can I try before paying?", "Oui. La première leçon de chaque cours est gratuite, et le test de niveau est gratuit.": "Yes. The first lesson of every course is free, and so is the level test.",
  "Je dois avoir beaucoup de données Internet ?": "Do I need a lot of mobile data?", "Non. Les leçons sont légères, et tu peux télécharger les audios pour les écouter hors connexion.": "No. Lessons are light, and you can download the audio to listen offline.",
  "Le certificat est-il reconnu ?": "Is the certificate recognised?", "C’est un certificat NEXOMIA aligné sur les niveaux européens (A1 à C2). Chaque certificat porte un code que n’importe qui peut vérifier en ligne.": "It’s a NEXOMIA certificate aligned with the European levels (A1 to C2). Each certificate carries a code anyone can verify online.",
  "Je peux arrêter quand je veux ?": "Can I stop whenever I want?", "Oui. L’abonnement dure un mois et ne se renouvelle pas tout seul. Tu repaies seulement si tu veux continuer.": "Yes. A subscription lasts one month and doesn’t renew automatically. You only pay again if you want to continue.",


  // Catalogue de départ (si l'équipe modifie ces textes dans le Studio, ils restent en français)
  "Design graphique": "Graphic design", "Création de contenu": "Content creation", "Bases du numérique": "Digital basics", "Vendre ses services": "Selling your services",
  "Le parcours complet, du tout premier « Hello » jusqu’au discours en public : 44 leçons audio, de débutant (A1) à maîtrise (C2), avec grammaire expliquée en français, vocabulaire et exercices d’écoute.": "The complete path, from your very first “Hello” to public speaking: 44 audio lessons from beginner (A1) to mastery (C2), with grammar explained in French, vocabulary and listening exercises.",
  "Portugais du Brésil pour communiquer avec l’Angola, le Mozambique et le Brésil : commerce, voyage, travail.": "Brazilian Portuguese to communicate with Angola, Mozambique and Brazil: trade, travel, work.",
  "Créer des visuels professionnels sur téléphone et les vendre aux commerces de ton quartier.": "Create professional visuals on your phone and sell them to local businesses.",
  "Filmer, écrire et publier du contenu qui attire des clients pour un commerce local.": "Film, write and publish content that brings customers to a local business.",
  "Maîtriser son téléphone et son ordinateur pour travailler : courriel, documents, sécurité.": "Master your phone and computer for work: email, documents, security.",
  "Fixer un prix, trouver ses trois premiers clients et se faire payer par Mobile Money.": "Set a price, find your first three clients and get paid with Mobile Money.",
  // Domaines et niveaux
  "Tous": "All", "Langues": "Languages", "Numérique": "Digital", "Design et création": "Design and creation", "Entrepreneuriat": "Entrepreneurship",
  "Initiation": "Introduction", "Tous niveaux · A1 à C2": "All levels · A1 to C2", "Débutant · A1": "Beginner · A1",
  "A1 · Débutant": "A1 · Beginner", "A2 · Élémentaire": "A2 · Elementary", "B1 · Intermédiaire": "B1 · Intermediate", "B2 · Intermédiaire avancé": "B2 · Upper intermediate", "C1 · Avancé": "C1 · Advanced", "C2 · Maîtrise": "C2 · Mastery",
  "Débutant": "Beginner", "Élémentaire": "Elementary", "Intermédiaire": "Intermediate", "Intermédiaire avancé": "Upper intermediate", "Avancé": "Advanced", "Maîtrise": "Mastery",
  // Catalogue et cours
  "Choisis ton prochain cours": "Choose your next course", "Aucun cours dans ce domaine pour l’instant.": "No course in this field yet.",
  "Tous les cours": "All courses", "Pas sûr de ton niveau ?": "Not sure of your level?", "10 minutes pour savoir où commencer, de A1 à C2.": "10 minutes to know where to start, from A1 to C2.",
  "Passer le test": "Take the test", "Refaire le test": "Retake the test", "Abonnement": "Subscription", "Terminée": "Done",
  "S’abonner à ce cours": "Subscribe to this course", "La première leçon est gratuite. Prix réduit si tu prends plusieurs cours ensemble.": "The first lesson is free. Reduced price when you take several courses together.",
  "Prolonger d’un mois": "Extend by one month", "Niveau validé": "Level completed", "Voir et télécharger mon certificat": "View and download my certificate",
  "Aperçu équipe : ce cours n’est pas encore publié.": "Team preview: this course is not published yet.",
  // Leçon
  "Écoute chaque phrase, répète-la à voix haute, puis vérifie que tu as compris.": "Listen to each sentence, repeat it out loud, then check you understood.",
  "Leçon d’essai gratuite": "Free trial lesson", "À retenir": "Key points", "Vocabulaire": "Vocabulary",
  "Phrase par phrase": "Sentence by sentence", "Écoute-répète": "Listen & repeat", "Boucle": "Loop", "Traduction": "Translation",
  "Phrase précédente": "Previous sentence", "Phrase suivante": "Next sentence", "Pause": "Pause", "Ouvrir": "Open",
  "Télécharger pour écouter hors connexion": "Download to listen offline", "Téléchargement…": "Downloading…", "Échec du téléchargement, réessaie": "Download failed, try again",
  "Cet appareil n’a pas de voix pour cette langue. Les phrases sans enregistrement seront lues dès qu’une voix sera disponible, ou quand l’équipe aura ajouté l’audio.": "This device has no voice for this language. Sentences without a recording will be read as soon as a voice is available, or once the team adds the audio.",
  "Abonne-toi à ce cours pour débloquer toutes les leçons, les audios hors connexion et l’accompagnement.": "Subscribe to this course to unlock every lesson, offline audio and support.",
  "Déjà abonné ?": "Already subscribed?", "Connecte-toi": "Log in",
  // Exercices
  "Écoute": "Listening", "Mots dans l’ordre": "Word order", "Phrase à compléter": "Fill in the gap", "Dictée": "Dictation",
  "Écouter l’extrait": "Play the clip", "Écouter la phrase": "Play the sentence", "Plus lentement": "Slower",
  "Remets les mots dans l’ordre": "Put the words in order", "Touche les mots dans le bon ordre": "Tap the words in the right order",
  "Complète la phrase": "Complete the sentence", "Écoute et écris la phrase": "Listen and type the sentence", "Ta réponse": "Your answer",
  "Écris ce que tu entends…": "Type what you hear…", "Vérifier": "Check", "Continuer": "Continue", "Voir mon résultat": "See my result",
  "Bien joué !": "Well done!", "Excellent !": "Excellent!", "Parfait !": "Perfect!", "Bien entendu !": "Well heard!", "Pas tout à fait.": "Not quite.",
  "Aucune faute.": "No mistakes.", "Presque parfait : compare avec la phrase ci-dessous.": "Almost perfect: compare with the sentence below.",
  "Compare avec la bonne phrase, puis réécoute-la.": "Compare with the correct sentence, then listen again.",
  "Écris d’abord ce que tu entends.": "Type what you hear first.",
  "Fin de leçon": "End of lesson", "As-tu tout écouté ?": "Did you listen to everything?", "Terminer la leçon": "Finish the lesson",
  "Leçon validée": "Lesson passed", "Presque": "Almost", "Bravo !": "Well done!", "Encore un petit effort": "One more effort",
  "Il faut 80 % pour valider. Réécoute les phrases en mode phrase par phrase, puis refais les exercices.": "You need 80% to pass. Listen again sentence by sentence, then redo the exercises.",
  "Réécouter et réessayer": "Listen again and retry", "Rester ici": "Stay here", "Créer mon compte": "Create my account",
  "Crée un compte gratuit pour enregistrer ta progression.": "Create a free account to save your progress.",
  "Voir mon parcours": "See my progress", "Objectif du jour atteint !": "Daily goal reached!",
  "Niveau terminé !": "Level completed!",
  // Prononciation
  "Prononciation": "Pronunciation", "Parle, l’application t’écoute": "Speak, the app is listening", "Modèle": "Model",
  "Appuie et prononce la phrase": "Tap and say the sentence", "J’écoute… touche pour arrêter": "Listening… tap to stop", "J’écoute… parle maintenant": "Listening… speak now",
  "Excellente prononciation !": "Excellent pronunciation!", "Très bien, c’est compréhensible.": "Very good, it’s clear.",
  "Presque : réécoute les mots en rouge et réessaie.": "Almost: listen to the words in red again and retry.", "Réécoute la phrase lentement, puis réessaie.": "Listen to the sentence slowly, then try again.",
  "Ton navigateur ne permet pas encore la reconnaissance vocale. Ouvre NEXOMIA Academy avec Google Chrome pour t’entraîner à la prononciation.": "Your browser doesn’t support speech recognition yet. Open NEXOMIA Academy in Google Chrome to practise pronunciation.",
  "Autorise le micro pour t’entraîner à la prononciation.": "Allow the microphone to practise pronunciation.", "Je n’ai rien entendu. Approche-toi du micro et réessaie.": "I didn’t hear anything. Move closer to the microphone and try again.",
  "La reconnaissance vocale a besoin d’Internet.": "Speech recognition needs an internet connection.",
  // Test de niveau
  "Trouve ton point de départ": "Find your starting point",
  "Environ 10 minutes. Les questions deviennent plus difficiles au fil du test, qui s’arrête dès que tu atteins ton niveau. Pas de stress : ce n’est pas un examen.": "About 10 minutes. Questions get harder as you go, and the test stops once you reach your level. No stress: it’s not an exam.",
  "Grammaire, vocabulaire et écoute": "Grammar, vocabulary and listening", "Du niveau A1 (débutant) au C2 (maîtrise)": "From A1 (beginner) to C2 (mastery)",
  "Mets le son pour les questions d’écoute": "Turn the sound on for listening questions", "Commencer le test": "Start the test", "Arrêter": "Stop",
  "Ton résultat": "Your result", "Voir toutes les leçons": "See all lessons", "Crée un compte gratuit pour garder ce résultat.": "Create a free account to keep this result.",
  "Échelle des niveaux": "Level scale",
  // Accueil guidé
  "Pourquoi apprends-tu ?": "Why are you learning?", "Nous adaptons les exemples et les rappels à ton objectif.": "We adapt examples and reminders to your goal.",
  "Pour mon travail": "For my job", "Clients, réunions, entretiens": "Clients, meetings, interviews", "Pour mes études": "For my studies", "Cours, examens, bourses": "Classes, exams, scholarships",
  "Pour voyager": "To travel", "Zambie, Afrique du Sud, ailleurs": "Zambia, South Africa, elsewhere", "Pour mon entreprise": "For my business", "Vendre, négocier, exporter": "Sell, negotiate, export",
  "Par plaisir": "For fun", "Films, musique, culture": "Films, music, culture",
  "Ton rythme": "Your pace", "Quel objectif chaque jour ?": "What’s your daily goal?",
  "Une leçon rapporte environ 20 à 30 points. Tu pourras changer d’objectif à tout moment.": "A lesson earns about 20 to 30 points. You can change your goal at any time.",
  "environ 5 min par jour": "about 5 min a day", "environ 10 min par jour": "about 10 min a day", "environ 15 min par jour": "about 15 min a day", "20 min et plus par jour": "20+ min a day",
  "Retour": "Back", "Ton niveau": "Your level", "Par où commencer ?": "Where to start?",
  "Le test de niveau te place directement au bon endroit du cours d’anglais.": "The level test takes you straight to the right place in the English course.",
  "Passer le test de niveau": "Take the level test", "10 minutes, de A1 à C2 · recommandé": "10 minutes, A1 to C2 · recommended",
  "Je débute en anglais": "I’m new to English", "Commencer au niveau A1, leçon 1": "Start at level A1, lesson 1", "Portugais, design, numérique, entrepreneuriat…": "Portuguese, design, digital, entrepreneurship…",
  // Tableau de bord
  "Continuer · Anglais": "Continue · English", "Reprendre l’écoute": "Resume listening", "Voir la leçon": "See the lesson", "Commencer": "Start",
  "Choisis ton premier cours": "Choose your first course", "La première leçon de chaque cours est gratuite.": "The first lesson of every course is free.",
  "Objectif du jour": "Daily goal", "Objectif atteint, bravo !": "Goal reached, well done!", "Changer l’objectif": "Change the goal",
  "Révision intelligente": "Smart review", "à revoir aujourd’hui, pour ne pas les oublier.": "to review today, so you don’t forget them.",
  "Rien à revoir aujourd’hui. Reviens demain.": "Nothing to review today. Come back tomorrow.", "Termine une leçon pour remplir ta mémoire.": "Finish a lesson to fill your memory.",
  "Réviser maintenant": "Review now", "Ma semaine": "My week", "Points des 7 derniers jours": "Points over the last 7 days",
  "min d’écoute": "min listened", "leçon validée": "lesson passed", "leçons validées": "lessons passed", "certificat": "certificate", "certificats": "certificates",
  "Mes cours": "My courses", "Essai": "Trial", "Abonné": "Subscribed", "Tu n’as pas encore commencé de cours.": "You haven’t started a course yet.",
  "Tu ne connais pas ton niveau d’anglais ?": "Don’t know your English level?", "Mes certificats": "My certificates",
  "Valide toutes les leçons d’un niveau (A1, A2, B1…) pour recevoir ton certificat NEXOMIA, téléchargeable en PDF et vérifiable en ligne.": "Pass every lesson of a level (A1, A2, B1…) to receive your NEXOMIA certificate, downloadable as a PDF and verifiable online.",
  "Badges": "Badges", "Premier pas": "First step", "Valider ta première leçon": "Pass your first lesson", "Sur la lancée": "On a roll", "Valider 10 leçons": "Pass 10 lessons",
  "Marathonien": "Marathoner", "Valider 30 leçons": "Pass 30 lessons", "Régulier": "Regular", "3 jours de suite": "3 days in a row", "Une semaine pleine": "A full week", "7 jours de suite": "7 days in a row",
  "Inarrêtable": "Unstoppable", "30 jours de suite": "30 days in a row", "500 points": "500 points", "Gagner 500 points": "Earn 500 points", "2 000 points": "2,000 points", "Gagner 2 000 points": "Earn 2,000 points",
  "Sans faute": "Flawless", "Obtenir 100 % à une leçon": "Score 100% on a lesson", "Je connais mon niveau": "I know my level", "Diplômé": "Graduate", "Obtenir un certificat de niveau": "Earn a level certificate",
  "Bonne mémoire": "Good memory", "Faire 5 séances de révision": "Complete 5 review sessions",
  "Classement de la semaine": "This week’s ranking", "Points gagnés ces 7 derniers jours": "Points earned over the last 7 days", "Sois le premier à gagner des points cette semaine.": "Be the first to earn points this week.",
  "Mes abonnements": "My subscriptions", "Aucun abonnement. Les premières leçons restent gratuites.": "No subscription. First lessons remain free.", "Gérer mes abonnements": "Manage my subscriptions",
  "Besoin d’aide ?": "Need help?", "L’équipe NEXOMIA répond sous deux jours ouvrables. Ton rôle :": "The NEXOMIA team replies within two working days. Your role:",
  "Apprenant": "Learner", "Mentor": "Mentor", "Accompagnateur": "Coach", "Créateur de cours": "Course creator", "Responsable pédagogique": "Academic lead", "Administrateur": "Administrator",
  "Jours de suite": "Days in a row", "Points": "Points",
  // Révision
  "Je savais": "I knew it", "À revoir": "Review again", "Dis la traduction à voix haute, puis touche la carte": "Say the translation out loud, then tap the card",
  "Rien à réviser pour l’instant": "Nothing to review for now", "Révision terminée": "Review complete",
  "Les mots à revoir reviendront demain. Ceux que tu connais reviendront de plus en plus tard.": "Words to review will come back tomorrow. The ones you know will come back later and later.",
  "Retour à mon parcours": "Back to my progress",
  // Certificat
  "Télécharger en PDF": "Download as PDF", "Copier le lien de vérification": "Copy the verification link", "Certificat de réussite": "Certificate of achievement",
  "Ce certificat atteste que": "This certifies that", "a validé l’ensemble du niveau": "has successfully completed level", "Délivré le": "Issued on",
  "Code de vérification": "Verification code", "Pour NEXOMIA SARL": "For NEXOMIA SARL", "Fondateur": "Founder", "Lien copié": "Link copied",
  "Lubumbashi · République démocratique du Congo": "Lubumbashi · Democratic Republic of the Congo",
  // Comptes
  "Connexion": "Log in", "Content de te revoir": "Welcome back", "Adresse électronique": "Email address", "Mot de passe": "Password",
  "Mot de passe oublié ? Écris à l’équipe NEXOMIA : elle t’enverra un lien de réinitialisation.": "Forgot your password? Write to the NEXOMIA team: they’ll send you a reset link.",
  "Administrateur ?": "Administrator?", "Pas encore de compte ?": "No account yet?", "Créer un compte gratuit": "Create a free account",
  "Inscription gratuite": "Free sign-up", "Ton parcours commence": "Your journey starts here",
  "Crée ton compte pour enregistrer ta progression. La première leçon de chaque cours est gratuite.": "Create your account to save your progress. The first lesson of every course is free.",
  "Nom complet": "Full name", "Téléphone (facultatif)": "Phone (optional)", "8 caractères au moins. Une phrase de trois mots est idéale.": "At least 8 characters. A three-word phrase is ideal.",
  "Déjà un compte ?": "Already have an account?", "Bienvenue dans NEXOMIA Academy": "Welcome to NEXOMIA Academy",
  // Abonnements et paiement
  "Abonnements · 5 $ par cours et par mois": "Subscriptions · $5 per course per month", "Choisis tes cours": "Choose your courses",
  "Mode test.": "Test mode.", "Les paiements sont simulés : aucun argent n’est prélevé. Le mode réel s’active dès que le prestataire de paiement est configuré.": "Payments are simulated: no money is taken. Live mode starts once the payment provider is set up.",
  "1. Cours": "1. Courses", "2. Moyen de paiement": "2. Payment method", "Carte bancaire": "Bank card",
  "Tu recevras une demande de paiement sur ce téléphone : valide-la avec ton code secret, uniquement sur ton téléphone. Ne communique jamais ton code PIN à personne.": "You’ll receive a payment request on this phone: approve it with your secret code, only on your phone. Never share your PIN with anyone.",
  "Se connecter pour payer": "Log in to pay", "Récapitulatif": "Summary", "Aucun cours choisi": "No course selected", "Total": "Total",
  "Un mois à partir de la confirmation. Si tu es déjà abonné, le mois s’ajoute à la suite. Le renouvellement est manuel : nous te rappelons avant chaque échéance.": "One month from confirmation. If you’re already subscribed, the month is added on. Renewal is manual: we remind you before each due date.",
  "Cours à payer": "Courses to pay for", "Moyen de paiement": "Payment method", "Choisis au moins un cours": "Choose at least one course", "Aucun abonnement actif.": "No active subscription.",
  "Confirme le paiement sur ton téléphone": "Confirm the payment on your phone", "Paiement confirmé": "Payment confirmed", "Paiement non abouti": "Payment not completed",
  "Commencer à apprendre": "Start learning", "Fermer": "Close", "Fermer cette fenêtre": "Close this window", "Réessayer": "Try again",
  "Je n’ai rien reçu sur mon téléphone": "I didn’t receive anything on my phone", "Garde ton téléphone allumé, déverrouillé et avec du réseau.": "Keep your phone on, unlocked and connected.",
  "Si la demande a expiré, ferme cette fenêtre et clique à nouveau sur « Payer ».": "If the request has expired, close this window and click “Pay” again.",
  "Mode test : aucun téléphone ne sonnera. Choisis le résultat à simuler.": "Test mode: no phone will ring. Choose the result to simulate.",
  "Simuler un paiement réussi": "Simulate a successful payment", "Simuler un refus": "Simulate a refusal",
  "Aucun montant n’a été prélevé pour cet essai et aucun abonnement n’a été activé.": "No money was taken for this attempt and no subscription was activated.",
  "Accès ouvert :": "Access granted:", "en dollars (USD)": "in US dollars (USD)", "code secret": "secret code",
  "Page introuvable": "Page not found", "Retour à l’accueil": "Back to home", "Pas de connexion. Vérifie ton réseau et réessaie.": "No connection. Check your network and try again.",
  "Leçon introuvable.": "Lesson not found.", "Cours introuvable.": "Course not found.", "Adresse ou mot de passe incorrect.": "Incorrect email or password.",
  "Un compte existe déjà avec cette adresse. Connecte-toi.": "An account already exists with this email. Log in.",
  "Le mot de passe doit contenir au moins 8 caractères.": "The password must be at least 8 characters.", "Adresse électronique invalide.": "Invalid email address.",
};
// Textes avec des nombres ou des noms
const R = [
  [/^(.+) · (\d+) leçons?$/, (m) => `${tr(m[1])} · ${m[2]} lesson${m[2] > 1 ? "s" : ""}`],
  [/^(Détente|Régulier|Sérieux|Intense) · (\d+) points$/, (m) => `${{ "Détente": "Relaxed", "Régulier": "Regular", "Sérieux": "Serious", "Intense": "Intense" }[m[1]]} · ${m[2]} points`],
  [/^(\d+) cours publiés$/, (m) => `${m[1]} published courses`],
  [/^· (\d+) leçons? audio$/, (m) => `· ${m[1]} audio lesson${m[1] > 1 ? "s" : ""}`],
  [/^(\d+) \/ (\d+) leçons?$|^(\d+)\/(\d+) leçons?$/, (m) => `${m[1] || m[3]}/${m[2] || m[4]} lessons`],
  [/^(\d+) min · gratuite$/, (m) => `${m[1]} min · free`],
  [/^(\d+) min · meilleur score (\d+) %$/, (m) => `${m[1]} min · best score ${m[2]}%`],
  [/^(\d+) min · gratuite · meilleur score (\d+) %$/, (m) => `${m[1]} min · free · best score ${m[2]}%`],
  [/^(.+) · Leçon (\d+) sur (\d+) · (\d+) min$/, (m) => `${tr(m[1])} · Lesson ${m[2]} of ${m[3]} · ${m[4]} min`],
  [/^(.+) · Leçon (\d+) sur (\d+)$/, (m) => `${tr(m[1])} · Lesson ${m[2]} of ${m[3]}`],
  [/^Leçon (\d+) · (\d+) min( · abonnement requis)?$/, (m) => `Lesson ${m[1]} · ${m[2]} min${m[3] ? " · subscription required" : ""}`],
  [/^Phrase (\d+) sur (\d+)( · voix enregistrée)?$/, (m) => `Sentence ${m[1]} of ${m[2]}${m[3] ? " · recorded voice" : ""}`],
  [/^Phrase (\d+) sur (\d+) · touche le micro et parle$/, (m) => `Sentence ${m[1]} of ${m[2]} · tap the mic and speak`],
  [/^Phrase (\d+)$/, (m) => `Sentence ${m[1]}`],
  [/^(\d+) phrases? réussies?$/, (m) => `${m[1]} sentence${m[1] > 1 ? "s" : ""} passed`],
  [/^Leçon suivante : (.+)$/, (m) => `Next lesson: ${m[1]}`],
  [/^S’abonner · (.+) \/ mois$/, (m) => `Subscribe · ${m[1]} / month`],
  [/^S’abonner à (.+)$/, (m) => `Subscribe to ${tr(m[1])}`],
  [/^Continue ton cours de (.+)$/, (m) => `Continue your ${tr(m[1].replace(/^./, (c) => c.toUpperCase()))} course`],
  [/^Abonné jusqu’au (.+)$/, (m) => `Subscribed until ${m[1]}`],
  [/^Abonné · jusqu’au (.+)$/, (m) => `Subscribed · until ${m[1]}`],
  [/^jusqu’au (.+)$/, (m) => `until ${m[1]}`],
  [/^(Écoute|Mots dans l’ordre|Phrase à compléter|Dictée) · (\d+)\/(\d+)$/, (m) => `${D[m[1]]} · ${m[2]}/${m[3]}`],
  [/^L’ordre correct : (.+)$/, (m) => `Correct order: ${m[1]}`],
  [/^La phrase complète : (.+)$/, (m) => `Full sentence: ${m[1]}`],
  [/^(Leçon validée|Presque) · (\d+) %$/, (m) => `${D[m[1]]} · ${m[2]}%`],
  [/^(\d+) bonnes? réponses? sur (\d+)$/, (m) => `${m[1]} correct answer${m[1] > 1 ? "s" : ""} out of ${m[2]}`],
  [/^⚡ \+(\d+) points$/, (m) => `⚡ +${m[1]} points`],
  [/^Objectif du jour : (\d+) \/ (\d+)$/, (m) => `Daily goal: ${m[1]} / ${m[2]}`],
  [/^Objectif du jour : (\d+) sur (\d+) points$/, (m) => `Daily goal: ${m[1]} of ${m[2]} points`],
  [/^Objectif du jour : (\d+) points$/, (m) => `Daily goal: ${m[1]} points`],
  [/^\+(\d+) points( de prononciation)?$/, (m) => `+${m[1]} ${m[2] ? "pronunciation points" : "points"}`],
  [/^(Content de te revoir|Bienvenue), (.+)\.$/, (m) => `${m[1] === "Bienvenue" ? "Welcome" : "Welcome back"}, ${m[2]}.`],
  [/^Bienvenue, (.+)$/, (m) => `Welcome, ${m[1]}`],
  [/^🔥 (\d+) jours?$/, (m) => `🔥 ${m[1]} day${m[1] > 1 ? "s" : ""}`],
  [/^⚡ ([\d  ]+) pts$/, (m) => `⚡ ${m[1]} pts`],
  [/^\/ (\d+) pts$/, (m) => `/ ${m[1]} pts`],
  [/^Encore (\d+) points pour l’atteindre\.$/, (m) => `${m[1]} more points to reach it.`],
  [/^(\d+) mots?$/, (m) => `${m[1]} word${m[1] > 1 ? "s" : ""}`],
  [/^(\d+) maîtrisés? sur (\d+)$/, (m) => `${m[1]} mastered out of ${m[2]}`],
  [/^Record : (\d+) jours? de suite$/, (m) => `Record: ${m[1]} day${m[1] > 1 ? "s" : ""} in a row`],
  [/^(.+) \(toi\)$/, (m) => `${m[1]} (you)`],
  [/^Niveau d’anglais : $|^Niveau d’anglais :$/, () => "English level:"],
  [/^Ton niveau : $|^Ton niveau :$/, () => "Your level:"],
  [/^Révision · (\d+)\/(\d+)$/, (m) => `Review · ${m[1]}/${m[2]}`],
  [/^Boîte (\d+) sur (\d+)$/, (m) => `Box ${m[1]} of ${m[2]}`],
  [/^(\d+) sur (\d+) retenus$/, (m) => `${m[1]} of ${m[2]} remembered`],
  [/^Test de niveau · (.+)$/, (m) => `Level test · ${tr(m[1])}`],
  [/^Niveau ([ABC][12]) · question (\d+)$/, (m) => `Level ${m[1]} · question ${m[2]}`],
  [/^Commence au niveau ([ABC][12]) · (.+)$/, (m) => `Start at level ${m[1]} · ${tr(m[2])}`],
  [/^Commencer au niveau ([ABC][12])$/, (m) => `Start at level ${m[1]}`],
  [/^Délivré le (.+) · (NX-\w+)$/, (m) => `Issued on ${m[1]} · ${m[2]}`],
  [/^Vérifier l’authenticité : (.+)$/, (m) => `Verify authenticity: ${m[1]}`],
  [/^(\d+) leçons audio et exercices · score moyen de (\d+) % · niveau aligné sur le Cadre européen commun de référence \(CECRL\)$/, (m) => `${m[1]} audio lessons and exercises · average score ${m[2]}% · level aligned with the Common European Framework of Reference (CEFR)`],
  [/^(\d+) cours · soit (.+) par cours$/, (m) => `${m[1]} courses · ${m[2]} per course`],
  [/^(\d+) cours$/, (m) => `${m[1]} course${m[1] > 1 ? "s" : ""}`],
  [/^(.+) \/ mois$/, (m) => `${m[1]} / month`],
  [/^Numéro (.+)$/, (m) => `${m[1]} number`],
  [/^Payer (.+)$/, (m) => `Pay ${m[1]}`],
  [/^Envoi de la demande à (.+)…$/, (m) => `Sending the request to ${m[1]}…`],
  [/^Langues · (.+)$/, (m) => `Languages · ${tr(m[1])}`],
  [/^(.+) · Initiation$/, (m) => `${tr(m[1])} · Introduction`],
];
const SKIP = ".transcript,.vocab,.notes-card,.opts,.gap-line,.speak-line,.flash,.dict-ref,.tiles,.answer-line,.cert-name,.feedback span,.lrow b,.lesson-head h1,[data-noi18n],textarea,input,select,option,.hero-card .line,.hero-card .tr,.speak-res small,.pq,.ptest .opt";
let lang = "fr";
function tr(t) {
  if (lang !== "en") return t;
  if (D[t]) return D[t];
  for (const [re, fn] of R) { const m = t.match(re); if (m) return fn(m); }
  return t;
}
const orig = new WeakMap(), origAttr = new WeakMap();
function translateText(n) {
  const el = n.parentElement; if (!el || el.closest(SKIP) || el.closest("script,style,noscript")) return;
  if (!orig.has(n)) orig.set(n, n.nodeValue);
  const src = orig.get(n);
  if (lang === "fr") { if (n.nodeValue !== src) n.nodeValue = src; return; }
  const core = src.replace(/\s+/g, " ").trim(); if (!core || !/[a-zà-ÿ]/i.test(core)) return;
  const out = tr(core);
  if (out !== core) { const lead = /^\s/.test(src) ? " " : "", trail = /\s$/.test(src) ? " " : ""; const v = lead + out + trail; if (n.nodeValue !== v) n.nodeValue = v; }
}
const SKIP_ATTR = SKIP.replace(",textarea,input,select,option", "");
function translateAttrs(el) {
  if (el.closest(SKIP_ATTR)) return;
  for (const a of ["aria-label", "placeholder", "title"]) {
    if (!el.hasAttribute(a)) continue;
    let o = origAttr.get(el); if (!o) { o = {}; origAttr.set(el, o); }
    if (!(a in o)) o[a] = el.getAttribute(a);
    const v = lang === "fr" ? o[a] : tr(o[a]);
    if (el.getAttribute(a) !== v) el.setAttribute(a, v);
  }
}
function walk(root) {
  if (root.nodeType === 3) return translateText(root);
  if (root.nodeType !== 1) return;
  translateAttrs(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n; while ((n = w.nextNode())) { if (n.nodeType === 3) translateText(n); else translateAttrs(n); }
}
let busy = false;
const mo = new MutationObserver((list) => {
  if (busy) return; busy = true;
  try {
    for (const m of list) {
      // Un changement fait par l'application devient le nouveau texte d'origine.
      if (m.type === "characterData") { orig.set(m.target, m.target.nodeValue); translateText(m.target); }
      else if (m.type === "attributes") { const o = origAttr.get(m.target); if (o) delete o[m.attributeName]; translateAttrs(m.target); }
      else m.addedNodes.forEach(walk);
    }
  } finally { mo.takeRecords(); busy = false; }
});
function setLang(l) {
  lang = l === "en" ? "en" : "fr";
  document.documentElement.lang = lang;
  walk(document.body);
  document.title = lang === "en" ? "NEXOMIA Academy · Learn, create, share" : "NEXOMIA Academy";
}
window.NXI18N = { setLang, tr, get lang() { return lang; } };
document.addEventListener("DOMContentLoaded", () => mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "placeholder", "title"] }));
})();
