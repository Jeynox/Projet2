# Déploiement — strasbouq.daniellemosjose.fr

VPS : Docker rootless (utilisateur `hackyra`) + Caddy système pour le HTTPS. Le site écoute sur
`127.0.0.1:3300`, l'API et la base ne sont jamais exposées.

## Première installation

1. **Caddy** (une fois, en root) : ajouter `caddy/strasbouq.daniellemosjose.fr.caddy` à
   `/etc/caddy/Caddyfile` (après sauvegarde), puis
   `caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy`.
2. **Dossier** `~/strasbouq` sur le serveur avec `compose.yaml`, `compose.prod.yaml` et un `.env`
   (`chmod 600`) généré sur place — jamais copié depuis le poste :

   ```
   POSTGRES_PASSWORD=<openssl rand -hex 32>
   JWT_SECRET=<openssl rand -hex 32>
   INTERNAL_API_KEY=<openssl rand -hex 32>
   ADMIN_EMAIL=...
   ADMIN_PASSWORD=<openssl rand -base64 24>
   SEED_DEMO=catalogue
   ```

## Mise à jour

Sur le poste (images construites localement, le serveur n'a que 2 Go de RAM) :

```bash
docker compose -f compose.yaml -f compose.prod.yaml build
docker save strasbouq/api:prod strasbouq/web:prod | gzip | ssh hackyra "gunzip | docker load"
scp compose.yaml compose.prod.yaml hackyra:strasbouq/
ssh hackyra "cd strasbouq && docker compose -f compose.yaml -f compose.prod.yaml up -d --no-build"
```

Les migrations s'appliquent au démarrage de l'API ; base et photos sont dans des volumes Docker
(`strasbouq_db-data`, `strasbouq_uploads`) conservés d'une mise à jour à l'autre.
