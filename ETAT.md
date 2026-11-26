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
- (27/11) BOUTON_PANNEAU_TOUJOURS n'existe plus (v23) : « Je suis devant le panneau » + « Aller à une étape » = codes 🐞 testeurs (et ?debug=1) seulement, à CHAQUE étape, MÊME après l'ouverture de la vente (demande de Gonzalo). Ne jamais les retirer des testeurs.

## Prochain pour Claude Code

- **26/11 (Claude chat)** : VIDÉO D'ACCUEIL du site faite (Runway, accord de Gonzalo) → `CONSIGNES_VIDEO_ACCUEIL_26-11.md`
  (plein écran au 1er passage, muette + sous-titres FR/EN/ES, 🔊, croix ✕). Gonzalo dépose le MP4 dans Dossier des modifications/5_Video accueil site/.

- **26/11 (Claude Code) — VIDÉO DES RUINES (station V « La tour plus vieille que tout » v1 / « Le passage secret » v2, Chevalier
  et Grand Maître), EN ATTENTE de la nouvelle vidéo de Gonzalo** : sa vidéo `scenario/saint-genies/photos/Ruines ancien chateau.mp4`
  (chevalier IA devant le donjon, générée avec Pavo) recadrée sans le logo « Pavo » en bas à droite (bande du bas coupée ; la mention
  « AI Generated » en haut à gauche est GARDÉE exprès) → `app/media/ruines_ancien_chateau.mp4` (720×904, 1,6 Mo), NON utilisée,
  NON publiée. `sg_donjon_ruine_1.jpg` n'est utilisée nulle part dans le jeu (rien à remplacer). Gonzalo va REFAIRE la vidéo
  (prompt donné le 26/11 : caméra fixe, le chevalier arrive depuis la tour et s'arrête DERRIÈRE le totem des ruines, épée dans une
  main, bouclier dans l'autre, dernière seconde immobile, sans texte ni logo). Quand elle arrive : faire comme le totem 03 —
  alléger, dernière image → photo de v1 ET v2 (remplace `sg_anciens_ruines_3/4.jpg`), `"video"` sur v1 dans `fabriquer_episode.py`,
  tester en local (Chevalier, « Aller à une étape » → 23), montrer, publier seulement après son accord. Supprimer alors
  `app/media/ruines_ancien_chateau.mp4` si elle n'est plus utile.
- **22/11 (Claude Code) — VIDÉO D'ARRIVÉE AU TOTEM 03 — ✅ PUBLIÉ le 22/11 (accord de Gonzalo, commit ad4d8ee, sw v25)** : vidéo de Gonzalo
  (« Photos iCloud/07oct2026/arriver au Totem 03 Regard autour de la chapelle (2).mp4 », 4,5 s, le chevalier vient tenir le totem)
  allégée → `app/media/arrivee_totem03.mp4` (720×960, 1,7 Mo). Sa dernière image → `photos/sg_totem_03_arrivee_chevalier.jpg`.
  `fabriquer_episode.py` : r1 (« Le jour de foire », 1re étape de la station R, jouée par Chevalier ET Grand Maître) reçoit
  `"video"` (jouée une fois à l'arrivée) + cette photo ; r2 et r3 (même totem) reçoivent aussi cette photo (demande de Gonzalo :
  le chevalier reste derrière le totem pour toutes les énigmes de ce totem). Textes et voix INCHANGÉS (r1_* MP3 lus, vérifié). Pour Claude chat : la photo
  de r1 dans `niveaux_contenu.py` est remplacée par Code dans le fabricant ; à reprendre dans ton contenu si tu régénères autrement.
  Testé en local (code testeur, Chevalier, « Aller à une étape » → 25) : vidéo OK, puis énigme avec la nouvelle photo et la voix d'Aymeric.
  Publié SEUL (sw.js v25, episode.json, la vidéo, la photo) ; app.js (VERSION_APP reste 'v24') et les changements partenaires
  (app.js, vitrine.js, serveur) restent NON publiés. Vérifié en ligne : v25 servie, vidéo et photo 200, episode.json = local, aucune fuite.
- **20/11 (Claude Code) — ESPACE PARTENAIRES / VENDEURS : SERVEUR DÉPLOYÉ le 20/11 (accord de Gonzalo, pour qu'il teste l'admin en ligne ;
  version e9f47bf5). PAS DANS GIT. app.js + vitrine.js (rattachement ?pv=) PAS ENCORE PUBLIÉS sur GitHub Pages** : tant qu'ils ne le sont pas,
  les QR des partenaires ne comptent ni visites ni achats en ligne (l'admin, l'espace partenaire et les ventes au comptoir marchent déjà).
  Décisions de Gonzalo (20/11) : il crée lui-même l'identifiant + mot de passe de chaque partenaire ; achat en ligne venu du QR d'un
  partenaire = Gonzalo encaisse 15 € et doit au partenaire 3 € MOINS les frais SumUp (réglage « commission en ligne », 2,62 € par défaut
  = 3 € − ~2,5 % de 15 €, À VÉRIFIER avec son tarif SumUp) ; vente encaissée au comptoir = le partenaire garde 3 € et doit 12 € (pas de frais).
  · Serveur (`src/index.js`) : tables `petro_partenaires` (id = code du QR, identifiant, mdp PBKDF2, mode 'lien' | 'comptoir', commissions
    particulières), `petro_pv_sessions`, `petro_pv_visites`, `petro_pv_reglements` ; colonnes `pv`/`pv_commission` (ventes), `pv`/`pv_commission`/`pv_du`
    (codes), `pv` (évènements) — créées toutes seules au 1er appel comme le reste. Routes publiques `/api/pv/visite`, `/api/pv/connexion` ;
    partenaire connecté (en-tête x-jeton) `/api/pv/moi`, `/api/pv/code` (code comptoir, mode comptoir seulement), `/api/pv/annuler` (24 h, jamais activé),
    `/api/pv/deconnexion` ; admin `/api/partenaires` (liste, créer/modifier), `/api/partenaires/detail`, `/api/partenaires/regler`, `/api/partenaires/reglement-suppr`.
    Une vente compte au paiement (en ligne) ou à la création (comptoir) ; code désactivé/annulé/test = ne compte plus.
  · Admin (`src/page.js`) : onglet « 🤝 Partenaires » (commissions par défaut, fiche partenaire, liste avec solde, détail par mois :
    ventes, codes activés ou non, QR + statistiques, bouton « ✓ Commission payée » / « ✓ Il m'a payé » + historique des règlements).
  · Page partenaire (`src/partenaire.js`, adresse `/partenaire` du serveur, FR/EN/ES) : CA, codes vendus/activés, commission du mois, solde,
    vente au comptoir (crée le code + QR), liste des ventes, statistiques et impression de son QR.
  · QR d'un partenaire = `https://escape-game-dordogne.fr/?pv=ID` (vitrine). `site/vitrine.js` et `app/app.js` gardent l'ID 30 jours
    (`petrocores_pv`), comptent la visite, l'ajoutent aux évènements (étapes de la partie gratuite p0…e0b par partenaire) et à l'achat SumUp.
  · Testé en local (wrangler dev sur 8789, base de test séparée dans le scratchpad, SIMULATION, aucun secret réel) : création, doublon
    d'identifiant refusé, visites, étapes gratuites (« dont sans code »), achat simulé via QR → 2,62 €, achat sans QR non compté, activation,
    codes comptoir (3 € / 12 €), annulation, mode 'lien' refusé au comptoir, mauvais mot de passe, changement de mdp = session coupée,
    règlements → solde à 0. Pages vues dans le navigateur (admin + partenaire FR/EN).
  · Pour publier (après son « oui ») : `npx wrangler deploy` (serveur) ; app.js + vitrine.js sur GitHub Pages avec **sw v25**
    (pas encore incrémenté). La vente reste FERMÉE et SumUp en test : rien ne change de ce côté.
- **14/11 (Claude chat)** : appliquer `CONSIGNES_PARCHEMIN_14-11.md` (textes du parchemin VALIDÉS par Gonzalo le 15/11).
- **18/11 (Claude chat)** : `CONSIGNES_TARIF_ACTIVATION_18-11.md` = 15 €, 2 tél., code valable le JOUR de l'activation (sur place,
  jusqu'à minuit, pour les 2 tél.) + MISE EN LIGNE de ce qui est fait avec la VENTE FERMÉE (médiateur + INPI en cours).
- **16/11 soir (Claude chat)** : `CONSIGNES_16-11_SOIR.md` = infos légales (Kbis) reportées, textes provisoires vitrine relus,
  avis Brevo, TEXTE FINAL (fin du [À COMPLÉTER]) + voix final_texte/final_recit + correction moteur (voix du final).
- **16/11 (Claude chat)** : VENTE EN LIGNE SumUp → `CONSIGNES_SUMUP_16-11.md` (+ `VITRINE_TEXTES_16-11.md`, `CGV_BROUILLON_16-11.md`).
  Mise en place EN MODE TEST autorisée par Gonzalo ; rien d'encaissé en réel sans son accord.
- **15/11 soir (Claude chat)** : textes provisoires de Code relus → `CONSIGNES_TEXTES_CODE_15-11.md` (6 clés + noms p0-p2 validés).
- **15/11 (Claude chat)** : `CONSIGNES_NIVEAUX_15-11.md` = 3 niveaux Écuyer / Chevalier / Grand Maître liés au code + promos.
  Principe + noms validés par Gonzalo. Contenu complet (Chevalier + Grand Maître + descriptions) dans `_travail/niveaux_contenu.py`,
  168 voix FAITES (index.json = 525 entrées). Attendre que Gonzalo relise les énigmes avant de publier.

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
   ✅ 13/11 (Claude Code) — DOMAINE escape-game-dordogne.fr (OVH, payé 3 ans par Gonzalo) branché sur GitHub Pages :
     DNS OVH : 4 A vers 185.199.108-111.153, CNAME www → dordrone.github.io (MX/SPF OVH intacts) ; fichier CNAME à la racine du dépôt
     (créé par GitHub, NE PAS SUPPRIMER) ; HTTPS imposé. Le jeu = https://escape-game-dordogne.fr/app/ ; l'ancienne adresse
     dordrone.github.io/Petrocores renvoie dessus. Serveur : CORS accepte la nouvelle adresse, QR de la page admin = nouvelle adresse.
     Nouvelle adresse = nouveau site pour les téléphones : un code déjà saisi doit être retapé (compte comme un appareil de plus).
     Mail : contact@escape-game-dordogne.fr (Zimbra Starter inclus), webmail https://webmail.mail.ovh.net.
     Liens utiles + Excel des réponses dans le Google Drive de Gonzalo : « Mon Drive/Escape Game Dordogne » (privé).
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
- 26/11 Claude Code (session promo) : teaser « Je code un jeu… » (21 s, FR, validé par Gonzalo) monté par `promo/monter_teaser.py` (sons CC0 + Earshot, voix OmniVoice) ; PROGRAMMÉ le 27/11 à 08:00 Paris : reel 9:16 sur Facebook + Instagram Dordrone (Business Suite), Short 1:1 sur YouTube DORDRONE (https://youtube.com/shorts/tTybx1bDBEo, IA déclarée). ⚠ L'extrait « Voyageurs… vous voici enfin » vient de l'intro v4 : vérifier qu'il ne contient pas la musique CapCut.
- 20/11 Claude Code : PUBLIÉ sw v24 (accord de Gonzalo) = correction des énigmes vides de la v23 + énigmes par niveau (variantes c/g), x1 refait (+ x1t), chapelle Chevalier KC, 502 voix de Claude chat. Vérifié en ligne (escape-game-dordogne.fr) : v24 servie, 33 étapes dont 28 chiffrées, aucune réponse en clair, énigme p0 affichée avec champ + Valider + Indice.
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

## 14/11 Claude Code — EN LOCAL, PAS ENCORE PUBLIÉ (sw v20, attend l'accord de Gonzalo)
- Bienvenue FR refaite (Runway, 400 crédits, accord de Gonzalo) : Aymeric sort du fond, passe entre le lavoir et le totem 02, parle
  avec la voix d'origine (Zion Aquila) dans le bon ordre « Bienvenue à Saint-Geniès, voyageurs ». `app/media/bienvenue_saint_genies.fr.mp4`
  + sous-titres fr / fr.en / fr.es recalés (voix à 7,1 s). Vidéos EN/ES = anciennes (à refaire : ~400 crédits chacune, demander à Gonzalo).
  Sources et programmes : `C:\Users\DORDRONE\MuseTalk\petrocores\` (caler_voix.py, runway_totem02.mp4, ancienne vidéo).
- Écran final : « Parchemin d'honneur ». Avant la victoire, les joueurs tapent jusqu'à 6 prénoms (S.noms, restent sur le téléphone) ;
  le jeu dessine un parchemin (canvas 1080x1440) : noms, équipe, titre de l'épisode, date, temps, chemin parcouru (étapes avec lat/lon),
  sceau gagné, signature Frère Aymeric, escape-game-dordogne.fr. Boutons Enregistrer (PNG) / Partager (téléphones) / Modifier les noms.
  → **Pour Claude chat** : les textes du parchemin sont PROVISOIRES, dans `UI` de app/app.js (clés noms* et parchemin*), à réécrire en fr/en/es
    (me les donner ici, je les recopie). Idées suivantes : envoi par mail (consentement RGPD), photo souvenir, carnet des sceaux de la saison.

- **15/11 (Claude Code)** : `CONSIGNES_PARCHEMIN_14-11.md` APPLIQUÉ dans app/app.js (EN LOCAL, pas encore publié) :
  textes validés fr/en/es, singulier `parcheminExploit1` si exactement 1 prénom, devise latine `parcheminDevise` au-dessus
  du site, texte de partage `parcheminPartage`. Mise en page : carte un peu raccourcie si besoin pour que sceau et devise
  ne se chevauchent pas. Publication (sw v21) après accord de Gonzalo.

- **15/11 (Claude Code)** : `CONSIGNES_NIVEAUX_15-11.md` APPLIQUÉ — EN LOCAL, RIEN PUBLIÉ (app, épisode, serveur) :
  · `fabriquer_episode.py` importe `_travail/niveaux_contenu.py` tel quel : 11 étapes ajoutées (31 au total), `trouver` sur d1 m1 f1 c1 l1,
    stations R V T K, `"niveaux"` (réglages + titres/desc/voix) et `"interface"` dans l'épisode. z1 : champ `"affiche": "DOWZVO"`.
    Sauvegarde : `_travail/fabriquer_episode_avant_niveaux.py`.
  · App : écran « Choisissez votre quête » après le nom d'équipe (démo : Écuyer seul, autres grisés) et de nouveau si un code est
    saisi au moment payant ; parcours A/B/C tiré au hasard (plus de lettres) ; Chevalier et Grand Maître = stations du bourg puis
    toujours T → V → R (→ K) jusqu'à la chapelle (code final là-bas) ; Chevalier : énigme `trouver` + bouton « voir la photo » (pénalité
    d'indice), nom du lieu caché ; Grand Maître : boussole seule (pas de carte ni de distance), pas de « Voir la réponse » ;
    1 indice, pénalités ×2/×3 ; rappel du niveau dans le menu ☰ ; code promo sous le parchemin.
  · Textes PROVISOIRES ajoutés par Code dans app.js (à relire, Claude chat) : niveauConfirme, niveauVotre, photoLieu,
    boussoleActiver, boussoleAide, boussoleNord.
  · Serveur (pas redéployé) : colonne `niveau` sur les codes (anciens codes = Grand Maître, nouveaux = choix dans l'admin, Écuyer par défaut),
    /api/verify renvoie le niveau, /api/promo (1 promo par code et par niveau terminé, seulement si le code est de ce niveau ; crée un
    vrai code du niveau suivant, canal « promo »), réglages promo dans l'admin, niveau dans les stats + classement Grand Maître,
    planche A4 avec titre + description du niveau (lus dans l'épisode publié).
  · Testé en local (serveur `wrangler dev --local` + app) : 3 niveaux, code en cours de partie, boussole, DOWZVO, promo, stats.
  · Publier = sw v21 + épisode + `npx wrangler deploy` (les colonnes s'ajoutent toutes seules à la base).
- **15/11 (Gonzalo → Claude Code)** : POUR L'INSTANT un même code ouvre les 3 niveaux jusqu'à sa date d'expiration, et PAS de codes promo
  (tarifs à décider après les tests en vrai). Serveur : `UN_CODE_TOUS_NIVEAUX = true` (index.js) → /api/verify répond Grand Maître pour
  tout code, /api/promo répond « off », l'admin cache le choix du niveau et les réglages promo. App : `PROMOS = false`.
  Le reste (niveau par code, promos) est écrit et testé : il suffira de remettre ces deux réglages pour l'activer.

- **16/11 (Claude Code)** : `CONSIGNES_TEXTES_CODE_15-11.md` recopié dans `UI` de app/app.js (6 clés, FR/EN/ES). EN LOCAL, pas encore publié (attend l'accord de Gonzalo ; publier = sw v22).

- **16/11 (Claude Code)** : vente SumUp EN MODE TEST — FAIT EN LOCAL, RIEN PUBLIÉ NI DÉPLOYÉ (attend Gonzalo).
  · Serveur (`serveur/petrocores/src/index.js`) : table `petro_ventes` ; GET /api/offre (prix lu dans les réglages : vente_prix,
    vente_validite_jours, vente_appareils, vente_active, rgpd_mois) ; POST /api/achat (commande + checkout SumUp Hosted Checkout,
    redirect_url = /merci.html?commande=ID, return_url = /api/sumup-webhook) ; GET /api/commande/ID ; webhook = simple « sonnette »,
    le statut est TOUJOURS redemandé à SumUp (PAID + montant + référence) ; un seul code par commande (testé avec 3 appels simultanés).
    Code créé : client « Vente en ligne » (ou « Vente en ligne (test) »), canal web, Grand Maître, email seulement dans la vente.
    `wrangler.toml` : [vars] MODE_TEST = "true". Secrets à poser par Gonzalo : SUMUP_API_KEY, SUMUP_MERCHANT_CODE.
    Essais locaux sans SumUp : SIMULATION=1 (faux paiement /api/simul), inactif en ligne et dès qu'une clé existe.
  · Admin : onglet « Ventes en ligne » (réglages prix/validité/téléphones/RGPD, commandes, « Copier l'email », désactiver le code,
    « Redemander à SumUp », CSV) + Statistiques : ventes par jour, test à part, part des groupes démo qui achètent.
  · Site : `index.html` (vitrine, remplace la redirection ; ?code=/?episode= renvoient toujours vers /app/), `merci.html`, `cgv.html`,
    `mentions.html`, `site/vitrine.css`, `site/vitrine.js` (textes), `site/aymeric.jpg` (image de la vidéo intro v4, 8 s).
    Quêtes lues dans episode.json. CGV et mentions = brouillon FR, champs [..] surlignés, bandeau « brouillon ».
  · Email automatique PAS branché (EMAIL_AUTO = false) : la page merci n'annonce pas l'email ; l'admin copie le texte à envoyer.
  · Pour Claude chat — textes PROVISOIRES (Code) à relire, marqués dans site/vitrine.js : bientot, bandeauTest, titres de sections
    (hComment, hQuetes, hInfos, hFaq, hAchat, hCadeau), errEmail/errCgv/errPrenom/errServeur/errReseau, valable, recevoirEmail, lent,
    probleme, inconnue, accueil, enFrancais (CGV en français seulement). « arrive par email » (comment1, CGV art. 4) est faux tant
    que l'email automatique n'existe pas.
  · 16/11 (suite) : Gonzalo a posé SUMUP_API_KEY + SUMUP_MERCHANT_CODE (compte SANDBOX confirmé : étiquette orange). Serveur DÉPLOYÉ
    avec son accord (version 321f3831…, MODE_TEST=true). Vérifié : /api/offre → vente ouverte, test ; /api/achat → page SumUp créée
    (commande d'essai VPGYPV4Y7TAJPQG non payée, email example.com). Vitrine PAS publiée : essai depuis localhost:8123?serveur=…
  · 16/11 : ✅ ESSAI SumUp SANDBOX RÉUSSI par Gonzalo (carte de test) : commande payée (PAID, transaction TAAA7HRE37P), code SG-8BEQ-VY
    créé et rendu sur la page merci. Reste avant la vraie vente : prix/validité/téléphones, infos légales (SIRET, adresse, TVA,
    médiateur), relecture CGV + textes provisoires (Claude chat), email automatique (proposé : Brevo), publier la vitrine (git),
    puis clé RÉELLE + MODE_TEST="false" avec l'accord de Gonzalo.
  · 17/11 (Claude Code) : EMAIL DU CODE BRANCHÉ (en local, PAS publié). Choix de Gonzalo : pas de Brevo, la boîte OVH (Zimbra)
    contact@escape-game-dordogne.fr en SMTP (ssl0.ovh.net:465), bibliothèque npm worker-mailer 1.3.0 (serveur/petrocores/package.json,
    + compatibility_flags nodejs_compat). Mot de passe = secret SMTP_PASS tapé par Gonzalo (jamais dans le dépôt).
    Le serveur envoie l'email (textes de VITRINE_TEXTES_16-11, section Email, FR/EN/ES, objet « [TEST] » en mode test) une seule
    fois, au moment où le code est rattaché à la commande ; échec = noté, la vente n'est pas bloquée. Admin : état de l'email par
    commande, bouton « Envoyer/Renvoyer l'email », « Envoyer un email d'essai à… » ; « Copier l'email » gardé en secours.
    Vitrine : EMAIL_AUTO = true → la page merci dit de nouveau « Il vous a aussi été envoyé par email » (comment1 et CGV art. 4
    deviennent vrais). Texte « recevoirEmail » (bouton « bientôt ») n'est plus affiché.
    Testé en local : email d'essai + faux achat cadeau (Léa) → 2 emails partis vers l'adresse de Gonzalo.
    Pour la mise en ligne (avec l'accord de Gonzalo) : il tape « npx wrangler secret put SMTP_PASS », puis npx wrangler deploy.
  · 17/11 : ✅ Emails bien reçus dans Gmail (simplement en retard au début : nouvelle adresse). Gonzalo a ajouté DMARC
    (_dmarc TXT « v=DMARC1; p=none; rua=mailto:contact@…; aspf=r ») et vérifié DKIM chez OVH. Journal SMTP détaillé
    possible en local : --var SMTP_DEBUG:1. Reste : secret SMTP_PASS sur Cloudflare + déploiement, avec l'accord de Gonzalo.
  · 17/11 : Gonzalo a posé SMTP_PASS sur Cloudflare. Serveur DÉPLOYÉ avec son accord (version 2c1c89f5…, toujours MODE_TEST=true) :
    l'email du code part maintenant aussi depuis le serveur en ligne. Vitrine toujours PAS publiée.
  · 18/11 (Claude Code) : CONSIGNES_16-11_SOIR + CONSIGNES_TARIF_ACTIVATION_18-11 APPLIQUÉES EN LOCAL, testées (PAS encore publiées :
    attend le « oui » de Gonzalo). Mentions + CGV : infos Kbis/SIRET, TVA 293 B, 15 €, art. 4 « jour J », « [médiateur : en cours] »,
    plus de bandeau brouillon. Vitrine : textes relus (bientot, hAchat, hCadeau, valable, errReseau, infos, quetesNote), « PROVISOIRE »
    retirés, mention TVA sous « Payer » et sur la page merci, bandeau « mode test » caché quand la vente est fermée.
    Jeu (sw v22) : texte final regénéré (fabriquer_episode.py → episode.json, seul final.texte change), voix final_texte jouée ;
    « ?code= » ne fait plus que PRÉ-REMPLIR le code ; l'app envoie sa position à /api/verify ; messages utilise/horszone/position ;
    après minuit, une NOUVELLE partie referme le jeu (la partie en cours continue).
    Serveur : colonnes regle ('jour'|'fixe') + fin_jour ; 1re activation seulement à moins de 2 km du parking du lavoir (+ marge de
    précision GPS, max 1 km), puis valable jusqu'à minuit (Paris, été/hiver) pour les 2 téléphones ; ventes en ligne et nouveaux codes
    = « jour J », case « Multi-jours » dans l'admin = ancien fonctionnement ; codes déjà créés (testeurs) = multi-jours, inchangés.
    Admin : colonne Validité (en attente / activé le… / expire le…), bouton « Prolonger d'un jour », réglage « Délai pour venir jouer ».
    Réglages par défaut : vente_prix 15, vente_active 0 (la base en ligne n'a aucun réglage enregistré → vente FERMÉE dès le déploiement).
    Email du code : nouveau texte de validité. Pour Claude chat — PROVISOIRE (Code) à relire : app « code_position » (FR/EN/ES),
    vitrine « tva » EN/ES. Rappel : BOUTON_PANNEAU_TOUJOURS = true (tests entre amis) toujours en place.

## 18/11 — PUBLIÉ (Claude Code, avec l'accord de Gonzalo)
- GitHub `d35595c` : jeu sw **v22**, vitrine, mentions légales, CGV, texte final + voix. En ligne sur escape-game-dordogne.fr (vérifié : v22, « La vente en ligne ouvre très bientôt », RCS dans les mentions).
- Serveur Cloudflare déployé (version ad96461d) : `/api/offre` → vente **fermée**, 15 €, MODE_TEST toujours "true". Colonnes `regle` / `fin_jour` présentes dans la base en ligne.
- Reste avant d'ouvrir la vente : médiateur, activité INPI, relecture des textes PROVISOIRE (code_position, tva EN/ES), vraie clé SumUp + MODE_TEST="false" (accord de Gonzalo).

- 18/11 soir : copie cachée de chaque email de code à contact@ (serveur 0ed68c48). Code offert à une testeuse : SG-UQYV-35 (vente V8BZ47XWEX5, 0 €, OFFERT) ; email à envoyer par Gonzalo depuis l'admin.

## 18/11 soir — Mode testeur (Claude Code, publié avec l'accord de Gonzalo)
- Admin : « Type de code » = Client (jour J) / 🐞 Testeur (15 jours dès la 1re activation, partout, sans contrôle de position) / Multi-jours. Onglet « 🐞 Testeurs » = problèmes signalés (table petro_bugs, bouton Traité).
- Vitrine : lien discret « 🐞 Mode testeur » sous « Essayer gratuitement » → app/?episode=saint-genies&testeur=1 (saisie du code testeur).
- Jeu sw v23 : avec un code testeur → bouton 🐞 (barre + menu) « Signaler un problème » (POST /api/bug : étape, langue, téléphone ajoutés) et « Je suis devant le panneau » / « Aller à une étape ». BOUTON_PANNEAU_TOUJOURS supprimé : les clients ne voient plus ces boutons.
- Pour Claude chat : textes testeurTitre, testeurExplication, testeurOk, testeurPasCode, bugBouton, bugAide, bugEnvoyer, bugMerci, bugErreur (app.js) et « testeur » (vitrine.js) = PROVISOIRE, à relire.

## 26/11 soir (Claude chat)
- ➡ Code : lire `CONSIGNES_VIDEO_ACCUEIL_VERTICALE_26-11.md` :
  1) vidéo de bienvenue du site = `accueil_v10_vertical.mp4` (9:16), remplace accueil_v3 ; plein écran téléphone, centrée sur ordinateur ;
  2) mode testeur : garder « Je suis devant le panneau » + « Aller à une étape » pour les codes testeurs, même après l'ouverture de la vente.
- Pas de publication sans le « oui » de Gonzalo. Gonzalo doit vérifier la licence de l'appli Pavo (plan chapelle du Cheylard).
- ✅ 26/11 nuit (Claude Code) point 1 FAIT EN LOCAL, NON PUBLIÉ : `site/accueil.mp4` (4,9 Mo) + `accueil.jpg` + `accueil.fr/en/es.vtt`
  (calage mesuré sur la voix : 2,9-8,4 / 9,4-13,2 / 13,9-16,3 / 16,4-18,4 / 19,0-22,3 s) ; code à part `site/accueil-video.js`
  (+ styles en fin de vitrine.css, 1 ligne dans index.html). 🔊 et ✕ en haut ; « ▶ Revoir la vidéo » sous « Mode testeur ».
  Testé : téléphone plein écran, ordinateur centré, FR/EN, fermeture. ⚠ vitrine.js contient encore les changements non publiés de la session partenaires.
  ✅ 27/11 PUBLIÉ (accord de Gonzalo), sans les changements partenaires de vitrine.js.
  Point 2 vérifié dans le code : `panneauToujours() = DEBUG || estTesteur()`, rien ne dépend de la vente → OK, rien à changer.
- earshot installé sur le PC de Gonzalo (sons gratuits) : `fabriquer_rires.bat` = exemple d'utilisation. Crédits Runway restants : ~67.
