// Chiffre les étapes PAYANTES d'un épisode avant publication (le dépôt GitHub est public).
// Usage : node outils/chiffrer_episode.mjs <episode_clair.json> <episode.json publié> <fichier de clé>
//
// L'épisode en clair liste ses étapes gratuites dans "gratuit": ["p0", …]. Toutes les autres étapes et le "final"
// sont chiffrés (AES-GCM 256) dans "chiffre": { iv, donnees } ; à leur place il reste { "id", "verrou": true }.
// La clé (base64) est créée au premier lancement dans le fichier de clé — à garder HORS du dépôt et à enregistrer sur le
// serveur (table petro_cles) : /api/verify la donne à l'app quand un code est valide, et l'app déchiffre en local.
// Sans champ "gratuit", rien n'est chiffré : l'épisode est recopié tel quel.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const [, , entree, sortie, fichierCle] = process.argv;
if (!entree || !sortie || !fichierCle) {
  console.error('Usage : node outils/chiffrer_episode.mjs <episode_clair.json> <episode.json> <fichier de clé>');
  process.exit(1);
}
const b64 = octets => Buffer.from(octets).toString('base64');
const ep = JSON.parse(readFileSync(entree, 'utf8'));

if (!Array.isArray(ep.gratuit)) {
  writeFileSync(sortie, JSON.stringify(ep, null, 2));
  console.log('Pas de champ "gratuit" : épisode recopié sans chiffrement.');
  process.exit(0);
}

if (!existsSync(fichierCle)) {
  writeFileSync(fichierCle, b64(crypto.getRandomValues(new Uint8Array(32))) + '\n');
  console.log('Nouvelle clé créée : ' + fichierCle + ' (à enregistrer sur le serveur)');
}
const cleB64 = readFileSync(fichierCle, 'utf8').trim();
const cle = await crypto.subtle.importKey('raw', Buffer.from(cleB64, 'base64'), 'AES-GCM', false, ['encrypt']);

const gratuit = ep.gratuit.map(String);
const secret = { etapes: {}, final: ep.final ?? null };
const publie = { ...ep };
publie.etapes = ep.etapes.map(e => {
  if (gratuit.includes(String(e.id))) return e;
  secret.etapes[e.id] = e;
  return { id: e.id, verrou: true };
});
if (ep.final) publie.final = { verrou: true };

const iv = crypto.getRandomValues(new Uint8Array(12));
const donnees = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cle, new TextEncoder().encode(JSON.stringify(secret)));
publie.chiffre = { iv: b64(iv), donnees: b64(new Uint8Array(donnees)) };

writeFileSync(sortie, JSON.stringify(publie, null, 2));
console.log(`Épisode publié : ${gratuit.length} étapes en clair, ${Object.keys(secret.etapes).length} chiffrées + final → ${sortie}`);
