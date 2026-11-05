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

## Saint-Geniès — base de travail (02/11)
- Textes COMPLETS des panneaux « Balade patrimoine » : `scenario/saint-genies/panneaux.md` (seule source de faits pour les énigmes).
- Photos renommées par Gonzalo → copies web `scenario/saint-genies/photos/sg_<nom>.jpg` (ex. sg_l_eglise_init.jpg) ; correspondance anciens numéros/GPS :
  `scenario/saint-genies/_travail/correspondance_photos.json`. Les anciens sg_00XX.jpg restent (utilisés par la démo).
- Départ : PARKING DU LAVOIR, GPS 44.994108, 1.253759 (point donné par Gonzalo le 03/11, centre du parking ; ancien point photo « Le Lavoir (1) » : 44.993917, 1.254025) ; grand parking ~300 m² autour du point → rayon_m 25 pour ce point (exception à la règle des 10 m) = point d'ARRIVÉE/accueil seulement (intro vidéo, consignes, trajet guidé).
  DÉBUT DU JEU = panneau de l'église, GPS 44.994094, 1.250122, rayon 10 m — POINT DE DÉPART COMMUN À TOUTES LES ÉQUIPES
  (décision Gonzalo 03/11) : la vidéo d'intro (identique pour tous) se joue ICI ; ensuite chaque équipe part vers un point différent
  (rotation de la boucle). Les énigmes de l'église deviennent une station de la boucle (pour éviter que tout le monde reste à l'église).
  Chaque piste aura AUSSI sa propre vidéo (Frère Aymeric) → champ "video" par étape dans episode.json (même règles que l'intro). Étape 1 = l'église → `scenario/saint-genies/etape1_eglise.md`.
- Blason Salignac réel = cour du château (souvent fermée) → jamais comme lieu à trouver. Modillons : pas de comptage, photo-repère.
- À FAIRE plus tard : allonger les parcours pour ~45 min de jeu.
- PISTE 0 au panneau de l'église (Gonzalo 03/11, soir) : vidéo intro + 1re énigme SUR LE PANNEAU (clocher 15e, clapet Salignac) pour tous,
  puis l'app donne à chaque équipe sa prochaine destination. Les énigmes intérieur/chevet vont dans la station M. Détail : scenario/saint-genies/etape1_eglise.md (v3).
- STATIONS (Gonzalo 03/11) : P parking (arrivée) → E église (départ commun + intro) → D abbé Delprat (totem salle des fêtes 44.993722,1.250558)
  → M modillons (chevet, GPS approx 44.99412,1.25048 à relever) → F école de filles (totem « Les écoles » 44.994792,1.251058) → T trésor (lieu à choisir).
  Parcours (onglet « Parcours » de Petrocores_Saint-Genies_Etape1.xlsx) : A = E-D-M-F-T ; B = E-M-F-D-T ; C = E-F-D-M-T. Une vidéo Aymeric par station.
- IDÉE GONZALO (03/11) — plusieurs groupes le même jour : chaque équipe fait les étapes dans un ORDRE DIFFÉRENT (rotations d'une boucle),
  pour ne pas se marcher dessus ; tous finissent au même point final où se trouve un trésor physique (cartes trésor) caché par Gonzalo,
  ouvert seulement si toutes les pistes sont résolues. Spéc moteur à venir (Claude chat) : "parcours" = liste d'ordres possibles,
  ordre attribué par équipe (code d'équipe ou n° de départ), étape finale commune et verrouillée tant que tous les fragments ne sont pas trouvés.

## En attente de Gonzalo
- (fait) Voix choisie le 31/10 : voix IA « essai 3 » baissée de 3 demi-tons, SANS écho → `scenario/voix-reference/aymeric_reference.mp3`.
- Valider/corriger `parcours-propose.md` (ordre, énigmes) ; compter sur place les croix de Saint-André (étape 5) ;
  point de départ avec parking.
- Infos confirmées 31/10 : église toujours ouverte ; chapelle du Cheylard fermée, clé à récupérer au Proxi.
  → Demander au Proxi s'il accepte de jouer le jeu (prêt de la clé aux équipes, horaires, caution).
- Créer l'organisation GitHub « Dordrone » (2 min, Claude ne peut pas créer de compte).
- Vérifier le nom « Pétrocores » (INPI + domaine), accord mairie, assurance.

## Prochain pour Claude (chat)
- ✅ FAIT (04/11, nuit) : `scenario/saint-genies/episode.json` écrit au NOUVEAU format (voir CONSIGNES_VIDEOS_PARCOURS_04-11.md) :
  bienvenue_video {lang} + bienvenue_lieu (lavoir, 5 m), depart = e0a/e0b (panneau église, vidéo intro v4 sur e0a),
  stations D (d1-d3), M (m1-m3), F (f1-f3), parcours A/B/C, fragments 1(pos1) 3(pos2) 2(pos3) 7(pos4) → final 1327.
  Trilingue complet, 11 étapes, toutes les photos présentes. Généré par `scenario/saint-genies/_travail/fabriquer_episode.py`
  (modifier ce script puis le relancer plutôt que d'éditer le JSON à la main).
  ⚠ Le moteur actuel ne connaît pas encore depart/stations/parcours/position/bienvenue_* → Claude Code doit appliquer les consignes du 04/11.
  À vérifier sur place par Gonzalo : indice m1 « pan à droite, près du cyprès » ; GPS du chevet (m1) ; texte final du coffre (lieu du trésor).
- Après validation : écrire `scenario/saint-genies/episode.json` complet en FR/EN/ES (textes, voix, indices, réponses).
  Y mettre `"intro_video": "media/intro_saint_genies.mp4"` (ce fichier n'existe pas encore ; le champ n'est que dans `app/demo-episode.json`).

  Mise à jour Claude Code (31/10, sw v3) : mettre plutôt `"intro_video": "media/intro_saint_genies_v2_mobile.mp4"`,
  et ajouter `"narrateur": {"fr":"Frère Aymeric","en":"Brother Aymeric","es":"Fray Aymeric"}` (texte du grand bouton « ▶ Écouter … »).
  Ne mettre "rayon_m" que pour une étape qui s'écarte des 10 m par défaut.
- Recaler les sous-titres sur la vidéo v2 (14,4 s) : à livrer à côté de la vidéo sous le nom `intro_saint_genies_v2_mobile.{fr,en,es}.vtt`,
  puis Claude Code remet `SOUS_TITRES_INTRO = true` dans `app/app.js`.

## Prochain pour Claude Code
- FAIT le 05/11 (sw v11) : `CONSIGNES_CHATEAU_05-11.md`.
  1) Station sans fragment : le moteur l'accepte sans modification (une case du carnet par étape AVEC fragment seulement).
     Testé en local : Saint-Geniès joué en entier pour A, B et C (14 étapes, station C c1-c2-c3 jouée à sa place), finale « 4/4 » = 1 3 2 7,
     code 1327 accepté, aucun diagnostic, « ✓ Prêt à jouer sans réseau ».
  2) Démo : l'étape « Le château (démo) » avec choix intérieur/cour est remplacée par « Le panneau du château (démo) », dehors,
     photo sg_totem_chateau_1.jpg (plus de variantes dans la démo).
  3) Poussés : episode.json (14 étapes) + photos utilisées = 15 (ajout sg_totem_chateau_1, sg_totem_chateau_1_hd, sg_chateau_et_tour ;
     retrait de sg_0078 et sg_0092 que plus rien n'utilise, gardées sur le PC).
- 🔴 NOUVEAU (05/11 16h) : `CONSIGNES_CHATEAU_05-11.md` — jamais dans la cour du château ; station C (panneau + disque des blasons, dehors) ajoutée à episode.json ; nettoyer la démo.
- ✅ 05/11 : voix Sentia appliquée, OK en ligne (en local sur PC Windows = voix Microsoft, normal).
- FAIT le 05/11 (sw v10) : `CONSIGNES_VOIX_SENTIA_05-11.md`. choisirVoix() = pickVoice() de Sentia à l'identique (en-US, bonus « siri »),
  chaque phrase lue avec lang = fr-FR / en-US / es-ES, vitesse 0.96, hauteur 1, voix recalculée à chaque phrase. Mêmes réglages pour
  « ▶ Écouter », les indices, l'après-étape et la fin. Texte absent dans la langue choisie → rien n'est lu (plus de repli sur le français) ;
  l'écran garde l'affichage en français. En ?debug=1 : ligne « Voix : <nom> <langue> » sur l'écran d'équipe et sur chaque énigme, et message
  « Rien à lire en EN… » si le texte manque. Testé sur PC (n'a que des voix françaises → « Voix : aucune pour en-US » : le navigateur prend
  alors sa voix par défaut, c'est le seul cas où l'accent peut revenir ; sur téléphone, installer la voix anglaise/espagnole dans les réglages).
- 🔴 NOUVEAU (05/11) : `CONSIGNES_VOIX_SENTIA_05-11.md` — voix du téléphone recopiée À L'IDENTIQUE de Sentia (en-US, rate 0.96, pitch 1, bonus siri), plus de préférence voix d'homme ; jamais de texte d'une autre langue.
- ℹ️ (05/11) FFmpeg est installé sur le PC de Gonzalo (build gyan.dev dans %LOCALAPPDATA%\ffmpeg, ajouté au PATH utilisateur ; winget absent). Rouvrir le terminal pour l'utiliser.
- FAIT le 05/11 (sw v9), demande de Gonzalo :
  1) Seules les photos UTILISÉES sont sur GitHub (14 : 10 de Saint-Geniès + 4 de la démo). Les 93 autres retirées du dépôt
     (git rm --cached : toujours sur le PC, mais encore dans l'historique git). Règle : ne pousser une photo que si un episode.json la cite.
  2) Vidéos de bienvenue EN et ES MISES DE CÔTÉ (lèvres pas synchronisées) : retirées du dépôt (et ajoutées au .gitignore), gardées sur le PC.
     Tout le monde voit la vidéo FR ; en anglais/espagnol, sous-titres `bienvenue_saint_genies.fr.en.vtt` / `.fr.es.vtt`
     (texte des anciens .en/.es.vtt, minutage de la voix française). Pas de changement de code ni d'episode.json : c'est le secours prévu
     (vidéo de la langue absente → version fr + sous-titres de la langue). Intro à l'église : déjà la vidéo FR avec sous-titres EN/ES.
     Contrôle ffmpeg (05/11) : voix de bienvenue FR à 5,2–8,3 / 9,3–11,9 / 12,8–17,0 / 17,8–19,4 s = les 4 sous-titres (écart ≤ 0,3 s) ;
     intro v4 : voix au-dessus de la musique vers 10,4 / 13,6 / 18,0 s = début des 3 sous-titres. Rien à recaler.
- FAIT le 05/11 (sw v8) : `scenario/saint-genies/episode.json` + les 107 photos de `scenario/saint-genies/photos/` poussés.
  Vérifié avec ?debug=1 (positions simulées) : aucun diagnostic, « ✓ Prêt à jouer sans réseau » ; parcours A = e0a e0b D M F,
  B = e0a e0b M F D, C = e0a e0b F D M ; bienvenue au panneau du lavoir → 1re étape e0a « Le grand panneau de l'église »
  avec la photo sg_totem_l_eglise_1.jpg, puis vidéo intro v4 à l'arrivée, puis l'énigme.
  Bug moteur corrigé : "photos_dossier" était lu depuis le dossier de l'épisode → photos introuvables pour Saint-Geniès.
  Il se lit maintenant depuis `app/` (comme les vidéos) ; sans ce champ, `photos/` à côté de l'épisode. episode.json n'a pas été modifié.
  Rappel : dépôt public → les réponses de episode.json sont lisibles en ligne (à cacher avant le vrai lancement).
- 🔴 URGENT (05/11, test terrain) : Gonzalo a joué la DÉMO (1re étape au totem des écoles) car le vrai jeu n'est PAS en ligne.
  Pousser `scenario/saint-genies/episode.json` (mis à jour le 05/11 : photos = totems, cf. scenario/saint-genies/photos_catalogue.md)
  + TOUTES les photos de `scenario/saint-genies/photos/`. Vérifier : bienvenue au panneau du lavoir (reste là, validé par Gonzalo)
  → 1re étape = panneau de l'église (44.994094,1.250122) avec photo sg_totem_l_eglise_1.jpg ET vidéo intro v4, pour A, B et C.
- 🔴 NOUVEAU (04/11) : `CONSIGNES_VOIX_04-11.md` (voix d'HOMME native par langue : MP3 pré-enregistrés + secours synthèse masculine de la bonne langue).
- FAIT le 04/11 (sw v7) : `CONSIGNES_VIDEOS_PARCOURS_04-11.md` points 1 à 4, testé sur ordinateur avec positions simulées (`app/demo-episode.json` les utilise tous).
  Déroulé : écran d'équipe (nom, code, choix « Parcours A/B/C » obligatoire si l'épisode a "parcours") → « Commencer » →
  trajet guidé « Bienvenue » vers "bienvenue_lieu" (déclenche à <= 5 m, précision <= 8 m, 2 positions ; secours « Je suis devant le panneau »
  après 15 s à moins de 15 m) → vidéo de bienvenue dans la langue choisie → le chrono part → 1re étape de "depart" (panneau de l'église) :
  à l'arrivée GPS, "intro_video" puis l'énigme → stations dans l'ordre du parcours → finale.
  Sans "bienvenue_lieu" mais avec "bienvenue_video" : la vidéo se joue juste après « Commencer ».
  Vidéo par langue : `{lang}` dans le chemin ; si la langue manque → version fr, avec `x.fr.<langue>.vtt` si présent, sinon sous-titres fr.
  Vidéos FR/EN/ES de bienvenue + .vtt poussées. Chaque vidéo n'est jouée qu'une fois ; menu ☰ : « 📜 Carnet » + « Revoir … » pour chaque vidéo vue.
  Après une étape, « Prochaine destination : <nom> » quand l'étape suivante est un nouveau lieu GPS.
  Carnet / finale : une case par fragment du parcours, rangée par "position" (« ? » si pas trouvé) ; finale bloquée avec « Il vous manque N fragments ».
  Barre : lettre du parcours (« B · Étape 2/3 »). ?debug=1 : vérifie depart/stations/parcours, positions en double, et affiche la précision exigée.
  Anciennes sauvegardes : ordre linéaire. Non vérifié : téléphone réel, et le secours « devant le panneau » sans ?debug=1 (en debug le bouton est toujours là).
  Pour Claude chat — nouveaux champs episode.json (voir aussi le format plus bas) :
    "bienvenue_video":"media/bienvenue_saint_genies.{lang}.mp4", "bienvenue_lieu":{"lat","lon","rayon_m":5, "precision_m":8 (facultatif),
    "nom":{fr,en,es}, "consigne_trajet":{fr,en,es}, "photo":"x.jpg" (facultatifs : sinon « Bienvenue ! Suivez-moi jusqu'au point rouge. »)},
    "depart":[ids], "stations":{"D":[ids]}, "parcours":{"A":["D","M","F"]}, et sur les étapes "video":"media/x.mp4", "position":1..4 (avec "fragment").
    Les "id" d'étape doivent être uniques (comparés en texte). "intro_video" = vidéo de la 1re étape de "depart".
- 🔴 NOUVEAU (04/11) : appliquer `CONSIGNES_VIDEOS_PARCOURS_04-11.md` (bienvenue vidéo au parking par langue, intro au panneau de l'église,
  champ "video" par étape, parcours A/B/C, fragments + finale verrouillée). Bienvenue jouée au PANNEAU DU LAVOIR (44.993917,1.254025, rayon 5 m), pas au parking. Vidéo bienvenue FR prête : app/media/bienvenue_saint_genies.fr.mp4 (+ .fr.vtt) —
  version locale SANS synchro labiale exacte (choix de Gonzalo, pour économiser les crédits Runway).
- FAIT le 03/11 (sw v6) : `CONSIGNES_ACCUEIL_03-11.md` points 1 et 2.
  Accueil = `app/index.html` sans paramètre : blason, langue, un bouton par village de `app/villages.json` (« bientot » = grisé + « Bientôt »).
  Fiche village : distance en direct au point "arrivee" (affichée de loin même si le GPS est imprécis, « ≈ » sous 1 km si précision > 15 m),
  « Activez la localisation… » si GPS refusé, message « Vous êtes arrivés » à moins de rayon_m (25 m par défaut) après 2 positions précises,
  « 🧭 Itinéraire » → Google Maps / Plans / Waze (Plans en premier sur iPhone), durée, puis « Commencer » → `index.html?episode=<episode>`.
  « ← Villages » sur la fiche et sur l'écran d'équipe ; le bouton retour Android revient à la liste. Partie en cours → bouton « Reprendre » sur la liste.
  Démo désormais à `index.html?episode=demo` (bouton « Démo (test) » visible seulement avec ?debug=1).
  Test du son supprimé : vidéo → 1re étape directement, chrono lancé à la fin de la vidéo. villages.json ajouté au précache.
  ⚠ Pour Claude chat : `scenario/saint-genies/episode.json` n'existe pas encore → « Commencer » sur Saint-Geniès affiche « Ce village n'est pas encore prêt ».
  ⚠ Pour Claude chat : l'intro se joue encore juste après « Commencer » (au parking). Pour la jouer au panneau de l'église (décision du 03/11),
  il faudra un champ "video" par étape (prévu au point 3 des consignes) : à spécifier, puis Claude Code l'ajoute au moteur.
- 🔴 NOUVEAU (03/11) : appliquer `CONSIGNES_ACCUEIL_03-11.md` (accueil villages + distance + itinéraire Maps/Plans/Waze, `app/villages.json` ; suppression de l'écran test du son).
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
