// Vitrine escape-game-dordogne.fr (index.html, merci.html, cgv.html, mentions.html) — 16/11.
// Textes : VITRINE_TEXTES_16-11.md, relus le 16/11 soir et le 18/11 (CONSIGNES_16-11_SOIR, CONSIGNES_TARIF_ACTIVATION_18-11, Claude chat).
// Ceux encore marqués « PROVISOIRE (Code) » sont à faire relire par Claude chat.
// Le prix, la validité et le nombre de téléphones viennent du serveur (/api/offre) : jamais écrits ici.
'use strict';

const T = {
  titre: { fr: "L'escape game en plein air de Saint-Geniès", en: 'The outdoor escape game of Saint-Geniès', es: 'El escape game al aire libre de Saint-Geniès' },
  accroche: {
    fr: "Octobre 1307. Le roi fait arrêter les Templiers. En fuite, Frère Aymeric a caché un secret dans ce village du Périgord noir. Téléphone en main, suivez sa trace de panneau en panneau et percez son secret.",
    en: 'October 1307. The King has the Templars arrested. On the run, Brother Aymeric hid a secret in this village of the Périgord Noir. Phone in hand, follow his trail from sign to sign and uncover his secret.',
    es: 'Octubre de 1307. El rey manda arrestar a los templarios. Huyendo, Fray Aymeric escondió un secreto en este pueblo del Périgord Negro. Móvil en mano, seguid su rastro de panel en panel y desvelad su secreto.',
  },
  acheter: { fr: 'Acheter un code — {PRIX}', en: 'Buy a code — {PRIX}', es: 'Comprar un código — {PRIX}' },
  offrir: { fr: '🎁 Offrir', en: '🎁 Give as a gift', es: '🎁 Regalar' },
  essayer: { fr: 'Essayer gratuitement', en: 'Try it for free', es: 'Probar gratis' },
  // 18/11 soir : accès des testeurs (code testeur donné par Gonzalo). PROVISOIRE (Code).
  testeur: { fr: '🐞 Mode testeur (avec un code testeur)', en: '🐞 Tester mode (with a tester code)', es: '🐞 Modo probador (con un código de probador)' },
  bientot: { fr: 'La vente en ligne ouvre très bientôt', en: 'Online sales open very soon', es: 'La venta en línea abre muy pronto' },
  bandeauTest: { fr: '🧪 MODE TEST — aucun paiement réel', en: '🧪 TEST MODE — no real payment', es: '🧪 MODO PRUEBA — ningún pago real' },

  hComment: { fr: 'Comment ça marche', en: 'How it works', es: 'Cómo funciona' },
  comment1: { fr: "Achetez votre code en ligne : il s'affiche aussitôt et arrive par email.", en: 'Buy your code online: it appears instantly and is sent by email.', es: 'Comprad vuestro código en línea: aparece al instante y llega por email.' },
  comment2: { fr: 'Rendez-vous sur le parking du lavoir de Saint-Geniès, quand vous voulez, de jour.', en: 'Meet at the wash-house car park in Saint-Geniès, whenever you like, in daylight.', es: 'Id al aparcamiento del lavadero de Saint-Geniès, cuando queráis, de día.' },
  comment3: { fr: 'Ouvrez le jeu, entrez votre code et laissez Frère Aymeric vous guider.', en: 'Open the game, enter your code and let Brother Aymeric guide you.', es: 'Abrid el juego, introducid vuestro código y dejad que Fray Aymeric os guíe.' },

  hQuetes: { fr: 'Les 3 quêtes', en: 'The 3 quests', es: 'Las 3 búsquedas' },
  // 18/11 : le code vit un seul jour (CONSIGNES_TARIF_ACTIVATION_18-11)
  quetesNote: { fr: 'Un code ouvre les trois quêtes le jour de votre venue.', en: 'One code opens all three quests on the day of your visit.', es: 'Un código abre las tres búsquedas el día de vuestra visita.' },

  hInfos: { fr: 'Infos pratiques', en: 'Practical information', es: 'Información práctica' },
  infos: {
    fr: ["En autonomie, toute l'année, de jour.", "Votre code est valable un jour : il s'active sur place à Saint-Geniès, sur 2 téléphones, jusqu'à minuit. Vous avez 12 mois pour venir jouer.", 'En français, anglais ou espagnol, avec la voix de Frère Aymeric.', "Gratuit jusqu'à l'église : essayez avant d'acheter.", 'Prévoyez un téléphone chargé et des données mobiles (vidéos et voix).', "Le village est habité : respectez les lieux, la circulation et le silence dans l'église."],
    en: ['Self-guided, all year round, in daylight.', 'Your code is valid for one day: it activates on site in Saint-Geniès, on 2 phones, until midnight. You have 12 months to come and play.', "In French, English or Spanish, with Brother Aymeric's voice.", 'Free up to the church: try before you buy.', 'Bring a charged phone with mobile data (videos and voices).', 'People live in the village: respect the places, the traffic and silence in the church.'],
    es: ['Por libre, todo el año, de día.', 'Vuestro código es válido un día: se activa allí mismo, en Saint-Geniès, en 2 móviles, hasta medianoche. Tenéis 12 meses para venir a jugar.', 'En francés, inglés o español, con la voz de Fray Aymeric.', 'Gratis hasta la iglesia: probad antes de comprar.', 'Llevad un móvil cargado y con datos móviles (vídeos y voces).', 'El pueblo está habitado: respetad los lugares, el tráfico y el silencio en la iglesia.'],
  },
  hFaq: { fr: 'Questions fréquentes', en: 'FAQ', es: 'Preguntas frecuentes' },
  faq: {
    fr: [['Combien de joueurs ?', "Autant que vous voulez par code ; l'idéal est 2 à 6 par téléphone."],
      ['Avec des enfants ?', "Oui, la quête Écuyer est faite pour ça. Les poussettes passent sur l'Écuyer ; ça monte un peu vers la chapelle."],
      ['On peut s\'arrêter et reprendre ?', 'Oui, la partie reste sur le téléphone.'],
      ['Un souci ?', 'Écrivez à contact@escape-game-dordogne.fr.']],
    en: [['How many players?', 'As many as you like per code; 2 to 6 per phone is ideal.'],
      ['With children?', 'Yes, the Squire quest is made for that. Pushchairs are fine on the Squire route; it climbs a little towards the chapel.'],
      ['Can we pause and resume?', 'Yes, the game is saved on the phone.'],
      ['A problem?', 'Write to contact@escape-game-dordogne.fr.']],
    es: [['¿Cuántos jugadores?', 'Los que queráis por código; lo ideal es de 2 a 6 por móvil.'],
      ['¿Con niños?', 'Sí, la búsqueda Escudero está hecha para ellos. Los carritos pasan en el Escudero; hay algo de cuesta hacia la capilla.'],
      ['¿Se puede parar y retomar?', 'Sí, la partida se guarda en el móvil.'],
      ['¿Algún problema?', 'Escribid a contact@escape-game-dordogne.fr.']],
  },

  // formulaire
  hAchat: { fr: 'Acheter votre code', en: 'Buy your code', es: 'Comprar vuestro código' },
  hCadeau: { fr: '🎁 Offrir la quête', en: '🎁 Give the quest as a gift', es: '🎁 Regalar la búsqueda' },
  email: { fr: 'Votre email (pour recevoir le code)', en: 'Your email (to receive the code)', es: 'Vuestro email (para recibir el código)' },
  prenom: { fr: 'Prénom du destinataire', en: "Recipient's first name", es: 'Nombre del destinatario' },
  message: { fr: 'Petit mot (facultatif)', en: 'A short message (optional)', es: 'Unas palabras (opcional)' },
  cgv: {
    fr: "J'accepte les <a href=\"cgv.html\" target=\"_blank\">conditions générales de vente</a> et je demande à recevoir mon code tout de suite : je renonce donc à mon droit de rétractation.",
    en: 'I accept the <a href="cgv.html" target="_blank">terms of sale</a> and ask to receive my code immediately: I therefore waive my right of withdrawal.',
    es: 'Acepto las <a href="cgv.html" target="_blank">condiciones generales de venta</a> y pido recibir mi código de inmediato: por lo tanto renuncio a mi derecho de desistimiento.',
  },
  payer: { fr: 'Payer {PRIX} par carte', en: 'Pay {PRIX} by card', es: 'Pagar {PRIX} con tarjeta' },
  securise: { fr: 'Paiement sécurisé par SumUp', en: 'Secure payment by SumUp', es: 'Pago seguro con SumUp' },
  // Mention légale près du prix (CONSIGNES_16-11_SOIR). EN/ES = PROVISOIRE (Code).
  tva: { fr: 'TVA non applicable, art. 293 B du CGI', en: 'VAT not applicable, art. 293 B of the French Tax Code (CGI)', es: 'IVA no aplicable, art. 293 B del CGI francés' },
  // messages d'erreur du formulaire
  errEmail: { fr: 'Vérifiez votre adresse email.', en: 'Please check your email address.', es: 'Revisad vuestra dirección de email.' },
  errCgv: { fr: 'Cochez la case pour continuer.', en: 'Please tick the box to continue.', es: 'Marcad la casilla para continuar.' },
  errPrenom: { fr: 'Indiquez le prénom du destinataire.', en: "Please enter the recipient's first name.", es: 'Indicad el nombre del destinatario.' },
  errServeur: { fr: 'Le paiement est indisponible pour le moment. Réessayez dans quelques minutes.', en: 'Payment is unavailable right now. Please try again in a few minutes.', es: 'El pago no está disponible ahora mismo. Volved a intentarlo en unos minutos.' },
  errReseau: { fr: 'Pas de connexion internet : vérifiez votre réseau et réessayez.', en: 'No internet connection: check your network and try again.', es: 'Sin conexión a internet: revisad vuestra red y volved a intentarlo.' },

  // page merci
  merci: { fr: 'Merci ! Voici votre code :', en: 'Thank you! Here is your code:', es: '¡Gracias! Aquí tenéis vuestro código:' },
  capture: { fr: "Faites une capture d'écran : il vous servira sur place.", en: 'Take a screenshot: you will need it on site.', es: 'Haced una captura de pantalla: la necesitaréis allí.' },
  parEmail: { fr: 'Il vous a aussi été envoyé par email.', en: 'It has also been sent to you by email.', es: 'También os lo hemos enviado por email.' },
  cadeauPour: { fr: '🎁 Un cadeau pour {PRENOM} : « {MESSAGE} »', en: '🎁 A gift for {PRENOM}: “{MESSAGE}”', es: '🎁 Un regalo para {PRENOM}: «{MESSAGE}»' },
  lancer: { fr: '⚔ Lancer le jeu', en: '⚔ Start the game', es: '⚔ Empezar el juego' },
  verif: { fr: 'Nous vérifions votre paiement…', en: 'Checking your payment…', es: 'Comprobando vuestro pago…' },
  echec: { fr: "Le paiement n'a pas abouti. Aucun montant n'a été débité.", en: 'The payment did not go through. You have not been charged.', es: 'El pago no se ha completado. No se ha cobrado nada.' },
  reessayer: { fr: 'Réessayer', en: 'Try again', es: 'Reintentar' },
  valable: { fr: "À activer sur place avant le {DATE} · {APPAREILS} téléphones · valable jusqu'à minuit le jour de l'activation.", en: 'To activate on site before {DATE} · {APPAREILS} phones · valid until midnight on the day of activation.', es: 'A activar allí antes del {DATE} · {APPAREILS} móviles · válido hasta medianoche el día de la activación.' },
  recevoirEmail: { fr: '📧 Recevoir par email (bientôt)', en: '📧 Receive by email (coming soon)', es: '📧 Recibir por email (pronto)' },
  lent: { fr: "La confirmation prend plus de temps que prévu. Gardez cette page ouverte, ou écrivez à contact@escape-game-dordogne.fr avec ce numéro de commande : {ID}", en: 'Confirmation is taking longer than expected. Keep this page open, or write to contact@escape-game-dordogne.fr with this order number: {ID}', es: 'La confirmación tarda más de lo previsto. Dejad esta página abierta o escribid a contact@escape-game-dordogne.fr con este número de pedido: {ID}' },
  probleme: { fr: 'Un problème est survenu avec ce paiement. Écrivez à contact@escape-game-dordogne.fr avec ce numéro de commande : {ID}', en: 'Something went wrong with this payment. Write to contact@escape-game-dordogne.fr with this order number: {ID}', es: 'Ha habido un problema con este pago. Escribid a contact@escape-game-dordogne.fr con este número de pedido: {ID}' },
  inconnue: { fr: 'Commande introuvable.', en: 'Order not found.', es: 'Pedido no encontrado.' },
  accueil: { fr: "← Retour à l'accueil", en: '← Back to home page', es: '← Volver a la página de inicio' },

  // pied de page / pages légales
  mentions: { fr: 'Mentions légales', en: 'Legal notice', es: 'Aviso legal' },
  cgvLien: { fr: 'Conditions de vente', en: 'Terms of sale', es: 'Condiciones de venta' },
  enFrancais: { fr: '', en: 'This legal text is available in French only.', es: 'Este texto legal solo está disponible en francés.' },
};

// Le vrai site parle au serveur en ligne ; en local, « ?serveur=http://localhost:8787 » vise le serveur de test.
const PARAMS = new URLSearchParams(location.search);
const LOCAL = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
// (en local, l'adresse est retenue pour le retour de paiement sur merci.html)
if (LOCAL && PARAMS.get('serveur')) try { sessionStorage.setItem('petrocores_serveur', PARAMS.get('serveur')); } catch { /* rien */ }
const SERVEUR = (LOCAL && (PARAMS.get('serveur') || (() => { try { return sessionStorage.getItem('petrocores_serveur'); } catch { return null; } })()))
  || 'https://petrocores.petrocores.workers.dev';
// 17/11 : le serveur envoie le code par email (boîte OVH contact@) : la page merci l'annonce.
const EMAIL_AUTO = true;

const LANGUES = ['fr', 'en', 'es'];
function lire(k) { try { return localStorage.getItem(k); } catch { return null; } }
function ecrire(k, v) { try { localStorage.setItem(k, v); } catch { /* navigation privée */ } }
let lang = PARAMS.get('lang') || lire('petrocores_vitrine_lang') || (navigator.language || 'fr').slice(0, 2);
if (!LANGUES.includes(lang)) lang = 'fr';

const t = (cle, vars) => {
  let s = (T[cle] && (T[cle][lang] ?? T[cle].fr)) ?? cle;
  if (typeof s === 'string' && vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
};
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LOCALE = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES' };

let OFFRE = null;
function prixTexte() {
  if (!OFFRE) return '…';
  return new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency: OFFRE.devise || 'EUR' }).format(OFFRE.montant);
}
function validiteTexte() {
  const j = (OFFRE && OFFRE.validite_jours) || 365;
  const mots = { an: { fr: ['an', 'ans'], en: ['year', 'years'], es: ['año', 'años'] }, mois: { fr: ['mois', 'mois'], en: ['month', 'months'], es: ['mes', 'meses'] }, jour: { fr: ['jour', 'jours'], en: ['day', 'days'], es: ['día', 'días'] } };
  const [n, u] = j % 365 === 0 ? [j / 365, 'an'] : j % 30 === 0 ? [j / 30, 'mois'] : [j, 'jour'];
  return n + ' ' + mots[u][lang][n > 1 ? 1 : 0];
}
const appareils = () => (OFFRE && OFFRE.appareils) || 2;

// Remplit tous les éléments [data-t] ; [data-html] = texte avec lien.
function traduire() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-t]').forEach(e => { e.textContent = t(e.dataset.t, { PRIX: prixTexte(), VALIDITE: validiteTexte(), APPAREILS: appareils() }); });
  document.querySelectorAll('[data-html]').forEach(e => { e.innerHTML = t(e.dataset.html); });
  document.querySelectorAll('.langues button').forEach(b => b.classList.toggle('actif', b.dataset.lang === lang));
  const fr = $('#en-francais');
  if (fr) { fr.textContent = t('enFrancais'); fr.hidden = lang === 'fr'; }
  if (window.rendrePage) window.rendrePage();
}
function boutonsLangue() {
  const l = $('.langues');
  if (!l) return;
  l.innerHTML = LANGUES.map(x => '<button type="button" data-lang="' + x + '">' + x.toUpperCase() + '</button>').join('');
  l.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    lang = b.dataset.lang; ecrire('petrocores_vitrine_lang', lang); traduire();
  });
}

async function chargerOffre() {
  try {
    const r = await fetch(SERVEUR + '/api/offre');
    OFFRE = await r.json();
  } catch { OFFRE = null; }
  const b = $('#bandeau-test');
  // 18/11 : bandeau « mode test » seulement quand la vente est ouverte (vente fermée = rien à tester pour le public).
  if (b) b.hidden = !(OFFRE && OFFRE.test && OFFRE.vente);
}

// ---------- page d'accueil ----------
let EPISODE = null;
function pageAccueil() {
  window.rendrePage = () => {
    const ouvert = !!(OFFRE && OFFRE.vente);
    for (const id of ['#b-acheter', '#b-offrir', '#b-acheter-2']) {
      const b = $(id); if (!b) continue;
      b.disabled = !ouvert;
      if (!ouvert && id !== '#b-offrir') b.textContent = t('bientot');
    }
    $('#b-offrir').hidden = !ouvert;
    $('#comment').innerHTML = ['comment1', 'comment2', 'comment3'].map(k => '<li>' + esc(t(k)) + '</li>').join('');
    $('#infos').innerHTML = t('infos').map(s => '<li>' + esc(s.split('{APPAREILS}').join(appareils())) + '</li>').join('');
    $('#faq').innerHTML = t('faq').map(([q, r]) => '<dt>' + esc(q) + '</dt><dd>' + esc(r) + '</dd>').join('');
    const n = EPISODE && EPISODE.niveaux;
    $('#quetes').innerHTML = n ? ['ecuyer', 'chevalier', 'grandmaitre'].filter(k => n[k]).map(k => {
      const x = n[k], L = o => (o && (o[lang] || o.fr)) || '';
      return '<div class="quete"><h3>' + esc(L(x.titre)) + '</h3><div class="sous">' + esc(L(x.sous)) + '</div><p>' + esc(L(x.desc)) + '</p></div>';
    }).join('') : '';
    if (!$('#achat').hidden) majFormulaire();
  };
  $('#b-acheter').addEventListener('click', () => ouvrirAchat(false));
  $('#b-acheter-2').addEventListener('click', () => ouvrirAchat(false));
  $('#b-offrir').addEventListener('click', () => ouvrirAchat(true));
  $('#achat').addEventListener('click', e => { if (e.target.id === 'achat' || e.target.closest('.fermer')) fermerAchat(); });
  $('#f-achat').addEventListener('submit', payer);
  // Les niveaux (titres, durées, descriptions) sont lus dans l'épisode publié : une seule source.
  fetch('scenario/saint-genies/episode.json').then(r => r.json()).then(e => { EPISODE = e; traduire(); }).catch(() => {});
  if (location.hash === '#acheter') setTimeout(() => ouvrirAchat(false), 300);
}
let CADEAU = false;
function ouvrirAchat(cadeau) {
  if (!OFFRE || !OFFRE.vente) return;
  CADEAU = cadeau;
  $('#achat').hidden = false;
  $('#erreur').textContent = '';
  majFormulaire();
  setTimeout(() => $('#f-email').focus(), 50);
}
function majFormulaire() {
  $('#h-achat').textContent = t(CADEAU ? 'hCadeau' : 'hAchat');
  $('#z-cadeau').hidden = !CADEAU;
  $('#b-payer').textContent = t('payer', { PRIX: prixTexte() });
}
function fermerAchat() { $('#achat').hidden = true; }
async function payer(ev) {
  ev.preventDefault();
  const err = $('#erreur'), b = $('#b-payer');
  const email = $('#f-email').value.trim(), prenom = $('#f-prenom').value.trim();
  err.textContent = '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = t('errEmail'); return; }
  if (CADEAU && !prenom) { err.textContent = t('errPrenom'); return; }
  if (!$('#f-cgv').checked) { err.textContent = t('errCgv'); return; }
  b.disabled = true;
  try {
    const r = await fetch(SERVEUR + '/api/achat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, cgv: true, cadeau: CADEAU, prenom: CADEAU ? prenom : '', message: CADEAU ? $('#f-message').value.trim() : '', lang }),
    });
    const d = await r.json();
    if (d.ok && d.url) { location.href = d.url; return; }
    err.textContent = t({ email: 'errEmail', cgv: 'errCgv', prenom: 'errPrenom' }[d.erreur] || 'errServeur');
  } catch { err.textContent = t('errReseau'); }
  b.disabled = false;
}

// ---------- page merci ----------
function pageMerci() {
  const id = PARAMS.get('commande') || '';
  let etat = null, debut = Date.now(), langImposee = !!PARAMS.get('lang') || !!lire('petrocores_vitrine_lang');
  window.rendrePage = () => {
    const z = $('#resultat');
    if (!etat) { z.innerHTML = '<p class="attente">' + esc(t('verif')) + '</p>'; return; }
    if (etat.statut === 'paye' && etat.code) {
      const date = etat.expire ? new Date(Number(etat.expire)).toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      const lien = 'app/?episode=' + encodeURIComponent(etat.episode || 'saint-genies') + '&code=' + encodeURIComponent(etat.code);
      const mot = etat.message ? t('cadeauPour', { PRENOM: etat.prenom, MESSAGE: etat.message }) : t('cadeauPour', { PRENOM: etat.prenom, MESSAGE: '' }).replace(/\s*[:：]?\s*[«“]\s*[»”]\s*$/, '');
      z.innerHTML = (etat.cadeau ? '<p class="cadeau">' + esc(mot) + '</p>' : '')
        + '<p><b>' + esc(t('merci')) + '</b></p><div class="code">' + esc(etat.code) + '</div><div id="qr"></div>'
        + '<p>' + esc(t('valable', { DATE: date, APPAREILS: appareils() })) + '</p>'
        + '<p class="tva">' + esc(t('tva')) + '</p>'
        + '<p>' + esc(t('capture')) + (EMAIL_AUTO ? ' ' + esc(t('parEmail')) : '') + '</p>'
        + '<div class="boutons"><a class="bouton" href="' + lien + '">' + esc(t('lancer')) + '</a>'
        + (EMAIL_AUTO ? '' : '<button class="bouton second" disabled>' + esc(t('recevoirEmail')) + '</button>') + '</div>';
      if (window.qrcode) {
        const q = window.qrcode(0, 'M'); q.addData(new URL(lien, location.href).href); q.make();
        $('#qr').innerHTML = q.createImgTag(6, 8);
      }
      return;
    }
    if (etat.statut === 'echec' || etat.statut === 'expire') {
      z.innerHTML = '<p>' + esc(t('echec')) + '</p><a class="bouton" href="./#acheter">' + esc(t('reessayer')) + '</a>';
      return;
    }
    if (etat.statut === 'inconnue') { z.innerHTML = '<p>' + esc(t('inconnue')) + '</p>'; return; }
    if (etat.statut === 'erreur' || etat.statut === 'anomalie') { z.innerHTML = '<p>' + esc(t('probleme', { ID: id })) + '</p>'; return; }
    // en attente
    z.innerHTML = '<p class="attente">' + esc(t('verif')) + '</p>' + (Date.now() - debut > 90000 ? '<p>' + esc(t('lent', { ID: id })) + '</p>' : '');
  };
  async function interroger() {
    try {
      const r = await fetch(SERVEUR + '/api/commande/' + encodeURIComponent(id));
      etat = await r.json();
      if (!langImposee && LANGUES.includes(etat.lang) && etat.lang !== lang) { lang = etat.lang; langImposee = true; traduire(); }
    } catch { /* réseau : on réessaie */ }
    window.rendrePage();
    // On continue tant que le paiement est en attente (au plus 10 minutes).
    if ((!etat || etat.statut === 'attente') && Date.now() - debut < 600000) setTimeout(interroger, Date.now() - debut < 60000 ? 2500 : 6000);
  }
  if (!id) { etat = { statut: 'inconnue' }; window.rendrePage(); return; }
  interroger();
}

// ---------- démarrage ----------
(async function () {
  boutonsLangue();
  traduire();
  await chargerOffre();
  const p = document.body.dataset.page;
  if (p === 'accueil') pageAccueil();
  if (p === 'merci') pageMerci();
  traduire();
})();
