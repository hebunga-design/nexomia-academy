// Anglais — niveau B2 (Intermédiaire avancé). Contenu original NEXOMIA.
module.exports = [
  { t: "La voix passive", d: 15, goal: "Tu sais décrire un processus et mettre l’accent sur l’action plutôt que sur son auteur.",
    notes: `Le **passif** = **to be** (au temps voulu) + **participe passé**.
- Présent : Copper **is exported** to China.
- Prétérit : The mine **was opened** in 1906.
- Present perfect : The contract **has been signed**.
- Futur : The goods **will be delivered** tomorrow.
- Avec un modal : It **must be checked**.
On l’utilise quand l’auteur est inconnu, évident ou moins important. Pour le préciser : **by** → The logo was designed **by** Grace.
Tournure fréquente : **It is said that…** / **He is said to be…** (on dit que…).`,
    s: [["N", "How is copper produced in the Katanga region?", "Comment le cuivre est-il produit dans la région du Katanga ?"], ["N", "First, the ore is extracted from open-pit or underground mines.", "D’abord, le minerai est extrait de mines à ciel ouvert ou souterraines."], ["N", "Then it is crushed and mixed with water and chemicals.", "Ensuite, il est broyé et mélangé à de l’eau et à des produits chimiques."], ["N", "The copper is separated and turned into cathodes.", "Le cuivre est séparé et transformé en cathodes."], ["N", "Most of the cathodes are transported by truck to the ports of Dar es Salaam or Durban.", "La plupart des cathodes sont transportées par camion vers les ports de Dar es Salaam ou de Durban."], ["N", "From there, they are shipped to factories all over the world.", "De là, elles sont expédiées vers des usines du monde entier."], ["N", "Many of our phones and cables are made with this copper.", "Beaucoup de nos téléphones et câbles sont fabriqués avec ce cuivre."], ["N", "It is said that the region holds some of the richest deposits on Earth.", "On dit que la région possède certains des gisements les plus riches de la planète."]],
    v: [["the ore", "le minerai"], ["to be extracted", "être extrait"], ["to crush", "broyer, concasser"], ["to be shipped", "être expédié (par bateau)"], ["a deposit", "un gisement (aussi : un acompte)"]],
    q: [["First, the ore is extracted from open-pit or underground mines.", "Quelle est la forme passive de « They extract the ore » ?", ["The ore extracts.", "The ore is extracted.", "The ore has extract."], 1, "Passif : **to be + participe passé**."], ["Most of the cathodes are transported by truck to the ports of Dar es Salaam or Durban.", "Comment les cathodes sont-elles transportées ?", ["Par train", "Par camion", "Par avion"], 1, "« by truck » : par camion."], ["It is said that the region holds some of the richest deposits on Earth.", "Que signifie « It is said that » ?", ["Il a dit que", "On dit que", "C’est triste que"], 1, "Tournure passive impersonnelle : **on dit que**."]] },

  { t: "Rapporter des paroles", d: 15, goal: "Tu sais rapporter ce que quelqu’un a dit, demandé ou ordonné.",
    notes: `Au **discours indirect**, quand le verbe introducteur est au passé (said, told), on **recule** souvent d’un temps :
- présent → prétérit : “I **am** tired.” → She said she **was** tired.
- prétérit / present perfect → past perfect : “I **have finished**.” → He said he **had finished**.
- will → **would** · can → **could** · must → **had to**
**say** (sans complément) ≠ **tell** + personne : She **said** that… / She **told me** that…
Questions : ordre sujet + verbe, sans do : He asked **where I lived**. · She asked **if** I was ready.
Ordres : **told / asked** + personne + **to** + verbe → He told me **to wait**.
Repères qui changent : today → that day, tomorrow → the next day, here → there.`,
    s: [["A", "What did the manager say in the meeting?", "Qu’a dit le directeur à la réunion ?"], ["B", "He said that sales had increased by twenty percent.", "Il a dit que les ventes avaient augmenté de vingt pour cent."], ["A", "Great news! Did he mention the new office?", "Excellente nouvelle ! A-t-il parlé du nouveau bureau ?"], ["B", "Yes, he told us that it would open in January.", "Oui, il nous a dit qu’il ouvrirait en janvier."], ["A", "Did anybody ask about salaries?", "Quelqu’un a-t-il posé une question sur les salaires ?"], ["B", "Esther asked if there would be a bonus this year.", "Esther a demandé s’il y aurait une prime cette année."], ["A", "And what did he answer?", "Et qu’a-t-il répondu ?"], ["B", "He asked us to be patient and promised to give details the next week.", "Il nous a demandé d’être patients et a promis de donner des détails la semaine suivante."]],
    v: [["sales", "les ventes"], ["to increase by", "augmenter de"], ["to mention", "mentionner, évoquer"], ["a bonus", "une prime"], ["to be patient", "être patient"]],
    q: [["He said that sales had increased by twenty percent.", "Qu’a dit le directeur exactement ?", ["“Sales will increase.”", "“Sales have increased by twenty percent.”", "“Sales are decreasing.”"], 1, "« had increased » rapporte « have increased » : on recule d’un temps."], ["Esther asked if there would be a bonus this year.", "Quelle phrase est correcte ?", ["She asked where did I live.", "She asked where I lived.", "She asked where I do live."], 1, "Question indirecte : ordre **sujet + verbe**, sans do."], ["He asked us to be patient and promised to give details the next week.", "Complète : « She ___ me that she was busy. »", ["said", "told", "asked"], 1, "**tell** + personne ; **say** sans personne."]] },

  { t: "Les propositions relatives", d: 14, goal: "Tu sais relier tes idées et donner des précisions dans une même phrase.",
    notes: `Pronoms relatifs :
- **who** : pour une personne → the client **who** called
- **which** : pour une chose → the phone **which** I bought
- **that** : personne ou chose (seulement dans les relatives essentielles, sans virgule)
- **whose** : dont (possession) → the woman **whose** shop is next door
- **where** : où (lieu) · **when** : où (temps) → the day **when** we met
Relative **essentielle** (sans virgules) : elle identifie → The man **who lives next door** is a doctor.
Relative **non essentielle** (entre virgules) : information en plus, **that** interdit → My brother, **who lives in Kinshasa**, is a doctor.
On peut omettre who / which / that quand il est complément : the book (that) I read.`,
    s: [["A", "Do you know the woman who opened the new bakery?", "Tu connais la femme qui a ouvert la nouvelle boulangerie ?"], ["B", "Yes, she’s the one whose husband works at the bank.", "Oui, c’est celle dont le mari travaille à la banque."], ["A", "The bread that she makes is delicious.", "Le pain qu’elle fait est délicieux."], ["B", "I agree. The shop, which opened last month, is always full.", "Je suis d’accord. La boutique, qui a ouvert le mois dernier, est toujours pleine."], ["A", "Is that the place where you buy your breakfast?", "C’est l’endroit où tu achètes ton petit déjeuner ?"], ["B", "Every morning! I remember the day when she gave away free cakes.", "Tous les matins ! Je me souviens du jour où elle a offert des gâteaux."], ["A", "That’s good marketing.", "C’est du bon marketing."], ["B", "Exactly. She’s someone who understands her customers.", "Exactement. C’est quelqu’un qui comprend ses clients."]],
    v: [["a bakery", "une boulangerie"], ["whose", "dont (possession)"], ["to give away", "offrir, distribuer gratuitement"], ["always full", "toujours plein"], ["customers", "clients (d’un commerce)"]],
    q: [["Yes, she’s the one whose husband works at the bank.", "Que signifie « whose » ici ?", ["qui", "dont (son mari)", "où"], 1, "**whose** exprime la possession : dont le mari."], ["The shop, which opened last month, is always full.", "Pourquoi ne peut-on pas dire « that » ici ?", ["Parce que c’est une personne", "Parce que la relative est entre virgules", "Parce que c’est au passé"], 1, "Dans une relative non essentielle (entre virgules), **that** est interdit."], ["Is that the place where you buy your breakfast?", "Complète : « This is the man ___ car was stolen. »", ["who", "which", "whose"], 2, "La voiture **de** cet homme : **whose**."]] },

  { t: "Regrets et troisième conditionnel", d: 15, goal: "Tu sais exprimer des regrets et imaginer un passé différent.",
    notes: `**Conditionnel 3** — passé **irréel** (ce qui ne s’est pas passé) :
**If** + **past perfect**, **would have** + participe passé
- If I **had left** earlier, I **wouldn’t have missed** the bus.
**Regrets** :
- **I wish** + past perfect : regret sur le passé → I wish I **had studied** harder.
- **I wish** + prétérit : souhait sur le présent → I wish I **spoke** Portuguese.
- **If only…** : plus fort, plus émotionnel.
- **should have** + participe : reproche → You **should have** called me!
Conditionnel **mixte** : If I **had accepted** that job, I **would be** rich now.`,
    s: [["A", "You look upset. What’s wrong?", "Tu as l’air contrarié. Qu’est-ce qui ne va pas ?"], ["B", "I missed a great opportunity. A company in Lusaka offered me a job.", "J’ai raté une belle occasion. Une entreprise de Lusaka m’a proposé un poste."], ["A", "Why didn’t you accept it?", "Pourquoi ne l’as-tu pas accepté ?"], ["B", "The interview was in English. If I had spoken better English, I would have got the job.", "L’entretien était en anglais. Si j’avais mieux parlé anglais, j’aurais eu le poste."], ["A", "I’m sorry. You should have told me, I would have helped you prepare.", "Je suis désolé. Tu aurais dû me le dire, je t’aurais aidé à te préparer."], ["B", "I wish I had started learning earlier.", "Je regrette de ne pas avoir commencé à apprendre plus tôt."], ["A", "Don’t give up. If you keep studying, you’ll be ready next time.", "N’abandonne pas. Si tu continues à étudier, tu seras prêt la prochaine fois."], ["B", "You’re right. If I had accepted, I would be in Zambia now… but my chance will come.", "Tu as raison. Si j’avais accepté, je serais en Zambie maintenant… mais ma chance viendra."]],
    v: [["upset", "contrarié, bouleversé"], ["to miss an opportunity", "rater une occasion"], ["should have told", "aurait dû dire"], ["I wish I had…", "je regrette de ne pas avoir…"], ["Don’t give up", "N’abandonne pas"]],
    q: [["If I had spoken better English, I would have got the job.", "A-t-il eu le poste ?", ["Oui", "Non", "On ne sait pas"], 1, "Conditionnel 3 : situation irréelle dans le passé, il **n’a pas** eu le poste."], ["You should have told me, I would have helped you prepare.", "Que signifie « should have told » ?", ["Tu devrais dire", "Tu aurais dû dire", "Tu vas dire"], 1, "**should have** + participe : reproche sur le passé."], ["I wish I had started learning earlier.", "Complète : « If she ___ the bus, she wouldn’t have been late. »", ["didn’t miss", "hadn’t missed", "wouldn’t miss"], 1, "Conditionnel 3 : **if + past perfect** (hadn’t missed)."]] },

  { t: "Négocier avec un client", d: 15, goal: "Tu sais négocier un prix et des conditions de façon professionnelle.",
    notes: `Formules de négociation polies et efficaces :
- Proposer : **We could offer…** · **How would you feel about…?**
- Conditionner : **We can agree to that, provided that / as long as…** (à condition que)
- Refuser poliment : **I’m afraid that’s not possible.** · **That’s a bit more than we expected.**
- Faire une contre-offre : **Would you consider…?** · **What if we…?**
- Conclure : **I think we have a deal.** · **Let’s put it in writing.**
**I’m afraid** ne veut pas dire « j’ai peur » ici : c’est une manière polie d’annoncer un refus.`,
    s: [["A", "Thank you for your proposal. However, the price is a bit higher than we expected.", "Merci pour votre proposition. Cependant, le prix est un peu plus élevé que prévu."], ["B", "I understand. What budget did you have in mind?", "Je comprends. Quel budget aviez-vous en tête ?"], ["A", "Around four thousand dollars for the whole campaign.", "Environ quatre mille dollars pour toute la campagne."], ["B", "I’m afraid we can’t go that low. But we could offer four thousand five hundred.", "J’ai bien peur que nous ne puissions pas descendre aussi bas. Mais nous pourrions proposer quatre mille cinq cents."], ["A", "Would you consider including the social media videos?", "Accepteriez-vous d’inclure les vidéos pour les réseaux sociaux ?"], ["B", "We can agree to that, provided that you pay fifty percent upfront.", "Nous pouvons l’accepter, à condition que vous payiez cinquante pour cent d’avance."], ["A", "That sounds reasonable. I think we have a deal.", "Cela semble raisonnable. Je crois que nous avons un accord."], ["B", "Excellent. I’ll send you the contract this afternoon.", "Excellent. Je vous envoie le contrat cet après-midi."]],
    v: [["a proposal", "une proposition (commerciale)"], ["to have in mind", "avoir en tête"], ["I’m afraid…", "je regrette, malheureusement…"], ["provided that", "à condition que"], ["upfront", "d’avance, à la commande"]],
    q: [["Around four thousand dollars for the whole campaign.", "Quel budget le client propose-t-il ?", ["3 500 $", "4 000 $", "4 500 $"], 1, "« four thousand dollars »."], ["I’m afraid we can’t go that low.", "Que signifie « I’m afraid » ici ?", ["J’ai peur", "Malheureusement, je regrette", "Je suis surpris"], 1, "Formule polie pour annoncer un refus."], ["We can agree to that, provided that you pay fifty percent upfront.", "Quelle est la condition ?", ["Payer la moitié d’avance", "Signer aujourd’hui", "Réduire le nombre de vidéos"], 0, "« fifty percent upfront » : cinquante pour cent d’avance."]] },

  { t: "Les phrasal verbs du travail", d: 14, goal: "Tu comprends et utilises les phrasal verbs les plus courants au bureau.",
    notes: `Un **phrasal verb** = verbe + particule (up, out, off, on…). Le sens change souvent complètement.
- **set up** : créer, installer (une entreprise, une réunion)
- **carry out** : réaliser, effectuer (une étude, un projet)
- **put off** : reporter (= postpone)
- **call off** : annuler (= cancel)
- **come up with** : trouver, proposer (une idée)
- **look into** : examiner, étudier (un problème)
- **follow up (on)** : relancer, faire le suivi
- **run out of** : manquer de, ne plus avoir
- **take over** : reprendre (une responsabilité, une entreprise)
Avec un pronom, il se place au milieu : set **it** up, call **it** off.`,
    s: [["A", "We need to set up a meeting with the new supplier.", "Nous devons organiser une réunion avec le nouveau fournisseur."], ["B", "Can we put it off until next week? We’ve run out of time today.", "Pouvons-nous la reporter à la semaine prochaine ? Nous n’avons plus de temps aujourd’hui."], ["A", "Fine. Have you looked into the delivery problem?", "D’accord. As-tu examiné le problème de livraison ?"], ["B", "Yes, and I’ve come up with a solution: a second transport company.", "Oui, et j’ai trouvé une solution : une deuxième société de transport."], ["A", "Great idea. Can you carry out a quick cost study?", "Excellente idée. Peux-tu réaliser une petite étude de coûts ?"], ["B", "Sure. I’ll follow up with you on Thursday.", "Bien sûr. Je reviens vers toi jeudi."], ["A", "By the way, the training session has been called off.", "Au fait, la formation a été annulée."], ["B", "Good, because Esther is taking over my clients next month.", "Tant mieux, car Esther reprend mes clients le mois prochain."]],
    v: [["to set up", "organiser, créer"], ["to put off", "reporter"], ["to run out of", "manquer de"], ["to come up with", "trouver (une idée)"], ["to call off", "annuler"]],
    q: [["Can we put it off until next week?", "Que veut faire B avec la réunion ?", ["L’annuler", "La reporter", "L’avancer"], 1, "**put off** = reporter."], ["Yes, and I’ve come up with a solution: a second transport company.", "Que signifie « come up with » ?", ["Monter avec", "Trouver, proposer", "Refuser"], 1, "**come up with** an idea / a solution : trouver une idée."], ["By the way, the training session has been called off.", "Qu’est-il arrivé à la formation ?", ["Elle est annulée", "Elle est reportée", "Elle commence"], 0, "**call off** = annuler."]] },

  { t: "Exprimer et défendre son opinion", d: 14, goal: "Tu sais donner ton avis, nuancer, être d’accord ou non avec politesse.",
    notes: `Donner son avis : **In my opinion…** · **As far as I’m concerned…** · **I strongly believe that…**
Être d’accord : **I couldn’t agree more.** (tout à fait d’accord) · **That’s a good point.**
Être partiellement d’accord : **I see your point, but…** · **To some extent, yes.**
Être en désaccord poliment : **I’m not sure I agree.** · **I see it differently.**
Articuler ses idées : **On the one hand… on the other hand…** · **However** · **Moreover / Furthermore** (de plus) · **Therefore** (donc).
Éviter l’agressivité : en anglais professionnel, on dit rarement « You’re wrong ».`,
    s: [["A", "In my opinion, every child in Congo should learn English at school.", "À mon avis, chaque enfant au Congo devrait apprendre l’anglais à l’école."], ["B", "I see your point, but what about our national languages?", "Je comprends ton point de vue, mais qu’en est-il de nos langues nationales ?"], ["A", "That’s a good point. On the one hand, English opens doors to the world.", "C’est une bonne remarque. D’un côté, l’anglais ouvre des portes vers le monde."], ["A", "On the other hand, Swahili and Lingala are part of our identity.", "D’un autre côté, le swahili et le lingala font partie de notre identité."], ["B", "I couldn’t agree more. Moreover, children learn better in their mother tongue.", "Je suis tout à fait d’accord. De plus, les enfants apprennent mieux dans leur langue maternelle."], ["A", "Therefore, we could teach both from an early age.", "Par conséquent, nous pourrions enseigner les deux dès le plus jeune âge."], ["B", "To some extent, yes. However, we would need many more trained teachers.", "Dans une certaine mesure, oui. Cependant, il faudrait beaucoup plus d’enseignants formés."], ["A", "As far as I’m concerned, that’s the real challenge.", "En ce qui me concerne, c’est le vrai défi."]],
    v: [["In my opinion", "À mon avis"], ["I see your point, but…", "Je comprends, mais…"], ["I couldn’t agree more", "Je suis tout à fait d’accord"], ["Moreover", "De plus"], ["To some extent", "Dans une certaine mesure"]],
    q: [["I couldn’t agree more.", "Que signifie « I couldn’t agree more » ?", ["Je ne suis pas du tout d’accord", "Je suis tout à fait d’accord", "Je ne sais pas"], 1, "Littéralement « je ne pourrais pas être plus d’accord »."], ["On the one hand, English opens doors to the world.", "Quelle expression introduit l’argument opposé ?", ["Moreover", "On the other hand", "Therefore"], 1, "**On the one hand… on the other hand** : d’un côté… de l’autre."], ["However, we would need many more trained teachers.", "Quel est le problème soulevé par B ?", ["Le manque d’enseignants formés", "Le prix des livres", "Le manque d’écoles"], 0, "« many more trained teachers » : beaucoup plus d’enseignants formés."]] },
];
