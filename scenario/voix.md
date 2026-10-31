# Voix du narrateur — « Frère Aymeric, templier d'outre-tombe »

## Le personnage
Frère Aymeric, chevalier du Temple, mort vers 1307. Il parle aux joueurs depuis l'au-delà.
Voix d'homme mûr (50–60 ans), GRAVE, lente, solennelle, un peu rauque. Autorité bienveillante, jamais effrayante
pour les enfants : mystérieux, pas d'horreur. Pauses marquées avant les révélations.
Exemple de ton : « Voyageurs… vous voici enfin. Il y a sept siècles, j'ai traversé ce village… avec un secret. »

## Fabrication (décision 31/10) : fichiers audio PRÉ-ENREGISTRÉS, pas la voix du téléphone
La synthèse vocale du navigateur (speechSynthesis) ne permet ni vraie voix grave ni écho : elle reste en SECOURS seulement
(pitch 0.6, rate 0.85).
1. Gonzalo crée une voix grave (outil de voix IA) → Claude (chat) écrit les textes FR/EN/ES de chaque étape
   dans episode.json (champ "recit"), avec les pauses (« … »).
2. On génère un MP3 par texte et par langue : `app/audio/<langue>/<episode>_<etape>.mp3`
   (+ intro, final, et 2 indices par étape).
3. Effet « outre-tombe » appliqué UNE FOIS au fichier avec ffmpeg (pas en direct sur le téléphone) :

   ffmpeg -i brut.mp3 -af "asetrate=44100*0.92,aresample=44100,atempo=1.087,\
   lowpass=f=5500,highpass=f=70,\
   aecho=0.8:0.7:90|220:0.35|0.18,\
   volume=1.4" -ar 44100 -b:a 96k sortie.mp3

   - asetrate/atempo : voix ~1,5 demi-ton plus grave, même vitesse
   - aecho : petit écho de crypte (90 ms et 220 ms), assez discret pour rester compréhensible
   - Régler à l'oreille : si l'écho brouille les mots, baisser 0.35|0.18 → 0.25|0.12
4. Option ambiance : nappe sonore très basse (vent, cloche lointaine) en fond, coupable par le joueur.

## Décision 31/10
- Voix d'homme exigée : essai 2 (`aymeric2_*`) en attendant une voix IA masculine grave.
- Réglage d'effet par défaut : « moyen » (aymeric_2_moyen) tant que Gonzalo n'a pas choisi.
- Pour le prototype, Claude Code peut utiliser speechSynthesis (pitch 0.6, rate 0.85) en attendant les MP3 ;
  le lecteur doit déjà être prêt à lire les MP3 dès qu'ils existent.

## Exigence : VOIX D'HOMME (31/10)
- Mesure de hauteur : essai 1 (voix IA) ≈ 193 Hz = trop aigu (voix féminine/neutre) → écarté.
  Essai 2 (Enregistrement.m4a) ≈ 131 Hz = voix d'homme → utilisable en attendant.
- Cible : homme grave, ~90–120 Hz avant effet.
- Voix candidates (bibliothèque ElevenLabs, français, à écouter par Gonzalo) :
  « David – Professional Narrator » (50 ans, grave, posé), « Zion Aquila – Deep, Aged & Warm » (mûr, solennel),
  « Benoît – Warm & mischievous storyteller » (épique/mystérieux), « HenryD » (vieil homme), « Bellami – Deep and Smoky ».
- La génération via Runway n'est pas possible sur l'offre gratuite actuelle.

## Décision 31/10 (15h48) : PAS D'ÉCHO
- Gonzalo veut la voix grave SANS écho. Source retenue : essai 3 (audio_6.wav, voix IA ~174 Hz) baissée.
- Recette ffmpeg en vigueur (choisir A ou B selon Gonzalo) :
  ffmpeg -i brut.wav -af "asetrate=SR*R,aresample=44100,atempo=1/R,highpass=f=60,lowpass=f=5500,loudnorm=I=-16:TP=-1.5" -ac 1 -b:a 96k sortie.mp3
  ✅ RETENU : A, R=0.84 (−3 demi-tons). Référence : `scenario/voix-reference/aymeric_reference.mp3`.
  (B, R=0.79, écarté) ; SR = fréquence d'origine du fichier (24000 pour cette voix).
- La recette avec aecho plus haut est abandonnée.

## Règles pour Claude Code
- Lecteur audio dans l'app : bouton ▶ / ⏸ / « réécouter », sous-titres affichés pendant la lecture (accessibilité,
  et pour jouer sans son dans l'église).
- Tous les MP3 dans le précache du service worker (jeu hors-ligne). Viser 96 kbit/s mono → ~0,7 Mo par minute.
- Si le fichier de la langue manque → speechSynthesis en secours, jamais une voix d'une autre langue (erreur n°1 de Sentia).
- Dans l'église : volume réduit / rappel « écouteurs conseillés ».
