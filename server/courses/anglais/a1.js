// Anglais — niveau A1 (Débutant). Contenu original NEXOMIA.
module.exports = [
  { t: "Se présenter", d: 12, goal: "Tu sais te présenter et demander le nom et l’origine de quelqu’un.",
    notes: `Pour te présenter, trois phrases suffisent :
- **My name is…** / **I’m…** : je m’appelle… / je suis…
- **I’m from…** : je viens de…
- **I’m a…** + métier : je suis… (**a** devant une consonne, **an** devant une voyelle : an engineer)
**I’m** est la forme courte de **I am**. À l’oral, on utilise presque toujours la forme courte.`,
    s: [["A", "Hello! My name is Amani.", "Bonjour ! Je m’appelle Amani."], ["B", "Hi Amani, I’m Grace. Nice to meet you.", "Salut Amani, moi c’est Grace. Enchantée."], ["A", "Nice to meet you too. Where are you from?", "Enchanté aussi. Tu viens d’où ?"], ["B", "I’m from Lubumbashi. And you?", "Je viens de Lubumbashi. Et toi ?"], ["A", "I’m from Kinshasa. I’m a graphic designer.", "Je viens de Kinshasa. Je suis graphiste."], ["B", "Really? I’m an engineer.", "C’est vrai ? Moi, je suis ingénieure."], ["A", "Great! I’m learning English for my work.", "Super ! J’apprends l’anglais pour mon travail."], ["B", "Me too. Good luck!", "Moi aussi. Bonne chance !"]],
    v: [["Nice to meet you", "Enchanté(e)"], ["Where are you from?", "Tu viens d’où ?"], ["I’m from…", "Je viens de…"], ["an engineer", "un(e) ingénieur(e)"], ["Me too", "Moi aussi"]],
    q: [["Where are you from?", "Qu’as-tu entendu ?", ["Tu viens d’où ?", "Comment tu t’appelles ?", "Où travailles-tu ?"], 0, "« Where are you from? » sert à demander l’origine de quelqu’un."], ["Really? I’m an engineer.", "Quel est le métier de Grace ?", ["Graphiste", "Ingénieure", "Enseignante"], 1, "« an engineer » : on dit **an** car engineer commence par une voyelle."], ["I’m learning English for my work.", "Pourquoi Amani apprend-il l’anglais ?", ["Pour voyager", "Pour ses études", "Pour son travail"], 2, "« for my work » signifie « pour mon travail »."]] },

  { t: "Saluer et être poli", d: 10, goal: "Tu sais saluer à tout moment de la journée et utiliser les formules de politesse.",
    notes: `Les salutations changent selon le moment :
- **Good morning** : jusqu’à midi
- **Good afternoon** : de midi à environ 18 h
- **Good evening** : le soir, en arrivant
- **Good night** : seulement pour dire au revoir le soir ou avant de dormir
Politesse : **please** (s’il te plaît), **thank you / thanks** (merci), **you’re welcome** (de rien), **sorry** (pardon, désolé), **excuse me** (excusez-moi, pour attirer l’attention).`,
    s: [["A", "Good morning, Mr Kalala. How are you?", "Bonjour, monsieur Kalala. Comment allez-vous ?"], ["B", "I’m fine, thank you. And you?", "Je vais bien, merci. Et vous ?"], ["A", "Very well, thanks.", "Très bien, merci."], ["B", "Excuse me, can you help me, please?", "Excusez-moi, pouvez-vous m’aider, s’il vous plaît ?"], ["A", "Of course.", "Bien sûr."], ["B", "Thank you so much.", "Merci beaucoup."], ["A", "You’re welcome. Have a nice day!", "De rien. Bonne journée !"], ["B", "Thanks, you too. Goodbye!", "Merci, vous aussi. Au revoir !"]],
    v: [["How are you?", "Comment allez-vous ?"], ["I’m fine", "Je vais bien"], ["please", "s’il vous plaît"], ["You’re welcome", "De rien"], ["Have a nice day", "Bonne journée"]],
    q: [["Good morning, Mr Kalala.", "À quel moment dit-on « Good morning » ?", ["Le matin", "L’après-midi", "Le soir"], 0, "**Good morning** s’utilise jusqu’à midi."], ["You’re welcome.", "Que signifie cette réponse ?", ["Bienvenue chez nous", "De rien", "Bonne chance"], 1, "Après **thank you**, on répond **you’re welcome** : de rien."], ["Excuse me, can you help me, please?", "Que demande la personne ?", ["L’heure", "De l’aide", "Son chemin"], 1, "« Can you help me? » : pouvez-vous m’aider ?"]] },

  { t: "Le verbe to be", d: 14, goal: "Tu sais conjuguer « to be » et l’utiliser pour décrire des personnes.",
    notes: `**To be** = être. C’est le verbe le plus important de l’anglais.
- I **am** (I’m) · you **are** (you’re) · he / she / it **is** (he’s, she’s, it’s)
- we **are** (we’re) · you **are** · they **are** (they’re)
Négation : on ajoute **not** → I’m **not** tired, she **isn’t** here, they **aren’t** ready.
Question : on inverse → **Are** you ready? **Is** he a teacher?
Réponse courte : Yes, I **am**. / No, he **isn’t**.`,
    s: [["A", "Is this your sister?", "C’est ta sœur ?"], ["B", "Yes, she is. Her name is Esther.", "Oui. Elle s’appelle Esther."], ["A", "Is she a student?", "Elle est étudiante ?"], ["B", "No, she isn’t. She’s a nurse.", "Non. Elle est infirmière."], ["A", "Are you tired today?", "Tu es fatigué aujourd’hui ?"], ["B", "No, I’m not. I’m very happy.", "Non. Je suis très content."], ["A", "Where are your parents?", "Où sont tes parents ?"], ["B", "They’re at home. They aren’t here.", "Ils sont à la maison. Ils ne sont pas ici."]],
    v: [["to be", "être"], ["a nurse", "un(e) infirmier(ère)"], ["tired", "fatigué(e)"], ["happy", "content(e), heureux(se)"], ["at home", "à la maison"]],
    q: [["She’s a nurse.", "Quel est le métier d’Esther ?", ["Étudiante", "Infirmière", "Médecin"], 1, "« She’s » = she is. **a nurse** : une infirmière."], ["They’re at home.", "Où sont les parents ?", ["Au travail", "Au marché", "À la maison"], 2, "« at home » signifie « à la maison »."], ["No, I’m not. I’m very happy.", "Choisis la bonne forme : « She ___ a teacher. »", ["am", "is", "are"], 1, "Avec he, she, it, on utilise **is**."]] },

  { t: "Les nombres et l’âge", d: 12, goal: "Tu sais compter, donner ton âge et ton numéro de téléphone.",
    notes: `Nombres utiles :
- 1 one · 2 two · 3 three · 4 four · 5 five · 6 six · 7 seven · 8 eight · 9 nine · 10 ten
- 11 eleven · 12 twelve · 13 thirteen · 15 fifteen · 20 twenty · 30 thirty · 50 fifty · 100 a hundred
Attention : **thirteen** (13) et **thirty** (30) se ressemblent. L’accent tombe à la fin pour 13 (thir**teen**), au début pour 30 (**thir**ty).
L’âge se dit avec **to be** : I **am** 25 (years old). Jamais « I have 25 ».
Numéro de téléphone : chiffre par chiffre, 0 se dit souvent **oh**.`,
    s: [["A", "How old are you, Joel?", "Quel âge as-tu, Joël ?"], ["B", "I’m twenty-four years old.", "J’ai vingt-quatre ans."], ["A", "And your brother?", "Et ton frère ?"], ["B", "He’s thirteen. Not thirty, thirteen!", "Il a treize ans. Pas trente, treize !"], ["A", "What’s your phone number?", "Quel est ton numéro de téléphone ?"], ["B", "It’s oh-nine-seven, four-five-two, eight-one-six.", "C’est zéro-neuf-sept, quatre-cinq-deux, huit-un-six."], ["A", "Can you repeat, please?", "Tu peux répéter, s’il te plaît ?"], ["B", "Sure. Oh-nine-seven, four-five-two, eight-one-six.", "Bien sûr. Zéro-neuf-sept, quatre-cinq-deux, huit-un-six."]],
    v: [["How old are you?", "Quel âge as-tu ?"], ["years old", "ans (âge)"], ["phone number", "numéro de téléphone"], ["Can you repeat?", "Tu peux répéter ?"], ["oh", "zéro (au téléphone)"]],
    q: [["He’s thirteen.", "Quel âge a le frère ?", ["13 ans", "30 ans", "3 ans"], 0, "**thirteen** = 13. L’accent est sur la fin : thir-**teen**."], ["I’m twenty-four years old.", "Comment dit-on « J’ai 24 ans » ?", ["I have twenty-four years.", "I’m twenty-four years old.", "I’m having twenty-four."], 1, "L’âge se dit avec **to be** : I am 24."], ["Can you repeat, please?", "Que demande Amani ?", ["De répéter", "De parler plus fort", "D’écrire le numéro"], 0, "« repeat » : répéter."]] },

  { t: "La famille", d: 12, goal: "Tu sais présenter ta famille et utiliser les possessifs.",
    notes: `Les adjectifs possessifs ne changent pas selon l’objet, mais selon le propriétaire :
- **my** (mon, ma, mes) · **your** (ton, ta, tes / votre)
- **his** (son, sa : à lui) · **her** (son, sa : à elle) · **its** (pour une chose)
- **our** (notre) · **their** (leur)
Le **’s** indique la possession : **Grace’s** husband = le mari de Grace.
**have got** = avoir (britannique) : I’ve got two brothers.`,
    s: [["A", "Do you have a big family?", "Tu as une grande famille ?"], ["B", "Yes. I’ve got two brothers and three sisters.", "Oui. J’ai deux frères et trois sœurs."], ["A", "Wow! Are your parents in Lubumbashi?", "Waouh ! Tes parents sont à Lubumbashi ?"], ["B", "My father is here, but my mother lives in Likasi.", "Mon père est ici, mais ma mère vit à Likasi."], ["A", "Is this your grandmother in the photo?", "C’est ta grand-mère sur la photo ?"], ["B", "Yes. Her name is Maman Josephine.", "Oui. Elle s’appelle Maman Joséphine."], ["A", "And who is this boy?", "Et qui est ce garçon ?"], ["B", "That’s my sister’s son. His name is David.", "C’est le fils de ma sœur. Il s’appelle David."]],
    v: [["brother / sister", "frère / sœur"], ["parents", "parents (père et mère)"], ["grandmother", "grand-mère"], ["son / daughter", "fils / fille"], ["husband / wife", "mari / femme"]],
    q: [["I’ve got two brothers and three sisters.", "Combien de sœurs a-t-il ?", ["Deux", "Trois", "Cinq"], 1, "« three sisters » : trois sœurs."], ["That’s my sister’s son.", "Qui est David ?", ["Son fils", "Son frère", "Son neveu (le fils de sa sœur)"], 2, "« my sister’s son » : le fils de ma sœur, donc mon neveu (**nephew**)."], ["Her name is Maman Josephine.", "Pourquoi « her » et pas « his » ?", ["Parce que la grand-mère est une femme", "Parce que le nom est long", "Parce que c’est au pluriel"], 0, "**her** s’utilise quand le propriétaire est une femme."]] },

  { t: "Objets et couleurs", d: 12, goal: "Tu sais nommer des objets, leurs couleurs et former le pluriel.",
    notes: `Article indéfini : **a** devant un son consonne (a phone, a bag), **an** devant un son voyelle (an umbrella, an hour).
Pluriel : on ajoute **-s** (phones). Après s, sh, ch, x : **-es** (boxes, watches).
Pluriels irréguliers : man → **men**, woman → **women**, child → **children**, person → **people**.
L’adjectif se place **avant** le nom et ne prend jamais de -s : a **red** car, two **red** cars.
**this / that** (singulier) · **these / those** (pluriel).`,
    s: [["A", "What’s in your bag?", "Qu’y a-t-il dans ton sac ?"], ["B", "A phone, two pens and an umbrella.", "Un téléphone, deux stylos et un parapluie."], ["A", "Is that your blue umbrella?", "C’est ton parapluie bleu ?"], ["B", "No, mine is black. That one is my sister’s.", "Non, le mien est noir. Celui-là est à ma sœur."], ["A", "I like these green shoes.", "J’aime ces chaussures vertes."], ["B", "Thank you! They’re new.", "Merci ! Elles sont neuves."], ["A", "How many children are in your class?", "Combien d’enfants y a-t-il dans ta classe ?"], ["B", "Thirty children: fifteen boys and fifteen girls.", "Trente enfants : quinze garçons et quinze filles."]],
    v: [["bag", "sac"], ["umbrella", "parapluie"], ["shoes", "chaussures"], ["red / blue / green / black / white", "rouge / bleu / vert / noir / blanc"], ["children", "enfants"]],
    q: [["A phone, two pens and an umbrella.", "Pourquoi « an umbrella » ?", ["Parce que c’est un objet long", "Parce que umbrella commence par un son voyelle", "Parce que c’est un objet cher"], 1, "Devant un son voyelle, **a** devient **an**."], ["No, mine is black.", "De quelle couleur est son parapluie ?", ["Bleu", "Noir", "Vert"], 1, "**black** = noir."], ["I like these green shoes.", "Comment dit-on « deux voitures rouges » ?", ["two reds cars", "two cars reds", "two red cars"], 2, "L’adjectif se place avant le nom et reste invariable."]] },

  { t: "L’heure et les jours", d: 12, goal: "Tu sais demander et dire l’heure, et parler des jours de la semaine.",
    notes: `Demander l’heure : **What time is it?** / **What’s the time?**
- 8:00 → **eight o’clock**
- 8:15 → **quarter past eight** · 8:30 → **half past eight** · 8:45 → **quarter to nine**
- On peut aussi lire les chiffres : 8:20 → **eight twenty**
Prépositions de temps : **at** + heure (at 9), **on** + jour (on Monday), **in** + mois / moment de la journée (in June, in the morning).
Les jours prennent une majuscule : Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.`,
    s: [["A", "Excuse me, what time is it?", "Excusez-moi, quelle heure est-il ?"], ["B", "It’s half past eight.", "Il est huit heures et demie."], ["A", "Oh no! My class starts at nine.", "Oh non ! Mon cours commence à neuf heures."], ["B", "Don’t worry, you have thirty minutes.", "Ne t’inquiète pas, tu as trente minutes."], ["A", "Do you work on Saturday?", "Tu travailles le samedi ?"], ["B", "Yes, from Monday to Saturday. I rest on Sunday.", "Oui, du lundi au samedi. Je me repose le dimanche."], ["A", "I go to church on Sunday morning.", "Je vais à l’église le dimanche matin."], ["B", "Me too. Then I visit my family in the afternoon.", "Moi aussi. Ensuite je rends visite à ma famille l’après-midi."]],
    v: [["What time is it?", "Quelle heure est-il ?"], ["half past", "et demie"], ["quarter to", "moins le quart"], ["from … to …", "de … à …"], ["to rest", "se reposer"]],
    q: [["It’s half past eight.", "Quelle heure est-il ?", ["8 h 30", "8 h 15", "7 h 30"], 0, "**half past eight** = 8 h 30 (la moitié après huit)."], ["My class starts at nine.", "Quelle préposition devant une heure ?", ["on", "in", "at"], 2, "**at** + heure : at nine."], ["Yes, from Monday to Saturday.", "Quel jour se repose-t-il ?", ["Samedi", "Dimanche", "Lundi"], 1, "« I rest on Sunday » : je me repose le dimanche."]] },

  { t: "Au marché", d: 13, goal: "Tu sais demander un prix, négocier poliment et payer.",
    notes: `Demander un prix :
- **How much is this?** (singulier) · **How much are these?** (pluriel)
- **How much does it cost?** : combien ça coûte ?
**How much** + indénombrable (how much water) · **How many** + dénombrable pluriel (how many tomatoes).
Pour demander poliment : **Can I have…?** / **I’d like…** (= I would like : je voudrais).
**Too** = trop (too expensive) ; **a bit** = un peu.`,
    s: [["A", "Good afternoon. How much are these tomatoes?", "Bon après-midi. Combien coûtent ces tomates ?"], ["B", "Two thousand francs a kilo.", "Deux mille francs le kilo."], ["A", "That’s a bit expensive. Can you do fifteen hundred?", "C’est un peu cher. Vous pouvez faire mille cinq cents ?"], ["B", "Okay, eighteen hundred. That’s my last price.", "D’accord, mille huit cents. C’est mon dernier prix."], ["A", "Fine. I’d like two kilos, please.", "Très bien. Je voudrais deux kilos, s’il vous plaît."], ["B", "Anything else?", "Autre chose ?"], ["A", "Yes, how many eggs do you have?", "Oui, combien d’œufs avez-vous ?"], ["B", "Thirty. Here you are. Thank you, come again!", "Trente. Voilà. Merci, revenez !"]],
    v: [["How much is it?", "Combien ça coûte ?"], ["expensive / cheap", "cher / bon marché"], ["I’d like…", "Je voudrais…"], ["Anything else?", "Autre chose ?"], ["Here you are", "Voilà (en donnant)"]],
    q: [["Two thousand francs a kilo.", "Quel est le premier prix ?", ["1 500 francs", "1 800 francs", "2 000 francs"], 2, "« two thousand » = deux mille."], ["Okay, eighteen hundred. That’s my last price.", "À quel prix la vente se conclut-elle ?", ["1 800 francs le kilo", "1 500 francs le kilo", "2 000 francs le kilo"], 0, "« eighteen hundred » = 1 800. On compte souvent en centaines."], ["Yes, how many eggs do you have?", "Pourquoi « how many » ?", ["Parce que les œufs se comptent", "Parce que c’est une question polie", "Parce que c’est au passé"], 0, "**How many** avec ce qu’on peut compter ; **how much** avec ce qu’on ne compte pas (l’argent, l’eau)."]] },

  { t: "Le présent simple : ma journée", d: 14, goal: "Tu sais décrire tes habitudes avec le présent simple.",
    notes: `Le **présent simple** décrit les habitudes et les vérités générales.
- I / you / we / they **work** · he / she / it **works** (n’oublie pas le **-s** !)
- Négation : I **don’t** work · she **doesn’t** work (sans -s après doesn’t)
- Question : **Do** you work? **Does** she work?
Adverbes de fréquence (avant le verbe) : **always** (toujours), **usually** (d’habitude), **often** (souvent), **sometimes** (parfois), **never** (jamais).
Verbes en -o, -sh, -ch : **goes, washes, watches**. **have → has**.`,
    s: [["N", "This is Patrick’s day.", "Voici la journée de Patrick."], ["N", "He usually wakes up at six o’clock.", "Il se réveille d’habitude à six heures."], ["N", "He takes a shower and has breakfast with his children.", "Il prend une douche et prend le petit déjeuner avec ses enfants."], ["N", "He goes to work by bus.", "Il va au travail en bus."], ["N", "He doesn’t eat lunch at the office. He eats at a small restaurant.", "Il ne déjeune pas au bureau. Il mange dans un petit restaurant."], ["N", "In the evening, he sometimes watches football.", "Le soir, il regarde parfois le football."], ["N", "He never goes to bed after eleven.", "Il ne se couche jamais après onze heures."], ["N", "And you? What time do you wake up?", "Et toi ? À quelle heure te réveilles-tu ?"]],
    v: [["to wake up", "se réveiller"], ["to have breakfast", "prendre le petit déjeuner"], ["by bus", "en bus"], ["usually", "d’habitude"], ["to go to bed", "aller se coucher"]],
    q: [["He usually wakes up at six o’clock.", "À quelle heure Patrick se réveille-t-il ?", ["5 h", "6 h", "7 h"], 1, "« at six o’clock » : à six heures."], ["He doesn’t eat lunch at the office.", "Choisis la phrase correcte :", ["She work in a bank.", "She works in a bank.", "She don’t works in a bank."], 1, "Avec he / she / it, on ajoute **-s** au verbe."], ["He never goes to bed after eleven.", "Que signifie « never » ?", ["Toujours", "Parfois", "Jamais"], 2, "**never** = jamais."]] },

  { t: "Parler de son métier", d: 14, goal: "Tu sais présenter ton métier et ton lieu de travail.",
    notes: `Questions sur le travail :
- **What do you do?** = quel est ton métier ? (et non « que fais-tu en ce moment »)
- **Where do you work?** · **Who do you work for?** (pour quelle entreprise)
Réponses :
- I’m **a** designer / **an** accountant (n’oublie jamais l’article)
- I work **for** a bank · I work **in** an office · I work **at** NEXOMIA
- I’m **self-employed** : je suis indépendant(e)`,
    s: [["A", "What do you do?", "Qu’est-ce que tu fais dans la vie ?"], ["B", "I’m a graphic designer. I’m self-employed.", "Je suis graphiste. Je suis indépendant."], ["A", "What do you create?", "Qu’est-ce que tu crées ?"], ["B", "I create logos and posters for small businesses.", "Je crée des logos et des affiches pour les petites entreprises."], ["A", "That sounds interesting. Do you work online?", "Ça a l’air intéressant. Tu travailles en ligne ?"], ["B", "Yes, I have clients in Zambia and South Africa.", "Oui, j’ai des clients en Zambie et en Afrique du Sud."], ["A", "I’m an accountant. I work for a mining company.", "Je suis comptable. Je travaille pour une entreprise minière."], ["B", "Do you like your job?", "Tu aimes ton travail ?"]],
    v: [["What do you do?", "Quel est ton métier ?"], ["self-employed", "indépendant(e)"], ["small businesses", "petites entreprises"], ["an accountant", "un(e) comptable"], ["a mining company", "une entreprise minière"]],
    q: [["What do you do?", "Que signifie « What do you do? » ?", ["Que fais-tu maintenant ?", "Quel est ton métier ?", "Tu fais quoi ce soir ?"], 1, "Cette question demande le métier de quelqu’un."], ["Do you work online?", "Qu’as-tu entendu ?", ["Tu travailles en ligne ?", "Tu travailles le matin ?", "Tu aimes ton travail ?"], 0, "« online » signifie « en ligne »."], ["I work for a mining company.", "Pour qui travaille le comptable ?", ["Une banque", "Une école", "Une entreprise minière"], 2, "« a mining company » : une entreprise minière."]] },
];
