// Pétrocores — serveur Cloudflare Workers + base D1 (liaison "DB"). Même logique que le trio Val Town de Sentia.
//   POST /api/event   : compteur anonyme envoyé par l'app (file d'attente hors-ligne côté app)
//   POST /api/verify  : vérifie un code client → épisode débloqué + clé de déchiffrement
//   /                 : page d'administration (mot de passe = secret ADMIN_PASS, jamais dans le code)
//   /api/codes, /api/toggle, /api/export.csv, /api/cle, /api/stats : réservés à l'admin (en-tête x-pass)
//   16/11 vente en ligne : GET /api/offre, POST /api/achat, GET /api/commande/ID, POST /api/sumup-webhook (publics) ;
//   /api/ventes, /api/ventes/verifier, /api/ventes.csv, /api/ventes/email, /api/mail-essai (admin)
//   17/11 email du code : envoyé par la boîte OVH contact@ (SMTP ssl0.ovh.net:465, bibliothèque worker-mailer).
//   Mot de passe = secret SMTP_PASS (tapé par Gonzalo avec « npx wrangler secret put SMTP_PASS », jamais dans le dépôt).
//   18/11 règle « jour J » (CONSIGNES_TARIF_ACTIVATION_18-11) : un code (regle = 'jour') s'active SUR PLACE (position à moins de
//   ~2 km du village) et reste valable jusqu'à minuit (Paris) ce jour-là pour tous ses téléphones (fin_jour, partagé).
//   Avant activation, « expire » = date limite pour venir jouer. regle = 'fixe' (ou vide : anciens codes) = ancien fonctionnement.
import { PAGE } from './page.js';
import { WorkerMailer } from 'worker-mailer';

const APP = 'https://escape-game-dordogne.fr/app/index.html';
// Origines autorisées à appeler l'API depuis un navigateur (l'app en ligne + les tests en local).
const ORIGINES = ['https://escape-game-dordogne.fr', 'https://www.escape-game-dordogne.fr', 'https://dordrone.github.io', 'http://localhost:8123'];
const APPAREILS_DEFAUT = 2;
// Alphabet des codes : pas de O/0, I/1, L (lisibles au comptoir et au téléphone).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const EVENEMENTS = ['lancement', 'etape', 'indice', 'solution', 'fin'];
// 15/11 : niveaux de jeu. Un code de niveau supérieur ouvre aussi les niveaux inférieurs (c'est l'app qui l'applique).
const NIVEAUX = ['ecuyer', 'chevalier', 'grandmaitre'];
const rangNiveau = n => NIVEAUX.indexOf(n);
// Codes créés avant les niveaux : ils ouvrent tout (codes de test).
const niveauCode = c => NIVEAUX.includes(c.niveau) ? c.niveau : 'grandmaitre';
// 15/11 (Gonzalo) : POUR L'INSTANT un code ouvre les 3 niveaux jusqu'à son expiration, et pas de codes promo (tarifs à décider
// après les tests en vrai). Remettre false pour que chaque code n'ouvre que son niveau, et que les promos repartent.
const UN_CODE_TOUS_NIVEAUX = true;
const REGLAGES_DEFAUT = {
  promo_active: '1', promo_jours: '180', promo_note: '',
  // 16/11 vente en ligne (provisoire, en test) : prix d'un code en euros, validité, téléphones, vente ouverte, effacement des emails.
  // 18/11 : 15 €, 2 téléphones, 365 jours pour venir jouer (le code vit ensuite un seul jour), vente FERMÉE par défaut.
  vente_prix: '15.00', vente_validite_jours: '365', vente_appareils: '2', vente_active: '0', rgpd_mois: '13',
};

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS petro_codes (
    code TEXT PRIMARY KEY,
    episode TEXT NOT NULL,
    client TEXT NOT NULL,
    canal TEXT NOT NULL,
    max_appareils INTEGER NOT NULL,
    expire INTEGER,
    note TEXT,
    actif INTEGER NOT NULL DEFAULT 1,
    cree INTEGER NOT NULL,
    active INTEGER,
    fin INTEGER NOT NULL DEFAULT 0,
    sceau TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS petro_activations (
    code TEXT NOT NULL,
    appareil TEXT NOT NULL,
    ts INTEGER NOT NULL,
    PRIMARY KEY (code, appareil)
  )`,
  `CREATE TABLE IF NOT EXISTS petro_events (
    id INTEGER PRIMARY KEY,
    ts INTEGER NOT NULL,
    ev TEXT NOT NULL,
    partie TEXT,
    episode TEXT, etape TEXT, lang TEXT, parcours TEXT,
    duree INTEGER, sceau TEXT, client TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS petro_events_ts ON petro_events (ts)`,
  `CREATE TABLE IF NOT EXISTS petro_cles (episode TEXT PRIMARY KEY, cle TEXT NOT NULL)`,
  // 15/11 : code promo donné à la fin d'un niveau (un seul par code d'origine et par niveau terminé).
  `CREATE TABLE IF NOT EXISTS petro_promos (origine TEXT NOT NULL, niveau TEXT NOT NULL, promo TEXT NOT NULL, ts INTEGER NOT NULL, PRIMARY KEY (origine, niveau))`,
  `CREATE TABLE IF NOT EXISTS petro_reglages (cle TEXT PRIMARY KEY, valeur TEXT)`,
  // 16/11 : commandes de la vente en ligne (montant en centimes ; test = 1 si passée en mode test).
  `CREATE TABLE IF NOT EXISTS petro_ventes (
    id TEXT PRIMARY KEY, ts INTEGER NOT NULL, maj INTEGER, paye INTEGER,
    email TEXT NOT NULL, montant INTEGER NOT NULL, statut TEXT NOT NULL, statut_sumup TEXT,
    checkout_id TEXT, url_paiement TEXT, transaction_code TEXT, code TEXT,
    cadeau INTEGER NOT NULL DEFAULT 0, prenom TEXT, message TEXT, lang TEXT, episode TEXT NOT NULL,
    test INTEGER NOT NULL DEFAULT 1, retour TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS petro_ventes_checkout ON petro_ventes (checkout_id)`,
];
// Colonnes ajoutées après coup (D1 ne connaît pas « ADD COLUMN IF NOT EXISTS » : erreur ignorée si elle existe déjà).
const COLONNES = [
  'ALTER TABLE petro_codes ADD COLUMN niveau TEXT',
  'ALTER TABLE petro_events ADD COLUMN niveau TEXT',
  // 17/11 : email du code (date d'envoi, ou la dernière erreur)
  'ALTER TABLE petro_ventes ADD COLUMN email_envoye INTEGER',
  'ALTER TABLE petro_ventes ADD COLUMN email_erreur TEXT',
  // 18/11 : règle d'activation ('jour' ou 'fixe') et fin du jour d'activation (minuit, heure de Paris)
  'ALTER TABLE petro_codes ADD COLUMN regle TEXT',
  'ALTER TABLE petro_codes ADD COLUMN fin_jour INTEGER',
];

let pret = false;
async function initDb(db) {
  if (pret) return;
  await db.batch(SCHEMA.map(s => db.prepare(s)));
  for (const a of COLONNES) { try { await db.prepare(a).run(); } catch { /* colonne déjà là */ } }
  pret = true;
}

function cors(req) {
  const o = req.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': ORIGINES.includes(o) ? o : ORIGINES[0],
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-pass',
    'Vary': 'Origin',
  };
}
const json = (req, data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...cors(req) } });

const admin = (req, env) => !!env.ADMIN_PASS && req.headers.get('x-pass') === env.ADMIN_PASS;
const txt = (v, n) => String(v ?? '').trim().slice(0, n);
const normCode = v => String(v ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

function prefixe(episode) {
  if (episode === '*') return 'PC';
  const p = episode.split('-').map(m => m[0] || '').join('').toUpperCase().replace(/[^A-Z]/g, '');
  return (p + 'XX').slice(0, 2);
}
function nouveauCode(episode) {
  const b = new Uint8Array(6);
  crypto.getRandomValues(b);
  const c = Array.from(b, x => ALPHABET[x % ALPHABET.length]).join('');
  return prefixe(episode) + '-' + c.slice(0, 4) + '-' + c.slice(4);
}
// Les codes sont rangés avec leurs tirets ; la saisie du joueur est comparée sans tirets ni espaces.
function trouverCode(db, saisie) {
  return db.prepare("SELECT * FROM petro_codes WHERE REPLACE(code, '-', '') = ?").bind(normCode(saisie)).first();
}

// 18/11 : centre de chaque village (parking de départ, villages.json) pour l'activation sur place.
const VILLAGES = { 'saint-genies': { lat: 44.994108, lon: 1.253759 } };
const RAYON_ACTIVATION_M = 2000;
function distanceM(a, b) {
  const R = 6371000, r = x => x * Math.PI / 180;
  const dLat = r(b.lat - a.lat), dLon = r(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// Minuit (heure de Paris, heure d'été/hiver comprise) à la fin du jour qui contient l'instant t.
function minuitParis(t) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' });
  const [y, m, d] = f.format(new Date(t)).split('-').map(Number);
  // Minuit du lendemain à Paris = 23 h ou 22 h UTC la veille (hiver / été) : on prend celui qui tombe bien sur le lendemain.
  for (const decalage of [1, 2]) {
    const x = Date.UTC(y, m - 1, d + 1, 0, 0, 0) - decalage * 3600000;
    if (f.format(new Date(x)) !== f.format(new Date(t)) && f.format(new Date(x - 1)) === f.format(new Date(t))) return x - 1;
  }
  return Date.UTC(y, m - 1, d, 22, 59, 59, 999);
}
const regleJour = c => c.regle === 'jour';

async function verifier(req, db) {
  let b;
  try { b = await req.json(); } catch { return json(req, { ok: false, raison: 'inconnu' }); }
  const appareil = txt(b.appareil, 64);
  const episode = txt(b.episode, 40);
  if (!normCode(b.code) || !appareil) return json(req, { ok: false, raison: 'inconnu' });
  const c = await trouverCode(db, b.code);
  if (!c) return json(req, { ok: false, raison: 'inconnu' });
  if (Number(c.actif) !== 1) return json(req, { ok: false, raison: 'desactive' });
  const now = Date.now();
  const jourJ = regleJour(c);
  let finJour = c.fin_jour ? Number(c.fin_jour) : null;
  // Code « jour J » déjà activé : valable jusqu'à minuit ce jour-là, pour tous ses téléphones, puis plus jamais.
  if (jourJ && finJour && now > finJour) return json(req, { ok: false, raison: 'utilise', active: c.active ?? null });
  // Pas encore activé : la date limite pour venir jouer (ou l'expiration d'un code « fixe »).
  if (!(jourJ && finJour) && c.expire && Number(c.expire) < now) return json(req, { ok: false, raison: 'expire' });
  if (c.episode !== '*' && episode && c.episode !== episode) return json(req, { ok: false, raison: 'episode' });
  const ep = c.episode === '*' ? episode : c.episode;

  const act = (await db.prepare('SELECT appareil FROM petro_activations WHERE code = ?').bind(c.code).all()).results;
  if (!act.some(r => r.appareil === appareil)) {
    if (act.length >= Number(c.max_appareils)) return json(req, { ok: false, raison: 'appareils' });
    const ops = [];
    if (jourJ && !finJour) {
      // 1re activation : seulement sur place (le code ne « brûle » pas si on le tape chez soi la veille).
      const centre = VILLAGES[ep];
      if (centre) {
        const p = b.position || {};
        const lat = Number(p.lat), lon = Number(p.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return json(req, { ok: false, raison: 'position' });
        const marge = Math.min(Math.max(Number(p.precision) || 0, 0), 1000);
        if (distanceM(centre, { lat, lon }) > RAYON_ACTIVATION_M + marge) return json(req, { ok: false, raison: 'horszone' });
      }
      finJour = minuitParis(now);
      ops.push(db.prepare('UPDATE petro_codes SET fin_jour = COALESCE(fin_jour, ?) WHERE code = ?').bind(finJour, c.code));
    }
    ops.push(
      db.prepare('INSERT OR IGNORE INTO petro_activations (code, appareil, ts) VALUES (?, ?, ?)').bind(c.code, appareil, now),
      db.prepare('UPDATE petro_codes SET active = COALESCE(active, ?) WHERE code = ?').bind(now, c.code),
      db.prepare("INSERT INTO petro_events (ts, ev, episode, client) VALUES (?, 'activation', ?, ?)").bind(now, c.episode, c.client),
    );
    await db.batch(ops);
    if (jourJ) { const x = await db.prepare('SELECT fin_jour FROM petro_codes WHERE code = ?').bind(c.code).first(); finJour = x ? Number(x.fin_jour) : finJour; }
  }
  const k = await db.prepare('SELECT cle FROM petro_cles WHERE episode = ?').bind(ep).first();
  return json(req, { ok: true, code: c.code, episode: c.episode, niveau: UN_CODE_TOUS_NIVEAUX ? 'grandmaitre' : niveauCode(c), cle: k ? k.cle : null,
    expire: c.expire ?? null, fin_jour: jourJ ? finJour : null });
}

async function reglages(db) {
  const r = { ...REGLAGES_DEFAUT };
  for (const x of (await db.prepare('SELECT cle, valeur FROM petro_reglages').all()).results) r[x.cle] = x.valeur;
  return r;
}

// Fin d'un niveau : code promo pour le niveau suivant. Seulement si le code de la partie est exactement de ce niveau
// (un code Chevalier qui rejoue l'Écuyer a déjà le Chevalier), et une seule fois par code : on renvoie le même ensuite.
async function promo(req, db) {
  let b;
  try { b = await req.json(); } catch { return json(req, { ok: false }); }
  const r = await reglages(db);
  if (UN_CODE_TOUS_NIVEAUX || r.promo_active !== '1') return json(req, { ok: false, raison: 'off' });
  const niveau = txt(b.niveau, 20);
  const suivant = NIVEAUX[rangNiveau(niveau) + 1];
  if (rangNiveau(niveau) < 0 || !suivant) return json(req, { ok: false, raison: 'niveau' });
  const c = await trouverCode(db, b.code);
  if (!c || Number(c.actif) !== 1) return json(req, { ok: false, raison: 'inconnu' });
  if (niveauCode(c) !== niveau) return json(req, { ok: false, raison: 'niveau' });
  const deja = await db.prepare('SELECT promo FROM petro_promos WHERE origine = ? AND niveau = ?').bind(c.code, niveau).first();
  if (deja) return json(req, { ok: true, promo: deja.promo });
  const now = Date.now();
  const jours = Math.max(1, Number(r.promo_jours) || 180);
  for (let essais = 0; essais < 20; essais++) {
    const code = nouveauCode(c.episode);
    try {
      await db.batch([
        db.prepare("INSERT INTO petro_codes (code, episode, client, canal, niveau, max_appareils, expire, note, cree, regle) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'jour')")
          .bind(code, c.episode, c.client, 'promo', suivant, Number(c.max_appareils) || APPAREILS_DEFAUT, now + jours * 86400000,
            txt((r.promo_note ? r.promo_note + ' — ' : '') + 'promo de ' + c.code, 200), now),
        db.prepare('INSERT INTO petro_promos (origine, niveau, promo, ts) VALUES (?, ?, ?, ?)').bind(c.code, niveau, code, now),
      ]);
      return json(req, { ok: true, promo: code });
    } catch {
      // deux appels en même temps : l'autre a déjà créé la promo
      const d2 = await db.prepare('SELECT promo FROM petro_promos WHERE origine = ? AND niveau = ?').bind(c.code, niveau).first();
      if (d2) return json(req, { ok: true, promo: d2.promo });
    }
  }
  return json(req, { ok: false, raison: 'erreur' });
}

async function evenements(req, db) {
  let b;
  try { b = await req.json(); } catch { return json(req, { ok: false }, 400); }
  const evs = (Array.isArray(b.events) ? b.events : []).slice(0, 200);
  const now = Date.now();
  const ops = [];
  const clients = {};   // code saisi → fiche du code (une seule lecture par code)
  for (const e of evs) {
    const ev = txt(e.ev, 20);
    if (!EVENEMENTS.includes(ev)) continue;
    const ts = Math.min(Math.max(Number(e.t) || now, 0), now + 60000);
    // Le code n'est jamais gardé dans les évènements : seulement le nom du client, pour les statistiques.
    let c = null;
    if (e.code) {
      const cle = normCode(e.code);
      if (!(cle in clients)) clients[cle] = await trouverCode(db, e.code);
      c = clients[cle];
    }
    ops.push(db.prepare('INSERT INTO petro_events (ts, ev, partie, episode, etape, lang, parcours, niveau, duree, sceau, client) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(ts, ev, txt(e.partie, 40), txt(e.episode, 40), txt(e.etape, 20), txt(e.lang, 5), txt(e.parcours, 5), txt(e.niveau, 20),
        Math.max(0, Math.round(Number(e.duree) || 0)), txt(e.sceau, 10), c ? c.client : null));
    if (ev === 'fin' && c) ops.push(db.prepare('UPDATE petro_codes SET fin = 1, sceau = ? WHERE code = ?').bind(txt(e.sceau, 10), c.code));
  }
  if (ops.length) await db.batch(ops);
  return json(req, { ok: true, saved: ops.length });
}

async function listeCodes(db) {
  return (await db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM petro_activations a WHERE a.code = c.code) AS appareils
    FROM petro_codes c ORDER BY c.cree DESC, c.code`).all()).results;
}

async function creerCodes(req, db) {
  const b = await req.json();
  const episode = txt(b.episode, 40) || '*';
  const client = txt(b.client, 60);
  const canal = ['main', 'web', 'play'].includes(b.canal) ? b.canal : 'main';
  const niveau = UN_CODE_TOUS_NIVEAUX ? 'grandmaitre' : NIVEAUX.includes(b.niveau) ? b.niveau : 'ecuyer';
  const nombre = Math.min(Math.max(Math.round(Number(b.nombre) || 1), 1), 200);
  const max = Math.min(Math.max(Math.round(Number(b.max_appareils) || APPAREILS_DEFAUT), 1), 50);
  // 18/11 : par défaut « jour J » ; « multi-jours » (case de l'admin) = valable jusqu'à la date d'expiration, comme avant.
  const regle = b.multi === true ? 'fixe' : 'jour';
  // Expiration (ou, en jour J, date limite pour l'activer) : fin de la journée choisie, heure de Paris.
  const expire = b.expire ? minuitParis(Date.parse(String(b.expire) + 'T12:00:00Z')) : null;
  if (!client) return json(req, { erreur: 'Le nom du client est obligatoire.' }, 400);
  if (b.expire && !Number.isFinite(expire)) return json(req, { erreur: "Date d'expiration illisible." }, 400);
  const crees = [];
  const now = Date.now();
  for (let essais = 0; crees.length < nombre && essais < nombre * 20; essais++) {
    const code = nouveauCode(episode);
    try {
      await db.prepare('INSERT INTO petro_codes (code, episode, client, canal, niveau, max_appareils, expire, note, cree, regle) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(code, episode, client, canal, niveau, max, expire, txt(b.note, 200), now, regle).run();
      crees.push(code);
    } catch { /* code déjà pris (clé primaire) : on en tire un autre */ }
  }
  return json(req, { ok: true, codes: crees });
}

// Statistiques sur une période, pour tous les clients, un client, ou les parties sans code (démo).
async function statistiques(req, db, url) {
  const debut = url.searchParams.get('du') ? Date.parse(url.searchParams.get('du') + 'T00:00:00+01:00') : 0;
  const finP = url.searchParams.get('au') ? Date.parse(url.searchParams.get('au') + 'T23:59:59+01:00') : Date.now() + 86400000;
  const client = url.searchParams.get('client') || '';
  let filtre = 'ts >= ? AND ts <= ?';
  const args = [debut || 0, finP || Date.now() + 86400000];
  // Une partie appartient à un client dès qu'un de ses évènements porte son code (le code est souvent saisi après le lancement).
  const AVEC_CODE = "(SELECT partie FROM petro_events WHERE client IS NOT NULL AND partie IS NOT NULL AND partie <> '')";
  if (client === '(sans code)') filtre += ` AND ev <> 'activation' AND (partie IS NULL OR partie NOT IN ${AVEC_CODE})`;
  else if (client) {
    filtre += " AND (client = ? OR partie IN (SELECT partie FROM petro_events WHERE client = ? AND partie IS NOT NULL AND partie <> ''))";
    args.push(client, client);
  }
  const q = async (sql, ...plus) => (await db.prepare(sql).bind(...args, ...plus).all()).results;
  const par = (champ, ev) => q(`SELECT COALESCE(NULLIF(${champ}, ''), '—') AS k, COUNT(*) AS n FROM petro_events WHERE ${filtre} AND ev = ? GROUP BY k ORDER BY n DESC`, ev);

  const totaux = (await q(`SELECT
      COUNT(DISTINCT CASE WHEN ev = 'lancement' THEN partie END) AS lancees,
      COUNT(DISTINCT CASE WHEN ev = 'lancement' AND partie NOT IN ${AVEC_CODE} THEN partie END) AS sans_code,
      COUNT(DISTINCT CASE WHEN ev = 'fin' THEN partie END) AS terminees,
      SUM(CASE WHEN ev = 'activation' THEN 1 ELSE 0 END) AS activations,
      ROUND(AVG(CASE WHEN ev = 'fin' AND duree > 0 THEN duree END)) AS duree_moyenne
    FROM petro_events WHERE ${filtre}`))[0];
  // Abandon : dernière étape atteinte par les parties qui n'ont pas de « fin ».
  const abandons = await q(`SELECT e.etape AS k, COUNT(*) AS n FROM petro_events e
    JOIN (SELECT partie, MAX(ts) AS m FROM petro_events WHERE ${filtre} AND ev = 'etape' GROUP BY partie) x
      ON x.partie = e.partie AND x.m = e.ts
    WHERE e.ev = 'etape' AND e.partie NOT IN (SELECT partie FROM petro_events WHERE ev = 'fin' AND partie IS NOT NULL)
    GROUP BY e.etape`);
  const clients = (await db.prepare("SELECT DISTINCT client FROM petro_codes ORDER BY client").all()).results.map(r => r.client);
  // Classement des Grands Maîtres : meilleurs temps (pénalités comprises), sans nom d'équipe (rien de personnel n'est envoyé).
  // 16/11 : ventes payées par jour (les ventes de test sont comptées à part).
  const ventes = (await db.prepare(`SELECT date(paye / 1000, 'unixepoch') AS k, COUNT(*) AS n, SUM(montant) AS s, SUM(test) AS t
    FROM petro_ventes WHERE statut = 'paye' AND paye >= ? AND paye <= ? GROUP BY k ORDER BY k DESC`).bind(args[0], args[1]).all()).results;
  const classement = await q(`SELECT duree, sceau, ts, client FROM petro_events WHERE ${filtre} AND ev = 'fin' AND niveau = 'grandmaitre' AND duree > 0 ORDER BY duree LIMIT 20`);
  return json(req, {
    totaux, clients,
    atteintes: await par('etape', 'etape'), indices: await par('etape', 'indice'), solutions: await par('etape', 'solution'), abandons,
    sceaux: await par('sceau', 'fin'), langues: await par('lang', 'lancement'), parcours: await par('parcours', 'lancement'),
    niveaux: await par('niveau', 'lancement'), niveaux_fin: await par('niveau', 'fin'), classement,
    activations: await par('client', 'activation'), ventes,
  });
}

// ---------- 16/11 : vente en ligne avec SumUp (Hosted Checkout) ----------
// Parcours : vitrine → POST /api/achat (commande « attente » + paiement SumUp) → page SumUp → merci.html?commande=ID
// qui interroge GET /api/commande/ID. Le code n'est créé QUE si SumUp lui-même confirme le paiement (statut PAID, bon montant,
// bonne référence) : on ne croit jamais un message reçu, on redemande toujours à SumUp avec la clé secrète.
// Secrets (posés par Gonzalo, jamais dans le dépôt) : SUMUP_API_KEY, SUMUP_MERCHANT_CODE. Variable MODE_TEST (wrangler.toml).
// SIMULATION=1 (seulement en local : npx wrangler dev --var SIMULATION:1, et sans clé SumUp) : faux paiement pour les essais.
const SUMUP = 'https://api.sumup.com/v0.1';
const SITE = 'https://escape-game-dordogne.fr';
const EPISODE_VENTE = 'saint-genies';
const DESCRIPTION_VENTE = 'Pétrocores – Saint-Geniès';
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const modeTest = env => String(env.MODE_TEST ?? 'true') !== 'false';
const simulation = env => String(env.SIMULATION) === '1' && !env.SUMUP_API_KEY;
const venteBranchee = env => simulation(env) || (!!env.SUMUP_API_KEY && !!env.SUMUP_MERCHANT_CODE);
const centimes = v => Math.round(Number(String(v ?? '').replace(',', '.')) * 100) || 0;

function idCommande() {
  const b = new Uint8Array(14);
  crypto.getRandomValues(b);
  return 'V' + Array.from(b, x => ALPHABET[x % ALPHABET.length]).join('');
}
const lireVente = (db, id) => db.prepare('SELECT * FROM petro_ventes WHERE id = ?').bind(txt(id, 40)).first();

// Ce que la vitrine a besoin de savoir (un seul endroit pour le prix : le réglage « vente_prix » de l'admin).
async function offre(req, env, db) {
  const r = await reglages(db);
  const montant = centimes(r.vente_prix);
  return json(req, {
    ok: true, vente: r.vente_active === '1' && venteBranchee(env) && montant > 0,
    montant: montant / 100, devise: 'EUR',
    validite_jours: Math.max(1, Number(r.vente_validite_jours) || 365),
    appareils: Math.max(1, Number(r.vente_appareils) || APPAREILS_DEFAUT),
    test: modeTest(env), simulation: simulation(env),
  });
}

async function achat(req, env, db, url) {
  let b;
  try { b = await req.json(); } catch { return json(req, { ok: false, erreur: 'donnees' }, 400); }
  const email = txt(b.email, 120).toLowerCase();
  if (!EMAIL_OK.test(email)) return json(req, { ok: false, erreur: 'email' }, 400);
  if (b.cgv !== true) return json(req, { ok: false, erreur: 'cgv' }, 400);
  const cadeau = b.cadeau === true;
  const prenom = cadeau ? txt(b.prenom, 40) : '', message = cadeau ? txt(b.message, 300) : '';
  if (cadeau && !prenom) return json(req, { ok: false, erreur: 'prenom' }, 400);
  const r = await reglages(db);
  const montant = centimes(r.vente_prix);
  if (r.vente_active !== '1' || !venteBranchee(env) || montant <= 0) return json(req, { ok: false, erreur: 'ferme' }, 503);
  const lang = ['fr', 'en', 'es'].includes(b.lang) ? b.lang : 'fr';
  const origine = req.headers.get('origin') || '';
  // Retour après paiement : toujours le vrai site, sauf pour les essais en local.
  const site = origine.startsWith('http://localhost') && ORIGINES.includes(origine) ? origine : SITE;
  const id = idCommande(), now = Date.now();
  const retour = site + '/merci.html?commande=' + id;
  await db.prepare(`INSERT INTO petro_ventes (id, ts, maj, email, montant, statut, cadeau, prenom, message, lang, episode, test, retour)
    VALUES (?, ?, ?, ?, ?, 'attente', ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, now, now, email, montant, cadeau ? 1 : 0, prenom, message, lang, EPISODE_VENTE, modeTest(env) ? 1 : 0, retour).run();

  let checkout, lien;
  if (simulation(env)) {
    checkout = 'SIM-' + id; lien = url.origin + '/api/simul?commande=' + id;
  } else {
    let res, d = {};
    try {
      res = await fetch(SUMUP + '/checkouts', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + env.SUMUP_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkout_reference: id, amount: montant / 100, currency: 'EUR', merchant_code: env.SUMUP_MERCHANT_CODE,
          description: DESCRIPTION_VENTE, redirect_url: retour, return_url: url.origin + '/api/sumup-webhook',
          hosted_checkout: { enabled: true },
        }),
      });
      d = await res.json().catch(() => ({}));
    } catch { /* réseau */ }
    if (!res || !res.ok || !d.id || !d.hosted_checkout_url) {
      await db.prepare("UPDATE petro_ventes SET statut = 'erreur', statut_sumup = ?, maj = ? WHERE id = ?")
        .bind(txt((res ? res.status + ' ' : '') + (d.error_code || d.message || ''), 80), now, id).run();
      return json(req, { ok: false, erreur: 'sumup' }, 502);
    }
    checkout = d.id; lien = d.hosted_checkout_url;
  }
  await db.prepare('UPDATE petro_ventes SET checkout_id = ?, url_paiement = ?, statut_sumup = ? WHERE id = ?').bind(checkout, lien, 'PENDING', id).run();
  return json(req, { ok: true, commande: id, url: lien });
}

// Demande à SumUp où en est le paiement, et crée le code s'il est payé. Appelée par le webhook, la page merci et l'admin.
async function verifierVente(env, db, v) {
  if (!v || v.code || !v.checkout_id) return v;
  let s;
  if (v.checkout_id.startsWith('SIM-')) {
    if (!simulation(env)) return v;
    s = { status: v.statut_sumup || 'PENDING', amount: v.montant / 100, currency: 'EUR', checkout_reference: v.id };
  } else {
    if (!env.SUMUP_API_KEY) return v;
    try {
      const r = await fetch(SUMUP + '/checkouts/' + encodeURIComponent(v.checkout_id), { headers: { Authorization: 'Bearer ' + env.SUMUP_API_KEY } });
      if (!r.ok) return v;
      s = await r.json();
    } catch { return v; }
  }
  const now = Date.now();
  const conforme = s.checkout_reference === v.id && s.currency === 'EUR' && Math.round(Number(s.amount) * 100) === Number(v.montant)
    && (!s.merchant_code || !env.SUMUP_MERCHANT_CODE || s.merchant_code === env.SUMUP_MERCHANT_CODE);
  if (s.status === 'PAID' && conforme) {
    const tr = (s.transactions || []).find(t => t.status === 'SUCCESSFUL') || (s.transactions || [])[0] || {};
    return attribuerCode(env, db, v, now, txt(tr.transaction_code, 40));
  }
  const statut = s.status === 'PAID' ? 'anomalie' : s.status === 'FAILED' ? 'echec' : s.status === 'EXPIRED' ? 'expire' : 'attente';
  await db.prepare('UPDATE petro_ventes SET statut = ?, statut_sumup = ?, maj = ? WHERE id = ? AND code IS NULL')
    .bind(statut, txt(s.status, 20), now, v.id).run();
  return lireVente(db, v.id);
}

// Une commande = un seul code, même si le webhook et la page merci arrivent en même temps :
// le code n'est rattaché que si la commande n'en a pas encore (sinon on efface celui qu'on vient de tirer).
async function attribuerCode(env, db, v, now, transaction) {
  const r = await reglages(db);
  const jours = Math.max(1, Number(r.vente_validite_jours) || 365);
  const max = Math.min(Math.max(Math.round(Number(r.vente_appareils) || APPAREILS_DEFAUT), 1), 50);
  const note = txt('vente ' + v.id + (Number(v.cadeau) ? ' · cadeau pour ' + v.prenom : '') + (Number(v.test) ? ' · TEST' : ''), 200);
  for (let essais = 0; essais < 20; essais++) {
    const code = nouveauCode(v.episode);
    try {
      await db.prepare("INSERT INTO petro_codes (code, episode, client, canal, niveau, max_appareils, expire, note, cree, regle) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'jour')")
        .bind(code, v.episode, Number(v.test) ? 'Vente en ligne (test)' : 'Vente en ligne', 'web', 'grandmaitre', max, minuitParis(now + jours * 86400000), note, now).run();
    } catch { continue; /* code déjà pris : on en tire un autre */ }
    const u = await db.prepare("UPDATE petro_ventes SET code = ?, statut = 'paye', statut_sumup = 'PAID', transaction_code = ?, paye = ?, maj = ? WHERE id = ? AND code IS NULL")
      .bind(code, transaction, now, now, v.id).run();
    if (!u.meta || !u.meta.changes) await db.prepare('DELETE FROM petro_codes WHERE code = ?').bind(code).run();
    else await envoyerCode(env, db, v.id); // seul celui qui a rattaché le code envoie l'email (jamais deux fois)
    break;
  }
  return lireVente(db, v.id);
}

// ---------- 17/11 : email du code, par la boîte OVH ----------
// Textes : Claude chat (VITRINE_TEXTES_16-11.md, section Email). Même texte que « Copier l'email » de l'admin.
const SMTP = { host: 'ssl0.ovh.net', port: 465, secure: true, user: 'contact@escape-game-dordogne.fr' };
const MAIL = {
  objet: { fr: 'Votre code Pétrocores — Saint-Geniès', en: 'Your Pétrocores code — Saint-Geniès', es: 'Vuestro código Pétrocores — Saint-Geniès' },
  corps: {
    fr: "Bonjour, merci pour votre achat ! Votre code : {CODE}. Il s'active sur place, à Saint-Geniès, et reste valable jusqu'à minuit ce jour-là, sur 2 téléphones. À utiliser avant le {DATE}. Pour jouer : rendez-vous au parking du lavoir de Saint-Geniès, ouvrez {LIEN} et entrez le code. Frère Aymeric vous attend. — Gonzalo, DORDRONE · contact@escape-game-dordogne.fr",
    en: "Hello, thank you for your purchase! Your code: {CODE}. It activates on site in Saint-Geniès and stays valid until midnight that day, on 2 phones. To be used before {DATE}. To play: go to the wash-house car park in Saint-Geniès, open {LIEN} and enter the code. Brother Aymeric is waiting for you. — Gonzalo, DORDRONE · contact@escape-game-dordogne.fr",
    es: "Hola, ¡gracias por vuestra compra! Vuestro código: {CODE}. Se activa allí mismo, en Saint-Geniès, y es válido hasta medianoche ese día, en 2 móviles. A usar antes del {DATE}. Para jugar: id al aparcamiento del lavadero de Saint-Geniès, abrid {LIEN} e introducid el código. Fray Aymeric os espera. — Gonzalo, DORDRONE · contact@escape-game-dordogne.fr",
  },
  cadeau: { fr: '🎁 Un cadeau pour {PRENOM} : « {MESSAGE} »', en: '🎁 A gift for {PRENOM}: “{MESSAGE}”', es: '🎁 Un regalo para {PRENOM}: «{MESSAGE}»' },
  bouton: { fr: '⚔ Lancer le jeu', en: '⚔ Start the game', es: '⚔ Empezar el juego' },
};
const echapper = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function composerMail(v, expire) {
  const lg = MAIL.objet[v.lang] ? v.lang : 'fr';
  const date = new Date(Number(expire)).toLocaleDateString({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES' }[lg],
    { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
  const lien = SITE + '/app/?episode=' + encodeURIComponent(v.episode) + '&code=' + encodeURIComponent(v.code);
  const corps = MAIL.corps[lg].replace('{CODE}', v.code).replace('{DATE}', date);
  const cadeau = !Number(v.cadeau) ? '' : v.message ? MAIL.cadeau[lg].replace('{PRENOM}', v.prenom || '').replace('{MESSAGE}', v.message)
    : MAIL.cadeau[lg].replace('{PRENOM}', v.prenom || '').replace(/\s*:?\s*[«“].*$/, ''); // sans message : « Un cadeau pour Léa »
  const objet = (Number(v.test) ? '[TEST] ' : '') + MAIL.objet[lg];
  const text = (cadeau ? cadeau + '\n\n' : '') + corps.replace('{LIEN}', lien);
  const lienHtml = '<a href="' + echapper(lien) + '">' + echapper(lien) + '</a>';
  const html = '<div style="font-family:Georgia,serif;font-size:17px;line-height:1.5;color:#1c1a17;max-width:560px">'
    + (cadeau ? '<p><i>' + echapper(cadeau) + '</i></p>' : '')
    + '<p>' + echapper(corps).replace(echapper(v.code), '<b style="font-family:monospace;font-size:22px">' + echapper(v.code) + '</b>')
      .replace('{LIEN}', lienHtml) + '</p>'
    + '<p><a href="' + echapper(lien) + '" style="display:inline-block;background:#8c2f23;color:#fff;padding:12px 18px;'
    + 'border-radius:8px;text-decoration:none;font-weight:bold">' + MAIL.bouton[lg] + '</a></p></div>';
  return { objet, text, html };
}

async function smtpEnvoyer(env, to, objet, text, html) {
  await WorkerMailer.send({
    host: SMTP.host, port: SMTP.port, secure: SMTP.secure, startTls: false, authType: ['plain', 'login'],
    credentials: { username: SMTP.user, password: env.SMTP_PASS },
    socketTimeoutMs: 15000, responseTimeoutMs: 15000, name: 'escape-game-dordogne.fr',
    logLevel: String(env.SMTP_DEBUG) === '1' ? 0 : 2, // 0 = journal détaillé (essais en local : --var SMTP_DEBUG:1)
  }, {
    from: { name: 'Pétrocores', email: SMTP.user }, reply: SMTP.user, to, subject: objet, text, html,
  });
}

// Envoie le code au client. Ne fait jamais échouer la vente : en cas de problème, l'erreur est notée
// (visible dans l'admin, bouton « Renvoyer l'email »).
async function envoyerCode(env, db, id) {
  const v = await lireVente(db, id);
  if (!v || !v.code || !EMAIL_OK.test(v.email || '')) return { ok: false, erreur: 'commande sans code ou sans email' };
  let erreur = null;
  if (!env.SMTP_PASS) erreur = 'mot de passe SMTP absent (secret SMTP_PASS)';
  else {
    try {
      const c = await db.prepare('SELECT expire FROM petro_codes WHERE code = ?').bind(v.code).first();
      const m = composerMail(v, c ? c.expire : Date.now());
      await smtpEnvoyer(env, v.email, m.objet, m.text, m.html);
    } catch (e) { erreur = txt(String((e && e.message) || e), 200) || 'erreur SMTP'; }
  }
  if (erreur) await db.prepare('UPDATE petro_ventes SET email_erreur = ? WHERE id = ?').bind(erreur, id).run();
  else await db.prepare('UPDATE petro_ventes SET email_envoye = ?, email_erreur = NULL WHERE id = ?').bind(Date.now(), id).run();
  return erreur ? { ok: false, erreur } : { ok: true };
}

// Pour la page merci (sans mot de passe : le numéro de commande, tiré au hasard, sert de clé).
async function commande(req, env, db, id) {
  let v = await lireVente(db, id);
  if (!v) return json(req, { ok: false, statut: 'inconnue' }, 404);
  if (!v.code) v = await verifierVente(env, db, v);
  const c = v.code ? await db.prepare('SELECT expire FROM petro_codes WHERE code = ?').bind(v.code).first() : null;
  return json(req, {
    ok: true, statut: v.statut, code: v.code || null, expire: c ? c.expire : null, episode: v.episode, lang: v.lang,
    cadeau: !!Number(v.cadeau), prenom: v.prenom || '', message: v.message || '', test: !!Number(v.test), url: v.statut === 'attente' ? v.url_paiement : null,
  });
}

// Faux paiement (essais en local uniquement).
async function simul(req, env, db, url) {
  if (!simulation(env)) return new Response('Introuvable', { status: 404 });
  const v = await lireVente(db, url.searchParams.get('commande'));
  if (!v) return new Response('Commande inconnue', { status: 404 });
  const choix = url.searchParams.get('choix');
  if (['PAID', 'FAILED', 'EXPIRED'].includes(choix)) {
    await db.prepare('UPDATE petro_ventes SET statut_sumup = ? WHERE id = ? AND code IS NULL').bind(choix, v.id).run();
    return Response.redirect(v.retour, 302);
  }
  const l = c => '/api/simul?commande=' + v.id + '&choix=' + c;
  return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:sans-serif;padding:20px">
    <h2>Faux paiement (simulation locale)</h2><p>${(v.montant / 100).toFixed(2)} € — ${v.email}</p>
    <p><a href="${l('PAID')}">✅ Paiement accepté</a></p><p><a href="${l('FAILED')}">❌ Paiement refusé</a></p><p><a href="${l('EXPIRED')}">⌛ Session expirée</a></p>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// RGPD : les emails (et prénoms/messages de cadeau) sont effacés après « rgpd_mois » mois.
async function purgerVentes(db) {
  const r = await reglages(db);
  const mois = Math.max(1, Number(r.rgpd_mois) || 13);
  await db.prepare("UPDATE petro_ventes SET email = '(effacé)', prenom = NULL, message = NULL WHERE ts < ? AND email <> '(effacé)'")
    .bind(Date.now() - mois * 30.44 * 86400000).run();
}
async function listeVentes(db) {
  await purgerVentes(db);
  return (await db.prepare('SELECT v.*, c.expire, c.actif FROM petro_ventes v LEFT JOIN petro_codes c ON c.code = v.code ORDER BY v.ts DESC LIMIT 1000').all()).results;
}

const csvCase = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
const jour = ms => ms ? new Date(Number(ms)).toISOString().slice(0, 10) : '';

export default {
  async fetch(req, env, ctx) {
    const db = env.DB;
    await initDb(db);
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });

    if (req.method === 'POST' && url.pathname === '/api/verify') return verifier(req, db);
    if (req.method === 'POST' && url.pathname === '/api/event') return evenements(req, db);
    if (req.method === 'POST' && url.pathname === '/api/promo') return promo(req, db);
    // 16/11 vente en ligne
    if (req.method === 'GET' && url.pathname === '/api/offre') return offre(req, env, db);
    if (req.method === 'POST' && url.pathname === '/api/achat') return achat(req, env, db, url);
    if (req.method === 'GET' && url.pathname.startsWith('/api/commande/')) return commande(req, env, db, url.pathname.slice(14));
    if (req.method === 'GET' && url.pathname === '/api/simul') return simul(req, env, db, url);
    if (req.method === 'POST' && url.pathname === '/api/sumup-webhook') {
      // Le message de SumUp n'est pas signé : il sert seulement de « sonnette ». On répond tout de suite, puis on
      // redemande nous-mêmes le statut à SumUp (verifierVente).
      let b = {};
      try { b = await req.json(); } catch { /* vide */ }
      if (b && b.event_type === 'CHECKOUT_STATUS_CHANGED' && b.id) {
        ctx.waitUntil(db.prepare('SELECT * FROM petro_ventes WHERE checkout_id = ?').bind(txt(b.id, 80)).first()
          .then(v => v && verifierVente(env, db, v)).catch(() => {}));
      }
      return new Response(null, { status: 200 });
    }

    if (url.pathname.startsWith('/api/')) {
      if (!admin(req, env)) return json(req, { erreur: 'Mot de passe incorrect.' }, 401);
      if (req.method === 'GET' && url.pathname === '/api/codes') {
        const cles = (await db.prepare('SELECT episode FROM petro_cles').all()).results;
        return json(req, { codes: await listeCodes(db), cles: cles.map(r => r.episode) });
      }
      if (req.method === 'POST' && url.pathname === '/api/codes') return creerCodes(req, db);
      if (req.method === 'GET' && url.pathname === '/api/stats') return statistiques(req, db, url);
      if (req.method === 'GET' && url.pathname === '/api/reglages') return json(req, await reglages(db));
      if (req.method === 'POST' && url.pathname === '/api/reglages') {
        const b = await req.json();
        const ops = Object.keys(REGLAGES_DEFAUT).filter(k => k in b)
          .map(k => db.prepare('INSERT OR REPLACE INTO petro_reglages (cle, valeur) VALUES (?, ?)').bind(k, txt(b[k], 100)));
        if (ops.length) await db.batch(ops);
        return json(req, { ok: true });
      }
      if (req.method === 'GET' && url.pathname === '/api/ventes') {
        return json(req, { ventes: await listeVentes(db), test: modeTest(env), branchee: venteBranchee(env), simulation: simulation(env) });
      }
      if (req.method === 'POST' && url.pathname === '/api/ventes/verifier') {
        const b = await req.json();
        return json(req, { ok: true, vente: await verifierVente(env, db, await lireVente(db, b.id)) });
      }
      if (req.method === 'POST' && url.pathname === '/api/ventes/email') {
        const b = await req.json();
        return json(req, await envoyerCode(env, db, txt(b.id, 40)));
      }
      if (req.method === 'POST' && url.pathname === '/api/mail-essai') {
        const b = await req.json();
        const a = txt(b.email, 120).toLowerCase();
        if (!EMAIL_OK.test(a)) return json(req, { ok: false, erreur: 'adresse email invalide' }, 400);
        if (!env.SMTP_PASS) return json(req, { ok: false, erreur: 'mot de passe SMTP absent (secret SMTP_PASS)' });
        const t = "Ceci est un essai d'envoi depuis le serveur Pétrocores (boîte contact@escape-game-dordogne.fr).";
        try {
          await smtpEnvoyer(env, a, "Pétrocores — email d'essai", t, '<p>' + echapper(t) + '</p>');
          return json(req, { ok: true });
        } catch (e) { return json(req, { ok: false, erreur: txt(String((e && e.message) || e), 200) }); }
      }
      if (req.method === 'GET' && url.pathname === '/api/ventes.csv') {
        const lignes = [['commande', 'date', 'email', 'montant', 'statut', 'statut_sumup', 'transaction', 'code', 'cadeau', 'prenom', 'langue', 'test', 'email_envoye']
          .map(csvCase).join(';')];
        for (const x of await listeVentes(db)) {
          lignes.push([x.id, jour(x.ts), x.email, (x.montant / 100).toFixed(2).replace('.', ','), x.statut, x.statut_sumup, x.transaction_code, x.code,
            Number(x.cadeau) ? 'oui' : 'non', x.prenom, x.lang, Number(x.test) ? 'oui' : 'non', x.email_envoye ? jour(x.email_envoye) : (x.email_erreur ? 'erreur' : '')].map(csvCase).join(';'));
        }
        return new Response('\uFEFF' + lignes.join('\r\n'), {
          headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="petrocores-ventes.csv"', ...cors(req) },
        });
      }
      if (req.method === 'POST' && url.pathname === '/api/toggle') {
        const b = await req.json();
        await db.prepare('UPDATE petro_codes SET actif = 1 - actif WHERE code = ?').bind(txt(b.code, 20)).run();
        return json(req, { ok: true });
      }
      // 18/11 : geste commercial (pluie, problème…) : un jour de plus. Code déjà périmé : valable jusqu'à ce soir minuit.
      if (req.method === 'POST' && url.pathname === '/api/prolonger') {
        const b = await req.json();
        const c = await db.prepare('SELECT fin_jour FROM petro_codes WHERE code = ?').bind(txt(b.code, 20)).first();
        if (!c || !c.fin_jour) return json(req, { erreur: "Ce code n'a pas encore été activé." }, 400);
        const now = Date.now();
        const fin = Number(c.fin_jour) < now ? minuitParis(now) : minuitParis(Number(c.fin_jour) + 12 * 3600000);
        await db.prepare('UPDATE petro_codes SET fin_jour = ? WHERE code = ?').bind(fin, txt(b.code, 20)).run();
        return json(req, { ok: true, fin_jour: fin });
      }
      if (req.method === 'POST' && url.pathname === '/api/cle') {
        const b = await req.json();
        const episode = txt(b.episode, 40), cle = txt(b.cle, 100);
        if (!episode || !cle) return json(req, { erreur: 'Épisode et clé obligatoires.' }, 400);
        await db.prepare('INSERT OR REPLACE INTO petro_cles (episode, cle) VALUES (?, ?)').bind(episode, cle).run();
        return json(req, { ok: true });
      }
      if (req.method === 'GET' && url.pathname === '/api/export.csv') {
        const lignes = [['code', 'episode', 'niveau', 'client', 'canal', 'appareils', 'max', 'cree', 'active', 'expire', 'actif', 'terminee', 'sceau', 'note', 'regle', 'valable_jusqu_au']
          .map(csvCase).join(';')];
        for (const c of await listeCodes(db)) {
          lignes.push([c.code, c.episode, niveauCode(c), c.client, c.canal, c.appareils, c.max_appareils, jour(c.cree), jour(c.active), jour(c.expire),
            Number(c.actif) ? 'oui' : 'non', Number(c.fin) ? 'oui' : 'non', c.sceau, c.note, c.regle || 'fixe', jour(c.fin_jour)].map(csvCase).join(';'));
        }
        // BOM : Excel ouvre le fichier avec les bons accents.
        return new Response('﻿' + lignes.join('\r\n'), {
          headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="petrocores-codes.csv"', ...cors(req) },
        });
      }
      return json(req, { erreur: 'Inconnu.' }, 404);
    }

    if (url.pathname !== '/') return new Response('Introuvable', { status: 404 });
    return new Response(PAGE.replace('__APP__', APP).replace('__TOUS__', String(UN_CODE_TOUS_NIVEAUX)).replace('__DEFAUT__', String(APPAREILS_DEFAUT)), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  },
};
