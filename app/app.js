'use strict';
// Moteur de jeu Pétrocores. Aucun texte de scénario ici : tout vient de l'episode.json.
// Sans paramètre : accueil, un bouton par village (villages.json).
// ?episode=saint-genies lit ../scenario/saint-genies/episode.json ; ?episode=demo : demo-episode.json.
// ?debug=1 affiche les erreurs de l'épisode et le bouton « je suis arrivé » en permanence.

const LANGUES = ['fr', 'en', 'es'];
const VOIX_LANG = { fr: 'fr-FR', en: 'en-US', es: 'es-ES' };   // comme Sentia (validé terrain)
const VOIX_VITESSE = 0.96, VOIX_HAUTEUR = 1;
// Réglages GPS, à ajuster après les tests au village.
const RAYON_DEFAUT = 10;          // m : l'épisode peut le changer par étape avec "rayon_m"
const ACCURACY_DECLENCHE = 15;    // m : au-delà, la position ne peut pas déclencher l'arrivée
const ACCURACY_MAX = 50;          // m : au-delà, on n'affiche plus de distance
const ACCURACY_EXACTE = 100;      // m : au-delà, la position exacte est sans doute désactivée
const EXACTE_ATTENTE_MS = 15000;  // durée au-delà de ACCURACY_EXACTE avant d'afficher le conseil
const CONFIRMATIONS = 2;          // positions fiables consécutives dans le cercle
const LISSAGE_NB = 3;             // positions fiables moyennées (poids 1/précision²)
const LISSAGE_AGE_MS = 10000;     // positions plus anciennes exclues de la moyenne
const SECOURS_DISTANCE_M = 25;    // proche du lieu mais GPS imprécis → bouton de secours
const GPS_MUET_MS = 20000;        // pas de position assez précise depuis 20 s → bouton de secours
const TRAJET_LONG_MS = 180000;    // 3 min sur un trajet (étapes à 50–150 m) → bouton de secours
// Réglages du son et de la vidéo.
const VOIX_ATTENTE_MS = 1000;     // attente maximale du chargement des voix
const LECTURE_ATTENTE_MS = 1500;  // lecture automatique pas démarrée → le bouton clignote
const SOUS_TITRES_VIDEOS = true;  // false coupe les sous-titres si les .vtt ne collent plus aux vidéos
// Panneau de la vidéo de bienvenue : le joueur doit voir le même décor que la vidéo.
const RAYON_BIENVENUE = 5;        // m, si "bienvenue_lieu" ne donne pas "rayon_m"
const ACCURACY_BIENVENUE = 8;     // m, si "bienvenue_lieu" ne donne pas "precision_m"
const SECOURS_PANNEAU_M = 15;     // à moins de 15 m…
const BOUTON_PANNEAU_TOUJOURS = true; // PROVISOIRE (tests entre amis, 07/11) : « Je suis devant le panneau » toujours visible. Remettre false avant la version payante.
const SECOURS_PANNEAU_MS = 15000; // …depuis 15 s sans déclenchement → « Je suis devant le panneau »
// 07/11 : sceau de fin selon les pénalités (secondes) : 0 = or, ≤ 10 min = argent, ≤ 20 min = bronze, au-delà = bois.
const SCEAUX = [[0, 'or'], [600, 'argent'], [1200, 'bronze'], [Infinity, 'bois']];
function sceauGagne(pen) { return SCEAUX.find(([max]) => (pen || 0) <= max)[1]; }
const PENALITE_INDICE_S = 120;
const PENALITE_SOLUTION_S = 300;
const CACHE_MEDIA = 'petrocores-media';

const UI = {
  chargement: { fr: 'Chargement…', en: 'Loading…', es: 'Cargando…' },
  erreurEpisode: { fr: "Impossible de charger l'épisode. Vérifiez votre connexion.", en: 'Could not load the episode. Check your connection.', es: 'No se pudo cargar el episodio. Compruebe su conexión.' },
  duree: { fr: 'Durée', en: 'Duration', es: 'Duración' },
  equipe: { fr: "Nom de l'équipe", en: 'Team name', es: 'Nombre del equipo' },
  code: { fr: "Code d'accès", en: 'Access code', es: 'Código de acceso' },
  codeFaux: { fr: 'Code incorrect.', en: 'Wrong code.', es: 'Código incorrecto.' },
  equipeVide: { fr: "Donnez un nom à votre équipe.", en: 'Give your team a name.', es: 'Ponga un nombre a su equipo.' },
  commencer: { fr: 'Commencer', en: 'Start', es: 'Empezar' },
  reprendre: { fr: 'Reprendre la partie', en: 'Resume the game', es: 'Reanudar la partida' },
  nouvelle: { fr: 'Nouvelle partie', en: 'New game', es: 'Nueva partida' },
  nouvelleConfirme: { fr: 'Effacer la partie en cours et recommencer ?', en: 'Erase the current game and start again?', es: '¿Borrar la partida en curso y empezar de nuevo?' },
  oui: { fr: 'Oui', en: 'Yes', es: 'Sí' },
  non: { fr: 'Non', en: 'No', es: 'No' },
  horsLigne: { fr: 'Préparation hors-ligne', en: 'Preparing for offline use', es: 'Preparando el modo sin conexión' },
  horsLignePret: { fr: '✓ Prêt à jouer sans réseau', en: '✓ Ready to play without network', es: '✓ Listo para jugar sin red' },
  horsLigneKo: { fr: 'Fichiers manquants : gardez du réseau pendant le jeu.', en: 'Some files are missing: keep a network connection while playing.', es: 'Faltan archivos: mantenga la conexión durante el juego.' },
  installer: { fr: "📲 Installer l'application", en: '📲 Install the app', es: '📲 Instalar la aplicación' },
  installerIos: { fr: "Sur iPhone : bouton Partager, puis « Sur l'écran d'accueil ».", en: 'On iPhone: tap Share, then “Add to Home Screen”.', es: 'En iPhone: botón Compartir y luego «Añadir a pantalla de inicio».' },
  etape: { fr: 'Étape', en: 'Step', es: 'Etapa' },
  enigmeFinale: { fr: 'Énigme finale', en: 'Final riddle', es: 'Enigma final' },
  choisirVariante: { fr: 'Comment voulez-vous jouer cette étape ?', en: 'How do you want to play this step?', es: '¿Cómo quiere jugar esta etapa?' },
  rendezVous: { fr: 'Rendez-vous à ce lieu', en: 'Go to this place', es: 'Vaya a este lugar' },
  silence: { fr: '🤫 Par respect pour ce lieu de culte, Frère Aymeric se tait ici. Lisez l\'énigme en silence.', en: '🤫 Out of respect for this place of worship, Brother Aymeric stays silent here. Read the riddle quietly.', es: '🤫 Por respeto a este lugar de culto, Fray Aymeric guarda silencio aquí. Leed el enigma en silencio.' },
  ecranAllume: { fr: "Gardez l'écran allumé : téléphone verrouillé, le GPS s'arrête.", en: 'Keep the screen on: when the phone locks, GPS stops.', es: 'Mantenga la pantalla encendida: con el teléfono bloqueado, el GPS se detiene.' },
  gpsAttente: { fr: 'Recherche du GPS…', en: 'Looking for GPS…', es: 'Buscando el GPS…' },
  gpsOk: { fr: 'Précision ± {n} m', en: 'Accuracy ± {n} m', es: 'Precisión ± {n} m' },
  gpsFaible: { fr: 'Position approximative (précision ± {n} m)', en: 'Approximate position (accuracy ± {n} m)', es: 'Posición aproximada (precisión ± {n} m)' },
  gpsExact: { fr: 'Activez la position exacte pour votre navigateur (iPhone : Réglages > Chrome ou Safari > Position > Position exacte ; Android : autorisations de Chrome > Position > Position exacte).', en: 'Turn on precise location for your browser (iPhone: Settings > Chrome or Safari > Location > Precise Location; Android: Chrome permissions > Location > Use precise location).', es: 'Active la ubicación exacta para su navegador (iPhone: Ajustes > Chrome o Safari > Ubicación > Ubicación exacta; Android: permisos de Chrome > Ubicación > Usar ubicación exacta).' },
  gpsRefuse: { fr: 'GPS refusé : autorisez la position, ou utilisez le bouton ci-dessous.', en: 'GPS denied: allow location, or use the button below.', es: 'GPS denegado: autorice la ubicación o use el botón de abajo.' },
  gpsAbsent: { fr: 'GPS indisponible : utilisez le bouton ci-dessous.', en: 'GPS unavailable: use the button below.', es: 'GPS no disponible: use el botón de abajo.' },
  arrive: { fr: 'Je suis arrivé', en: 'I have arrived', es: 'He llegado' },
  ecouter: { fr: '🔊 Écouter', en: '🔊 Listen', es: '🔊 Escuchar' },
  ecouterNarrateur: { fr: '▶ Écouter {n}', en: '▶ Listen to {n}', es: '▶ Escuchar a {n}' },
  votreReponse: { fr: 'Votre réponse', en: 'Your answer', es: 'Su respuesta' },
  valider: { fr: 'Valider', en: 'Submit', es: 'Validar' },
  trouve: { fr: 'Trouvé !', en: 'Found it!', es: '¡Encontrado!' },
  continuer: { fr: 'Continuer', en: 'Continue', es: 'Continuar' },
  faux: { fr: 'Ce n\'est pas ça. Cherchez encore !', en: 'Not quite. Keep looking!', es: 'No es eso. ¡Siga buscando!' },
  indice: { fr: 'Indice ({n}/{t}) · +{p}', en: 'Hint ({n}/{t}) · +{p}', es: 'Pista ({n}/{t}) · +{p}' },
  solution: { fr: 'Voir la réponse · +{p}', en: 'Show the answer · +{p}', es: 'Ver la respuesta · +{p}' },
  solutionConfirme: { fr: 'Voir la réponse ? {p} seront ajoutées au chrono.', en: 'Show the answer? {p} will be added to your time.', es: '¿Ver la respuesta? Se añadirán {p} al crono.' },
  etaitReponse: { fr: 'La réponse était : {r}', en: 'The answer was: {r}', es: 'La respuesta era: {r}' },
  bravo: { fr: 'Bien joué !', en: 'Well done!', es: '¡Bien hecho!' },
  fragment: { fr: 'Fragment obtenu', en: 'Fragment found', es: 'Fragmento obtenido' },
  suivante: { fr: 'Étape suivante', en: 'Next step', es: 'Siguiente etapa' },
  versFinale: { fr: "Vers l'énigme finale", en: 'On to the final riddle', es: 'Hacia el enigma final' },
  terminer: { fr: 'Terminer', en: 'Finish', es: 'Terminar' },
  sceau_or: { fr: "Sceau d'or", en: 'Gold seal', es: 'Sello de oro' },
  sceau_argent: { fr: "Sceau d'argent", en: 'Silver seal', es: 'Sello de plata' },
  sceau_bronze: { fr: 'Sceau de bronze', en: 'Bronze seal', es: 'Sello de bronce' },
  sceau_bois: { fr: 'Sceau de bois', en: 'Wooden seal', es: 'Sello de madera' },
  sceauMot_or: { fr: "Sans la moindre aide ! Vous méritez le sceau d'or des Templiers.", en: 'Without any help! You deserve the Templars’ gold seal.', es: '¡Sin ninguna ayuda! Merecéis el sello de oro de los templarios.' },
  sceauMot_argent: { fr: "Un peu d'aide, mais un vrai courage : voici le sceau d'argent.", en: 'A little help, but true courage: here is the silver seal.', es: 'Un poco de ayuda, pero verdadero valor: aquí tenéis el sello de plata.' },
  sceauMot_bronze: { fr: 'Le chemin fut long, mais vous êtes allés au bout : le sceau de bronze est à vous.', en: 'The road was long, but you made it to the end: the bronze seal is yours.', es: 'El camino fue largo, pero llegasteis al final: el sello de bronce es vuestro.' },
  sceauMot_bois: { fr: "Même le plus humble des frères reçoit un sceau : celui de bois. Revenez tenter l'or !", en: 'Even the humblest brother receives a seal: the wooden one. Come back and try for gold!', es: 'Hasta el más humilde de los hermanos recibe un sello: el de madera. ¡Volved a intentar el oro!' },
  victoire: { fr: 'Mission accomplie !', en: 'Mission accomplished!', es: '¡Misión cumplida!' },
  tempsFinal: { fr: 'Temps de votre équipe', en: "Your team's time", es: 'Tiempo de su equipo' },
  dontPenalites: { fr: 'dont {p} de pénalités', en: 'including {p} of penalties', es: 'de los cuales {p} de penalización' },
  min: { fr: 'min', en: 'min', es: 'min' },
  toucherCommencer: { fr: 'Touchez pour commencer', en: 'Tap to begin', es: 'Toque para empezar' },
  passer: { fr: 'Passer', en: 'Skip', es: 'Saltar' },
  passerConfirme: { fr: 'Toucher encore pour passer', en: 'Tap again to skip', es: 'Toque otra vez para saltar' },
  revoirDebut: { fr: '↺ Revoir', en: '↺ Replay', es: '↺ Volver a ver' },
  allerEtape: { fr: 'Aller à une étape (test)', en: 'Go to a step (test)', es: 'Ir a una etapa (prueba)' },
  revoirIntro: { fr: "Revoir l'intro", en: 'Watch the intro again', es: 'Volver a ver la intro' },
  fermer: { fr: 'Fermer', en: 'Close', es: 'Cerrar' },
  erreurVillages: { fr: 'Impossible de charger la liste des villages. Vérifiez votre connexion.', en: 'Could not load the list of villages. Check your connection.', es: 'No se pudo cargar la lista de pueblos. Compruebe su conexión.' },
  episodeAbsent: { fr: "Ce village n'est pas encore prêt. Revenez bientôt !", en: 'This village is not ready yet. Come back soon!', es: 'Este pueblo aún no está listo. ¡Vuelva pronto!' },
  choisirVillage: { fr: 'Choisissez votre village', en: 'Choose your village', es: 'Elija su pueblo' },
  bientot: { fr: 'Bientôt', en: 'Coming soon', es: 'Próximamente' },
  retourVillages: { fr: '← Villages', en: '← Villages', es: '← Pueblos' },
  demo: { fr: 'Démo (test)', en: 'Demo (test)', es: 'Demo (prueba)' },
  vousEtesA: { fr: 'Vous êtes à {d}', en: 'You are {d} away', es: 'Está a {d}' },
  activerLocalisation: { fr: 'Activez la localisation pour voir la distance.', en: 'Turn on location to see the distance.', es: 'Active la ubicación para ver la distancia.' },
  rendezVousLieu: { fr: 'Rendez-vous : {l}', en: 'Meeting point: {l}', es: 'Punto de encuentro: {l}' },
  arriveParking: { fr: '✓ Vous êtes arrivés : {l}. Touchez « Commencer ».', en: '✓ You have arrived: {l}. Tap “Start”.', es: '✓ Ha llegado: {l}. Toque «Empezar».' },
  itineraire: { fr: '🧭 Itinéraire', en: '🧭 Directions', es: '🧭 Cómo llegar' },
  ouvrirAvec: { fr: 'Ouvrir avec :', en: 'Open with:', es: 'Abrir con:' },
  plansApple: { fr: 'Plans (Apple)', en: 'Apple Maps', es: 'Mapas (Apple)' },
  bienvenue: { fr: 'Bienvenue', en: 'Welcome', es: 'Bienvenida' },
  suivezMoi: { fr: "Bienvenue ! Suivez-moi jusqu'au point rouge.", en: 'Welcome! Follow me to the red dot.', es: '¡Bienvenidos! Síganme hasta el punto rojo.' },
  devantPanneau: { fr: 'Je suis devant le panneau', en: 'I am in front of the sign', es: 'Estoy delante del panel' },
  revoirBienvenue: { fr: 'Revoir la bienvenue', en: 'Watch the welcome again', es: 'Volver a ver la bienvenida' },
  revoirVideo: { fr: 'Revoir : {n}', en: 'Watch again: {n}', es: 'Volver a ver: {n}' },
  parcours: { fr: 'Parcours {n}', en: 'Route {n}', es: 'Recorrido {n}' },
  choisirParcours: { fr: "Votre parcours (donné par l'organisateur)", en: 'Your route (given by the organiser)', es: 'Su recorrido (indicado por el organizador)' },
  parcoursVide: { fr: 'Choisissez votre parcours.', en: 'Choose your route.', es: 'Elija su recorrido.' },
  prochaine: { fr: 'Prochaine destination : {n}', en: 'Next destination: {n}', es: 'Próximo destino: {n}' },
  carnet: { fr: '📜 Carnet', en: '📜 Notebook', es: '📜 Cuaderno' },
  fragmentsTrouves: { fr: 'Fragments trouvés : {n}/{t}', en: 'Fragments found: {n}/{t}', es: 'Fragmentos encontrados: {n}/{t}' },
  manqueUn: { fr: 'Il vous manque 1 fragment.', en: 'You are missing 1 fragment.', es: 'Le falta 1 fragmento.' },
  manquent: { fr: 'Il vous manque {n} fragments.', en: 'You are missing {n} fragments.', es: 'Le faltan {n} fragmentos.' },
};

const DEBUG = new URLSearchParams(location.search).get('debug') === '1';
const $ = id => document.getElementById(id);

let langue = 'fr';
let ep = null;          // épisode chargé (null sur l'accueil des villages)
let slugEpisode = null;
let urlEpisode = null;
let urlPhotos = null;
let S = null;           // état de la partie (sauvegardé)
let etatHorsLigne = null;
let diagnostics = [];

// ---------- Petits outils ----------
function t(cle, vars) {
  let s = UI[cle][langue];
  for (const k in vars || {}) s = s.replace('{' + k + '}', vars[k]);
  return s;
}
function L(o) { return o ? (o[langue] || o.fr || '') : ''; }
function el(tag, props, ...enfants) {
  const n = document.createElement(tag);
  for (const k in props || {}) {
    if (k === 'class') n.className = props[k];
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), props[k]);
    else if (k in n) n[k] = props[k];
    else n.setAttribute(k, props[k]);
  }
  for (const e of enfants) if (e !== null && e !== undefined) n.append(e);
  return n;
}
function bouton(texte, action, classe) {
  return el('button', { type: 'button', class: 'bouton ' + (classe || ''), onclick: action }, texte);
}
function lire(cle) { try { return JSON.parse(localStorage.getItem(cle)); } catch (e) { return null; } }
function ecrire(cle, v) { try { localStorage.setItem(cle, JSON.stringify(v)); } catch (e) { /* stockage bloqué */ } }
function effacer(cle) { try { localStorage.removeItem(cle); } catch (e) { /* stockage bloqué */ } }
function cleSauvegarde() { return 'petrocores_partie_' + ep.id; }
function sauver() { if (S) ecrire(cleSauvegarde(), S); }

function toast(texte, ms) {
  const n = $('toast');
  n.textContent = texte;
  n.hidden = false;
  clearTimeout(toast.minuteur);
  toast.minuteur = setTimeout(() => { n.hidden = true; }, ms || 3000);
}
function normaliser(s) {
  return String(s).toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
function hashCode(s) {
  let h = 5381;
  for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  return h.toString(36);
}
function urlPhoto(nom) { return new URL(nom, urlPhotos).href; }
function dureeTexte(sec) {
  sec = Math.round(sec);
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? m + ' ' + t('min') + ' ' + s + ' s' : m + ' ' + t('min');
}
function chronoTexte(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
  const mm = h ? String(m).padStart(2, '0') : m;
  return (h ? h + ':' : '') + mm + ':' + String(s).padStart(2, '0');
}
function secondesJeu() { return (((S.fin || Date.now()) - S.debut) / 1000) + S.penalite; }
function penaliteIndice() { return ep.penalites && ep.penalites.indice_s !== undefined ? ep.penalites.indice_s : PENALITE_INDICE_S; }
function penaliteSolution() { return ep.penalites && ep.penalites.solution_s !== undefined ? ep.penalites.solution_s : PENALITE_SOLUTION_S; }

// ---------- Étapes et variantes ----------
function aDesCoordonnees(e) { return typeof e.lat === 'number' && typeof e.lon === 'number'; }
function varianteSelonHeure(base) {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const enMinutes = h => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
  const ouverte = v => (!v.heures || (minutes >= enMinutes(v.heures[0]) && minutes < enMinutes(v.heures[1])))
    && (!v.jours || v.jours.includes(now.getDay()));
  return base.variantes.find(ouverte) || base.variantes[base.variantes.length - 1];
}
function resoudre(i) {
  const base = ep.etapes[i];
  if (!base.variantes) return base;
  const v = base.variantes.find(x => x.id === S.variantes[i]);
  return v ? Object.assign({}, base, v) : base;
}
function etapeCourante() {
  if (S.phase === 'final') {
    const f = ep.final;
    return {
      nom: UI.enigmeFinale, question: f.question, recit: f.recit, photo: f.photo, indices: f.indices,
      type: f.type || 'code', choix: f.choix, reponses: f.reponses || [f.reponse]
    };
  }
  return resoudre(S.idx);
}
function cleEtape() { return S.phase === 'final' ? 'final' : String(S.idx); }

// Ordre des étapes de l'équipe (indices dans ep.etapes) : "depart" commun, puis les "stations" de son "parcours".
// Sans "parcours" dans l'épisode : toutes les étapes dans l'ordre du fichier.
function indexEtape(id) { return ep.etapes.findIndex(e => String(e.id) === String(id)); }
function calculerOrdre(choix) {
  if (!ep.parcours) return ep.etapes.map((_, i) => i);
  const stations = ep.stations || {};
  const ids = (ep.depart || []).concat(...(ep.parcours[choix] || []).map(s => stations[s] || []));
  return ids.map(indexEtape).filter(i => i >= 0);
}
// Sauvegardes d'avant les parcours : ordre linéaire.
function completerEtat() {
  if (!S.ordre) { S.ordre = ep.etapes.map((_, i) => i); S.rang = S.idx; }
  if (!S.vues) S.vues = [];
}

function commencerJeu() {
  S.debut = Date.now();   // le chrono part au début du jeu, après la bienvenue
  entrerRang(0);
}
function entrerRang(r) {
  S.rang = r;
  entrerEtape(S.ordre[r]);
}
function entrerEtape(i) {
  S.idx = i;
  const base = ep.etapes[i];
  if (base.variantes && !S.variantes[i]) {
    if (base.selection === 'heure') S.variantes[i] = varianteSelonHeure(base).id;
    else { S.phase = 'variante'; sauver(); afficher(); return; }
  }
  apresVariante();
}
function apresVariante() {
  const e = resoudre(S.idx);
  if (e.deverrouillage !== 'reponse' && aDesCoordonnees(e)) { S.phase = 'trajet'; sauver(); afficher(); }
  else ouvrirEnigme();
}
// Vidéo de l'étape : champ "video", ou "intro_video" pour la 1re étape de l'équipe.
function videoEtape(i) {
  const e = resoudre(i);
  return e.video || (i === S.ordre[0] && ep.intro_video) || null;
}
// À l'arrivée sur une étape : sa vidéo (une seule fois), puis le récit et la question.
function ouvrirEnigme() {
  S.phase = 'enigme';
  const video = videoEtape(S.idx);
  const nouvelle = video && !S.vues.includes(video);
  if (nouvelle) S.vues.push(video);
  sauver();
  if (nouvelle) jouerVideo(video, afficher); else afficher();
}
function etapeSuivante() {
  if (S.rang + 1 < S.ordre.length) entrerRang(S.rang + 1);
  else if (ep.final) { S.phase = 'final'; sauver(); afficher(); }
  else terminer();
}

// ---------- Fragments : une case par fragment du parcours, rangée selon "position" ----------
function casesFragments() {
  const cases = S.ordre.map(i => ({ i, e: resoudre(i) })).filter(x => x.e.fragment !== undefined && x.e.fragment !== null);
  cases.sort((a, b) => (a.e.position || 99) - (b.e.position || 99));
  return cases.map(x => S.fragments[x.i]);   // undefined : pas encore trouvé
}
function fragmentsManquants() { return casesFragments().filter(f => f === undefined).length; }
function reussir() {
  if (S.phase === 'final') { terminer(); return; }
  const e = resoudre(S.idx);
  if (e.fragment !== undefined && e.fragment !== null) S.fragments[S.idx] = String(e.fragment);
  S.phase = 'apres';
  sauver();
  afficher();
}
function terminer() {
  S.fin = Date.now();
  S.phase = 'fin';
  sauver();
  effacer('petrocores_en_cours');
  arreterEveil();
  afficher();
}

// ---------- Réponses ----------
// 07/11 : tolérance aux petites fautes (« le rissonnage », « les rissonnages », « chapelle du Cheylar »…).
// Les nombres restent exacts (codes, années). Mots courts (< 5 lettres) : exacts. Sinon 1 faute, 2 au-delà de 8 lettres.
const MOTS_VIDES = new Set(['le', 'la', 'les', 'l', 'un', 'une', 'des', 'de', 'du', 'd', 'au', 'aux', 'the', 'a', 'an', 'of', 'el', 'los', 'las', 'lo', 'del', 'saint', 'st', 'san', 'chapelle', 'chapel', 'capilla', 'famille', 'family', 'familia']);
function motsUtiles(s) {
  return normaliser(s).split(' ').filter(m => m && !MOTS_VIDES.has(m)).map(m => m.length > 4 ? m.replace(/[sx]$/, '') : m);
}
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function motProche(saisi, attendu) {
  if (saisi === attendu) return true;
  if (/^\d+$/.test(attendu) || attendu.length < 5) return false;
  return distance(saisi, attendu) <= (attendu.length > 8 ? 2 : 1);
}
function bonneReponse(e, saisie) {
  const r = (e.reponses || []).map(normaliser);
  const n = normaliser(saisie);
  if (r.includes(n)) return true;
  if (!n || /^\d+$/.test(n)) return false;           // un nombre faux reste faux
  const saisis = motsUtiles(saisie);
  if (!saisis.length) return false;
  return (e.reponses || []).some(rep => {
    const attendus = motsUtiles(rep);
    if (!attendus.length || /^\d+$/.test(attendus.join(''))) return false;
    // chaque mot attendu doit se retrouver (à une petite faute près) dans la réponse du joueur
    return attendus.every(a => saisis.some(m => motProche(m, a)));
  });
}
function choixEstBon(e, c) {
  const noms = [c.id, c.fr, c.en, c.es].filter(x => x !== undefined).map(normaliser);
  return (e.reponses || []).map(normaliser).some(r => noms.includes(r));
}
function texteSolution(e) {
  if (e.type === 'choix' && e.choix) {
    const c = e.choix.find(x => choixEstBon(e, x));
    if (c) return L(c);
  }
  return (e.reponses || [])[0] || '';
}

// ---------- GPS ----------
let idWatch = null, pos = null, gpsErreur = null, dernierFixBon = 0, debutTrajet = 0;
let fixes = [], lisse = null, confirmations = 0, imprecisDepuis = 0, presDepuis = 0;

function enTrajet() { return !!S && (S.phase === 'trajet' || S.phase === 'bienvenue'); }
// Lieu visé : l'étape en cours, ou le panneau de la vidéo de bienvenue (rayon et précision plus stricts).
function cible() {
  if (S.phase !== 'bienvenue') return resoudre(S.idx);
  const b = ep.bienvenue_lieu;
  return Object.assign({ nom: UI.bienvenue, consigne_trajet: UI.suivezMoi }, b, {
    rayon_m: b.rayon_m || RAYON_BIENVENUE, precision_m: b.precision_m || ACCURACY_BIENVENUE, panneau: true
  });
}
function precisionVoulue(c) { return c.precision_m || ACCURACY_DECLENCHE; }

function distanceM(a, b) {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function demarrerGps() {
  debutTrajet = dernierFixBon = Date.now();
  gpsErreur = null;
  oublierFixes();
  if (!navigator.geolocation) { gpsErreur = 'absent'; majTrajet(); return; }
  if (idWatch !== null) return;
  idWatch = navigator.geolocation.watchPosition(
    p => surPosition({ lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy, ts: p.timestamp }),
    err => { gpsErreur = err.code === 1 ? 'refuse' : null; majTrajet(); },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
  );
}
function oublierFixes() {
  fixes = [];
  lisse = null;
  confirmations = 0;
  presDepuis = 0;
}
function positionLissee() {
  const recents = fixes.filter(f => fixes[fixes.length - 1].ts - f.ts < LISSAGE_AGE_MS);
  const poids = f => 1 / Math.max(f.acc, 1) ** 2;
  const total = recents.reduce((s, f) => s + poids(f), 0);
  return {
    lat: recents.reduce((s, f) => s + f.lat * poids(f), 0) / total,
    lon: recents.reduce((s, f) => s + f.lon * poids(f), 0) / total
  };
}
function arreterGps() {
  if (idWatch !== null) navigator.geolocation.clearWatch(idWatch);
  idWatch = null;
}
function surPosition(p) {
  if (p.ts === undefined) p.ts = Date.now();
  const nouvelle = !pos || p.ts !== pos.ts;
  pos = p;
  gpsErreur = null;
  if (p.acc <= ACCURACY_EXACTE) imprecisDepuis = 0;
  else if (!imprecisDepuis) imprecisDepuis = Date.now();
  const e = enTrajet() ? cible() : null;
  if (e && nouvelle && p.acc <= precisionVoulue(e)) {
    dernierFixBon = Date.now();
    fixes = fixes.concat(p).slice(-LISSAGE_NB);
    lisse = positionLissee();
    confirmations = distanceM(lisse, e) <= (e.rayon_m || RAYON_DEFAUT) ? confirmations + 1 : 0;
    if (confirmations >= CONFIRMATIONS) { arrivee(); return; }
  }
  majTrajet();
}
function arrivee() {
  arreterGps();
  oublierFixes();
  if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
  if (S.phase === 'bienvenue') voirBienvenue(); else ouvrirEnigme();
}
function majTrajet() {
  if (!enTrajet() || !$('distance')) return;
  const e = cible();
  const precise = pos && pos.acc <= precisionVoulue(e);
  const utilisable = pos && pos.acc <= ACCURACY_MAX;
  const brute = pos ? distanceM(pos, e) : null;
  $('distance').textContent = utilisable ? (precise ? '' : '≈ ') + Math.round(brute) + ' m' : '… m';
  $('gps').textContent = gpsErreur === 'refuse' ? t('gpsRefuse')
    : gpsErreur === 'absent' ? t('gpsAbsent')
    : !pos ? t('gpsAttente')
    : t(precise ? 'gpsOk' : 'gpsFaible', { n: Math.round(pos.acc) });
  const now = Date.now();
  $('gps-exact').hidden = !(imprecisDepuis && now - imprecisDepuis > EXACTE_ATTENTE_MS);
  const sansPrecision = now - dernierFixBon > GPS_MUET_MS && (!utilisable || brute <= SECOURS_DISTANCE_M);
  // Panneau de bienvenue : rayon de 5 m difficile à atteindre près des murs → secours après 15 s à moins de 15 m.
  if (e.panneau && utilisable && brute <= SECOURS_PANNEAU_M) { if (!presDepuis) presDepuis = now; }
  else presDepuis = 0;
  const panneauBloque = presDepuis && now - presDepuis > SECOURS_PANNEAU_MS;
  $('secours').hidden = !(BOUTON_PANNEAU_TOUJOURS || DEBUG || gpsErreur || sansPrecision || panneauBloque || now - debutTrajet > TRAJET_LONG_MS);
  if (DEBUG) {
    const m = d => d === null ? '-' : d.toFixed(1) + ' m';
    $('debug-gps').textContent = 'acc ' + (pos ? m(pos.acc) : '-') + ' (≤ ' + precisionVoulue(e) + ') | brute ' + m(brute)
      + ' | lissée ' + m(lisse ? distanceM(lisse, e) : null)
      + ' | conf ' + confirmations + '/' + CONFIRMATIONS + ' | rayon ' + (e.rayon_m || RAYON_DEFAUT) + ' m';
  }
  dessinerCarte();
}

// ---------- Mini-carte (projection avec correction cos(lat)) ----------
function dessinerCarte() {
  const c = $('carte');
  if (!c) return;
  const ratio = window.devicePixelRatio || 1;
  const W = c.clientWidth, H = c.clientHeight;
  if (c.width !== Math.round(W * ratio)) { c.width = Math.round(W * ratio); c.height = Math.round(H * ratio); }
  const g = c.getContext('2d');
  g.setTransform(ratio, 0, 0, ratio, 0, 0);
  g.clearRect(0, 0, W, H);

  const vise = cible();
  const faites = [];
  if (S.phase !== 'bienvenue') {
    for (let r = 0; r < S.rang; r++) { const e = resoudre(S.ordre[r]); if (aDesCoordonnees(e)) faites.push({ e, n: r + 1 }); }
  }
  const pts = [vise].concat(faites.map(f => f.e));
  if (pos) pts.push(pos);

  const lat0 = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const k = Math.cos(lat0 * Math.PI / 180);
  const xs = pts.map(p => p.lon * k), ys = pts.map(p => p.lat);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const marge = 34;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 0.0006);
  const echelle = Math.min(W - 2 * marge, H - 2 * marge) / span;
  const X = p => W / 2 + (p.lon * k - cx) * echelle;
  const Y = p => H / 2 - (p.lat - cy) * echelle;
  const pxParM = echelle / 111320;

  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = 'bold 12px Georgia, serif';

  for (const f of faites) {
    g.fillStyle = '#6b6355';
    g.beginPath(); g.arc(X(f.e), Y(f.e), 10, 0, 7); g.fill();
    g.fillStyle = '#fff';
    g.fillText(f.n, X(f.e), Y(f.e));
  }
  if (pos) {
    g.strokeStyle = '#8c2f23';
    g.lineWidth = 2;
    g.setLineDash([7, 6]);
    g.beginPath(); g.moveTo(X(pos), Y(pos)); g.lineTo(X(vise), Y(vise)); g.stroke();
    g.setLineDash([]);
  }
  g.fillStyle = '#8c2f23';
  g.beginPath(); g.arc(X(vise), Y(vise), 13, 0, 7); g.fill();
  g.fillStyle = '#fff';
  g.fillText(S.phase === 'bienvenue' ? '★' : S.rang + 1, X(vise), Y(vise));
  g.fillStyle = 'rgba(140,47,35,.15)';
  g.strokeStyle = '#8c2f23';
  g.lineWidth = 2;
  g.beginPath(); g.arc(X(vise), Y(vise), (vise.rayon_m || RAYON_DEFAUT) * pxParM, 0, 7); g.fill(); g.stroke();

  if (pos) {
    g.fillStyle = 'rgba(38,99,178,.15)';
    g.beginPath(); g.arc(X(pos), Y(pos), pos.acc * pxParM, 0, 7); g.fill();
    g.fillStyle = '#2663b2';
    g.strokeStyle = '#fff';
    g.lineWidth = 2;
    g.beginPath(); g.arc(X(pos), Y(pos), 8, 0, 7); g.fill(); g.stroke();
  }
  g.fillStyle = '#6b6355';
  g.fillText('N ↑', W - 22, 16);
}

// ---------- Voix ----------
let voixDebloquee = false, lectureId = 0, voixPretes = null;

function preparerVoix() {
  if (!window.speechSynthesis || speechSynthesis.getVoices().length) return;
  voixPretes = new Promise(ok => {
    speechSynthesis.addEventListener('voiceschanged', ok, { once: true });
    setTimeout(ok, VOIX_ATTENTE_MS);
  }).then(() => { voixPretes = null; });
}

function debloquerVoix() {
  if (voixDebloquee || !window.speechSynthesis) return;
  voixDebloquee = true;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  speechSynthesis.speak(u);
}
// Choix de voix recopié de Sentia (pickVoice) : 1) code régional exact (en-US, es-ES),
// 2) sinon même langue de base ; bonus aux voix installées et de qualité.
function choisirVoix() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const want = VOIX_LANG[langue].toLowerCase();
  const base = langue.toLowerCase();
  const score = v => {
    const vl = (v.lang || '').toLowerCase().replace('_', '-');
    let s = 0;
    if (vl === want) s += 100;
    else if (vl.startsWith(base)) s += 40;
    else return -1;
    if (v.localService) s += 10;
    if (/google|natural|enhanced|premium|siri/i.test(v.name)) s += 8;
    return s;
  };
  let best = null, bestS = -1;
  voices.forEach(v => { const s = score(v); if (s > bestS) { bestS = s; best = v; } });
  return bestS >= 0 ? best : null;
}
function nomVoix() {
  const v = window.speechSynthesis && choisirVoix();
  return 'Voix : ' + (v ? v.name + ' ' + v.lang : 'aucune pour ' + VOIX_LANG[langue]);
}
function majDebugVoix() { const n = $('debug-voix'); if (n) n.textContent = nomVoix(); }
// Texte à lire : seulement dans la langue choisie, jamais le français en repli (sinon « accent français »).
function aLire(o) { return o ? o[langue] || '' : ''; }
function arreterVoix() {
  lectureId++;
  if (window.speechSynthesis) speechSynthesis.cancel();
}
let lectureEnCours = null;   // garde une référence (sinon Chrome peut « oublier » la phrase en cours)
function parler(textes) {
  arreterVoix();
  if (!window.speechSynthesis) return;
  if (lieuSilencieux()) return;
  const texte = textes.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  if (!texte) { if (DEBUG) toast('Rien à lire en ' + langue.toUpperCase() + " (texte absent de l'épisode)"); return; }
  // 06/11 : comme Sentia, UNE seule lecture, lancée tout de suite dans le geste du joueur
  // (plus d'attente des voix ni de découpage en phrases : sur téléphone, iOS refusait la lecture différée).
  majDebugVoix();
  try { speechSynthesis.resume(); } catch (e) { /* iOS après une vidéo : moteur parfois en pause */ }
  const u = new SpeechSynthesisUtterance(texte);
  u.lang = VOIX_LANG[langue];
  u.rate = VOIX_VITESSE;
  u.pitch = VOIX_HAUTEUR;
  const voix = choisirVoix();
  if (voix) u.voice = voix;
  u.onerror = e => { if (DEBUG) toast('Voix : erreur ' + (e.error || '')); };
  lectureEnCours = u;
  speechSynthesis.speak(u);
}
// 07/11 : étapes marquées "silence": true dans l'épisode (intérieur de l'église) → aucune voix.
function lieuSilencieux() {
  try { return !!(S && S.phase !== 'final' && ep.etapes[S.idx] && resoudre(S.idx).silence); } catch (e) { return false; }
}
function parlerAuto(textes) { if (S && S.voix && !finIntro) parler(textes); }
function surveillerLecture(bouton) {
  setTimeout(() => {
    const parle = window.speechSynthesis && speechSynthesis.speaking;
    if (bouton.isConnected && !parle) bouton.classList.add('clignote');
  }, LECTURE_ATTENTE_MS);
}

// ---------- Écran allumé ----------
let verrouEcran = null, eveilVoulu = false;

async function demanderEveil() {
  eveilVoulu = true;
  if (!('wakeLock' in navigator) || verrouEcran) return;
  try {
    verrouEcran = await navigator.wakeLock.request('screen');
    verrouEcran.addEventListener('release', () => { verrouEcran = null; });
  } catch (e) { /* refus : le jeu continue */ }
}
function arreterEveil() {
  eveilVoulu = false;
  if (verrouEcran) verrouEcran.release();
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && eveilVoulu) demanderEveil();
});

// ---------- Couches (photo, confirmation) : le bouton retour Android les ferme ----------
function ouvrirCouche(contenu, surClic) {
  const c = $('couche');
  c.replaceChildren(contenu);
  c.onclick = surClic || null;
  c.hidden = false;
  history.pushState({ couche: 1 }, '');
}
function fermerCouche() { if (!$('couche').hidden) history.back(); }
window.addEventListener('popstate', () => {
  $('couche').hidden = true;
  if (finIntro) finIntro();
});

// ---------- Vidéos (bienvenue, intro, vidéo d'étape) ----------
// iPhone : le son ne démarre qu'après un toucher, d'où l'écran « Touchez pour commencer ».
// Chemin avec {lang} : une vidéo par langue (voix dans la vidéo) ; si elle manque, version fr.
// Sous-titres à côté de la vidéo : x.mp4 → x.fr.vtt / x.en.vtt / x.es.vtt ; vidéo par langue : x.fr.mp4 → x.fr.vtt
// (et x.fr.en.vtt pour sous-titrer en anglais la version fr de secours).
let finIntro = null;

function urlMedia(chemin) { return new URL(chemin, location.href).href; }

function jouerVideo(chemin, suite) {
  arreterVoix();
  const zone = $('intro');
  const modele = chemin.includes('{lang}');
  let fermee = false, lancee = false, vl = modele ? langue : null;
  const fermer = () => {
    if (fermee) return;
    fermee = true;
    history.back();
  };
  const video = el('video', { preload: 'auto', playsInline: true, onended: fermer });
  video.setAttribute('playsinline', '');
  const montrerSousTitres = () => {
    const pistes = [...video.querySelectorAll('track')];
    const voulue = pistes.find(p => p.srclang === langue && !p.dataset.ko) || pistes.find(p => p.srclang === 'fr' && !p.dataset.ko);
    for (const p of pistes) p.track.mode = p === voulue ? 'showing' : 'disabled';
  };
  const toucher = bouton(t('toucherCommencer'), () => {
    toucher.hidden = true;
    lancee = true;
    montrerSousTitres();
    video.play().catch(() => { toucher.hidden = false; });
  }, 'toucher');
  toucher.className = 'toucher';
  const charger = () => {
    const src = urlMedia(modele ? chemin.replace('{lang}', vl) : chemin);
    const vtt = l => src.replace(/\.mp4$/i, '.' + l + '.vtt');
    const pistes = !SOUS_TITRES_VIDEOS ? []
      : !modele ? LANGUES.map(l => [l, vtt(l)])
      : vl === langue ? [[langue, src.replace(/\.mp4$/i, '.vtt')]]
      : [[langue, vtt(langue)], ['fr', src.replace(/\.mp4$/i, '.vtt')]];
    video.replaceChildren(...pistes.map(([l, s]) => {
      const p = el('track', { kind: 'subtitles', srclang: l, label: l.toUpperCase(), src: s });
      p.addEventListener('error', () => { p.dataset.ko = '1'; montrerSousTitres(); });
      return p;
    }));
    video.src = src;
    montrerSousTitres();
    if (lancee) video.play().catch(() => { toucher.hidden = false; });
  };
  video.addEventListener('error', () => {
    if (modele && vl !== 'fr') { vl = 'fr'; charger(); } else fermer();   // vidéo introuvable : on passe
  });
  video.addEventListener('loadedmetadata', montrerSousTitres);
  // 07/11 : « Passer » demande 2 touchers (évite qu'un enfant saute la vidéo par erreur) ; « Revoir » la relance du début.
  let armer = null;
  const passer = el('button', { type: 'button', class: 'passer', onclick: () => {
    if (armer) { clearTimeout(armer); fermer(); return; }
    passer.textContent = t('passerConfirme');
    armer = setTimeout(() => { armer = null; passer.textContent = t('passer'); }, 3000);
  } }, t('passer'));
  const revoir = el('button', { type: 'button', class: 'passer revoir', onclick: () => {
    lancee = true; toucher.hidden = true; montrerSousTitres();
    video.currentTime = 0; video.play().catch(() => { toucher.hidden = false; });
  } }, t('revoirDebut'));
  charger();
  zone.replaceChildren(video, toucher, revoir, passer);
  zone.hidden = false;
  finIntro = () => {
    finIntro = null;
    video.pause();
    zone.hidden = true;
    zone.replaceChildren();
    if (suite) suite();
  };
  history.pushState({ intro: 1 }, '');
}
function nomVideo(chemin) {
  if (chemin === ep.bienvenue_video) return t('revoirBienvenue');
  const i = ep.etapes.findIndex((_, k) => videoEtape(k) === chemin);
  return i >= 0 ? t('revoirVideo', { n: L(resoudre(i).nom) }) : t('revoirIntro');
}
// Le menu se ferme (retour arrière) avant d'ouvrir la suite, pour garder l'historique propre.
function apresMenu(action) {
  return () => {
    window.addEventListener('popstate', action, { once: true });
    fermerCouche();
  };
}
// 07/11 (tests) : reprendre la partie à n'importe quelle étape de son parcours (ex. après une remise à zéro, depuis l'église).
function ouvrirAllerEtape() {
  ouvrirCouche(el('div', { class: 'cadre' },
    el('h2', {}, t('allerEtape')),
    ...S.ordre.map((i, r) => bouton((r + 1) + '. ' + L(resoudre(i).nom), apresMenu(() => {
      if (!S.debut || S.phase === 'bienvenue') S.debut = Date.now();
      entrerRang(r);
    }), r === S.rang ? '' : 'second')),
    bouton(t('fermer'), fermerCouche, 'leger')));
}
function ouvrirMenu() {
  ouvrirCouche(el('div', { class: 'cadre' },
    bouton(t('carnet'), apresMenu(ouvrirCarnet)),
    ...(BOUTON_PANNEAU_TOUJOURS ? [bouton(t('allerEtape'), apresMenu(ouvrirAllerEtape), 'second')] : []),
    ...S.vues.map(chemin => bouton(nomVideo(chemin), apresMenu(() => jouerVideo(chemin)), 'second')),
    bouton(t('fermer'), fermerCouche, 'leger')));
}
function ouvrirCarnet() {
  ouvrirCouche(el('div', { class: 'cadre' },
    el('h2', {}, t('carnet')),
    zoneFragments() || el('p', { class: 'discret' }, t('fragmentsTrouves', { n: 0, t: 0 })),
    bouton(t('fermer'), fermerCouche, 'leger')));
}

function ouvrirPhoto(src) {
  ouvrirCouche(el('img', { class: 'plein', src, alt: '' }), fermerCouche);
}
function confirmer(texte, action) {
  ouvrirCouche(el('div', { class: 'cadre' },
    el('p', {}, texte),
    el('div', { class: 'ligne' },
      bouton(t('non'), fermerCouche, 'second'),
      bouton(t('oui'), () => { fermerCouche(); action(); }))));
}
function imagePhoto(nom) {
  const src = urlPhoto(nom);
  return el('img', { class: 'photo', src, alt: '', onclick: () => ouvrirPhoto(src) });
}

// ---------- Écrans ----------
function afficher() {
  if (!ep) { afficherVillages(); return; }
  const v = $('vue');
  arreterVoix();
  const enJeu = S && S.phase && S.phase !== 'fin' && afficher.jeu;
  $('barre').hidden = !afficher.jeu;
  majBarre();
  if (enTrajet() && enJeu) demarrerGps(); else arreterGps();
  v.replaceChildren();
  if (!afficher.jeu) ecranAccueil(v);
  else if (S.phase === 'son') commencerJeu();   // ancien écran « Test du son »
  else if (S.phase === 'variante') ecranVariante(v);
  else if (enTrajet()) ecranTrajet(v);
  else if (S.phase === 'enigme' || S.phase === 'final') ecranEnigme(v);
  else if (S.phase === 'apres') ecranApres(v);
  else ecranFin(v);
  window.scrollTo(0, 0);
}
function majBarre() {
  document.documentElement.lang = langue;
  $('b-langue').textContent = langue.toUpperCase();
  if (!S) return;
  $('b-voix').textContent = S.voix ? '🔊' : '🔇';
  $('b-etape').textContent = (S.parcours ? S.parcours + ' · ' : '') + (S.phase === 'final' ? t('enigmeFinale')
    : S.phase === 'fin' ? S.equipe
    : S.phase === 'bienvenue' ? t('bienvenue')
    : t('etape') + ' ' + (S.rang + 1) + '/' + S.ordre.length);
  majChrono();
}
function majChrono() { if (S) $('b-chrono').textContent = chronoTexte(secondesJeu()); }

function choixLangue() {
  return el('div', { class: 'ligne' }, ...LANGUES.map(l =>
    el('button', { type: 'button', class: 'langue' + (l === langue ? ' actif' : ''), onclick: () => changerLangue(l) }, l.toUpperCase())));
}
function changerLangue(l) {
  langue = l;
  ecrire('petrocores_langue', l);
  afficher();
}
function nouvelEtat(equipe, parcours) {
  return {
    equipe, parcours, ordre: calculerOrdre(parcours), rang: 0, debut: Date.now(), fin: null, penalite: 0, idx: 0, phase: null,
    voix: true, variantes: {}, indices: {}, solutions: {}, fragments: {}, vues: []
  };
}
// Après l'écran d'équipe : trajet jusqu'au panneau de la vidéo de bienvenue, ou la vidéo tout de suite, ou le jeu.
function debutPartie() {
  if (ep.bienvenue_lieu) { S.phase = 'bienvenue'; sauver(); afficher(); }
  else if (ep.bienvenue_video) voirBienvenue();
  else commencerJeu();
}
function voirBienvenue() {
  if (!ep.bienvenue_video) { commencerJeu(); return; }
  if (!S.vues.includes(ep.bienvenue_video)) S.vues.push(ep.bienvenue_video);
  sauver();
  jouerVideo(ep.bienvenue_video, commencerJeu);
}
function lancerPartie() {
  ecrire('petrocores_en_cours', { slug: slugEpisode, titre: ep.titre });
  debloquerVoix();
  demanderEveil();
  afficher.jeu = true;
}

function ecranAccueil(v) {
  v.append(
    el('a', { class: 'bouton leger retour', href: lienPage() }, t('retourVillages')),
    el('img', { class: 'cachet', src: 'icons/blason.png', alt: '' }),
    el('h1', {}, L(ep.titre)),
    choixLangue(),
    el('p', { class: 'texte', style: 'margin-top:14px' }, L(ep.intro)));
  if (ep.duree_min) v.append(el('p', { class: 'discret' }, t('duree') + ' : ' + ep.duree_min + ' ' + t('min')));
  if (ep.avertissement) v.append(el('div', { class: 'encart alerte texte' }, L(ep.avertissement)));

  const enCours = S && S.phase;
  if (enCours) {
    v.append(el('p', { class: 'discret' }, S.equipe + ' · ' + chronoTexte(secondesJeu())));
    v.append(bouton(t('reprendre'), () => {
      if (S.phase === 'fin') { afficher.jeu = true; afficher(); return; }
      lancerPartie();
      afficher();
    }));
    v.append(bouton(t('nouvelle'), () => confirmer(t('nouvelleConfirme'), () => {
      effacer(cleSauvegarde());
      effacer('petrocores_en_cours');
      S = null;
      afficher();
    }), 'second'));
  } else {
    const nom = el('input', { class: 'champ', id: 'nom', type: 'text', maxLength: 30, autocomplete: 'off' });
    const code = el('input', { class: 'champ', id: 'code', type: 'text', autocomplete: 'off', autocapitalize: 'characters' });
    const msg = el('div', { class: 'message' });
    v.append(el('label', { htmlFor: 'nom' }, t('equipe')), nom);
    if (ep.codes_equipe) v.append(el('label', { htmlFor: 'code' }, t('code')), code);
    // Parcours : l'organisateur dit à chaque groupe sa lettre (ordre différent des stations).
    let parcours = null;
    if (ep.parcours) {
      const choix = Object.keys(ep.parcours).map(k => el('button', {
        type: 'button', class: 'langue', 'data-k': k, onclick: () => {
          parcours = k;
          for (const b of choix) b.classList.toggle('actif', b.dataset.k === k);
        }
      }, t('parcours', { n: k })));
      v.append(el('label', {}, t('choisirParcours')), el('div', { class: 'ligne parcours' }, ...choix));
    }
    v.append(msg, bouton(t('commencer'), () => {
      const equipe = nom.value.trim();
      if (!equipe) { msg.textContent = t('equipeVide'); return; }
      if (ep.codes_equipe && !ep.codes_equipe.includes(hashCode(code.value.trim().toUpperCase()))) {
        msg.textContent = t('codeFaux');
        return;
      }
      if (ep.parcours && !parcours) { msg.textContent = t('parcoursVide'); return; }
      S = nouvelEtat(equipe, parcours);
      lancerPartie();
      debutPartie();
    }));
  }
  if (etatHorsLigne) v.append(el('p', { class: 'discret', id: 'horsligne' }, etatHorsLigne()));
  else v.append(el('p', { class: 'discret', id: 'horsligne' }));
  ajouterBoutonInstaller(v);
  if (DEBUG) { v.append(el('p', { id: 'debug-voix', class: 'discret' })); majDebugVoix(); }
  if (DEBUG && diagnostics.length) v.append(el('div', { id: 'diagnostic' }, diagnostics.join('\n')));
}

function ecranVariante(v) {
  const base = ep.etapes[S.idx];
  v.append(el('h2', {}, L(base.nom)), el('p', {}, t('choisirVariante')));
  for (const x of base.variantes) {
    v.append(bouton(L(x.label), () => {
      S.variantes[S.idx] = x.id;
      apresVariante();
    }, 'second'));
  }
}

function ecranTrajet(v) {
  const e = cible();
  v.append(el('h2', {}, L(e.nom)));
  v.append(el('p', { class: 'texte' }, L(e.consigne_trajet) || t('rendezVous')));
  v.append(el('canvas', { id: 'carte' }));
  v.append(el('p', { id: 'distance' }), el('p', { id: 'gps', class: 'discret' }));
  if (DEBUG) v.append(el('p', { id: 'debug-gps' }));
  v.append(el('div', { id: 'gps-exact', class: 'encart alerte', hidden: true }, t('gpsExact')));
  if (e.photo) v.append(imagePhoto(e.photo));
  // 07/11 : bouton sous la photo du panneau ; toujours visible tant que BOUTON_PANNEAU_TOUJOURS = true.
  v.append(bouton(t(BOUTON_PANNEAU_TOUJOURS || e.panneau ? 'devantPanneau' : 'arrive'), arrivee, 'second'));
  v.lastChild.id = 'secours';
  v.lastChild.hidden = !BOUTON_PANNEAU_TOUJOURS;
  v.append(el('p', { class: 'discret' }, t('ecranAllume')));
  majTrajet();
}

function ecranEnigme(v) {
  const e = etapeCourante();
  const type = e.type || 'texte';
  v.append(el('h2', {}, S.phase === 'final' ? t('enigmeFinale') : L(e.nom)));
  if (S.phase === 'final') {
    v.append(zoneFragments());
    // Finale verrouillée tant qu'il manque un fragment.
    const n = fragmentsManquants();
    if (n) { v.append(el('div', { class: 'encart alerte' }, n === 1 ? t('manqueUn') : t('manquent', { n }))); return; }
  }
  if (e.photo) v.append(imagePhoto(e.photo));
  // 07/11 : revoir la vidéo de cette étape directement (en plus du menu ☰).
  const videoIci = S.phase !== 'final' ? videoEtape(S.idx) : null;
  if (videoIci && S.vues.includes(videoIci)) v.append(bouton(t('revoirVideo', { n: L(e.nom) }), () => jouerVideo(videoIci), 'leger'));
  if (e.recit) v.append(el('p', { class: 'texte' }, L(e.recit)));
  const textes = [aLire(e.recit), aLire(e.question)];
  const ecoute = bouton(ep.narrateur ? t('ecouterNarrateur', { n: L(ep.narrateur) }) : t('ecouter'), () => {
    ecoute.classList.remove('clignote');
    parler(textes);
  }, 'ecouter');
  v.append(ecoute);
  if (e.silence && S.phase !== 'final') { ecoute.hidden = true; v.append(el('div', { class: 'encart' }, t('silence'))); }
  if (DEBUG) { v.append(el('p', { id: 'debug-voix', class: 'discret' })); majDebugVoix(); }
  if (e.question) v.append(el('p', { class: 'question texte' }, L(e.question)));

  const msg = el('div', { class: 'message' });
  const faux = () => {
    msg.textContent = t('faux');
    v.classList.remove('secoue');
    void v.offsetWidth;
    v.classList.add('secoue');
    if (navigator.vibrate) navigator.vibrate(200);
  };

  if (!e.question) {
    v.append(bouton(t('continuer'), reussir));
  } else if (type === 'choix') {
    for (const c of e.choix || []) {
      v.append(bouton(L(c), () => { choixEstBon(e, c) ? reussir() : faux(); }, 'choix'));
    }
    v.append(msg);
  } else if (type === 'photo' && !(e.reponses || []).length) {
    if (e.photo_repere) v.append(imagePhoto(e.photo_repere));
    v.append(bouton(t('trouve'), reussir));
  } else {
    if (type === 'photo' && e.photo_repere) v.append(imagePhoto(e.photo_repere));
    const chiffres = type === 'code' && (e.reponses || []).every(r => /^\d+$/.test(r));
    const champ = el('input', {
      class: 'champ', type: 'text', autocomplete: 'off', placeholder: t('votreReponse'),
      inputMode: chiffres ? 'numeric' : 'text'
    });
    champ.setAttribute('autocorrect', 'off');
    champ.setAttribute('spellcheck', 'false');
    const valider = () => { bonneReponse(e, champ.value) ? reussir() : faux(); };
    champ.addEventListener('keydown', ev => { if (ev.key === 'Enter') valider(); });
    v.append(champ, msg, bouton(t('valider'), valider));
  }
  if (e.question) zoneIndices(v, e);
  parlerAuto(textes);
  surveillerLecture(ecoute);
}

function zoneIndices(v, e) {
  const cle = cleEtape();
  const indices = e.indices || [];
  const liste = el('div');
  const actions = el('div');
  v.append(liste, actions);

  const maj = () => {
    const vus = S.indices[cle] || 0;
    liste.replaceChildren(...indices.slice(0, vus).map(x => el('div', { class: 'indice texte' }, L(x))));
    actions.replaceChildren();
    if (vus < indices.length) {
      const p = dureeTexte(penaliteIndice());
      actions.append(bouton(t('indice', { n: vus + 1, t: indices.length, p }), () => {
        S.indices[cle] = vus + 1;
        S.penalite += penaliteIndice();
        sauver();
        majChrono();
        maj();
        parler([aLire(indices[vus])]);
      }, 'leger'));
    } else if ((e.reponses || []).length) {
      const p = dureeTexte(penaliteSolution());
      actions.append(bouton(t('solution', { p }), () => confirmer(t('solutionConfirme', { p }), () => {
        S.solutions[cle] = texteSolution(e);
        S.penalite += penaliteSolution();
        reussir();
      }), 'leger'));
    }
  };
  maj();
}

function zoneFragments() {
  const cases = casesFragments();
  if (!cases.length) return null;
  const trouves = cases.filter(f => f !== undefined).length;
  return el('div', {},
    el('p', { class: 'discret' }, t('fragmentsTrouves', { n: trouves, t: cases.length })),
    el('div', { class: 'fragments' }, ...cases.map(f =>
      el('span', { class: 'fragment' + (f === undefined ? ' vide' : '') }, f === undefined ? '?' : f))));
}

function ecranApres(v) {
  const e = resoudre(S.idx);
  const solution = S.solutions[S.idx];
  v.append(el('h2', {}, solution !== undefined ? t('etaitReponse', { r: solution }) : t('bravo')));
  if (e.apres) v.append(el('p', { class: 'texte' }, L(e.apres)));
  if (S.fragments[S.idx] !== undefined) {
    v.append(el('p', { class: 'discret' }, t('fragment')));
    v.append(el('div', { class: 'fragments' }, el('span', { class: 'fragment' }, S.fragments[S.idx])));
  }
  const textes = [aLire(e.apres)];
  if (!lieuSilencieux()) v.append(bouton(t('ecouter'), () => parler(textes), 'leger'));
  const dernier = S.rang + 1 >= S.ordre.length;
  if (!dernier) {
    // Nouveau lieu (pas une question enchaînée au même endroit) : on annonce la destination.
    const suite = resoudre(S.ordre[S.rang + 1]);
    if (suite.deverrouillage !== 'reponse' && aDesCoordonnees(suite)) v.append(el('p', { class: 'question' }, t('prochaine', { n: L(suite.nom) })));
  }
  v.append(bouton(t(!dernier ? 'suivante' : ep.final ? 'versFinale' : 'terminer'), etapeSuivante));
  parlerAuto(textes);
}

function ecranFin(v) {
  const f = ep.final || {};
  v.append(el('h1', {}, t('victoire')));
  if (S.solutions.final !== undefined) v.append(el('p', { class: 'discret' }, t('etaitReponse', { r: S.solutions.final })));
  v.append(el('p', { class: 'discret', style: 'text-align:center;margin:0' }, S.equipe + ' · ' + t('tempsFinal')));
  v.append(el('p', { class: 'temps' }, chronoTexte(secondesJeu())));
  if (S.penalite) v.append(el('p', { class: 'discret', style: 'text-align:center' }, t('dontPenalites', { p: dureeTexte(S.penalite) })));
  const sceau = sceauGagne(S.penalite);
  v.append(el('div', { class: 'carte-fin' },
    el('img', { class: 'image-fin', src: f.image ? urlPhoto(f.image) : 'fragment-carte.svg', alt: '' }),
    el('img', { class: 'sceau-fin', src: 'sceaux/sceau_' + sceau + '.png', alt: t('sceau_' + sceau) })));
  v.append(el('p', { class: 'nom-sceau' }, t('sceau_' + sceau)));
  v.append(el('p', { class: 'texte' }, t('sceauMot_' + sceau)));
  if (f.texte) v.append(el('p', { class: 'texte' }, L(f.texte)));
  const textes = [UI['sceauMot_' + sceau][langue] || UI['sceauMot_' + sceau].fr, aLire(f.texte)];
  v.append(bouton(t('ecouter'), () => parler(textes), 'leger'));
  v.append(bouton(t('nouvelle'), () => confirmer(t('nouvelleConfirme'), () => {
    effacer(cleSauvegarde());
    effacer('petrocores_en_cours');
    S = null;
    afficher.jeu = false;
    afficher();
  }), 'second'));
  parlerAuto(textes);
}

// ---------- Accueil : un bouton par village (villages.json), distance au parking, itinéraire ----------
const RAYON_PARKING = 25;   // m : si villages.json ne donne pas "rayon_m" pour le point d'arrivée
let villages = [], villageOuvert = null;
let idWatchVillage = null, posVillage = null, gpsVillageErreur = false, confirmVillage = 0, arriveVillage = false;

function lienPage(slug) {
  const p = new URLSearchParams();
  if (slug) p.set('episode', slug);
  if (DEBUG) p.set('debug', '1');
  return 'index.html' + (p.toString() ? '?' + p : '');
}
function texteDistance(m) {
  if (m < 1000) return (m < 100 ? Math.round(m) : Math.round(m / 10) * 10) + ' m';
  const dec = m < 100000 ? 1 : 0;
  return (m / 1000).toLocaleString(VOIX_LANG[langue], { minimumFractionDigits: dec, maximumFractionDigits: dec }) + ' km';
}
function afficherVillages() {
  const v = $('vue');
  document.documentElement.lang = langue;
  $('barre').hidden = true;
  v.replaceChildren();
  if (villageOuvert) ecranVillage(v, villageOuvert); else ecranVillages(v);
  window.scrollTo(0, 0);
}
function ecranVillages(v) {
  v.append(el('img', { class: 'cachet', src: 'icons/blason.png', alt: '' }), choixLangue(),
    el('h1', { class: 'centre' }, t('choisirVillage')));
  const enCours = lire('petrocores_en_cours');
  if (enCours && enCours.slug) v.append(el('a', { class: 'bouton', href: lienPage(enCours.slug) }, t('reprendre') + ' · ' + L(enCours.titre)));
  for (const x of villages) {
    const ouvert = x.statut === 'ouvert';
    v.append(el('button', { type: 'button', class: 'bouton village' + (ouvert ? '' : ' bientot'), disabled: !ouvert, onclick: () => ouvrirVillage(x) },
      L(x.nom), ouvert ? null : el('span', { class: 'mention' }, t('bientot'))));
  }
  if (DEBUG) v.append(el('a', { class: 'bouton leger', href: lienPage('demo') }, t('demo')));
  ajouterBoutonInstaller(v);
}
function ouvrirVillage(x) {
  villageOuvert = x;
  history.pushState({ village: x.id }, '');   // le bouton retour Android revient à la liste
  afficherVillages();
  demarrerGpsVillage();
}
function fermerVillage() {
  arreterGpsVillage();
  villageOuvert = null;
  afficherVillages();
}
window.addEventListener('popstate', ev => {
  if (!ep && villageOuvert && !(ev.state && ev.state.village)) fermerVillage();
});
function ecranVillage(v, x) {
  const a = x.arrivee;
  v.append(bouton(t('retourVillages'), () => history.back(), 'leger retour'), el('h1', {}, L(x.nom)));
  if (a) {
    v.append(el('p', { id: 'distance', class: 'village' }), el('p', { id: 'gps', class: 'discret' }));
    if (DEBUG) v.append(el('p', { id: 'debug-gps' }));
    v.append(el('div', { id: 'arrive-parking', class: 'encart', hidden: true }, t('arriveParking', { l: L(a.label) })));
    if (a.label) v.append(el('p', {}, t('rendezVousLieu', { l: L(a.label) })));
  }
  if (x.duree_min) v.append(el('p', { class: 'discret' }, t('duree') + ' : ' + x.duree_min + ' ' + t('min')));
  if (a) v.append(bouton(t('itineraire'), () => ouvrirItineraire(a), 'second'));
  if (x.statut === 'ouvert' && x.episode) v.append(el('a', { class: 'bouton', href: lienPage(x.episode) }, t('commencer')));
  majVillage();
}
function ouvrirItineraire(a) {
  const ll = a.lat + ',' + a.lon;
  const applis = [
    ['Google Maps', 'https://www.google.com/maps/dir/?api=1&destination=' + ll + '&travelmode=driving'],
    [t('plansApple'), 'https://maps.apple.com/?daddr=' + ll + '&dirflg=d'],
    ['Waze', 'https://waze.com/ul?ll=' + ll + '&navigate=yes']
  ];
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) applis.unshift(applis.splice(1, 1)[0]);
  ouvrirCouche(el('div', { class: 'cadre' },
    el('p', {}, t('ouvrirAvec')),
    ...applis.map(([nom, url]) => el('a', { class: 'bouton second', href: url, target: '_blank', rel: 'noopener' }, nom)),
    bouton(t('fermer'), fermerCouche, 'leger')));
}
function demarrerGpsVillage() {
  posVillage = null;
  gpsVillageErreur = false;
  confirmVillage = 0;
  arriveVillage = false;
  if (!navigator.geolocation) { gpsVillageErreur = true; majVillage(); return; }
  if (idWatchVillage !== null) return;
  idWatchVillage = navigator.geolocation.watchPosition(
    p => surPositionVillage({ lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy, ts: p.timestamp }),
    err => { if (err.code === 1) { gpsVillageErreur = true; majVillage(); } },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
  );
}
function arreterGpsVillage() {
  if (idWatchVillage !== null) navigator.geolocation.clearWatch(idWatchVillage);
  idWatchVillage = null;
}
function surPositionVillage(p) {
  if (p.ts === undefined) p.ts = Date.now();
  const nouvelle = !posVillage || p.ts !== posVillage.ts;
  posVillage = p;
  gpsVillageErreur = false;
  const a = villageOuvert && villageOuvert.arrivee;
  if (a && nouvelle && p.acc <= ACCURACY_DECLENCHE) {
    confirmVillage = distanceM(p, a) <= (a.rayon_m || RAYON_PARKING) ? confirmVillage + 1 : 0;
    if (confirmVillage >= CONFIRMATIONS && !arriveVillage) {
      arriveVillage = true;
      if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
    }
  }
  majVillage();
}
function majVillage() {
  const a = villageOuvert && villageOuvert.arrivee;
  if (!a || !$('distance')) return;
  const p = posVillage;
  const brute = p ? distanceM(p, a) : null;
  // Loin du parking, une position imprécise suffit : ± 300 m ne change rien à « 12,4 km ».
  const utilisable = p && (p.acc <= ACCURACY_MAX || p.acc * 10 <= brute);
  const approx = p && p.acc > ACCURACY_DECLENCHE && brute < 1000;
  $('distance').textContent = gpsVillageErreur ? '' : utilisable ? t('vousEtesA', { d: (approx ? '≈ ' : '') + texteDistance(brute) }) : '… m';
  $('gps').textContent = gpsVillageErreur ? t('activerLocalisation')
    : !p ? t('gpsAttente')
    : t(p.acc <= ACCURACY_DECLENCHE ? 'gpsOk' : 'gpsFaible', { n: Math.round(p.acc) });
  $('arrive-parking').hidden = !arriveVillage;
  if (DEBUG) {
    $('debug-gps').textContent = 'acc ' + (p ? p.acc.toFixed(1) + ' m' : '-') + ' | brute ' + (p ? brute.toFixed(1) + ' m' : '-')
      + ' | conf ' + confirmVillage + '/' + CONFIRMATIONS + ' | rayon ' + (a.rayon_m || RAYON_PARKING) + ' m';
  }
}
async function demarrerVillages() {
  try {
    const r = await fetch('villages.json');
    if (!r.ok) throw new Error(r.status);
    villages = (await r.json()).villages || [];
  } catch (e) {
    $('vue').replaceChildren(el('p', {}, t('erreurVillages')));
    return;
  }
  afficherVillages();
  if (DEBUG) window.PETRO = { surPositionVillage };
}

// ---------- Installation ----------
let invitationInstall = null;
window.addEventListener('beforeinstallprompt', ev => {
  ev.preventDefault();
  invitationInstall = ev;
  if (!afficher.jeu && ep) afficher();
});
function ajouterBoutonInstaller(v) {
  const installee = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (installee || !(invitationInstall || ios)) return;
  v.append(bouton(t('installer'), () => {
    if (invitationInstall) invitationInstall.prompt();
    else toast(t('installerIos'), 8000);
  }, 'leger'));
}

// ---------- Hors-ligne : met l'épisode et ses photos en cache dès le chargement ----------
function listePhotos() {
  const noms = new Set();
  const ajouter = o => { if (o.photo) noms.add(o.photo); if (o.photo_repere) noms.add(o.photo_repere); };
  for (const e of ep.etapes) {
    ajouter(e);
    for (const v of e.variantes || []) ajouter(v);
  }
  if (ep.final) { ajouter(ep.final); if (ep.final.image) noms.add(ep.final.image); }
  return [...noms].map(urlPhoto);
}
async function preparerHorsLigne() {
  if (!window.caches) return;
  const cache = await caches.open(CACHE_MEDIA);
  const urls = [urlEpisode.href, ...listePhotos()];
  let faits = 0, echecs = [];
  const maj = () => {
    etatHorsLigne = () => faits < urls.length ? t('horsLigne') + ' : ' + faits + '/' + urls.length
      : echecs.length ? t('horsLigneKo') : t('horsLignePret');
    const n = $('horsligne');
    if (n) n.textContent = etatHorsLigne();
  };
  maj();
  for (const u of urls) {
    try {
      if (u === urlEpisode.href || !(await cache.match(u))) await cache.add(u);
    } catch (e) {
      if (!(await cache.match(u))) { echecs.push(u); diagnostics.push('Fichier introuvable : ' + u); }
    }
    faits++;
    maj();
  }
}

// ---------- Vérification de l'épisode (console, et écran avec ?debug=1) ----------
function verifierEpisode() {
  const pb = [];
  const trilingue = (o, ou) => {
    if (!o) return;
    for (const l of LANGUES) if (!o[l]) pb.push(ou + ' : texte « ' + l + ' » manquant');
  };
  const verifierEtape = (e, ou) => {
    for (const c of ['nom', 'consigne_trajet', 'recit', 'question', 'apres']) trilingue(e[c], ou + '.' + c);
    (e.indices || []).forEach((x, i) => trilingue(x, ou + '.indices[' + i + ']'));
    (e.choix || []).forEach((x, i) => trilingue(x, ou + '.choix[' + i + ']'));
    if (e.type && !['texte', 'code', 'choix', 'photo'].includes(e.type)) pb.push(ou + ' : type inconnu « ' + e.type + ' »');
    if (e.type === 'choix' && !(e.choix || []).some(c => choixEstBon(e, c))) pb.push(ou + ' : aucun choix ne correspond aux réponses');
  };
  trilingue(ep.titre, 'titre');
  trilingue(ep.intro, 'intro');
  trilingue(ep.narrateur, 'narrateur');
  trilingue(ep.avertissement, 'avertissement');
  ep.etapes.forEach((e, i) => {
    const ou = 'etape ' + (i + 1);
    verifierEtape(e, ou);
    (e.variantes || []).forEach(v => {
      trilingue(v.label, ou + '/' + v.id + '.label');
      verifierEtape(v, ou + '/' + v.id);
    });
    if (e.selection === 'heure' && !e.variantes) pb.push(ou + ' : selection « heure » sans variantes');
  });
  if (ep.bienvenue_lieu) {
    trilingue(ep.bienvenue_lieu.nom, 'bienvenue_lieu.nom');
    trilingue(ep.bienvenue_lieu.consigne_trajet, 'bienvenue_lieu.consigne_trajet');
    if (!aDesCoordonnees(ep.bienvenue_lieu)) pb.push('bienvenue_lieu : lat/lon manquants');
  }
  if (ep.parcours) {
    const stations = ep.stations || {};
    for (const id of ep.depart || []) if (indexEtape(id) < 0) pb.push('depart : étape « ' + id + ' » inconnue');
    for (const s in stations) for (const id of stations[s]) if (indexEtape(id) < 0) pb.push('stations.' + s + ' : étape « ' + id + ' » inconnue');
    for (const k in ep.parcours) for (const s of ep.parcours[k]) if (!stations[s]) pb.push('parcours ' + k + ' : station « ' + s + ' » inconnue');
  }
  const positions = ep.etapes.map(e => e.position).filter(x => x !== undefined);
  if (new Set(positions).size !== positions.length) pb.push('fragments : deux étapes ont la même « position »');
  if (ep.final) {
    for (const c of ['question', 'recit', 'texte']) trilingue(ep.final[c], 'final.' + c);
    (ep.final.indices || []).forEach((x, i) => trilingue(x, 'final.indices[' + i + ']'));
    if (!ep.final.reponse && !ep.final.reponses) pb.push('final : réponse manquante');
  }
  pb.forEach(p => console.warn('[episode] ' + p));
  return pb;
}

// ---------- Démarrage ----------
async function demarrer() {
  const params = new URLSearchParams(location.search);
  const memoire = lire('petrocores_langue');
  const nav = (navigator.language || 'fr').slice(0, 2);
  langue = LANGUES.includes(memoire) ? memoire : LANGUES.includes(nav) ? nav : 'fr';
  $('vue').append(el('p', {}, t('chargement')));

  $('b-langue').addEventListener('click', () => {
    changerLangue(LANGUES[(LANGUES.indexOf(langue) + 1) % LANGUES.length]);
  });
  $('b-voix').addEventListener('click', () => {
    S.voix = !S.voix;
    if (!S.voix) arreterVoix();
    sauver();
    majBarre();
  });
  $('b-menu').addEventListener('click', ouvrirMenu);
  preparerVoix();
  document.addEventListener('click', debloquerVoix, { once: true });
  document.addEventListener('touchend', debloquerVoix, { once: true });
  window.addEventListener('resize', dessinerCarte);
  setInterval(() => {
    if (!S || !afficher.jeu) return;
    if (S.phase !== 'fin') majChrono();
    if (enTrajet()) majTrajet();
  }, 1000);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

  const slug = params.get('episode');
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) { demarrerVillages(); return; }
  slugEpisode = slug;
  urlEpisode = new URL(slug === 'demo' ? 'demo-episode.json' : '../scenario/' + slug + '/episode.json', location.href);
  try {
    const r = await fetch(urlEpisode);
    if (!r.ok) throw new Error(r.status);
    ep = await r.json();
  } catch (e) {
    $('vue').replaceChildren(el('p', {}, t(String(e.message) === '404' ? 'episodeAbsent' : 'erreurEpisode')),
      el('a', { class: 'bouton second', href: lienPage() }, t('retourVillages')));
    return;
  }
  // "photos_dossier" se lit depuis app/, comme les vidéos ; sans ce champ : photos/ à côté de l'épisode.
  urlPhotos = ep.photos_dossier ? new URL(ep.photos_dossier, location.href) : new URL('photos/', urlEpisode);
  diagnostics = verifierEpisode();
  S = lire(cleSauvegarde());
  if (S) completerEtat();
  afficher.jeu = false;
  afficher();
  preparerHorsLigne();
  if (DEBUG) window.PETRO = { surPosition };
}
demarrer();
