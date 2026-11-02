# État du projet (à mettre à jour à chaque fin de session)

## Fait
- 2026-10-21 : structure du dossier, CLAUDE.md ; premier jet du pilote dans le doc du plan.
- 2026-10-31 : repérage Saint-Geniès par Gonzalo (38 photos iPhone + GPS dans « Photos iCloud », Live Photos .MOV ignorés).
  Claude (chat) : photos optimisées → `scenario/saint-genies/photos/sg_XXXX.jpg` (1600 px, JPEG 80),
  GPS extraits → `scenario/saint-genies/_travail/gps_photos.json`, planche contact → `_travail/planche.jpg`,
  parcours proposé (8 étapes, GPS, énigmes) → `scenario/saint-genies/parcours-propose.md`.
- 2026-10-31 : Claude Code : moteur de jeu complet dans `app/` (les 9 points de la liste), testé sur ordinateur
  avec `app/demo-episode.json` (partie entière, reprise, hors-ligne). Publié le même jour ; PAS encore testé sur téléphone.

## Décision GitHub (31/10)
- PAS de deuxième compte GitHub (règle GitHub : 1 seul compte gratuit par personne).
- Gonzalo crée une ORGANISATION gratuite « Dordrone » depuis son compte xlloollx (contact : dordrone.2446@gmail.com).
- Dépôt de l'appli : `Dordrone/Petrocores` (UN seul dépôt pour tout le jeu ; chaque village = un episode.json).
  Test en ligne via GitHub Pages : https://dordrone.github.io/Petrocores/ — n'affecte pas ses 4 sites existants.
- Plus tard : domaine perso possible (ex. jeu.dordrone.fr, CNAME chez OVH).
- Vérifier le déploiement Pages après chaque push (échecs silencieux fréquents, cf. méthode Sentia).

## En attente de Gonzalo
- (fait) Voix choisie le 31/10 : voix IA « essai 3 » baissée de 3 demi-tons, SANS écho → `scenario/voix-reference/aymeric_reference.mp3`.
- Valider/corriger `parcours-propose.md` (ordre, énigmes) ; compter sur place les croix de Saint-André (étape 5) ;
  point de départ avec parking.
- Infos confirmées 31/10 : église toujours ouverte ; chapelle du Cheylard fermée, clé à récupérer au Proxi.
  → Demander au Proxi s'il accepte de jouer le jeu (prêt de la clé aux équipes, horaires, caution).
- Créer l'organisation GitHub « Dordrone » (2 min, Claude ne peut pas créer de compte).
- Vérifier le nom « Pétrocores » (INPI + domaine), accord mairie, assurance.

## Prochain pour Claude (chat)
- Après validation : écrire `scenario/saint-genies/episode.json` complet en FR/EN/ES (textes, voix, indices, réponses).
  Y mettre `"intro_video": "media/intro_saint_genies.mp4"` (ce fichier n'existe pas encore ; le champ n'est que dans `app/demo-episode.json`).

  Mise à jour Claude Code (31/10, sw v3) : mettre plutôt `"intro_video": "media/intro_saint_genies_v2_mobile.mp4"`,
  et ajouter `"narrateur": {"fr":"Frère Aymeric","en":"Brother Aymeric","es":"Fray Aymeric"}` (texte du grand bouton « ▶ Écouter … »).
  Ne mettre "rayon_m" que pour une étape qui s'écarte des 10 m par défaut.
- Recaler les sous-titres sur la vidéo v2 (14,4 s) : à livrer à côté de la vidéo sous le nom `intro_saint_genies_v2_mobile.{fr,en,es}.vtt`,
  puis Claude Code remet `SOUS_TITRES_INTRO = true` dans `app/app.js`.

## Prochain pour Claude Code
- FAIT le 02/11 (sw v5) : intro v4 branchée dans `app/demo-episode.json`, sous-titres réactivés (`SOUS_TITRES_INTRO = true`), .vtt inchangés. Vidéo hors ASSETS et non interceptée.
  Poussés : le .mp4 v4 et ses 3 .vtt. Non poussés : 1031.mp4, complete.mp4, intro_v3_master.mp4, et v2/v3 restent inutilisés sur le PC.
  Pour Claude chat : dans `scenario/saint-genies/episode.json`, écrire `"intro_video": "media/intro_saint_genies_v4.mp4"` (remplace les chemins v1/v2 indiqués plus haut et dans le format).
  RESTE : tester l'intro et les sous-titres sur iPhone et Android.
- ✅ INTRO OFFICIELLE = v4 (02/11 soir) : montage CapCut de Gonzalo (`scenario/intro/complete.mp4`, 50 Mo, HEVC — hors git) converti par Claude chat
  → `app/media/intro_saint_genies_v4.mp4` (720x960, 23,2 s, 1,6 Mo, H.264, voix + musique de Gonzalo) + sous-titres calés
  `intro_saint_genies_v4.{fr,en,es}.vtt` (voix de 10,4 s à 19,6 s). À utiliser dans les episode.json À LA PLACE de v2_mobile/v3,
  sous-titres réactivés, .mp4 hors ASSETS et non intercepté par le sw, bumper VERSION.
  ⚠ Musique : Gonzalo doit vérifier la licence du morceau (bibliothèque CapCut) avant publication commerciale / Google Play.
  Les anciennes intros (v1, v2, v3) ne sont plus utilisées : ne pas les précacher ; ne pas pousser 1031.mp4, complete.mp4, intro_v3_master.mp4.
- (ancien) INTRO v3 (02/11, faite par Claude chat) : `app/media/intro_saint_genies_v3.mp4` (720x960, 22,6 s, 1,7 Mo,
  voix Zion Aquila seule, pas de musique) + sous-titres calés `intro_saint_genies_v3.{fr,en,es}.vtt` → remplacer v2_mobile dans les episode.json,
  réactiver les sous-titres. Même règle : pas dans ASSETS, .mp4 non intercepté par le sw. Bumper VERSION.
  Master haute qualité (pour CapCut / réseaux) : `scenario/intro/intro_v3_master.mp4` (hors app). Montage : `scenario/intro/monter_intro_v3.py`.
- FAIT le 31/10 (sw v4) : nouvelle croix fournie par Gonzalo. Croix seule sur fond noir dans `app/icons/icon-*.png` et `apple-touch-icon.png` ; blason complet avec devise (`app/icons/blason.png`) sur l'écran d'accueil.
- FAIT le 31/10 (sw v3) : `CORRECTIONS_TERRAIN_31-10.md` points 1, 2 et 3 (voir « Corrections terrain » dans le mode d'emploi du moteur).
  Vérifié sur ordinateur avec positions simulées et en ligne ; RESTE à retester au village sur téléphone.
- Vidéo d'intro v2 (31/10, 19h40) : Gonzalo a monté sa propre version (1031.mp4, HEVC 2160x2880, 31 Mo, illisible sur Chrome Android).
  Claude chat l'a convertie : `app/media/intro_saint_genies_v2.mp4` (H.264 1080x1440, 3,1 Mo) et `..._v2_mobile.mp4` (720x960, 1,4 Mo, À UTILISER dans l'app).
  L'original reste dans app/media/1031.mp4 mais est EXCLU de git (.gitignore) — ne pas le pousser, ne pas le précacher. Si déjà poussé : git rm --cached app/media/1031.mp4. Sous-titres .vtt à recaler sur la v2 (minutage à vérifier).
  Toujours EN ATTENTE côté app (voir CORRECTIONS point 3).
- 🔴 PRIORITÉ (31/10 soir, test terrain) : appliquer `CORRECTIONS_TERRAIN_31-10.md` (GPS 10 m, son). Vidéo mise en attente.
- NOUVEAU (31/10, demandé par Gonzalo) — VIDÉO D'INTRO avant la 1re étape :
  fichier `scenario/intro/intro_saint_genies.mp4` (17,5 s, 1080x1440, ~5 Mo, voix d'Aymeric incluse) — photo réelle → brume →
  templier au loin → templier proche. Fabriquée par `scenario/intro/monter_intro.py`. (`intro_provisoire_photo.mp4` = ancienne, ne pas utiliser.)
  Dans l'app : plein écran après le choix de langue, bouton « Passer », son lancé par un toucher (règle iOS), sous-titres FR/EN/ES,
  fichier dans le précache (hors-ligne), chemin lu dans episode.json (champ "intro_video").
  Sous-titres PRÊTS et validés (texte exact de l'audio, minutage mesuré) : `scenario/intro/intro_saint_genies.{fr,en,es}.vtt`
  → balises <track> de la vidéo, langue = langue choisie ; à copier à côté de la vidéo et à mettre aussi dans le précache. `scenario/intro/_brouillons/` = à ignorer (et dans .gitignore).
  → FAIT par Claude Code le 31/10 (voir « Vidéo d'intro » dans le mode d'emploi du moteur) ; reste le test iPhone + Android.
- GitHub (31/10) : dépôt public `Dordrone/Petrocores` créé par Gonzalo, code envoyé (branche main).
  Dépôt public = tout y est lisible. `parcours-propose.md` reste hors du dépôt (.gitignore), copie locale seulement.
  À prévoir : `episode.json` contiendra les réponses → les cacher avant le vrai lancement.
- 2026-10-31 : Pages actif et vérifié : https://dordrone.github.io/Petrocores/ (démo jouable, hors-ligne prêt, fichiers privés bien absents).
  Reste : retours de Gonzalo sur le test téléphone (iPhone + Android : GPS réel, voix, installation).
- Système de licences Sentia (pour l'instant : liste de codes dans l'épisode).
Plus tard : emballage Android (PWABuilder/Bubblewrap) pour Google Play — clé de signature hors du dépôt.

## Moteur de jeu (`app/`) — mode d'emploi
- Démo : `app/index.html` (code DEMO). Vrai épisode : `app/index.html?episode=saint-genies`
  (lit `scenario/saint-genies/episode.json`, photos dans `scenario/saint-genies/photos/`).
- `?debug=1` : liste à l'écran les erreurs de l'épisode (traductions manquantes, etc.) et affiche toujours « je suis arrivé ».
- Tester en local : serveur à la racine du projet (`python -m http.server 8123`), puis `localhost:8123/app/`.
- À chaque publication : incrémenter VERSION dans `app/sw.js`.
- Vidéo d'intro (31/10, sw v2) : fichiers dans `app/media/`, copiés depuis `scenario/intro/` (`.mp4` + 3 `.vtt`, texte et minutage inchangés).
  Jouée après « Commencer », avant la 1re étape : « Touchez pour commencer », « Passer », sous-titres de la langue choisie.
  Le chrono démarre après la vidéo. « Revoir l'intro » : menu ☰ de la barre de jeu. Reprise d'une partie : pas de vidéo.
  Si la vidéo ne se charge pas, le jeu passe directement à la 1re étape.
  `scenario/intro/` n'est PAS envoyé sur GitHub (dépôt public) : seule la copie de `app/media/` est en ligne.
- Corrections terrain (31/10, sw v3) — remplacent ce qui précède quand ça diffère :
  GPS : rayon 10 m par défaut, déclenchement avec précision <= 15 m et 2 positions fiables consécutives dans le cercle
  (position lissée : moyenne des 3 dernières de moins de 10 s). Réglages regroupés en haut de `app/app.js`.
  Bouton « Je suis arrivé » : si proche (<= 25 m) ou distance inconnue, sans position précise depuis 20 s ; aussi GPS refusé ou 3 min de trajet.
  Conseil « position exacte » si la précision reste > 100 m pendant 15 s. `?debug=1` affiche précision, distance brute, lissée, confirmations.
  Son : après l'intro, écran « Test du son » ; le chrono part quand on le quitte. Grand bouton « ▶ Écouter … » sur l'énigme, qui clignote si la lecture n'a pas démarré en 1,5 s.
  Vidéo : `intro_saint_genies_v2_mobile.mp4` (720x960, 14,4 s), hors du service worker, donc réseau NÉCESSAIRE pour la voir (sans réseau : on passe directement au test du son).
  Sous-titres désactivés (`SOUS_TITRES_INTRO = false`). `1031.mp4` et `intro_saint_genies_v2.mp4` ne sont pas sur GitHub ; l'ancienne `intro_saint_genies.mp4` et ses .vtt y restent, inutilisés.

## Format de episode.json (schéma d'origine + ajouts, modèle complet : `app/demo-episode.json`)
{ "id":"saint-genies-0", "titre":{fr,en,es}, "intro":{fr,en,es}, "duree_min":75,
  "intro_video":"media/intro_saint_genies_v2_mobile.mp4",   // facultatif : chemin depuis `app/` ; les .fr/.en/.es.vtt à côté, même nom
  "narrateur":{fr,en,es},                // facultatif : nom sur le bouton « ▶ Écouter … » (rayon_m des étapes : 10 par défaut)
  "avertissement":{fr,en,es},            // facultatif : encadré d'accueil (circulation, respect, part de fiction)
  "codes_equipe":["hash"],               // facultatif : sans ce champ, pas de code demandé (hash djb2-xor du code en majuscules)
  "penalites":{"indice_s":120,"solution_s":300},  // facultatif : ce sont les valeurs par défaut
  "etapes":[ { "id":1, "nom":{fr,en,es}, "lat":44.99479, "lon":1.25107, "rayon_m":25, "photo":"sg_0093.jpg",
     "consigne_trajet":{fr,en,es},       // facultatif : texte pendant la marche vers le lieu
     "deverrouillage":"gps|reponse",     // "reponse" : s'ouvre dès la bonne réponse précédente, sans GPS
     "recit":{fr,en,es}, "question":{fr,en,es}, "type":"texte|code|choix|photo",
     "choix":[{"id":"a",fr,en,es}],      // type choix : "reponses" contient l'id du bon choix
     "photo_repere":"sg_0092.jpg",       // type photo : image à retrouver ; "reponses":[] = simple bouton « Trouvé ! »
     "reponses":["lion","leon"],         // liste à plat : mettre les réponses des 3 langues
     "indices":[{fr,en,es},{fr,en,es}], "apres":{fr,en,es}, "fragment":"5",
     "selection":"joueur|heure",         // avec "variantes"
     "variantes":[ { "id":"interieur", "label":{fr,en,es}, "heures":["09:00","19:00"], "jours":[1,2,3,4,5,6],
                     /* + tout champ d'étape à remplacer : lat, lon, recit, question, type, reponses, indices, apres… */ } ]
     } ],
  "final":{ "question":{fr,en,es}, "reponse":"1327", "texte":{fr,en,es}, "recit":{fr,en,es}, "indices":[…], "image":"x.jpg" } }
Notes pour Claude (chat) :
- Une étape = une seule question. Pour 2 questions au même lieu (ex. étape 2 : clocher puis vitrail), faire 2 étapes,
  la seconde avec "deverrouillage":"reponse". Une étape sans "question" affiche le récit et un bouton Continuer (briefing).
- "selection":"heure" prend la première variante dont les heures/jours collent ; la dernière sert de repli (ne pas lui mettre d'heures).
- 0 = dimanche dans "jours". Ajout moteur : après les 2 indices, bouton « Voir la réponse » (+5 min), pour qu'aucune équipe ne reste bloquée.
