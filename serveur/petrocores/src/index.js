// Pétrocores — serveur Cloudflare Workers + base D1 (liaison "DB"). Même logique que le trio Val Town de Sentia, sans le mail.
//   POST /api/event   : compteur anonyme envoyé par l'app (file d'attente hors-ligne côté app)
//   POST /api/verify  : vérifie un code client → épisode débloqué + clé de déchiffrement
//   /                 : page d'administration (mot de passe = secret ADMIN_PASS, jamais dans le code)
//   /api/codes, /api/toggle, /api/export.csv, /api/cle, /api/stats : réservés à l'admin (en-tête x-pass)
import { PAGE } from './page.js';

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
const REGLAGES_DEFAUT = { promo_active: '1', promo_jours: '180', promo_note: '' };

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
];
// Colonnes ajoutées après coup (D1 ne connaît pas « ADD COLUMN IF NOT EXISTS » : erreur ignorée si elle existe déjà).
const COLONNES = [
  'ALTER TABLE petro_codes ADD COLUMN niveau TEXT',
  'ALTER TABLE petro_events ADD COLUMN niveau TEXT',
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

async function verifier(req, db) {
  let b;
  try { b = await req.json(); } catch { return json(req, { ok: false, raison: 'inconnu' }); }
  const appareil = txt(b.appareil, 64);
  const episode = txt(b.episode, 40);
  if (!normCode(b.code) || !appareil) return json(req, { ok: false, raison: 'inconnu' });
  const c = await trouverCode(db, b.code);
  if (!c) return json(req, { ok: false, raison: 'inconnu' });
  if (Number(c.actif) !== 1) return json(req, { ok: false, raison: 'desactive' });
  if (c.expire && Number(c.expire) < Date.now()) return json(req, { ok: false, raison: 'expire' });
  if (c.episode !== '*' && episode && c.episode !== episode) return json(req, { ok: false, raison: 'episode' });

  const act = (await db.prepare('SELECT appareil FROM petro_activations WHERE code = ?').bind(c.code).all()).results;
  if (!act.some(r => r.appareil === appareil)) {
    if (act.length >= Number(c.max_appareils)) return json(req, { ok: false, raison: 'appareils' });
    const now = Date.now();
    await db.batch([
      db.prepare('INSERT OR IGNORE INTO petro_activations (code, appareil, ts) VALUES (?, ?, ?)').bind(c.code, appareil, now),
      db.prepare('UPDATE petro_codes SET active = COALESCE(active, ?) WHERE code = ?').bind(now, c.code),
      db.prepare("INSERT INTO petro_events (ts, ev, episode, client) VALUES (?, 'activation', ?, ?)").bind(now, c.episode, c.client),
    ]);
  }
  const ep = c.episode === '*' ? episode : c.episode;
  const k = await db.prepare('SELECT cle FROM petro_cles WHERE episode = ?').bind(ep).first();
  return json(req, { ok: true, code: c.code, episode: c.episode, niveau: UN_CODE_TOUS_NIVEAUX ? 'grandmaitre' : niveauCode(c), cle: k ? k.cle : null, expire: c.expire ?? null });
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
        db.prepare('INSERT INTO petro_codes (code, episode, client, canal, niveau, max_appareils, expire, note, cree) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
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
  // Expiration : fin de la journée choisie (heure de Paris approchée : UTC+1).
  const expire = b.expire ? Date.parse(String(b.expire) + 'T23:59:59+01:00') : null;
  if (!client) return json(req, { erreur: 'Le nom du client est obligatoire.' }, 400);
  if (b.expire && !Number.isFinite(expire)) return json(req, { erreur: "Date d'expiration illisible." }, 400);
  const crees = [];
  const now = Date.now();
  for (let essais = 0; crees.length < nombre && essais < nombre * 20; essais++) {
    const code = nouveauCode(episode);
    try {
      await db.prepare('INSERT INTO petro_codes (code, episode, client, canal, niveau, max_appareils, expire, note, cree) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(code, episode, client, canal, niveau, max, expire, txt(b.note, 200), now).run();
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
  const classement = await q(`SELECT duree, sceau, ts, client FROM petro_events WHERE ${filtre} AND ev = 'fin' AND niveau = 'grandmaitre' AND duree > 0 ORDER BY duree LIMIT 20`);
  return json(req, {
    totaux, clients,
    atteintes: await par('etape', 'etape'), indices: await par('etape', 'indice'), solutions: await par('etape', 'solution'), abandons,
    sceaux: await par('sceau', 'fin'), langues: await par('lang', 'lancement'), parcours: await par('parcours', 'lancement'),
    niveaux: await par('niveau', 'lancement'), niveaux_fin: await par('niveau', 'fin'), classement,
    activations: await par('client', 'activation'),
  });
}

const csvCase = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
const jour = ms => ms ? new Date(Number(ms)).toISOString().slice(0, 10) : '';

export default {
  async fetch(req, env) {
    const db = env.DB;
    await initDb(db);
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors(req) });

    if (req.method === 'POST' && url.pathname === '/api/verify') return verifier(req, db);
    if (req.method === 'POST' && url.pathname === '/api/event') return evenements(req, db);
    if (req.method === 'POST' && url.pathname === '/api/promo') return promo(req, db);

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
      if (req.method === 'POST' && url.pathname === '/api/toggle') {
        const b = await req.json();
        await db.prepare('UPDATE petro_codes SET actif = 1 - actif WHERE code = ?').bind(txt(b.code, 20)).run();
        return json(req, { ok: true });
      }
      if (req.method === 'POST' && url.pathname === '/api/cle') {
        const b = await req.json();
        const episode = txt(b.episode, 40), cle = txt(b.cle, 100);
        if (!episode || !cle) return json(req, { erreur: 'Épisode et clé obligatoires.' }, 400);
        await db.prepare('INSERT OR REPLACE INTO petro_cles (episode, cle) VALUES (?, ?)').bind(episode, cle).run();
        return json(req, { ok: true });
      }
      if (req.method === 'GET' && url.pathname === '/api/export.csv') {
        const lignes = [['code', 'episode', 'niveau', 'client', 'canal', 'appareils', 'max', 'cree', 'active', 'expire', 'actif', 'terminee', 'sceau', 'note']
          .map(csvCase).join(';')];
        for (const c of await listeCodes(db)) {
          lignes.push([c.code, c.episode, niveauCode(c), c.client, c.canal, c.appareils, c.max_appareils, jour(c.cree), jour(c.active), jour(c.expire),
            Number(c.actif) ? 'oui' : 'non', Number(c.fin) ? 'oui' : 'non', c.sceau, c.note].map(csvCase).join(';'));
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
