# Stras'bouq 🌸

Site du fleuriste **Stras'bouq** (Strasbourg) : catalogue, configurateur de bouquet sur mesure,
formulaire de contact et back office (produits, stock, commandes, messages).

Réécriture complète de l'ancien projet PHP/Twig (le code d'origine reste dans l'historique git) :
même identité visuelle — bleu nuit `#132028`, gris `#D9D9D9`, titres manuscrits _Imperial Script_ —
modernisée, animée, accessible et sécurisée.

## Stack

| Partie | Techno |
| --- | --- |
| Front + back office | SvelteKit 3 / Svelte 5 (runes), SCSS, adapter-node |
| API | Node 24, Express 5, Apollo Server (GraphQL), TypeORM |
| Base | PostgreSQL 18 |
| Images | ré-encodées en WebP par `sharp` (métadonnées supprimées) |
| Conteneurs | Docker Compose (3 services durcis) |

```
apps/
  api/   API GraphQL (entités, migrations, seed, uploads)
  web/   site public + back office /admin
compose.yaml       stack complète
compose.dev.yaml   PostgreSQL seul pour le dev
```

## Lancer en local avec Docker

1. Copier le modèle d'environnement et remplir chaque valeur :

   ```bash
   cp .env.example .env
   ```

   Secrets : `openssl rand -hex 32` (ou `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
   `ADMIN_EMAIL` / `ADMIN_PASSWORD` (12 caractères min.) créent le compte du back office au premier démarrage.

2. Démarrer :

   ```bash
   docker compose up -d --build
   ```

3. Ouvrir <http://localhost:3000> — back office sur <http://localhost:3000/admin>.

Avec `SEED_DEMO=true`, la base est remplie automatiquement au premier démarrage : 9 produits avec
photos, une commande et un message de démonstration. Les migrations s'appliquent toutes seules.

Repartir de zéro (efface base et images) : `docker compose down -v`.

## Développement sans Docker pour le code

```bash
npm run install:all
npm run db:up              # PostgreSQL seul (compose.dev.yaml)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run dev:api            # http://localhost:4000/graphql
npm run dev:web            # http://localhost:5173
```

Qualité : `npm run check` (typage), `npm test`, et `npm run lint --prefix apps/web`.

## Fonctionnalités

**Site public** — accueil (promotions & nouveautés, présentation de Vincent & Yavuz), catalogue
filtrable (fleurs, bouquets, vases, coffrets, feuillages), fiches produit, configurateur de bouquet en
5 étapes avec récapitulatif en direct, contact avec horaires, mentions légales, sitemap.

**Back office** — tableau de bord (compteurs, bouquets à préparer, messages non lus, stocks faibles),
CRUD produits avec upload d'image, réassort rapide du stock, suivi des commandes par statut,
messagerie (lu / non lu, répondre, supprimer).

**Animations** — apparition au défilement en CSS pur (`animation-timeline: view()`), transitions de
page (View Transitions API), micro-interactions. Toutes désactivées si l'utilisateur demande moins
d'animations (`prefers-reduced-motion`).

**Accessibilité** — HTML sémantique, lien d'évitement, navigation clavier complète, focus visibles,
vrais boutons radio dans le configurateur, libellés sur tous les champs, contrastes AA.

## Sécurité

- **Aucun secret dans le dépôt** : tout passe par `.env` (ignoré par git et par Docker). L'API refuse
  de démarrer en production avec un secret manquant ou trop court.
- **Réseau** : seul le site est publié, sur `127.0.0.1`. L'API n'est joignable que par le front
  (clé interne partagée), la base uniquement par l'API (réseau Docker `internal`).
- **Conteneurs** : système de fichiers en lecture seule, utilisateur non-root, `cap_drop: ALL`,
  `no-new-privileges`.
- **Auth admin** : mots de passe bcrypt, JWT signé dans un cookie `httpOnly` / `SameSite=Strict`
  (`__Host-` en HTTPS), limitation des tentatives par IP et par compte, temps de réponse constant.
- **Formulaires publics** : validation stricte côté API (listes blanches, longueurs bornées),
  limitation des envois par IP, champ piège anti-robots, protection CSRF de SvelteKit.
- **En-têtes** : CSP stricte avec nonce (aucun script tiers, polices auto-hébergées), HSTS,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`…
- **Uploads** : format vérifié par signature binaire, ré-encodage WebP, noms aléatoires, taille et
  dimensions bornées, servis avec une CSP `sandbox`.
- **GraphQL** : introspection coupée en production, profondeur / taille / alias des requêtes limités,
  aucune erreur interne exposée.
- **CI** : `npm audit`, typage, lint, tests et build des images à chaque push.

## Production

En ligne sur <https://strasbouq.daniellemosjose.fr> (VPS, Caddy + Docker rootless) : procédure dans
[deploy/README.md](deploy/README.md), surcouche `compose.prod.yaml`.

Reste à faire : compléter les mentions légales (raison sociale, SIRET, hébergeur).
