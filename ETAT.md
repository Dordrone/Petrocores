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

## Prochain pour Claude Code
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

## Format de episode.json (schéma d'origine + ajouts, modèle complet : `app/demo-episode.json`)
{ "id":"saint-genies-0", "titre":{fr,en,es}, "intro":{fr,en,es}, "duree_min":75,
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
