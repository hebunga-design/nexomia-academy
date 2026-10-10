// Anglais — niveau A2 (Élémentaire). Contenu original NEXOMIA.
module.exports = [
  { t: "Fixer un rendez-vous", d: 12, goal: "Tu sais proposer, refuser et confirmer un rendez-vous.",
    notes: `Proposer : **Are you free on…?** · **What about…?** · **How about…?** (Et si… ?)
Accepter : **That’s perfect.** · **That works for me.**
Refuser poliment : **Sorry, I can’t.** · **…is difficult for me.**
Confirmer : **See you on Tuesday!** · **See you then!**
Rappel : **on** + jour, **at** + heure → on Tuesday **at** ten.`,
    s: [["A", "Hello Grace, are you free on Monday?", "Bonjour Grace, tu es libre lundi ?"], ["B", "Monday is difficult. I have a meeting all day.", "Lundi, c’est difficile. J’ai une réunion toute la journée."], ["A", "What about Tuesday?", "Et mardi ?"], ["B", "Tuesday is fine. What time?", "Mardi, ça va. À quelle heure ?"], ["A", "How about ten o’clock, at the office?", "Que dirais-tu de dix heures, au bureau ?"], ["B", "Ten is perfect. That works for me.", "Dix heures, c’est parfait. Ça me convient."], ["A", "Great. I’ll send you the address.", "Super. Je t’envoie l’adresse."], ["B", "Thanks. See you on Tuesday!", "Merci. À mardi !"]],
    v: [["Are you free…?", "Es-tu libre… ?"], ["a meeting", "une réunion"], ["What about…?", "Et… ? Que dis-tu de… ?"], ["That works for me", "Ça me convient"], ["See you then", "À ce moment-là, à tout à l’heure"]],
    q: [["Monday is difficult. I have a meeting all day.", "Pourquoi lundi est-il impossible ?", ["Elle voyage", "Elle a une réunion", "Elle est malade"], 1, "« a meeting » : une réunion."], ["How about ten o’clock, at the office?", "Quelle heure est proposée ?", ["10 h", "2 h", "12 h"], 0, "« ten o’clock » = 10 h."], ["Ten is perfect. That works for me.", "Que signifie « That works for me » ?", ["Je travaille là", "Ça me convient", "C’est mon travail"], 1, "Expression très courante pour accepter une proposition."]] },

  { t: "Le présent continu", d: 13, goal: "Tu sais décrire ce qui se passe en ce moment.",
    notes: `Le **présent continu** décrit une action en cours **maintenant**.
Forme : **to be + verbe-ing** → I **am working**, she **is cooking**, they **are playing**.
Négation : I’m **not** working. Question : **Are** you working?
Différence avec le présent simple :
- I **work** in a bank (habitude, en général)
- I**’m working** from home today (en ce moment, temporaire)
Orthographe : make → **making**, run → **running**, sit → **sitting**.
Certains verbes ne se mettent presque jamais au continu : **know, like, want, need, understand**.`,
    s: [["A", "Hi Joel! What are you doing?", "Salut Joël ! Qu’est-ce que tu fais ?"], ["B", "I’m cooking. My friends are coming for dinner.", "Je cuisine. Mes amis viennent dîner."], ["A", "Nice! What are you making?", "Sympa ! Qu’est-ce que tu prépares ?"], ["B", "I’m making fish with rice and vegetables.", "Je prépare du poisson avec du riz et des légumes."], ["A", "Is your sister helping you?", "Ta sœur t’aide ?"], ["B", "No, she isn’t. She’s studying for an exam.", "Non. Elle révise pour un examen."], ["A", "And what’s that noise?", "Et c’est quoi, ce bruit ?"], ["B", "The children are playing football outside.", "Les enfants jouent au football dehors."]],
    v: [["to cook", "cuisiner"], ["to come for dinner", "venir dîner"], ["vegetables", "légumes"], ["to study for an exam", "réviser pour un examen"], ["outside", "dehors"]],
    q: [["I’m cooking. My friends are coming for dinner.", "Que fait Joël en ce moment ?", ["Il cuisine", "Il mange", "Il fait les courses"], 0, "« I’m cooking » : présent continu, action en cours."], ["She’s studying for an exam.", "Que fait sa sœur ?", ["Elle dort", "Elle révise", "Elle joue"], 1, "**to study** : étudier, réviser."], ["The children are playing football outside.", "Quelle phrase décrit une action en cours ?", ["I work in a bank.", "I’m working from home today.", "I always work on Monday."], 1, "**to be + -ing** : ce qui se passe maintenant."]] },

  { t: "There is, there are : décrire un lieu", d: 12, goal: "Tu sais décrire une ville, une maison ou un bureau.",
    notes: `**There is** (there’s) + singulier : il y a un…
**There are** + pluriel : il y a des…
Négation : there **isn’t** a…, there **aren’t any**…
Question : **Is there** a bank near here? **Are there any** shops?
Prépositions de lieu : **in** (dans), **on** (sur), **under** (sous), **next to** (à côté de), **between** (entre), **opposite** (en face de), **near** (près de).`,
    s: [["A", "Is there a bank near here?", "Y a-t-il une banque près d’ici ?"], ["B", "Yes, there’s a bank next to the post office.", "Oui, il y a une banque à côté de la poste."], ["A", "Are there any good restaurants in this street?", "Y a-t-il de bons restaurants dans cette rue ?"], ["B", "There are two, opposite the big market.", "Il y en a deux, en face du grand marché."], ["A", "And is there a pharmacy?", "Et y a-t-il une pharmacie ?"], ["B", "No, there isn’t, but there’s one near the hospital.", "Non, mais il y en a une près de l’hôpital."], ["A", "Thank you very much.", "Merci beaucoup."], ["B", "No problem. Go straight on, it’s on your left.", "Pas de problème. Allez tout droit, c’est sur votre gauche."]],
    v: [["near here", "près d’ici"], ["next to", "à côté de"], ["opposite", "en face de"], ["Go straight on", "Allez tout droit"], ["on your left / right", "sur votre gauche / droite"]],
    q: [["Yes, there’s a bank next to the post office.", "Où est la banque ?", ["En face de la poste", "À côté de la poste", "Derrière la poste"], 1, "**next to** : à côté de."], ["There are two, opposite the big market.", "Combien de restaurants y a-t-il ?", ["Un", "Deux", "Aucun"], 1, "« There are two » : il y en a deux."], ["No, there isn’t, but there’s one near the hospital.", "Choisis : « ___ many shops in this town. »", ["There is", "There are", "It is"], 1, "Avec un pluriel (many shops), on utilise **there are**."]] },

  { t: "Le passé simple : verbes réguliers", d: 14, goal: "Tu sais raconter ce que tu as fait hier avec les verbes réguliers.",
    notes: `Le **prétérit** (past simple) décrit une action **terminée** à un moment précis du passé.
Verbes réguliers : on ajoute **-ed** → work**ed**, visit**ed**, play**ed**, stud**ied** (y → ied), stop**ped**.
Prononciation de -ed :
- /t/ après p, k, s, sh, ch : worked, watched
- /d/ après un son sonore : played, called
- /ɪd/ après t ou d : visit**ed**, need**ed**
Négation et question avec **did** (le verbe reste à la base) : I **didn’t work** · **Did** you **work**?
Marqueurs : **yesterday**, **last** week, two days **ago**.`,
    s: [["A", "What did you do yesterday?", "Qu’as-tu fait hier ?"], ["B", "I worked in the morning and visited my aunt in the afternoon.", "J’ai travaillé le matin et j’ai rendu visite à ma tante l’après-midi."], ["A", "Did you watch the match last night?", "Tu as regardé le match hier soir ?"], ["B", "No, I didn’t. I studied for my English test.", "Non. J’ai révisé pour mon test d’anglais."], ["A", "When did you start learning English?", "Quand as-tu commencé à apprendre l’anglais ?"], ["B", "I started three months ago.", "J’ai commencé il y a trois mois."], ["A", "Your English improved a lot!", "Ton anglais s’est beaucoup amélioré !"], ["B", "Thanks! I listened to the lessons every day.", "Merci ! J’ai écouté les leçons tous les jours."]],
    v: [["yesterday", "hier"], ["last night", "hier soir"], ["ago", "il y a (durée)"], ["to improve", "s’améliorer"], ["to visit", "rendre visite, visiter"]],
    q: [["I started three months ago.", "Quand a-t-il commencé l’anglais ?", ["Il y a trois semaines", "Il y a trois mois", "Il y a trois ans"], 1, "« three months ago » : il y a trois mois."], ["No, I didn’t. I studied for my English test.", "Choisis la question correcte :", ["Did you watched the match?", "Did you watch the match?", "Do you watched the match?"], 1, "Après **did**, le verbe reste à la base : did you **watch**."], ["I visited my aunt in the afternoon.", "Comment se prononce la fin de « visited » ?", ["/t/", "/d/", "/ɪd/"], 2, "Après un t, -ed se prononce /ɪd/ : visit-**id**."]] },

  { t: "Le passé simple : verbes irréguliers", d: 15, goal: "Tu sais raconter un événement avec les verbes irréguliers les plus fréquents.",
    notes: `Les verbes les plus utilisés sont **irréguliers** : il faut les apprendre.
- go → **went** · have → **had** · see → **saw** · get → **got**
- buy → **bought** · eat → **ate** · take → **took** · come → **came**
- make → **made** · say → **said** · meet → **met** · leave → **left**
**to be** au passé : I / he / she / it **was** · you / we / they **were**.
Avec **did** (négation, question), on revient à la base : I **didn’t go**, **did** you **see**…?`,
    s: [["A", "How was your weekend?", "Comment s’est passé ton week-end ?"], ["B", "It was great! I went to Kasumbalesa with my cousin.", "C’était super ! Je suis allé à Kasumbalesa avec mon cousin."], ["A", "What did you do there?", "Qu’avez-vous fait là-bas ?"], ["B", "We bought some goods and met a Zambian trader.", "Nous avons acheté des marchandises et rencontré un commerçant zambien."], ["A", "Did you speak English with him?", "Tu as parlé anglais avec lui ?"], ["B", "Yes! I understood almost everything.", "Oui ! J’ai presque tout compris."], ["A", "Wow. When did you come back?", "Waouh. Quand êtes-vous rentrés ?"], ["B", "We left on Sunday morning and got home at noon.", "Nous sommes partis dimanche matin et sommes arrivés à midi."]],
    v: [["How was…?", "Comment s’est passé… ?"], ["goods", "marchandises"], ["a trader", "un commerçant"], ["almost everything", "presque tout"], ["to get home", "arriver à la maison"]],
    q: [["I went to Kasumbalesa with my cousin.", "« went » est le passé de quel verbe ?", ["want", "go", "wait"], 1, "**go → went** : verbe irrégulier."], ["We bought some goods and met a Zambian trader.", "Qu’ont-ils fait ?", ["Ils ont vendu une voiture", "Ils ont acheté des marchandises", "Ils ont visité un musée"], 1, "**buy → bought** : acheter."], ["We left on Sunday morning.", "Quand sont-ils partis ?", ["Samedi soir", "Dimanche matin", "Lundi midi"], 1, "**leave → left** : partir. « on Sunday morning »."]] },

  { t: "Au restaurant", d: 13, goal: "Tu sais réserver, commander et payer au restaurant.",
    notes: `Formules polies au restaurant :
- **I’d like…** / **Could I have…?** : je voudrais… / pourrais-je avoir… ?
- **What would you like?** : que désirez-vous ?
- **Would you like** some water? : voulez-vous… ? (offre polie)
- **Can I have the bill, please?** (britannique) / **the check** (américain) : l’addition
**some** dans les phrases affirmatives et les offres ; **any** dans les questions et négations : We don’t have **any** fish.`,
    s: [["A", "Good evening. A table for two, please.", "Bonsoir. Une table pour deux, s’il vous plaît."], ["B", "Of course. Here’s the menu. What would you like to drink?", "Bien sûr. Voici la carte. Que désirez-vous boire ?"], ["A", "Could I have some water and an orange juice?", "Pourrais-je avoir de l’eau et un jus d’orange ?"], ["B", "Certainly. Are you ready to order?", "Certainement. Vous êtes prêts à commander ?"], ["A", "I’d like the grilled chicken with fries.", "Je voudrais le poulet grillé avec des frites."], ["B", "Sorry, we don’t have any chicken tonight. The fish is very good.", "Désolé, nous n’avons pas de poulet ce soir. Le poisson est très bon."], ["A", "Okay, the fish then.", "D’accord, le poisson alors."], ["A", "Excuse me, can we have the bill, please?", "Excusez-moi, pouvons-nous avoir l’addition, s’il vous plaît ?"]],
    v: [["a table for two", "une table pour deux"], ["the menu", "la carte, le menu"], ["to order", "commander"], ["grilled chicken", "poulet grillé"], ["the bill", "l’addition"]],
    q: [["Could I have some water and an orange juice?", "Que commande-t-il à boire ?", ["Du thé et de l’eau", "De l’eau et un jus d’orange", "Un café"], 1, "« some water and an orange juice »."], ["Sorry, we don’t have any chicken tonight.", "Pourquoi « any » et pas « some » ?", ["Parce que la phrase est négative", "Parce que c’est le soir", "Parce que chicken est au pluriel"], 0, "**any** dans les négations et les questions."], ["Can we have the bill, please?", "Que demande le client ?", ["Le menu", "L’addition", "Une autre table"], 1, "**the bill** = l’addition."]] },

  { t: "Au téléphone", d: 12, goal: "Tu sais passer un appel professionnel et laisser un message.",
    notes: `Au téléphone, on ne dit pas « I am Grace » mais **This is Grace** / **It’s Grace speaking**.
- **Can I speak to…?** / **Could I speak to…?** : pourrais-je parler à… ?
- **Hold on, please** / **One moment, please** : ne quittez pas
- **She’s not available.** **Can I take a message?** : elle n’est pas disponible, puis-je prendre un message ?
- **I’ll call back later.** : je rappellerai
- **Could you speak more slowly?** : pourriez-vous parler plus lentement ?
**I’ll** (= I will) exprime une décision prise sur le moment.`,
    s: [["A", "Good morning, NEXOMIA. How can I help you?", "Bonjour, NEXOMIA. Comment puis-je vous aider ?"], ["B", "Hello, this is Peter Banda from Ndola. Could I speak to Mr Ebunga?", "Bonjour, ici Peter Banda, de Ndola. Pourrais-je parler à M. Ebunga ?"], ["A", "One moment, please… I’m sorry, he’s in a meeting.", "Un instant, s’il vous plaît… Je suis désolée, il est en réunion."], ["B", "Can I leave a message?", "Puis-je laisser un message ?"], ["A", "Of course. Could you spell your name, please?", "Bien sûr. Pourriez-vous épeler votre nom ?"], ["B", "B-A-N-D-A. Please ask him to call me back.", "B-A-N-D-A. Demandez-lui de me rappeler, s’il vous plaît."], ["A", "Sure. What’s your number?", "Bien sûr. Quel est votre numéro ?"], ["B", "It’s plus two six oh, nine seven, five five five, one two three four.", "C’est le plus deux six zéro, neuf sept, cinq cinq cinq, un deux trois quatre."]],
    v: [["This is…", "Ici… (au téléphone)"], ["Could I speak to…?", "Pourrais-je parler à… ?"], ["to leave a message", "laisser un message"], ["to spell", "épeler"], ["to call back", "rappeler"]],
    q: [["Hello, this is Peter Banda from Ndola.", "Comment se présente-t-on au téléphone ?", ["I am Peter.", "This is Peter.", "Here is Peter."], 1, "Au téléphone : **This is** + nom."], ["I’m sorry, he’s in a meeting.", "Pourquoi M. Ebunga ne répond-il pas ?", ["Il est en réunion", "Il est en voyage", "Il est malade"], 0, "« in a meeting » : en réunion."], ["Please ask him to call me back.", "Que veut Peter ?", ["Envoyer un courriel", "Que M. Ebunga le rappelle", "Venir au bureau"], 1, "**to call back** = rappeler."]] },

  { t: "Comparer", d: 14, goal: "Tu sais comparer des produits, des villes et des personnes.",
    notes: `Comparatif :
- Adjectif court (1 syllabe) : **-er than** → cheaper than, bigger than
- Adjectif en -y : **-ier** → easy → easier
- Adjectif long : **more … than** → more expensive than
Superlatif : **the -est** / **the most** → the cheapest, the most expensive
Irréguliers : good → **better** → **the best** · bad → **worse** → **the worst** · far → **further**
Égalité : **as … as** → This phone is **as good as** that one.`,
    s: [["A", "Which phone is better for my business?", "Quel téléphone est le meilleur pour mon commerce ?"], ["B", "This one is cheaper, but that one is faster.", "Celui-ci est moins cher, mais celui-là est plus rapide."], ["A", "Is the battery bigger?", "La batterie est plus grande ?"], ["B", "Yes, and the camera is much better.", "Oui, et l’appareil photo est bien meilleur."], ["A", "It’s more expensive than I thought.", "Il est plus cher que je ne pensais."], ["B", "It’s the most popular model in our shop.", "C’est le modèle le plus populaire de notre boutique."], ["A", "Is it as strong as the other one?", "Il est aussi solide que l’autre ?"], ["B", "It’s the strongest phone we have.", "C’est le téléphone le plus solide que nous ayons."]],
    v: [["cheaper", "moins cher"], ["faster", "plus rapide"], ["better / the best", "meilleur / le meilleur"], ["more expensive than", "plus cher que"], ["as strong as", "aussi solide que"]],
    q: [["This one is cheaper, but that one is faster.", "Quel est l’avantage du premier téléphone ?", ["Il est plus rapide", "Il est moins cher", "Il est plus solide"], 1, "**cheaper** = moins cher."], ["It’s more expensive than I thought.", "Pourquoi « more expensive » et pas « expensiver » ?", ["Parce que l’adjectif est long", "Parce que c’est au passé", "Parce que c’est poli"], 0, "Adjectif long : **more** + adjectif."], ["It’s the strongest phone we have.", "Quel est le superlatif de « good » ?", ["the goodest", "the most good", "the best"], 2, "good → better → **the best** (irrégulier)."]] },
];
