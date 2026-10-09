# NEXOMIA Academy

Plateforme d’apprentissage en ligne de NEXOMIA (Lubumbashi, RDC) : langues (anglais, portugais du Brésil, et toute langue ajoutée par l’équipe), compétences numériques, design, création de contenu et entrepreneuriat.

**Apprendre · Produire · Transmettre**

## Ce que fait l’application

| Espace | Fonctions |
|---|---|
| Apprenant | Inscription, catalogue, première leçon gratuite par cours, lecteur audio (vitesse, phrase par phrase, boucle, écoute-répète, traduction, écran verrouillé), exercices d’écoute avec seuil de réussite de 80 %, progression, série de jours, téléchargement hors connexion |
| Abonnements | 5 USD par cours et par mois, tarif dégressif quand plusieurs cours sont payés ensemble (par défaut : 1 cours 5 $, 2 cours 8 $, 3 cours 12 $, puis +4 $ par cours), M-Pesa, Airtel Money, Orange Money, carte |
| Studio | Création de cours dans n’importe quel domaine, leçons à partir de phrases (`phrase \| traduction`), exercices générés, envoi des voix enregistrées par phrase, circuit Brouillon → En revue → Publié → Archivé |
| Administration | Indicateurs, rôles, suspension, lien de réinitialisation du mot de passe, bourses (un mois offert), suivi des paiements, réglage du tarif dégressif |

## Rôles

`learner` (apprenant) · `mentor` · `coach` (accompagnateur) · `creator` (créateur de cours) · `reviewer` (responsable pédagogique) · `admin`.
Les adresses listées dans `ADMIN_EMAILS` deviennent administrateurs à leur inscription. Les autres rôles s’attribuent dans **Admin → Utilisateurs**.

## Technique

- Node.js 22, **aucune dépendance externe** : serveur HTTP natif, base SQLite intégrée (`node:sqlite`), mots de passe hachés avec scrypt.
- Base de données et audios stockés dans `DATA_DIR` (volume persistant `/data` sur Railway).
- Interface web progressive (installable sur l’écran d’accueil, service worker pour l’écoute hors connexion).
- Sécurité : cookies de session HttpOnly, contrôle des rôles côté serveur, protection contre les requêtes d’une autre origine, limitation des tentatives de connexion, en-têtes de sécurité (CSP).

```
server/
  index.js     serveur HTTP, fichiers statiques, sécurité
  routes.js    API (comptes, catalogue, leçons, audio, progression, commandes, Studio, admin)
  billing.js   abonnements, commandes, mode test, FlexPay, rapprochement
  pricing.js   tarif dégressif
  auth.js      comptes, sessions, rôles
  content.js   création du contenu pédagogique
  seed.js      catalogue de départ
  db.js        schéma SQLite
public/        interface (index.html, app.js, app.css, sw.js)
```

## Lancer en local

```bash
ADMIN_EMAILS=vous@exemple.com node server/index.js
# puis ouvrir http://localhost:3000
```

## Variables d’environnement

| Variable | Rôle |
|---|---|
| `PORT` | Port d’écoute (fourni par Railway) |
| `DATA_DIR` | Dossier de la base et des audios (`/data` sur Railway) |
| `ADMIN_EMAILS` | Adresses qui deviennent administrateurs à l’inscription, séparées par des virgules |
| `PUBLIC_URL` | Adresse publique du site (pour les retours de paiement) |
| `PAYMENTS_TEST_MODE` | `true` par défaut : paiements simulés tant que FlexPay n’est pas configuré. `false` pour fermer les paiements |
| `PAWAPAY_TOKEN` | Jeton API pawaPay (prestataire prioritaire dès qu’il est renseigné ; Mobile Money uniquement) |
| `PAWAPAY_SANDBOX` | `true` pour utiliser l’environnement de test pawaPay avec un jeton de test |
| `FLEXPAY_TOKEN`, `FLEXPAY_MERCHANT` | Identifiants du compte marchand FlexPay. Dès qu’ils sont renseignés, le mode test s’arrête |
| `FLEXPAY_PAYMENT_URL`, `FLEXPAY_CARD_URL`, `FLEXPAY_CHECK_URL` | Adresses de l’API FlexPay, à confirmer avec FlexPay (des valeurs par défaut sont prévues) |

## Paiements pawaPay

1. Le serveur crée la commande et un identifiant de paiement avant d’appeler pawaPay ; le montant est calculé côté serveur.
2. L’opérateur est déduit du numéro (M-Pesa, Airtel, Orange) ; l’apprenant valide sur son téléphone.
3. Adresse de notification à déclarer dans le tableau de bord pawaPay : `https://<site>/api/payments/pawapay/callback`.
4. Chaque notification déclenche une vérification du statut auprès de pawaPay ; seul un statut `COMPLETED` avec le bon montant et la bonne devise active l’abonnement, une seule fois par cours.
5. Les commandes en attente sont revérifiées toutes les 2 minutes pendant 48 heures.

## Paiements FlexPay

1. L’apprenant choisit ses cours ; le serveur calcule le montant (jamais le navigateur).
2. Mobile Money : FlexPay envoie la demande sur le téléphone ; l’apprenant valide avec son code sur le canal de son opérateur. Carte : redirection vers la page sécurisée FlexPay.
3. La notification de FlexPay déclenche une **vérification** auprès de FlexPay (référence, montant, devise, statut définitif) avant toute activation.
4. Une commande payée n’active qu’**une seule période par cours**, même si la confirmation arrive plusieurs fois.
5. Toutes les 5 minutes, les commandes en attente sont revérifiées ; après 48 h sans confirmation, elles expirent.

Avant l’ouverture : faire un paiement réel de faible montant pour chaque réseau activé, et confirmer avec FlexPay les adresses d’API et le format des notifications.

## Sauvegardes

La base `nexomia.db` et le dossier `audio/` se trouvent sur le volume Railway. Activer les sauvegardes du volume dans Railway et tester une restauration avant l’ouverture au public.
