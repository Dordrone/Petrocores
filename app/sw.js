// Incrémenter VERSION à CHAQUE publication, et ajouter tout nouveau fichier à ASSETS.
const VERSION = 'petrocores-v2';
const MEDIA = 'petrocores-media'; // épisodes et photos, remplis par l'app (survit aux versions)
const DELAI_RESEAU_MS = 3000;     // réseau faible au village : on bascule vite sur le cache

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './demo-episode.json',
  './fragment-carte.svg',
  './media/intro_saint_genies.mp4',
  './media/intro_saint_genies.fr.vtt',
  './media/intro_saint_genies.en.vtt',
  './media/intro_saint_genies.es.vtt',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(noms => Promise.all(noms.filter(n => n !== VERSION && n !== MEDIA).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

function depuisCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(r => {
    if (r) return r;
    if (req.mode === 'navigate') return caches.match('./index.html');
    return Response.error();
  });
}

function reseauDabord(req) {
  const reseau = fetch(req).then(r => {
    if (r.ok) {
      const copie = r.clone();
      const nom = new URL(req.url).pathname.includes('/scenario/') ? MEDIA : VERSION;
      caches.open(nom).then(c => c.put(req, copie));
    }
    return r;
  });
  const delai = new Promise(ok => setTimeout(ok, DELAI_RESEAU_MS)).then(() =>
    caches.match(req, { ignoreSearch: true }).then(r => r || reseau));
  return Promise.race([reseau, delai]).catch(() => depuisCache(req));
}

function cacheDabord(req) {
  return caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req).then(rep => {
    if (rep.ok) {
      const copie = rep.clone();
      caches.open(MEDIA).then(c => c.put(req, copie));
    }
    return rep;
  }));
}

// L'iPhone demande les vidéos par morceaux (Range) : sans réponse 206, pas de lecture hors-ligne.
async function video(req) {
  const rep = await caches.match(req.url);
  if (!rep) return fetch(req);
  const plage = /bytes=(\d+)-(\d*)/.exec(req.headers.get('range') || '');
  if (!plage) return rep;
  const octets = await rep.arrayBuffer();
  const debut = Number(plage[1]);
  const fin = Math.min(plage[2] ? Number(plage[2]) : octets.byteLength - 1, octets.byteLength - 1);
  return new Response(octets.slice(debut, fin + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': String(fin - debut + 1),
      'Content-Range': 'bytes ' + debut + '-' + fin + '/' + octets.byteLength,
      'Accept-Ranges': 'bytes'
    }
  });
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('.mp4')) { e.respondWith(video(e.request)); return; }
  const image = e.request.destination === 'image';
  e.respondWith(image ? cacheDabord(e.request) : reseauDabord(e.request));
});
