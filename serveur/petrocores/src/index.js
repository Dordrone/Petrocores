// Pétrocores — serveur Cloudflare Workers + base D1 (liaison "DB"). Même logique que le trio Val Town de Sentia, sans le mail.
//   POST /api/event   : compteur anonyme envoyé par l'app (file d'attente hors-ligne côté app)
//   POST /api/verify  : vérifie un code client → épisode débloqué + clé de déchiffrement
//   /                 : page d'administration (mot de passe = secret ADMIN_PASS, jamais dans le code)
//   /api/codes, /api/toggle, /api/export.csv, /api/cle, /api/stats : réservés à l'admin (en-tête x-pass)
import { PAGE } from './page.js';

const APP = 'https://dordrone.github.io/Petrocores/app/index.html';
// Origines autorisées à appeler l'API depuis un navigateur (l'app en ligne + les tests en local).
const ORIGINES = ['https://dordrone.github.io', 'http://localhost:8123'];
const APPAREILS_DEFAUT = 2;
// Alphabet des codes : pas de O/0, I/1, L (lisibles au comptoir et au téléphone).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const EVENEMENTS = ['lancement', 'etape', 'indice', 'solution', 'fin'];

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
];

let pret = false;
async function initDb(db) {
  if (pret) return;
  await db.batch(SCHEMA.map(s => db.prepare(s)));
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
  return json(req, { ok: true, code: c.code, episode: c.episode, cle: k ? k.cle : null, expire: c.expire ?? null });
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
    ops.push(db.prepare('INSERT INTO petro_events (ts, ev, partie, episode, etape, lang, parcours, duree, sceau, client) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(ts, ev, txt(e.partie, 40), txt(e.episode, 40), txt(e.etape, 20), txt(e.lang, 5), txt(e.parcours, 5),
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
      await db.prepare('INSERT INTO petro_codes (code, episode, client, canal, max_appareils, expire, note, cree) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .bind(code, episode, client, canal, max, expire, txt(b.note, 200), now).run();
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
  return json(req, {
    totaux, clients,
    atteintes: await par('etape', 'etape'), indices: await par('etape', 'indice'), solutions: await par('etape', 'solution'), abandons,
    sceaux: await par('sceau', 'fin'), langues: await par('lang', 'lancement'), parcours: await par('parcours', 'lancement'),
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

    if (url.pathname.startsWith('/api/')) {
      if (!admin(req, env)) return json(req, { erreur: 'Mot de passe incorrect.' }, 401);
      if (req.method === 'GET' && url.pathname === '/api/codes') {
        const cles = (await db.prepare('SELECT episode FROM petro_cles').all()).results;
        return json(req, { codes: await listeCodes(db), cles: cles.map(r => r.episode) });
      }
      if (req.method === 'POST' && url.pathname === '/api/codes') return creerCodes(req, db);
      if (req.method === 'GET' && url.pathname === '/api/stats') return statistiques(req, db, url);
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
        const lignes = [['code', 'episode', 'client', 'canal', 'appareils', 'max', 'cree', 'active', 'expire', 'actif', 'terminee', 'sceau', 'note']
          .map(csvCase).join(';')];
        for (const c of await listeCodes(db)) {
          lignes.push([c.code, c.episode, c.client, c.canal, c.appareils, c.max_appareils, jour(c.cree), jour(c.active), jour(c.expire),
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
    return new Response(PAGE.replace('__APP__', APP).replace('__DEFAUT__', String(APPAREILS_DEFAUT)), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  },
};
