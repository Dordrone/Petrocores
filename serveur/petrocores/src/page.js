// Page d'administration (onglets Codes, Ventes en ligne et Statistiques). Le JavaScript du navigateur n'utilise pas de gabarits `…`
// (on est déjà dans un gabarit) ; les apostrophes des textes sont écrites \\'.
export const PAGE = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Pétrocores — Administration</title>
<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script>
<style>
body{font-family:Georgia,serif;background:#f4ead5;color:#1c1a17;margin:0 auto;padding:16px;max-width:1100px}
h1{font-size:1.4rem;margin:8px 0}h2{font-size:1.05rem;margin:22px 0 8px;color:#8c2f23}
.cadre{background:#fbf5e6;border:1px solid #d9c9a3;border-radius:10px;padding:12px}
form{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end}
label{display:flex;flex-direction:column;font-size:.78rem;gap:3px}
input,select{font:inherit;padding:8px;border:1px solid #1c1a17;border-radius:8px;background:#fff}
button{font:inherit;font-weight:bold;border:0;border-radius:8px;padding:9px 14px;cursor:pointer;background:#8c2f23;color:#fff}
button.second{background:none;color:#1c1a17;border:1px solid #1c1a17}
.onglets{display:flex;gap:6px;margin:10px 0}
.onglets button{background:#fbf5e6;color:#1c1a17;border:1px solid #d9c9a3}
.onglets button.actif{background:#1c1a17;color:#f4ead5}
table{width:100%;border-collapse:collapse;font-size:.85rem;margin-top:8px}
th,td{padding:7px 8px;text-align:left;border-bottom:1px solid #d9c9a3;vertical-align:top}
th{font-size:.7rem;text-transform:uppercase;color:#6b6355}
tr.off{opacity:.45}code{font-family:monospace;font-size:1rem;font-weight:bold}
#msg{min-height:1.4em;color:#8c2f23;font-weight:bold;margin:8px 0}
.outils{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin-top:10px}
.tuiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:10px}
.tuile{background:#fbf5e6;border:1px solid #d9c9a3;border-radius:10px;padding:10px}
.tuile b{display:block;font-size:1.6rem}.tuile span{font-size:.75rem;color:#6b6355}
.deux{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.barre{display:inline-block;height:.7em;background:#c89b3c;border-radius:3px;vertical-align:middle;margin-right:6px}
#planche{display:none}
.carte{border:1px dashed #6b6355;border-radius:8px;padding:10px;display:flex;gap:10px;align-items:center;break-inside:avoid}
.carte img{width:120px;height:120px}.carte b{font-family:monospace;font-size:1.25rem}
.carte p{margin:3px 0;font-size:.72rem}.carte p.desc{font-size:.6rem;line-height:1.25}
@media print{
  body{background:#fff;padding:0;max-width:none}
  #ecran{display:none}#planche{display:grid;grid-template-columns:1fr 1fr;gap:8mm}
  @page{size:A4;margin:10mm}
}
</style></head><body>
<div id="ecran">
<h1>Pétrocores — Administration</h1>
<div class="onglets"><button id="o-codes" class="actif" onclick="onglet('codes')">Codes clients</button><button id="o-ventes" onclick="onglet('ventes')">Ventes en ligne</button><button id="o-stats" onclick="onglet('stats')">Statistiques</button></div>
<div id="msg"></div>

<div id="p-codes">
<h2>Créer des codes</h2>
<div class="cadre"><form onsubmit="creer(event)">
  <label>Épisode<input id="f-episode" value="saint-genies" list="episodes" required><datalist id="episodes"><option value="saint-genies"><option value="*"></datalist></label>
  <label>Client<input id="f-client" list="clients" placeholder="Office de tourisme Sarlat" required><datalist id="clients"></datalist></label>
  <label class="niveaux">Niveau<select id="f-niveau"><option value="ecuyer">🛡 Écuyer</option><option value="chevalier">⚔ Chevalier</option><option value="grandmaitre">✠ Grand Maître</option></select></label>
  <label>Canal<select id="f-canal"><option value="main">À la main</option><option value="web">Web</option><option value="play">Play Store</option></select></label>
  <label>Nombre de codes<input id="f-nombre" type="number" min="1" max="200" value="1" style="width:6em"></label>
  <label>Téléphones par code<input id="f-max" type="number" min="1" max="50" value="__DEFAUT__" style="width:6em"></label>
  <label>À utiliser avant le (facultatif)<input id="f-expire" type="date"></label>
  <label title="Ancien fonctionnement : valable tous les jours jusqu'à la date ci-contre"><input id="f-multi" type="checkbox"> Multi-jours</label>
  <label style="flex:1;min-width:12em">Note<input id="f-note" placeholder="facultatif"></label>
  <button>Créer</button>
</form><p style="font-size:.8rem;margin:8px 0 0">Règle normale (18/11) : le code s'active sur place à Saint-Geniès et reste valable jusqu'à minuit ce jour-là, pour ses 2 téléphones. « Multi-jours » : valable chaque jour jusqu'à la date choisie (ancien fonctionnement).</p></div>

<h2>Codes</h2>
<div class="outils">
  <label>Filtrer par client<select id="filtre" onchange="afficher()"><option value="">Tous</option></select></label>
  <label>État<select id="etat" onchange="afficher()"><option value="">Tous</option><option value="libre">Jamais activés</option><option value="pris">Activés</option><option value="off">Désactivés</option><option value="promo">Codes promo</option></select></label>
  <button class="second" onclick="imprimer()">Imprimer la planche (codes affichés)</button>
  <button class="second" onclick="exporter()">Exporter en CSV</button>
</div>
<div id="liste">Chargement…</div>

<h2 class="niveaux">Codes promo de fin de niveau</h2>
<div class="cadre niveaux"><form onsubmit="regler(event)">
  <label>Donner un code promo<select id="r-active"><option value="1">Oui</option><option value="0">Non</option></select></label>
  <label>Valable (jours)<input id="r-jours" type="number" min="1" max="3650" style="width:6em"></label>
  <label style="flex:1;min-width:14em">Offre (note sur le code : « -30 % », « offert »…)<input id="r-note"></label>
  <button>Enregistrer</button>
</form><p style="font-size:.8rem;margin:8px 0 0">À la fin de l\'Écuyer (ou du Chevalier), le joueur reçoit sous son parchemin un code du niveau suivant, un seul par code acheté. Il apparaît ici dans la liste (canal « promo »).</p></div>

<h2>Clé de déchiffrement d'un épisode</h2>
<div class="cadre"><form onsubmit="cle(event)">
  <label>Épisode<input id="k-episode" value="saint-genies" required></label>
  <label style="flex:1;min-width:16em">Clé (donnée par Claude Code, à coller une seule fois)<input id="k-cle" required></label>
  <button>Enregistrer la clé</button>
</form><p id="cles" style="font-size:.8rem;margin:8px 0 0"></p></div>
</div>

<div id="p-ventes" hidden>
<p id="v-mode" class="cadre" style="font-weight:bold"></p>
<h2>Réglages de la vente</h2>
<div class="cadre"><form onsubmit="reglerVente(event)">
  <label>Vente ouverte<select id="rv-active"><option value="1">Oui</option><option value="0">Non</option></select></label>
  <label>Prix d'un code (€)<input id="rv-prix" inputmode="decimal" style="width:6em"></label>
  <label>Délai pour venir jouer (jours)<input id="rv-jours" type="number" min="1" max="3650" style="width:6em"></label>
  <label>Téléphones par code<input id="rv-max" type="number" min="1" max="50" style="width:6em"></label>
  <label>Effacer les emails après (mois)<input id="rv-rgpd" type="number" min="1" max="120" style="width:6em"></label>
  <button>Enregistrer</button>
</form><p style="font-size:.8rem;margin:8px 0 0">Le prix est lu par la vitrine : c'est le seul endroit où le changer. Le code vendu s'active sur place et vaut pour la journée (jusqu'à minuit, 2 téléphones). Un remboursement se fait dans SumUp, puis « Désactiver le code » ici.</p></div>
<h2>Email du code</h2>
<div class="cadre"><form onsubmit="mailEssai(event)">
  <p style="font-size:.8rem;margin:0 0 8px">Après chaque paiement, le code part tout seul depuis contact@escape-game-dordogne.fr (boîte OVH). Pour vérifier que l'envoi marche :</p>
  <label>Envoyer un email d'essai à<input id="me-adresse" type="email" style="width:16em"></label>
  <button>Envoyer</button>
</form></div>
<h2>Commandes</h2>
<div class="outils">
  <label>Statut<select id="v-filtre" onchange="afficherVentes()"><option value="">Toutes</option><option value="paye">Payées</option><option value="attente">En attente</option><option value="echec">Refusées</option><option value="expire">Expirées</option><option value="erreur">Erreurs</option></select></label>
  <button class="second" onclick="chargerVentes()">Actualiser</button>
  <button class="second" onclick="exporterVentes()">Exporter en CSV</button>
</div>
<div id="ventes">Chargement…</div>
</div>

<div id="p-stats" hidden>
<div class="outils">
  <label>Du<input id="s-du" type="date" onchange="stats()"></label>
  <label>Au<input id="s-au" type="date" onchange="stats()"></label>
  <label>Client<select id="s-client" onchange="stats()"><option value="">Tous</option><option>(sans code)</option></select></label>
  <button class="second" onclick="periode(7)">7 jours</button><button class="second" onclick="periode(30)">30 jours</button><button class="second" onclick="periode(0)">Tout</button>
</div>
<div id="stats">Chargement…</div>
</div>
</div>
<div id="planche"></div>

<script>
var APP = '__APP__';
var PASS = sessionStorage.getItem('p') || prompt('Mot de passe administrateur :') || '';
sessionStorage.setItem('p', PASS);
var CODES = [];
// Pour l'instant (15/11) : un code ouvre les 3 niveaux, pas de promos → choix du niveau et réglages promo cachés.
var TOUS = __TOUS__;
if (TOUS) document.querySelectorAll('.niveaux').forEach(function(x){ x.style.display = 'none'; });
var NIV = { ecuyer: '🛡 Écuyer', chevalier: '⚔ Chevalier', grandmaitre: '✠ Grand Maître' };
function niv(c){ return c.niveau || 'grandmaitre'; }
function nomNiv(c){ return TOUS ? 'les 3' : NIV[niv(c)]; }
// Titres et descriptions des niveaux : lus dans l'épisode publié (une seule source, écrite par Claude chat).
var EPISODES = {};
function episodeTextes(slug){
  if (!(slug in EPISODES)) EPISODES[slug] = fetch(APP.replace('app/index.html', 'scenario/' + slug + '/episode.json')).then(function(r){ return r.json(); }).catch(function(){ return {}; });
  return EPISODES[slug];
}
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function jour(ms){ return ms ? new Date(Number(ms)).toLocaleDateString('fr-FR') : '—'; }
function dire(t){ document.getElementById('msg').textContent = t || ''; }
function v(id){ return document.getElementById(id).value; }
function api(chemin, corps){
  var o = { headers: { 'x-pass': PASS, 'Content-Type': 'application/json' } };
  if (corps) { o.method = 'POST'; o.body = JSON.stringify(corps); }
  return fetch(chemin, o).then(function(r){
    if (r.status === 401) { sessionStorage.removeItem('p'); dire('Mot de passe incorrect — recharge la page.'); throw new Error('401'); }
    return r;
  });
}
function onglet(nom){
  ['codes', 'ventes', 'stats'].forEach(function(n){
    document.getElementById('p-' + n).hidden = n !== nom;
    document.getElementById('o-' + n).className = n === nom ? 'actif' : '';
  });
  dire('');
  if (nom === 'stats') stats();
  if (nom === 'ventes') chargerVentes();
}

// ---------- Codes ----------
function charger(){
  return api('/api/codes').then(function(r){ return r.json(); }).then(function(d){
    CODES = d.codes;
    var clients = {}; CODES.forEach(function(c){ clients[c.client] = 1; });
    var noms = Object.keys(clients).sort(), f = document.getElementById('filtre'), garde = f.value;
    f.innerHTML = '<option value="">Tous</option>' + noms.map(function(n){ return '<option>' + esc(n) + '</option>'; }).join('');
    f.value = garde;
    document.getElementById('clients').innerHTML = noms.map(function(n){ return '<option value="' + esc(n) + '">'; }).join('');
    document.getElementById('cles').textContent = d.cles.length ? 'Clé enregistrée pour : ' + d.cles.join(', ') : 'Aucune clé enregistrée.';
    afficher();
  });
}
function visibles(){
  var f = v('filtre'), e = v('etat');
  return CODES.filter(function(c){
    if (f && c.client !== f) return false;
    if (e === 'libre') return !c.active && Number(c.actif);
    if (e === 'pris') return !!c.active;
    if (e === 'off') return !Number(c.actif);
    if (e === 'promo') return c.canal === 'promo';
    return true;
  });
}
function afficher(){
  var l = visibles();
  var h = '<p style="font-size:.8rem">' + l.length + ' code(s)</p><table><tr><th>Code</th><th>Niveau</th><th>Client</th><th>Épisode</th><th>Créé</th><th>Activé</th><th>Téléphones</th><th>Terminée</th><th>Validité</th><th>Note</th><th>État</th></tr>';
  l.forEach(function(c){
    h += '<tr class="' + (Number(c.actif) ? '' : 'off') + '"><td><code>' + esc(c.code) + '</code></td><td>' + nomNiv(c) + '</td><td>' + esc(c.client) + '<br><small>' + esc(c.canal) + '</small></td><td>' + esc(c.episode) + '</td>'
      + '<td>' + jour(c.cree) + '</td><td>' + jour(c.active) + '</td><td>' + c.appareils + ' / ' + c.max_appareils + '</td>'
      + '<td>' + (Number(c.fin) ? 'oui' + (c.sceau ? ' (' + esc(c.sceau) + ')' : '') : 'non') + '</td><td>' + validite(c) + '</td><td>' + esc(c.note) + '</td>'
      + '<td><button class="second" data-code="' + esc(c.code) + '" onclick="basculer(this.dataset.code)">' + (Number(c.actif) ? 'Actif ✓' : 'Désactivé ✗') + '</button></td></tr>';
  });
  document.getElementById('liste').innerHTML = h + '</table>';
}
// 18/11 : « jour J » = activé le … / valable jusqu'au … minuit ; avant activation : à utiliser avant le …
function heure(ms){ return new Date(Number(ms)).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }); }
function validite(c){
  if (c.regle !== 'jour') return (c.expire ? 'jusqu\\'au ' + jour(c.expire) : 'sans limite') + '<br><small>multi-jours</small>';
  if (!c.fin_jour) return 'en attente' + (c.expire ? '<br><small>à activer avant le ' + jour(c.expire) + '</small>' : '');
  var fini = Number(c.fin_jour) < Date.now();
  return (fini ? 'terminé' : 'valable') + '<br><small>activé le ' + heure(c.active) + '<br>expire le ' + heure(c.fin_jour) + '</small>'
    + '<br><button class="second" data-code="' + esc(c.code) + '" onclick="prolonger(this.dataset.code)">Prolonger d\\'un jour</button>';
}
function prolonger(code){
  if (!confirm('Donner un jour de plus au code ' + code + ' ? (s\\'il est déjà terminé : valable jusqu\\'à ce soir minuit)')) return;
  api('/api/prolonger', { code: code }).then(function(r){ return r.json(); }).then(function(d){
    dire(d.ok ? 'Code ' + code + ' valable jusqu\\'au ' + heure(d.fin_jour) + '.' : (d.erreur || 'Erreur.')); charger();
  });
}
function creer(ev){
  ev.preventDefault(); dire('');
  api('/api/codes', { episode: v('f-episode'), client: v('f-client'), canal: v('f-canal'), niveau: v('f-niveau'), nombre: v('f-nombre'), max_appareils: v('f-max'), expire: v('f-expire'), multi: document.getElementById('f-multi').checked, note: v('f-note') })
    .then(function(r){ return r.json(); }).then(function(d){
      if (d.erreur) { dire(d.erreur); return; }
      dire(d.codes.length + ' code(s) créé(s) : ' + d.codes.slice(0, 5).join(', ') + (d.codes.length > 5 ? '…' : ''));
      document.getElementById('filtre').value = ''; return charger();
    });
}
function chargerReglages(){
  api('/api/reglages').then(function(r){ return r.json(); }).then(function(d){
    document.getElementById('rv-active').value = d.vente_active; document.getElementById('rv-prix').value = String(d.vente_prix).replace('.', ',');
    document.getElementById('rv-jours').value = d.vente_validite_jours; document.getElementById('rv-max').value = d.vente_appareils; document.getElementById('rv-rgpd').value = d.rgpd_mois;
    document.getElementById('r-active').value = d.promo_active; document.getElementById('r-jours').value = d.promo_jours; document.getElementById('r-note').value = d.promo_note;
  });
}
function regler(ev){
  ev.preventDefault();
  api('/api/reglages', { promo_active: v('r-active'), promo_jours: v('r-jours'), promo_note: v('r-note') }).then(function(){ dire('Réglages des promos enregistrés.'); });
}
function basculer(code){ api('/api/toggle', { code: code }).then(charger); }
function cle(ev){
  ev.preventDefault();
  api('/api/cle', { episode: v('k-episode'), cle: v('k-cle') }).then(function(r){ return r.json(); }).then(function(d){
    dire(d.erreur || 'Clé enregistrée.'); document.getElementById('k-cle').value = ''; charger();
  });
}
function exporter(){
  api('/api/export.csv').then(function(r){ return r.blob(); }).then(function(b){
    var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'petrocores-codes.csv'; a.click();
  });
}
function imprimer(){
  var l = visibles().filter(function(c){ return Number(c.actif); });
  if (!l.length) { dire('Aucun code actif à imprimer.'); return; }
  var slugs = {}; l.forEach(function(c){ slugs[c.episode === '*' ? 'saint-genies' : c.episode] = 1; });
  Promise.all(Object.keys(slugs).map(function(s){ return episodeTextes(s).then(function(e){ slugs[s] = e; }); })).then(function(){ planche(l, slugs); });
}
function texteNiveau(c, slugs){
  if (TOUS) return '';
  var e = slugs[c.episode === '*' ? 'saint-genies' : c.episode] || {}, n = e.niveaux && e.niveaux[niv(c)];
  if (!n) return '<p><b style="font-family:Georgia">' + NIV[niv(c)] + '</b></p>';
  return '<p><b style="font-family:Georgia;font-size:.9rem">' + esc(n.titre.fr) + ' · ' + esc(n.titre.en.replace(/^\\S+\\s+/, '')) + ' · ' + esc(n.titre.es.replace(/^\\S+\\s+/, '')) + '</b> — ' + esc(n.sous.fr) + '</p>'
    + ['fr', 'en', 'es'].map(function(lg){ return '<p class="desc">' + lg.toUpperCase() + ' — ' + esc(n.desc[lg]) + '</p>'; }).join('');
}
function planche(l, slugs){
  document.getElementById('planche').innerHTML = l.map(function(c){
    var lien = APP + '?' + (c.episode === '*' ? '' : 'episode=' + encodeURIComponent(c.episode) + '&') + 'code=' + encodeURIComponent(c.code);
    var q = qrcode(0, 'M'); q.addData(lien); q.make();
    return '<div class="carte"><img src="' + q.createDataURL(6, 0) + '" alt=""><div><b>' + esc(c.code) + '</b>' + texteNiveau(c, slugs)
      + '<p>FR — Scannez le QR code, ou ouvrez l\\'application et touchez « J\\'ai un code ».</p>'
      + '<p>EN — Scan the QR code, or open the app and tap “I have a code”.</p>'
      + '<p>ES — Escanee el código QR, o abra la aplicación y toque «Tengo un código».</p>'
      + '<p>' + c.max_appareils + ' tél. max' + (c.regle === 'jour' ? ' · valable le jour de l\\'activation (sur place), jusqu\\'à minuit' + (c.expire ? ' · à activer avant le ' + jour(c.expire) : '')
        : (c.expire ? ' · valable jusqu\\'au ' + jour(c.expire) : '')) + '</p></div></div>';
  }).join('');
  setTimeout(function(){ window.print(); }, 200);
}

// ---------- Ventes en ligne (16/11) ----------
var VENTES = [];
var STATUTS = { attente: '⏳ en attente', paye: '✅ payée', echec: '❌ refusée', expire: '⌛ expirée', erreur: '⚠ erreur SumUp', anomalie: '⚠ montant anormal' };
// Texte de l'email du code (Claude chat, VITRINE_TEXTES_16-11) : le serveur l'envoie tout seul (même texte dans index.js) ; ici, copie de secours.
var MAIL = {
  objet: { fr: 'Votre code Pétrocores — Saint-Geniès', en: 'Your Pétrocores code — Saint-Geniès', es: 'Vuestro código Pétrocores — Saint-Geniès' },
  corps: {
    fr: "Bonjour, merci pour votre achat ! Votre code : {CODE}. Il s'active sur place, à Saint-Geniès, et reste valable jusqu'à minuit ce jour-là, sur 2 téléphones. À utiliser avant le {DATE}. Pour jouer : rendez-vous au parking du lavoir de Saint-Geniès, ouvrez {LIEN} et entrez le code. Frère Aymeric vous attend. — Gonzalo, DORDRONE · contact@escape-game-dordogne.fr",
    en: "Hello, thank you for your purchase! Your code: {CODE}. It activates on site in Saint-Geniès and stays valid until midnight that day, on 2 phones. To be used before {DATE}. To play: go to the wash-house car park in Saint-Geniès, open {LIEN} and enter the code. Brother Aymeric is waiting for you. — Gonzalo, DORDRONE · contact@escape-game-dordogne.fr",
    es: "Hola, ¡gracias por vuestra compra! Vuestro código: {CODE}. Se activa allí mismo, en Saint-Geniès, y es válido hasta medianoche ese día, en 2 móviles. A usar antes del {DATE}. Para jugar: id al aparcamiento del lavadero de Saint-Geniès, abrid {LIEN} e introducid el código. Fray Aymeric os espera. — Gonzalo, DORDRONE · contact@escape-game-dordogne.fr"
  },
  cadeau: { fr: '🎁 Un cadeau pour {PRENOM} : « {MESSAGE} »', en: '🎁 A gift for {PRENOM}: “{MESSAGE}”', es: '🎁 Un regalo para {PRENOM}: «{MESSAGE}»' }
};
function texteMail(x){
  var lg = MAIL.objet[x.lang] ? x.lang : 'fr';
  var date = x.expire ? new Date(Number(x.expire)).toLocaleDateString({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES' }[lg], { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  var lien = APP.replace('index.html', '') + '?episode=' + encodeURIComponent(x.episode) + '&code=' + encodeURIComponent(x.code);
  var corps = MAIL.corps[lg].replace('{CODE}', x.code).replace('{DATE}', date).replace('{LIEN}', lien);
  if (Number(x.cadeau)) corps = MAIL.cadeau[lg].replace('{PRENOM}', x.prenom || '').replace('{MESSAGE}', x.message || '') + '\\n\\n' + corps;
  return { objet: MAIL.objet[lg], corps: corps };
}
function chargerVentes(){
  return api('/api/ventes').then(function(r){ return r.json(); }).then(function(d){
    VENTES = d.ventes;
    document.getElementById('v-mode').innerHTML = !d.branchee ? '⚠ SumUp n\\'est pas encore branché (clés manquantes) : la vitrine affiche « bientôt ».'
      : d.simulation ? '🧪 SIMULATION locale (aucun SumUp).' : d.test ? '🧪 MODE TEST : paiements avec le compte de test SumUp, aucun argent réel.' : '💶 MODE RÉEL : vrais paiements.';
    afficherVentes();
  });
}
function afficherVentes(){
  var f = v('v-filtre'), l = VENTES.filter(function(x){ return !f || x.statut === f; });
  var payees = VENTES.filter(function(x){ return x.statut === 'paye' && !Number(x.test); });
  var total = payees.reduce(function(s, x){ return s + Number(x.montant); }, 0);
  var h = '<p style="font-size:.8rem">' + l.length + ' commande(s) · ' + payees.length + ' vente(s) réelle(s) payée(s) = ' + (total / 100).toFixed(2).replace('.', ',') + ' €</p>'
    + '<table><tr><th>Date</th><th>Email</th><th>Montant</th><th>Statut</th><th>Code</th><th>Cadeau</th><th></th></tr>';
  l.forEach(function(x){
    h += '<tr class="' + (x.code && !Number(x.actif) ? 'off' : '') + '"><td>' + new Date(Number(x.ts)).toLocaleString('fr-FR') + (Number(x.test) ? '<br><small>TEST</small>' : '') + '</td>'
      + '<td>' + esc(x.email) + '<br><small>' + esc(x.lang) + ' · ' + esc(x.id) + '</small>'
        + (x.email_envoye ? '<br><small>📧 envoyé le ' + new Date(Number(x.email_envoye)).toLocaleString('fr-FR') + '</small>'
          : x.email_erreur ? '<br><small style="color:#8c2f23">⚠ email non parti : ' + esc(x.email_erreur) + '</small>'
          : x.code ? '<br><small>📧 pas encore envoyé</small>' : '') + '</td>'
      + '<td>' + (x.montant / 100).toFixed(2).replace('.', ',') + ' €</td>'
      + '<td>' + (STATUTS[x.statut] || esc(x.statut)) + '<br><small>' + esc(x.statut_sumup || '') + (x.transaction_code ? ' · ' + esc(x.transaction_code) : '') + '</small></td>'
      + '<td>' + (x.code ? '<code>' + esc(x.code) + '</code><br><small>à activer avant le ' + jour(x.expire) + '</small>' : '—') + '</td>'
      + '<td>' + (Number(x.cadeau) ? '🎁 ' + esc(x.prenom) : 'non') + '</td><td>'
      + (x.code ? '<button class="second" data-id="' + esc(x.id) + '" onclick="renvoyerMail(this.dataset.id)">' + (x.email_envoye ? 'Renvoyer l\\'email' : 'Envoyer l\\'email') + '</button> '
        + '<button class="second" data-id="' + esc(x.id) + '" onclick="copierMail(this.dataset.id)">Copier l\\'email</button> '
        + '<button class="second" data-code="' + esc(x.code) + '" onclick="basculerVente(this.dataset.code)">' + (Number(x.actif) ? 'Désactiver le code' : 'Réactiver le code') + '</button>'
        : x.statut !== 'erreur' ? '<button class="second" data-id="' + esc(x.id) + '" onclick="reverifier(this.dataset.id)">Redemander à SumUp</button>' : '')
      + '</td></tr>';
  });
  document.getElementById('ventes').innerHTML = h + '</table>';
}
function copierMail(id){
  var x = VENTES.filter(function(y){ return y.id === id; })[0]; if (!x) return;
  var m = texteMail(x), t = 'À : ' + x.email + '\\nObjet : ' + m.objet + '\\n\\n' + m.corps;
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function(){ dire('Email copié : colle-le dans ta messagerie (à ' + x.email + ').'); }, function(){ prompt('Copie ce texte :', t); });
}
function renvoyerMail(id){
  var x = VENTES.filter(function(y){ return y.id === id; })[0]; if (!x) return;
  if (!confirm('Envoyer le code ' + x.code + ' à ' + x.email + ' ?')) return;
  dire('Envoi en cours…');
  api('/api/ventes/email', { id: id }).then(function(r){ return r.json(); }).then(function(d){
    dire(d.ok ? '📧 Email envoyé à ' + x.email + '.' : '⚠ Email non parti : ' + (d.erreur || '?')); chargerVentes();
  });
}
function mailEssai(ev){
  ev.preventDefault();
  var a = v('me-adresse'); if (!a) return;
  dire('Envoi en cours…');
  api('/api/mail-essai', { email: a }).then(function(r){ return r.json(); }).then(function(d){
    dire(d.ok ? '📧 Email d\\'essai envoyé à ' + a + ' : regarde ta boîte (et les spams).' : '⚠ Email non parti : ' + (d.erreur || '?'));
  });
}
function basculerVente(code){ if (confirm('Changer l\\'état du code ' + code + ' ? (après un remboursement fait dans SumUp : le désactiver)')) api('/api/toggle', { code: code }).then(chargerVentes); }
function reverifier(id){ api('/api/ventes/verifier', { id: id }).then(function(r){ return r.json(); }).then(function(d){ dire('SumUp dit : ' + ((d.vente && d.vente.statut_sumup) || '?')); chargerVentes(); }); }
function exporterVentes(){
  api('/api/ventes.csv').then(function(r){ return r.blob(); }).then(function(b){
    var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'petrocores-ventes.csv'; a.click();
  });
}
function reglerVente(ev){
  ev.preventDefault();
  api('/api/reglages', { vente_active: v('rv-active'), vente_prix: v('rv-prix').replace(',', '.'), vente_validite_jours: v('rv-jours'), vente_appareils: v('rv-max'), rgpd_mois: v('rv-rgpd') })
    .then(function(){ dire('Réglages de la vente enregistrés.'); });
}

// ---------- Statistiques ----------
function periode(jours){
  var f = function(d){ return d.toISOString().slice(0, 10); };
  document.getElementById('s-au').value = jours ? f(new Date()) : '';
  document.getElementById('s-du').value = jours ? f(new Date(Date.now() - (jours - 1) * 86400000)) : '';
  stats();
}
function tableau(titre, lignes, total){
  var max = Math.max.apply(null, lignes.map(function(l){ return l.n; }).concat([1]));
  return '<div><h2>' + titre + '</h2><table>' + (lignes.length ? lignes.map(function(l){
    return '<tr><td>' + esc(l.k) + '</td><td><span class="barre" style="width:' + Math.round(120 * l.n / max) + 'px"></span>' + l.n
      + (total ? ' <small>(' + Math.round(100 * l.n / total) + ' %)</small>' : '') + '</td></tr>';
  }).join('') : '<tr><td>Aucune donnée</td></tr>') + '</table></div>';
}
function stats(){
  var q = '?du=' + encodeURIComponent(v('s-du')) + '&au=' + encodeURIComponent(v('s-au')) + '&client=' + encodeURIComponent(v('s-client'));
  api('/api/stats' + q).then(function(r){ return r.json(); }).then(function(d){
    var s = document.getElementById('s-client'), garde = s.value;
    s.innerHTML = '<option value="">Tous</option><option>(sans code)</option>' + d.clients.map(function(n){ return '<option>' + esc(n) + '</option>'; }).join('');
    s.value = garde;
    var t = d.totaux, lancees = t.lancees || 0, min = t.duree_moyenne ? Math.round(t.duree_moyenne / 60) + ' min' : '—';
    var taux = function(a, b){ return b ? Math.round(100 * a / b) + ' %' : '—'; };
    var tuile = function(n, texte){ return '<div class="tuile"><b>' + n + '</b><span>' + texte + '</span></div>'; };
    // Par énigme : atteinte, indices, réponses dévoilées, abandons (dernière étape des parties non terminées).
    var enigmes = {};
    var note = function(liste, champ){ liste.forEach(function(l){ (enigmes[l.k] = enigmes[l.k] || { k: l.k, atteintes: 0, indices: 0, solutions: 0, abandons: 0 })[champ] = l.n; }); };
    note(d.atteintes, 'atteintes'); note(d.indices, 'indices'); note(d.solutions, 'solutions'); note(d.abandons, 'abandons');
    var lignes = Object.keys(enigmes).map(function(k){ return enigmes[k]; }).sort(function(a, b){ return b.atteintes - a.atteintes; });
    var h = '<div class="tuiles">' + tuile(lancees, 'parties lancées') + tuile(t.terminees || 0, 'parties terminées (' + taux(t.terminees || 0, lancees) + ')')
      + tuile(t.sans_code || 0, 'parties sans code (démo)') + tuile(t.activations || 0, 'téléphones activés') + tuile(min, 'durée moyenne d\\'une partie terminée') + '</div>';
    h += '<h2>Par énigme</h2><table><tr><th>Énigme</th><th>Groupes arrivés</th><th>Indices demandés</th><th>Réponses dévoilées</th><th>Abandons ici</th></tr>'
      + (lignes.length ? lignes.map(function(l){
        return '<tr><td><code>' + esc(l.k) + '</code></td><td>' + l.atteintes + '</td><td>' + l.indices + '</td><td>' + l.solutions + '</td><td>' + l.abandons + '</td></tr>';
      }).join('') : '<tr><td colspan="5">Aucune donnée</td></tr>') + '</table>';
    h += '<h2>Classement des Grands Maîtres (meilleurs temps, pénalités comprises)</h2><table><tr><th>#</th><th>Temps</th><th>Sceau</th><th>Date</th><th>Client</th></tr>'
      + (d.classement.length ? d.classement.map(function(c, i){
        var m = Math.round(c.duree / 60);
        return '<tr><td>' + (i + 1) + '</td><td>' + Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + '</td><td>' + esc(c.sceau) + '</td><td>' + jour(c.ts) + '</td><td>' + esc(c.client || '—') + '</td></tr>';
      }).join('') : '<tr><td colspan="5">Aucune partie Grand Maître terminée</td></tr>') + '</table>';
    h += '<div class="deux">' + tableau('Niveaux choisis', d.niveaux, lancees) + tableau('Niveaux terminés', d.niveaux_fin, t.terminees) + tableau('Sceaux obtenus', d.sceaux, t.terminees) + tableau('Langues', d.langues, lancees) + tableau('Parcours', d.parcours, lancees)
      + tableau('Téléphones activés par client', d.activations, t.activations) + '</div>';
    // 16/11 : ventes en ligne par jour, et part des groupes « démo » (sans code) qui achètent.
    var nv = d.ventes.reduce(function(s, x){ return s + x.n; }, 0), nr = d.ventes.reduce(function(s, x){ return s + x.n - x.t; }, 0);
    h += '<h2>Ventes en ligne</h2><div class="tuiles">' + tuile(nr, 'ventes réelles payées') + tuile(nv - nr, 'ventes de test')
      + tuile(taux(nv, (t.sans_code || 0) + nv), 'des groupes démo ont acheté (ventes ÷ (démos + ventes), approché)') + '</div>'
      + '<table><tr><th>Jour</th><th>Ventes</th><th>dont test</th><th>Montant</th></tr>' + (d.ventes.length ? d.ventes.map(function(x){
        return '<tr><td>' + esc(x.k) + '</td><td>' + x.n + '</td><td>' + x.t + '</td><td>' + (x.s / 100).toFixed(2).replace('.', ',') + ' €</td></tr>';
      }).join('') : '<tr><td colspan="4">Aucune vente</td></tr>') + '</table>';
    document.getElementById('stats').innerHTML = h;
  });
}
charger();
chargerReglages();
</script></body></html>`;
