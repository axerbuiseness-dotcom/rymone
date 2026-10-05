// Música: expositor de CDs con reproductor.
// Arriba, la caja del CD elegido y su disco, que sale de la caja con la portada impresa y gira.
// - «Escuchar» reproduce la canción; el disco gira más rápido y las barras siguen el sonido.
// - Arrastrar el disco hace "scratch": mientras suena, adelanta o retrocede la canción.
// - La barra de progreso permite saltar a cualquier punto (también con teclado).
// - Al acabar una canción pasa a la siguiente que tenga audio.
// Abajo, el estante con las cinco cajas: al pulsarlas cambia el disco (y si estaba sonando, sigue sonando).
// Las canciones sin `audio` lo dicen claramente y no simulan reproducción.
import { html, toNode, picture, tituloImg } from '../dom.js';
import { canciones, cancionesPublicadas, tituloCancion } from '../data/musica.js';
import { footer, instagramMarquee } from './shared.js';
import { initMarquees } from '../fx/marquee.js';
import { prefersReducedMotion } from '../fx/motion.js';

const src = (c, w = 840) => `/media/${c.imagen.name}-${w}.webp`;
const fmt = (t) => (Number.isFinite(t) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}` : '0:00');
const BARS = 14;

// Un único reproductor para toda la web (la portada y la página de música lo comparten)
let audio = null, actx = null, analyser = null, freq = null;
const getAudio = () => {
  if (!audio) { audio = new Audio(); audio.preload = 'metadata'; }
  return audio;
};
const ensureAnalyser = () => {
  if (analyser || !window.AudioContext) return;
  try {
    actx = new AudioContext();
    const srcNode = actx.createMediaElementSource(getAudio());
    analyser = actx.createAnalyser();
    analyser.fftSize = 64;
    srcNode.connect(analyser); analyser.connect(actx.destination);
    freq = new Uint8Array(analyser.frequencyBinCount);
  } catch { analyser = null; }
};

export const expositor = ({ id = 'disco' } = {}) => html`
  <section class="disco" data-disco aria-labelledby="${id}-title" style="--tinte:${canciones[0].tinte}">
    <div class="disco__stage">
      <div class="disco__player">
        <div class="disco__disc" data-disc aria-hidden="true" style="--print:url('${src(canciones[0])}')">
          <span class="disc__print"></span><span class="disc__shine"></span><span class="disc__hole"></span>
        </div>
        <div class="disco__case" data-case>
          ${picture(canciones[0].imagen, { alt: canciones[0].alt, sizes: '(min-width: 900px) 34vw, 78vw', attrs: 'data-case-img' })}
        </div>
      </div>
      <div class="disco__info">
        <p class="label disco__num" data-num>Pista ${canciones[0].numero} / ${String(cancionesPublicadas.length).padStart(2, '0')}</p>
        <h3 class="disco__title" id="${id}-title" data-title>${tituloCancion(canciones[0])}</h3>
        <p class="disco__artist" data-artist>${canciones[0].artista}</p>
        <div class="disco__eq" aria-hidden="true" data-eq>${Array(BARS).fill(html`<i></i>`)}</div>
        <div class="disco__controls">
          <button class="btn disco__play" type="button" data-play aria-pressed="false">▶ Escuchar</button>
        </div>
        <div class="disco__time" data-timebox>
          <span class="label" data-cur>0:00</span>
          <input class="disco__seek" type="range" min="0" max="100" step="0.1" value="0" data-seek aria-label="Posición en la canción">
          <span class="label" data-dur>0:00</span>
        </div>
        <p class="label disco__audio" data-audio-msg aria-live="polite"></p>
        <p class="sr-only">${matchMedia('(pointer: coarse)').matches ? 'Arrastra el disco con el dedo para scratchear' : 'Arrastra el disco para scratchear'}</p>
      </div>
    </div>
    <div class="disco__rack" role="listbox" aria-label="Canciones" data-rack>
      ${canciones.map((c, i) => html`
        <button class="disco__slot ${c.locked ? 'disco__slot--locked' : ''}" type="button" role="option" aria-selected="${i === 0}" data-slot="${i}" style="--i:${i}; --tinte:${c.tinte}" aria-label="${c.locked ? 'Próxima canción, todavía bloqueada' : `${tituloCancion(c)} · ${c.artista}`}">
          ${picture(c.imagen, { alt: '', sizes: '160px' })}
          ${c.locked ? html`<span class="disco__lock" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>` : ''}
        </button>`)}
    </div>
  </section>`;

export function initExpositor(root) {
  const el = root.querySelector('[data-disco]');
  if (!el) return () => {};
  const reduced = prefersReducedMotion();
  const player = getAudio();
  const $ = (s) => el.querySelector(s);
  const disc = $('[data-disc]'), caseEl = $('[data-case]'), caseImg = $('[data-case-img]'), caseSource = caseEl.querySelector('source');
  const slots = [...el.querySelectorAll('[data-slot]')];
  const title = $('[data-title]'), num = $('[data-num]'), artist = $('[data-artist]'), msg = $('[data-audio-msg]');
  const playBtn = $('[data-play]'), seek = $('[data-seek]'), cur = $('[data-cur]'), dur = $('[data-dur]'), timebox = $('[data-timebox]');
  const bars = [...el.querySelectorAll('[data-eq] i')];
  let active = 0, angle = 0, raf = 0, scratch = null, visible = true, seeking = false;
  const loaded = () => player.dataset.slug === canciones[active].slug;
  const playing = () => loaded() && !player.paused;

  // ---------- Estado de la interfaz ----------
  const paintState = () => {
    const c = canciones[active];
    const on = playing();
    el.classList.toggle('is-playing', on);
    playBtn.textContent = on ? '❚❚ Pausa' : '▶ Escuchar';
    playBtn.setAttribute('aria-pressed', String(on));
    playBtn.disabled = !c.audio;
    timebox.hidden = !c.audio;
    el.classList.toggle('is-locked', !!c.locked);
    if (c.locked) msg.textContent = 'Todavía no se puede escuchar. Muy pronto.';
    else if (!c.audio) msg.textContent = 'El audio de esta canción llegará pronto.';
    else if (msg.textContent.startsWith('El audio') || msg.textContent.startsWith('Todavía')) msg.textContent = '';
  };
  const paintTime = () => {
    if (!loaded()) { cur.textContent = '0:00'; seek.value = 0; return; }
    const d = player.duration;
    dur.textContent = fmt(d);
    if (!seeking) { cur.textContent = fmt(player.currentTime); seek.value = d ? (player.currentTime / d) * 100 : 0; }
  };

  // ---------- Reproducción ----------
  const load = (c) => { player.src = c.audio; player.dataset.slug = c.slug; };
  const play = async () => {
    const c = canciones[active];
    if (!c.audio) return;
    if (!loaded()) load(c);
    ensureAnalyser();
    try { await actx?.resume(); await player.play(); msg.textContent = ''; }
    catch { msg.textContent = 'No se ha podido reproducir. Pulsa de nuevo.'; }
    paintState();
  };
  playBtn.addEventListener('click', () => {
    if (playing()) player.pause(); else play();
    el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump');
  });
  seek.addEventListener('input', () => { seeking = true; if (loaded() && player.duration) cur.textContent = fmt((seek.value / 100) * player.duration); });
  seek.addEventListener('change', () => {
    seeking = false;
    if (!loaded()) load(canciones[active]);
    const go = () => { player.currentTime = (seek.value / 100) * player.duration; paintTime(); };
    player.duration ? go() : player.addEventListener('loadedmetadata', go, { once: true });
  });
  const onPlayState = () => paintState();
  const onTime = () => paintTime();
  const onMeta = () => paintTime();
  const onEnded = () => {
    if (!loaded()) return;
    // Pasa a la siguiente canción que tenga audio
    for (let k = 1; k <= canciones.length; k++) {
      const n = (active + k) % canciones.length;
      if (canciones[n].audio) { select(n, false, true); return; }
    }
  };
  player.addEventListener('play', onPlayState); player.addEventListener('pause', onPlayState);
  player.addEventListener('timeupdate', onTime); player.addEventListener('loadedmetadata', onMeta);
  player.addEventListener('ended', onEnded);

  // ---------- Disco: giro, barras y scratch ----------
  const tick = () => {
    const on = playing();
    if (!scratch && !reduced) angle += on ? 4.2 : 1.2;
    disc.style.setProperty('--a', `${angle.toFixed(2)}deg`);
    if (on && analyser) {
      analyser.getByteFrequencyData(freq);
      bars.forEach((b, i) => { b.style.setProperty('--h', (freq[Math.min(freq.length - 1, i + 1)] / 255).toFixed(3)); });
      const bass = (freq[1] + freq[2]) / 510;
      disc.style.setProperty('--pulse', bass.toFixed(3));
    } else if (on) {
      bars.forEach((b, i) => b.style.setProperty('--h', (0.3 + 0.5 * Math.abs(Math.sin(performance.now() / 180 + i))).toFixed(3)));
    } else {
      bars.forEach((b) => b.style.setProperty('--h', '0.08'));
      disc.style.setProperty('--pulse', '0');
    }
    raf = visible ? requestAnimationFrame(tick) : 0;
  };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); });
  io.observe(el);
  const angleAt = (e) => {
    const r = disc.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  disc.addEventListener('pointerdown', (e) => {
    scratch = { last: angleAt(e) };
    try { disc.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
    disc.classList.add('is-scratch');
  });
  disc.addEventListener('pointermove', (e) => {
    if (!scratch) return;
    const a = angleAt(e);
    let d = a - scratch.last;
    if (d > 180) d -= 360; if (d < -180) d += 360;
    angle += d; scratch.last = a;
    // Una vuelta completa del disco = 2 segundos de canción
    if (playing() && player.duration) player.currentTime = Math.max(0, Math.min(player.duration - 0.2, player.currentTime + (d / 360) * 2));
    if (reduced) disc.style.setProperty('--a', `${angle.toFixed(2)}deg`);
  });
  const release = () => { scratch = null; disc.classList.remove('is-scratch'); };
  disc.addEventListener('pointerup', release);
  disc.addEventListener('pointercancel', release);

  // ---------- Cambiar de CD ----------
  let swapTimer = 0;
  const select = (i, focus = false, autoplay = playing()) => {
    i = (i + slots.length) % slots.length;
    if (i === active && !autoplay) return;
    active = i;
    const c = canciones[i];
    slots.forEach((s, k) => { s.setAttribute('aria-selected', String(k === i)); s.tabIndex = k === i ? 0 : -1; });
    if (focus) slots[i].focus();
    el.style.setProperty('--tinte', c.tinte);
    num.textContent = c.locked ? 'Pista ? · sin desvelar' : `Pista ${c.numero} / ${String(cancionesPublicadas.length).padStart(2, '0')}`;
    title.textContent = tituloCancion(c);
    artist.textContent = c.artista;
    if (!loaded()) player.pause();
    el.classList.add('is-swapping');
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      caseImg.src = src(c);
      caseImg.srcset = `${src(c, 420)} 420w, ${src(c, 840)} 840w`;
      caseImg.alt = c.alt;
      caseSource?.setAttribute('srcset', `/media/${c.imagen.name}-420.avif 420w, /media/${c.imagen.name}-840.avif 840w`);
      disc.style.setProperty('--print', `url('${src(c)}')`);
      el.classList.remove('is-swapping');
      if (autoplay && c.audio) { load(c); play(); }
    }, reduced ? 0 : 420);
    paintState(); paintTime();
  };
  slots.forEach((s, i) => { s.tabIndex = i === 0 ? 0 : -1; s.addEventListener('click', () => select(i)); });
  $('[data-rack]').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select(active + 1, true); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select(active - 1, true); }
  });

  // Si ya sonaba una canción (venimos de otra página), el expositor la muestra
  const now = canciones.findIndex((c) => c.slug === player.dataset.slug);
  if (now > 0) { active = -1; select(now, false, false); }
  paintState(); paintTime();
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf); io.disconnect(); clearTimeout(swapTimer);
    player.removeEventListener('play', onPlayState); player.removeEventListener('pause', onPlayState);
    player.removeEventListener('timeupdate', onTime); player.removeEventListener('loadedmetadata', onMeta);
    player.removeEventListener('ended', onEnded);
    player.pause(); // al cambiar de página la música se para
  };
}

export function musicaView() {
  const node = toNode(html`
    <section class="section wrap obra-head" aria-labelledby="musica-h">
      <div class="section__head">
        <div>
          <p class="label" data-reveal>${cancionesPublicadas.length} canciones · One</p>
          <h1 id="musica-h" class="section__title titulo-h" data-focus>${tituloImg('musica', 'Música', { sizes: '(min-width: 900px) 640px, 86vw' })}</h1>
        </div>
      </div>
      ${expositor({ id: 'disco-pagina' })}
    </section>
    ${instagramMarquee()}
    ${footer()}
  `);
  const offs = [];
  return {
    node,
    mounted() { const v = document.querySelector('[data-view]'); offs.push(initExpositor(v), initMarquees(v)); },
    cleanup() { offs.forEach((f) => f()); },
  };
}
