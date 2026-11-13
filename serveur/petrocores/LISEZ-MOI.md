# Serveur Pétrocores (Cloudflare Workers + base D1)

Un seul Worker `petrocores` :
- `POST /api/verify` : vérifie un code client (appelé par l'app) → épisode débloqué + clé de déchiffrement.
- `POST /api/event` : compteur anonyme (lancement, étape, indice, solution, fin).
- `/` : page d'administration (onglets « Codes clients » et « Statistiques »), protégée par le secret `ADMIN_PASS`.
- Tables créées toutes seules au premier appel : `petro_codes`, `petro_activations`, `petro_events`, `petro_cles`.

Fichiers : `src/index.js` (API), `src/page.js` (page d'administration), `wrangler.toml` (réglages).

## Tester sur le PC (aucun compte nécessaire)
Depuis ce dossier :

    npx wrangler dev --local --port 8787

Puis ouvrir http://localhost:8787 — mot de passe de test : celui du fichier `.dev.vars` (non publié).
La base de test est dans `.wrangler/` (non publiée) ; la supprimer remet tout à zéro.

## En ligne depuis le 13/11/2026
Adresse : https://petrocores.petrocores.workers.dev (page d'administration = cette adresse).

## Mettre en ligne (déjà fait le 13/11, pour mémoire)
1. Gonzalo crée un compte gratuit sur https://dash.cloudflare.com/sign-up et confirme son email.
2. `npx wrangler login` → le navigateur s'ouvre, cliquer « Allow ».
3. `npx wrangler d1 create petrocores` → copier le `database_id` affiché dans `wrangler.toml`.
4. `npx wrangler deploy` → note l'adresse `https://petrocores.<compte>.workers.dev`.
5. `npx wrangler secret put ADMIN_PASS` → Gonzalo tape SON mot de passe d'administration (jamais communiqué à Claude).

Ensuite, chaque modification : `npx wrangler deploy`.

## Réponses de /api/verify
`{ok:true, code, episode, cle, expire}` ou `{ok:false, raison}` avec `raison` = `inconnu`, `desactive`, `expire`, `episode`, `appareils`.
