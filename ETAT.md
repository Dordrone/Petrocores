# État du projet — à lire au début de chaque séance

> Ce fichier ne garde que l'ÉTAT ACTUEL et ce qui RESTE À FAIRE. L'historique complet (21/10 → 12/11) est dans
> `ETAT_ARCHIVE.md` : ne le lire qu'en cas de besoin. Rangé le 12/11 par Claude Code à la demande de Gonzalo.
> Règle de tenue : AJOUTER ses notes datées dans la bonne rubrique ; quand une tâche est finie, la remplacer par UNE ligne
> dans « Derniers faits » (le détail va à la fin de `ETAT_ARCHIVE.md`). Les fichiers `CONSIGNES_*.md` gardent le détail de chaque demande.
> Carte du code et des documents : `graphify-out/GRAPH_REPORT.md` (graphe du 12/11, textes + code).

## Où en est-on (12/11)
- En ligne : https://dordrone.github.io/Petrocores/app/ — **sw v17** (voix enregistrées d'Aymeric). Vrai jeu : `?episode=saint-genies` ;
  démo : `?episode=demo` (bouton « Démo (test) » sur l'accueil seulement avec `?debug=1`).
- ✅ 12/11 (Claude Code) : PC remis au niveau de GitHub (v17, toast debug « 🎙 » conservé). Les seules différences locales étaient :
  toast retiré + v18 (abandonnés), voix.md et CLAUDE.md (gardés). Branche de secours `sauvegarde-avant-pull-12-11`.
- ✅ 12/11 (Claude Code) — PUBLIÉ (sw v18, accord de Gonzalo) : échauffement p0 → p1 → p2 dans `fabriquer_episode.py`
  (20 étapes, depart = p0,p1,p2,e0a,e0b). 327 textes comparés à index.json : 0 différence. Plus de `bienvenue_lieu`, `bienvenue_video`
  ni `intro_video` dans l'épisode : la bienvenue est le champ `"video_apres"` de p2 (nouveau dans le moteur : vidéo jouée une fois
  en quittant l'étape réussie), la vidéo d'intro reste `"video"` sur e0a. Noms p0/p1/p2 écrits par Code (« Le panneau de bienvenue /
  L'eau de neige / Le train » + EN/ES) : à valider par Claude chat. xls régénéré (ligne « Échauffement – lavoir »).
  Testé en local (?debug=1) : parcours A et B, voix MP3 p0-p2 jouées, vidéo après 1899, puis e0a. À publier : app.js, episode.json,
  3 photos (sg_totem_00_bienvenue_plan, sg_totem_01_eau_1, sg_totem_02_train_1), 54 MP3 p0-p2 + index.json, sw v18.
  Non fait : les voix `*_consigne_trajet` existent mais l'écran de trajet ne les lit pas ; `CONSIGNES_SON_TELEPHONE_06-11.md`.
- Saint-Geniès (17 étapes) : épisode GÉNÉRÉ par `scenario/saint-genies/_travail/fabriquer_episode.py` (jamais episode.json à la main) ;
  onglet Énigmes du xls par `maj_xls.py`. Déroulé : accueil villages → écran d'équipe (parcours A/B/C) → panneau du lavoir
  (vidéo de bienvenue FR, sous-titres EN/ES) → e0a/e0b panneau de l'église (vidéo intro v4) → stations → finale code **1327** (fragments 1·3·2·7).
  Stations D, C, M, L, F ; parcours A = D,C,M,L,F · B = M,L,F,C,D · C = L,F,D,M,C. m2/m3 (église) : `"silence": true` (pas de voix).
- Voix : MP3 d'Aymeric faits GRATUITEMENT avec OmniVoice local (PC de Gonzalo) dans `app/media/voix/<langue>/<clé>.mp3` + `index.json` ;
  joués seulement si le texte de index.json = texte actuel de l'épisode, sinon voix du téléphone (choix de voix recopié de Sentia).
  Après toute modif de texte : régénérer la phrase avec OmniVoice + mettre à jour index.json.
- Fin de partie : sceau or / argent / bronze / bois selon les pénalités.
- `BOUTON_PANNEAU_TOUJOURS = true` dans app.js = PROVISOIRE (tests entre amis) → remettre `false` avant la version payante.

## Prochain pour Claude Code
1. `PROMPT_FABLE_CODE_12-11.md` : étapes 0 et 1 faites et en ligne (sw v18).
   Décisions de Gonzalo : GRATUIT jusqu'à l'église (p0 → e0b), code demandé avant la 1re station ; 2 téléphones par code par défaut ;
   13/11 : serveur sur CLOUDFLARE Workers + D1 (Val Town ferme), PAS de mail quotidien, onglet Statistiques.
   ✅ 13/11 (Claude Code) — étapes 2 et 3 côté serveur ÉCRITES ET TESTÉES EN LOCAL (`npx wrangler dev --local`), PAS EN LIGNE, PAS dans git :
   dossier `serveur/petrocores/` (voir son LISEZ-MOI.md) : `src/index.js` (/api/verify, /api/event, /api/codes, /api/toggle, /api/cle,
   /api/stats, /api/export.csv), `src/page.js` (admin : lots de codes « SG-7K4P-Q9 », filtres client/état, désactivation, CSV,
   planche A4 + QR `?episode=…&code=…`, clé par épisode ; onglet Statistiques : lancées/terminées/sans code, durée moyenne, par énigme
   arrivées/indices/réponses dévoilées/abandons, sceaux, langues, parcours, filtre période + client).
   Testé : 401 sans mot de passe, lot, 2 téléphones max (3e refusé), saisie sans tirets/minuscules, expiré, désactivé, autre épisode, CORS.
   Évènements attendus de l'app : {events:[{ev: lancement|etape|indice|solution|fin, partie (id anonyme), episode, etape, lang, parcours,
   duree (s), sceau, code, t}]}. L'essai de val « petrocores » sur Val Town n'a PAS abouti : rien n'y a été créé.
   ✅ 13/11 : DÉPLOYÉ sur Cloudflare (compte de Gonzalo) : https://petrocores.petrocores.workers.dev — base D1 « petrocores »
   (id 8a418164-200c-43bc-9fdb-16068d761935, région WEUR). Vérifié en ligne : page admin servie, /api/verify répond, CORS OK,
   admin refusé (401) tant que le secret ADMIN_PASS n'est pas posé par Gonzalo (tableau de bord Cloudflare). Base vide (aucun code).
   Redéployer : `npx wrangler deploy` depuis `serveur/petrocores/` (wrangler est connecté sur le PC de Gonzalo).
   ✅ 13/11 : Gonzalo a posé ADMIN_PASS (page admin utilisable par lui).
   ✅ 13/11 (Claude Code) — PUBLIÉ (sw v19, accord de Gonzalo) — étapes 3 (app) et 4 :
   · Chiffrement : `outils/chiffrer_episode.mjs` (AES-GCM 256). `fabriquer_episode.py` écrit maintenant l'épisode EN CLAIR dans
     `_travail/episode_clair.json` (hors dépôt) puis produit `episode.json` PUBLIÉ : étapes de `"gratuit"` (p0,p1,p2,e0a,e0b) en clair,
     les 15 autres + le final remplacés par {id, verrou:true} et rangés dans `"chiffre": {iv, donnees}`.
     Clé : `_travail/cle_saint-genies.txt` (hors dépôt), ENREGISTRÉE dans la base du serveur (table petro_cles) le 13/11.
     Si la clé change un jour : la réenregistrer (page admin ou wrangler d1) sinon les codes ne déchiffrent plus.
     `maj_xls.py` lit l'épisode en clair. Pour lister les photos à pousser : lire l'épisode EN CLAIR (le publié cache les étapes payantes).
   · App : écran « J'ai un code » (bouton sur l'écran d'équipe + arrêt automatique à la 1re étape payante, phase "code"), lien/QR
     `?code=…` vérifié au chargement, clé gardée en local (`petrocores_acces_<episode>`) → rejouable hors-ligne ; messages trilingues
     (inconnu, désactivé, expiré, autre village, trop de téléphones, pas de réseau).
     Statistiques anonymes (lancement, etape, indice, solution, fin) dans une file locale `petrocores_file`, envoyées à /api/event ;
     pas d'envoi pour la démo ni en ?debug=1. Test local : `?serveur=http://localhost:8787` (localhost seulement).
   · Serveur : statistiques par client calculées par PARTIE (le code est souvent saisi après le lancement) — redéployé le 13/11.
   Testé en local de bout en bout : partie gratuite → mur du code → faux code refusé → bon code → fin 1327 → stats et sceau sur le serveur ;
   2e téléphone refusé ; réouverture sans serveur OK ; démo intacte.
   ⚠ LIMITES de la protection : (1) l'historique git public garde les anciennes versions de episode.json EN CLAIR ; (2) `app/media/voix/index.json`
   et les MP3 publics contiennent les textes (dont les « après » qui donnent les réponses). Pour Claude chat : idée = mettre un condensé (hash)
   du texte dans index.json au lieu du texte. (3) BOUTON_PANNEAU_TOUJOURS et « Aller à une étape (test) » toujours actifs (tests entre amis).
   Depuis la v19 le jeu en ligne est PAYANT après l'église : les testeurs ont besoin d'un code (Gonzalo les crée sur la page admin).
   Reste : étape 5 achat web puis Play Store ; retirer les aides de test avant la vente.
   ⚠ Sentia est aussi sur Val Town (val sentia/sentiaStats) : à migrer avant le 10/12/2026, dans une séance séparée (dossier claude Sentia).
2. `CONSIGNES_SON_TELEPHONE_06-11.md` (voix muette = mode silencieux probable ; message d'aide + bouton Tester la voix) : vérifier si c'est fait.
3. Avant le vrai lancement : cacher les réponses (le dépôt est public) ; remettre BOUTON_PANNEAU_TOUJOURS à false.

## Prochain pour Claude (chat)
- Texte final du coffre / lieu du trésor (dès que Gonzalo l'a choisi) + sa voix OmniVoice.
- Voix des étapes d'échauffement p0/p1/p2 après leur intégration.

## En attente de Gonzalo
- Lieu du trésor final et texte du coffre ; vérifs sur place (indice m1, GPS du chevet).
- Chapelle du Cheylard : accord de la mairie (visite payante) ; Proxi d'accord pour prêter la clé ?
- Licence de la musique de l'intro v4 (bibliothèque CapCut) avant toute vente / Google Play.
- Nom « Pétrocores » (INPI + domaine), accord mairie, assurance.
- Tests sur téléphone (iPhone + Android) : GPS réel, voix MP3 et voix du téléphone, vidéos et sous-titres.

## Derniers faits (une ligne chacun ; détail dans ETAT_ARCHIVE.md)
- 08/11 Claude chat : voix MP3 d'Aymeric branchées et en ligne (sw v17).
- 07/11 Claude chat : sw v13 → v16 (bouton panneau, étapes silencieuses, réponses tolérantes aux fautes, sceaux de fin) — voir `CONSIGNES_FAIT_PAR_CLAUDE_07-11.md`.
- 05/11 Claude Code : station château dehors, voix du téléphone = Sentia, seules les photos citées sur GitHub, bienvenue EN/ES mises de côté.
- 04/11 Claude Code : bienvenue au lavoir, vidéo par étape, parcours A/B/C, carnet, finale verrouillée.

## Règles techniques (moteur `app/`)
- Tester en local : `python -m http.server 8123` à la racine du projet, puis `localhost:8123/app/`.
  `?debug=1` : diagnostics de l'épisode, positions simulées (`window.PETRO`), nom de la voix choisie, bouton « Je suis arrivé » toujours visible.
- Chaque publication : VERSION de `app/sw.js` +1, puis vérifier EN LIGNE (GitHub Pages échoue parfois sans prévenir).
- Vidéos et MP3 : hors ASSETS et non interceptés par le service worker (réseau nécessaire pour eux).
- Chemins dans l'épisode (`photos_dossier`, vidéos) : lus depuis `app/`.
- GPS : rayon 10 m par défaut, précision ≤ 15 m, 2 positions de suite ; panneau de bienvenue 5 m avec précision ≤ 8 m.
- Ne jamais pousser : 1031.mp4, complete.mp4, intro_v3_master.mp4, bienvenue EN/ES (.gitignore), photos non citées par un épisode, clé Android.
- Vidéo par langue : `{lang}` dans le chemin ; langue absente → version fr + `x.fr.<langue>.vtt`, sinon sous-titres fr.

## Format de episode.json (à jour au 12/11 ; modèle simple : `app/demo-episode.json`)
- Épisode : id, titre, intro, duree_min, narrateur, avertissement, codes_equipe, penalites, photos_dossier,
  bienvenue_video (`{lang}`), bienvenue_lieu {lat, lon, rayon_m, precision_m, nom, consigne_trajet, photo}, intro_video (= vidéo de la 1re étape de depart),
  depart [ids], stations {lettre: [ids]}, parcours {lettre: [stations]}, etapes [ … ], final.
- Étape : id (unique), nom, lat, lon, rayon_m, photo, consigne_trajet, deverrouillage gps|reponse, recit, question,
  type texte|code|choix|photo, choix, photo_repere, reponses (toutes langues à plat), indices [2], apres,
  fragment + position (1..4), video (à l'arrivée), video_apres (en quittant l'étape réussie), silence, selection + variantes.
- Épisode payant : "gratuit": [ids en clair] dans l'épisode en clair ; le fichier publié a en plus "chiffre" et des étapes {id, verrou:true}.
- Final : question, reponse, texte, recit, indices, image.
- Tout texte affiché ou lu : {fr, en, es}. Une étape = une question ; 2 questions au même lieu = 2 étapes, la seconde en "deverrouillage":"reponse".
  Étape sans question = récit + « Continuer ». Pas de chiffres écrits en numérique dans les textes LUS (la voix OmniVoice déraille).
