// Page d'administration (onglets Codes et Statistiques). Le JavaScript du navigateur n'utilise pas de gabarits `…`
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
.carte p{margin:3px 0;font-size:.72rem}
@media print{
  body{background:#fff;padding:0;max-width:none}
  #ecran{display:none}#planche{display:grid;grid-template-columns:1fr 1fr;gap:8mm}
  @page{size:A4;margin:10mm}
}
</style></head><body>
<div id="ecran">
<h1>Pétrocores — Administration</h1>
<div class="onglets"><button id="o-codes" class="actif" onclick="onglet('codes')">Codes clients</button><button id="o-stats" onclick="onglet('stats')">Statistiques</button></div>
<div id="msg"></div>

<div id="p-codes">
<h2>Créer des codes</h2>
<div class="cadre"><form onsubmit="creer(event)">
  <label>Épisode<input id="f-episode" value="saint-genies" list="episodes" required><datalist id="episodes"><option value="saint-genies"><option value="*"></datalist></label>
  <label>Client<input id="f-client" list="clients" placeholder="Office de tourisme Sarlat" required><datalist id="clients"></datalist></label>
  <label>Canal<select id="f-canal"><option value="main">À la main</option><option value="web">Web</option><option value="play">Play Store</option></select></label>
  <label>Nombre de codes<input id="f-nombre" type="number" min="1" max="200" value="1" style="width:6em"></label>
  <label>Téléphones par code<input id="f-max" type="number" min="1" max="50" value="__DEFAUT__" style="width:6em"></label>
  <label>Expire le (facultatif)<input id="f-expire" type="date"></label>
  <label style="flex:1;min-width:12em">Note<input id="f-note" placeholder="facultatif"></label>
  <button>Créer</button>
</form></div>

<h2>Codes</h2>
<div class="outils">
  <label>Filtrer par client<select id="filtre" onchange="afficher()"><option value="">Tous</option></select></label>
  <label>État<select id="etat" onchange="afficher()"><option value="">Tous</option><option value="libre">Jamais activés</option><option value="pris">Activés</option><option value="off">Désactivés</option></select></label>
  <button class="second" onclick="imprimer()">Imprimer la planche (codes affichés)</button>
  <button class="second" onclick="exporter()">Exporter en CSV</button>
</div>
<div id="liste">Chargement…</div>

<h2>Clé de déchiffrement d'un épisode</h2>
<div class="cadre"><form onsubmit="cle(event)">
  <label>Épisode<input id="k-episode" value="saint-genies" required></label>
  <label style="flex:1;min-width:16em">Clé (donnée par Claude Code, à coller une seule fois)<input id="k-cle" required></label>
  <button>Enregistrer la clé</button>
</form><p id="cles" style="font-size:.8rem;margin:8px 0 0"></p></div>
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
  ['codes', 'stats'].forEach(function(n){
    document.getElementById('p-' + n).hidden = n !== nom;
    document.getElementById('o-' + n).className = n === nom ? 'actif' : '';
  });
  dire('');
  if (nom === 'stats') stats();
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
    return true;
  });
}
function afficher(){
  var l = visibles();
  var h = '<p style="font-size:.8rem">' + l.length + ' code(s)</p><table><tr><th>Code</th><th>Client</th><th>Épisode</th><th>Créé</th><th>Activé</th><th>Téléphones</th><th>Terminée</th><th>Expire</th><th>Note</th><th>État</th></tr>';
  l.forEach(function(c){
    h += '<tr class="' + (Number(c.actif) ? '' : 'off') + '"><td><code>' + esc(c.code) + '</code></td><td>' + esc(c.client) + '<br><small>' + esc(c.canal) + '</small></td><td>' + esc(c.episode) + '</td>'
      + '<td>' + jour(c.cree) + '</td><td>' + jour(c.active) + '</td><td>' + c.appareils + ' / ' + c.max_appareils + '</td>'
      + '<td>' + (Number(c.fin) ? 'oui' + (c.sceau ? ' (' + esc(c.sceau) + ')' : '') : 'non') + '</td><td>' + jour(c.expire) + '</td><td>' + esc(c.note) + '</td>'
      + '<td><button class="second" data-code="' + esc(c.code) + '" onclick="basculer(this.dataset.code)">' + (Number(c.actif) ? 'Actif ✓' : 'Désactivé ✗') + '</button></td></tr>';
  });
  document.getElementById('liste').innerHTML = h + '</table>';
}
function creer(ev){
  ev.preventDefault(); dire('');
  api('/api/codes', { episode: v('f-episode'), client: v('f-client'), canal: v('f-canal'), nombre: v('f-nombre'), max_appareils: v('f-max'), expire: v('f-expire'), note: v('f-note') })
    .then(function(r){ return r.json(); }).then(function(d){
      if (d.erreur) { dire(d.erreur); return; }
      dire(d.codes.length + ' code(s) créé(s) : ' + d.codes.slice(0, 5).join(', ') + (d.codes.length > 5 ? '…' : ''));
      document.getElementById('filtre').value = ''; return charger();
    });
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
  document.getElementById('planche').innerHTML = l.map(function(c){
    var lien = APP + '?' + (c.episode === '*' ? '' : 'episode=' + encodeURIComponent(c.episode) + '&') + 'code=' + encodeURIComponent(c.code);
    var q = qrcode(0, 'M'); q.addData(lien); q.make();
    return '<div class="carte"><img src="' + q.createDataURL(6, 0) + '" alt=""><div><b>' + esc(c.code) + '</b>'
      + '<p>FR — Scannez le QR code, ou ouvrez l\\'application et touchez « J\\'ai un code ».</p>'
      + '<p>EN — Scan the QR code, or open the app and tap “I have a code”.</p>'
      + '<p>ES — Escanee el código QR, o abra la aplicación y toque «Tengo un código».</p>'
      + '<p>' + c.max_appareils + ' tél. max' + (c.expire ? ' · valable jusqu\\'au ' + jour(c.expire) : '') + '</p></div></div>';
  }).join('');
  setTimeout(function(){ window.print(); }, 200);
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
    h += '<div class="deux">' + tableau('Sceaux obtenus', d.sceaux, t.terminees) + tableau('Langues', d.langues, lancees) + tableau('Parcours', d.parcours, lancees)
      + tableau('Téléphones activés par client', d.activations, t.activations) + '</div>';
    document.getElementById('stats').innerHTML = h;
  });
}
charger();
</script></body></html>`;
