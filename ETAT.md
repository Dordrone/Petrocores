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
1. `PROMPT_FABLE_CODE_12-11.md` : étapes 0 et 1 faites (voir ci-dessus). Reste : 2 Val Town (compteur, /api/verify, rapport),
   3 générateur de codes + écran « J'ai un code », 4 chiffrement des réponses, 5 achat web puis Play Store.
   Bloqué : le connecteur Val Town n'est pas autorisé dans Claude Code (Gonzalo doit l'autoriser), et réponses de Gonzalo attendues.
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
- Final : question, reponse, texte, recit, indices, image.
- Tout texte affiché ou lu : {fr, en, es}. Une étape = une question ; 2 questions au même lieu = 2 étapes, la seconde en "deverrouillage":"reponse".
  Étape sans question = récit + « Continuer ». Pas de chiffres écrits en numérique dans les textes LUS (la voix OmniVoice déraille).
