# État du projet (à mettre à jour à chaque fin de session)

## Fait
- 2026-10-21 : structure du dossier, CLAUDE.md ; premier jet du pilote dans le doc du plan.
- 2026-10-31 : repérage Saint-Geniès par Gonzalo (38 photos iPhone + GPS dans « Photos iCloud », Live Photos .MOV ignorés).
  Claude (chat) : photos optimisées → `scenario/saint-genies/photos/sg_XXXX.jpg` (1600 px, JPEG 80),
  GPS extraits → `scenario/saint-genies/_travail/gps_photos.json`, planche contact → `_travail/planche.jpg`,
  parcours proposé (8 étapes, GPS, énigmes) → `scenario/saint-genies/parcours-propose.md`.
- 2026-10-31 : Claude Code : moteur de jeu complet dans `app/` (les 9 points de la liste), testé sur ordinateur
  avec `app/demo-episode.json` (partie entière, reprise, hors-ligne). PAS encore publié ni testé sur téléphone.

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

## Prochain pour Claude Code
- GitHub (31/10) : organisation Dordrone créée ; dépôt git local prêt (branche main), lien vers GitHub PAS encore configuré.
  BLOQUÉ : la création du dépôt et l'ajout du lien (`git remote add`) ont été refusés par le contrôle de sécurité de Claude Code.
  Gonzalo doit créer le dépôt vide et autoriser ces actions.
  Ensuite : `git remote add origin https://github.com/Dordrone/Petrocores.git`, `git push -u origin main`, activer Pages (main, racine), vérifier en ligne.
  Attention : Pages gratuit = dépôt public, donc réponses et `parcours-propose.md` lisibles par tous.
- Publier (GitHub Pages) pour le test sur téléphone (le GPS exige une adresse https).
- Système de licences Sentia (pour l'instant : liste de codes dans l'épisode).
Plus tard : emballage Android (PWABuilder/Bubblewrap) pour Google Play — clé de signature hors du dépôt.

## Moteur de jeu (`app/`) — mode d'emploi
- Démo : `app/index.html` (code DEMO). Vrai épisode : `app/index.html?episode=saint-genies`
  (lit `scenario/saint-genies/episode.json`, photos dans `scenario/saint-genies/photos/`).
- `?debug=1` : liste à l'écran les erreurs de l'épisode (traductions manquantes, etc.) et affiche toujours « je suis arrivé ».
- Tester en local : serveur à la racine du projet (`python -m http.server 8123`), puis `localhost:8123/app/`.
- À chaque publication : incrémenter VERSION dans `app/sw.js`.

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
