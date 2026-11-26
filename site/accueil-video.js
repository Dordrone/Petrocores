// Vidéo de bienvenue de la vitrine (26/11, accueil_v10_vertical → site/accueil.mp4).
// 1er passage : plein écran par-dessus la page, muette avec sous-titres, 🔊 pour le son, ✕ pour passer.
// Ensuite : seulement le lien « ▶ Revoir la vidéo ». Jamais sur le jeu (/app/) ni sur merci.html.
(function () {
  if (document.body.dataset.page !== 'accueil') return;

  const TXT = {
    ecouter: { fr: '🔊 Écouter', en: '🔊 Listen', es: '🔊 Escuchar' },
    couper: { fr: 'Couper le son', en: 'Mute', es: 'Silenciar' },
    passer: { fr: '✕ Passer', en: '✕ Skip', es: '✕ Saltar' },
    revoir: { fr: '▶ Revoir la vidéo', en: '▶ Watch the video again', es: '▶ Volver a ver el vídeo' },
    lire: { fr: 'Lire la vidéo', en: 'Play the video', es: 'Reproducir el vídeo' }
  };
  const CLE_VU = 'accueil_vu';
  const lireLS = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const ecrireLS = (k, v) => { try { localStorage.setItem(k, v); } catch { /* navigation privée */ } };
  // même langue que la vitrine (variable « lang » de vitrine.js, sinon les mêmes règles)
  const langue = () => {
    let l = (typeof lang === 'string' && lang) || new URLSearchParams(location.search).get('lang')
      || lireLS('petrocores_vitrine_lang') || (navigator.language || 'fr').slice(0, 2);
    return ['fr', 'en', 'es'].includes(l) ? l : 'fr';
  };
  const tx = k => TXT[k][langue()];

  const sobre = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)
    || (navigator.connection && navigator.connection.saveData);

  // lien « Revoir » sous les boutons de l'en-tête
  const lien = document.createElement('p');
  lien.className = 'lien-video';
  lien.innerHTML = '<button type="button" id="b-revoir"></button>';
  const ancre = document.querySelector('.entete .lien-testeur') || document.querySelector('.entete .boutons');
  if (ancre) ancre.after(lien);
  const bRevoir = lien.querySelector('button');

  let fond = null, video = null, bSon = null, bLire = null, bPasser = null;

  function textes() {
    bRevoir.textContent = tx('revoir');
    if (!fond) return;
    bPasser.textContent = tx('passer');
    bLire.setAttribute('aria-label', tx('lire'));
    if (video.muted) { bSon.textContent = tx('ecouter'); bSon.removeAttribute('aria-label'); }
    else { bSon.textContent = '🔇'; bSon.setAttribute('aria-label', tx('couper')); }
    chargerSousTitres(langue());
  }

  // 27/11 : sous-titres affichés par la page (et non par le téléphone) : avec la vidéo en plein écran,
  // les sous-titres du téléphone se plaçaient sur l'image entière, plus large que l'écran → phrase coupée.
  let cues = [], langCues = '';
  const sec = h => h.split(':').reduce((a, x) => a * 60 + parseFloat(x), 0);
  async function chargerSousTitres(l) {
    if (l === langCues) return;
    langCues = l; cues = [];
    try {
      const txt = await (await fetch('site/accueil.' + l + '.vtt')).text();
      if (l !== langCues) return;
      cues = txt.replace(/\r/g, '').split(/\n\n+/).map(b => {
        const m = b.match(/(\d[\d:.]+)\s*-->\s*(\d[\d:.]+)[^\n]*\n([\s\S]+)/);
        return m && { de: sec(m[1]), a: sec(m[2]), texte: m[3].trim() };
      }).filter(Boolean);
    } catch { /* pas de sous-titres, la vidéo continue */ }
    majSousTitre();
  }
  function majSousTitre() {
    if (!fond) return;
    const st = fond.querySelector('.va-st'), t0 = video.currentTime;
    const c = cues.find(x => t0 >= x.de && t0 < x.a);
    st.textContent = c ? c.texte : '';
    st.hidden = !c;
  }

  function ouvrir(auto) {
    if (fond) return;
    fond = document.createElement('div');
    fond.className = 'video-accueil';
    fond.setAttribute('role', 'dialog');
    fond.setAttribute('aria-modal', 'true');
    fond.innerHTML =
      '<video playsinline muted preload="auto" poster="site/accueil.jpg">' +
        '<source src="site/accueil.mp4" type="video/mp4">' +
      '</video>' +
      '<p class="va-st" aria-live="polite" hidden></p>' +
      '<button type="button" class="va-passer"></button>' +
      '<button type="button" class="va-lire" hidden>▶</button>' +
      '<button type="button" class="va-son"></button>';
    document.body.appendChild(fond);
    document.documentElement.classList.add('video-ouverte');
    video = fond.querySelector('video');
    bSon = fond.querySelector('.va-son');
    bLire = fond.querySelector('.va-lire');
    bPasser = fond.querySelector('.va-passer');
    textes();
    langCues = '';
    textes();
    video.addEventListener('timeupdate', majSousTitre);
    video.addEventListener('seeked', majSousTitre);

    bPasser.onclick = fermer;
    bSon.onclick = () => {
      video.muted = !video.muted;
      if (video.paused) video.play().catch(() => {});
      textes();
    };
    bLire.onclick = () => { bLire.hidden = true; video.play().catch(() => { bLire.hidden = false; }); };
    video.addEventListener('play', () => { bLire.hidden = true; });
    video.addEventListener('ended', fermer);
    // la page ne doit jamais rester bloquée si la vidéo ne charge pas
    video.addEventListener('error', fermer);
    video.querySelector('source').addEventListener('error', fermer);
    document.addEventListener('keydown', echap);
    requestAnimationFrame(() => fond.classList.add('visible'));
    bPasser.focus({ preventScroll: true });

    if (auto) video.play().catch(() => { bLire.hidden = false; });
    else bLire.hidden = false;
  }

  function echap(e) { if (e.key === 'Escape') fermer(); }

  function fermer() {
    if (!fond) return;
    ecrireLS(CLE_VU, '1');
    const f = fond, v = video;
    fond = video = bSon = bLire = bPasser = null;
    document.removeEventListener('keydown', echap);
    document.documentElement.classList.remove('video-ouverte');
    try { v.pause(); } catch { /* rien */ }
    f.classList.remove('visible');
    setTimeout(() => { v.removeAttribute('src'); f.remove(); }, 500);
    bRevoir.focus({ preventScroll: true });
  }

  bRevoir.onclick = () => ouvrir(true);
  // changement de langue sur la vitrine → textes et sous-titres suivent
  document.addEventListener('click', e => { if (e.target.closest('.langues button')) setTimeout(textes, 0); });
  textes();

  if (!lireLS(CLE_VU)) ouvrir(!sobre);
})();
