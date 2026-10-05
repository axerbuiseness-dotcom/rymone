// "Acercarse": la obra vuela desde su sitio hasta llenar la pantalla y se recorre de cerca.
// - Ratón: la vista sigue al puntero (miras hacia donde apuntas); rueda o clic para ampliar.
// - Táctil: pellizca para ampliar, arrastra para moverte, doble toque para ampliar o volver.
// - Teclado: + y - amplían, flechas mueven, L enciende la linterna, Esc cierra.
// - Linterna: apaga la sala y solo ilumina alrededor del puntero, para explorar la obra a oscuras.
// La imagen nunca se deforma ni cambia de color: solo se escala y se desplaza.
import { prefersReducedMotion } from './motion.js';

const MAX = 3.2;

export function openZoom({ src, alt, width, height, label = '', fromEl = null }) {
  const reduced = prefersReducedMotion();
  const fine = matchMedia('(pointer: fine)').matches;
  const prevFocus = document.activeElement;

  const root = document.createElement('div');
  root.className = 'zoom';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', `${label} ampliada`);
  root.innerHTML = `
    <div class="zoom__stage" data-stage>
      <img class="zoom__img" alt="" draggable="false">
      <div class="zoom__torch" aria-hidden="true"></div>
    </div>
    <div class="zoom__bar">
      <span class="label zoom__label"></span>
      <div class="zoom__tools">
        <button class="icon-btn" type="button" data-out aria-label="Alejar">−</button>
        <span class="label zoom__pct" aria-live="polite">100 %</span>
        <button class="icon-btn" type="button" data-in aria-label="Acercar">+</button>
        <button class="btn btn--ghost zoom__torch-btn" type="button" data-torch aria-pressed="false">Linterna</button>
        <button class="btn" type="button" data-close>Cerrar</button>
      </div>
    </div>
    <div class="zoom__map" aria-hidden="true"><img alt=""><span data-view-box></span></div>
    <p class="sr-only">${fine ? 'Mueve el ratón para recorrer la obra · rueda o clic para acercarte' : 'Pellizca para acercarte · arrastra para moverte · doble toque para ampliar'}</p>`;
  const img = root.querySelector('.zoom__img');
  img.alt = alt;
  img.src = src;
  root.querySelector('.zoom__label').textContent = label;
  root.querySelector('.zoom__map img').src = src;
  const stage = root.querySelector('[data-stage]');
  const torch = root.querySelector('.zoom__torch');
  const pct = root.querySelector('.zoom__pct');
  const box = root.querySelector('[data-view-box]');
  const map = root.querySelector('.zoom__map');
  document.body.append(root);
  document.documentElement.classList.add('zoom-open');

  // Tamaño base: la obra entera cabe en pantalla
  let vw = 0, vh = 0, bw = 0, bh = 0;
  const measure = () => {
    vw = innerWidth; vh = innerHeight;
    const k = Math.min((vw * 0.9) / width, (vh * 0.78) / height);
    bw = width * k; bh = height * k;
    img.style.width = `${bw}px`; img.style.height = `${bh}px`;
  };
  measure();

  let s = 1, tx = 0, ty = 0;           // estado mostrado
  let ts = 1, ttx = 0, tty = 0;        // objetivo
  let raf = 0;
  const range = (scale) => ({ x: Math.max(0, (bw * scale - vw * 0.92) / 2), y: Math.max(0, (bh * scale - vh * 0.8) / 2) });
  const clampT = () => { const r = range(ts); ttx = Math.max(-r.x, Math.min(r.x, ttx)); tty = Math.max(-r.y, Math.min(r.y, tty)); };
  const render = () => {
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    pct.textContent = `${Math.round(s * 100)} %`;
    // Minimapa: qué parte de la obra estás viendo
    const vwPart = Math.min(1, (vw * 0.92) / (bw * s));
    const vhPart = Math.min(1, (vh * 0.8) / (bh * s));
    box.style.width = `${vwPart * 100}%`; box.style.height = `${vhPart * 100}%`;
    box.style.left = `${(0.5 - vwPart / 2 - tx / (bw * s)) * 100}%`;
    box.style.top = `${(0.5 - vhPart / 2 - ty / (bh * s)) * 100}%`;
    map.classList.toggle('is-on', s > 1.05);
  };
  const loop = () => {
    const k = reduced ? 1 : 0.16;
    s += (ts - s) * k; tx += (ttx - tx) * k; ty += (tty - ty) * k;
    render();
    raf = Math.abs(ts - s) + Math.abs(ttx - tx) + Math.abs(tty - ty) > 0.05 ? requestAnimationFrame(loop) : 0;
    if (!raf) { s = ts; tx = ttx; ty = tty; render(); }
  };
  const kick = () => { if (reduced) { s = ts; tx = ttx; ty = tty; render(); } else if (!raf) raf = requestAnimationFrame(loop); };

  // Ampliar manteniendo fijo el punto (cx, cy) de la pantalla
  const zoomAt = (next, cx = vw / 2, cy = vh / 2) => {
    next = Math.max(1, Math.min(MAX, next));
    const px = cx - vw / 2 - ttx, py = cy - vh / 2 - tty;
    ttx -= px * (next / ts - 1); tty -= py * (next / ts - 1);
    ts = next; clampT(); kick();
  };

  // Ratón: mirar hacia donde apunta el cursor
  let lastPointer = { x: vw / 2, y: vh / 2 };
  const look = (x, y) => {
    const r = range(ts);
    ttx = -((x / vw) - 0.5) * 2 * r.x;
    tty = -((y / vh) - 0.5) * 2 * r.y;
    kick();
  };
  const onMove = (e) => {
    torch.style.setProperty('--tx', `${e.clientX}px`);
    torch.style.setProperty('--ty', `${e.clientY}px`);
    if (e.pointerType === 'mouse') { lastPointer = { x: e.clientX, y: e.clientY }; look(e.clientX, e.clientY); }
  };
  stage.addEventListener('pointermove', onMove, { passive: true });
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomAt(ts * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY);
    look(e.clientX, e.clientY);
  }, { passive: false });
  stage.addEventListener('click', (e) => {
    if (!fine || e.target.closest('button')) return;
    zoomAt(ts > 1.4 ? 1 : 2.4, e.clientX, e.clientY);
    look(e.clientX, e.clientY);
  });

  // Táctil: pellizcar y arrastrar
  const touches = new Map();
  let pinch = null, panStart = null, lastTap = 0;
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    try { stage.setPointerCapture(e.pointerId); } catch { /* puntero ya liberado */ }
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.size === 2) {
      const [a, b] = [...touches.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: ts };
    } else {
      panStart = { x: e.clientX, y: e.clientY, tx: ttx, ty: tty };
      const now = performance.now();
      if (now - lastTap < 300) zoomAt(ts > 1.4 ? 1 : 2.4, e.clientX, e.clientY);
      lastTap = now;
    }
  });
  stage.addEventListener('pointermove', (e) => {
    if (!touches.has(e.pointerId)) return;
    touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && touches.size === 2) {
      const [a, b] = [...touches.values()];
      zoomAt(pinch.s * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.d), (a.x + b.x) / 2, (a.y + b.y) / 2);
    } else if (panStart) {
      ttx = panStart.tx + (e.clientX - panStart.x);
      tty = panStart.ty + (e.clientY - panStart.y);
      clampT(); kick();
    }
  });
  const endTouch = (e) => { touches.delete(e.pointerId); if (touches.size < 2) pinch = null; if (!touches.size) panStart = null; };
  stage.addEventListener('pointerup', endTouch);
  stage.addEventListener('pointercancel', endTouch);

  // Botones y teclado
  const setTorch = (on) => {
    root.classList.toggle('torch-on', on);
    root.querySelector('[data-torch]').setAttribute('aria-pressed', String(on));
  };
  root.querySelector('[data-torch]').addEventListener('click', () => setTorch(!root.classList.contains('torch-on')));
  root.querySelector('[data-in]').addEventListener('click', () => { zoomAt(ts * 1.4); if (fine) look(lastPointer.x, lastPointer.y); });
  root.querySelector('[data-out]').addEventListener('click', () => { zoomAt(ts / 1.4); if (fine) look(lastPointer.x, lastPointer.y); });
  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === '+' || e.key === '=') zoomAt(ts * 1.25);
    else if (e.key === '-') zoomAt(ts / 1.25);
    else if (e.key.toLowerCase() === 'l') setTorch(!root.classList.contains('torch-on'));
    else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const step = 80;
      if (e.key === 'ArrowLeft') ttx += step; if (e.key === 'ArrowRight') ttx -= step;
      if (e.key === 'ArrowUp') tty += step; if (e.key === 'ArrowDown') tty -= step;
      clampT(); kick();
    } else if (e.key === 'Tab') { // mantener el foco dentro
      const f = [...root.querySelectorAll('button')];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  };
  addEventListener('keydown', onKey, true);
  const onResize = () => { measure(); clampT(); kick(); };
  addEventListener('resize', onResize);

  // Vuelo de entrada desde la obra en la sala o en la ficha
  const fly = (reverse) => {
    if (reduced || !fromEl) return Promise.resolve();
    const r = fromEl.getBoundingClientRect();
    if (!r.width) return Promise.resolve();
    const k = r.width / bw;
    const dx = r.left + r.width / 2 - vw / 2, dy = r.top + r.height / 2 - vh / 2;
    const from = `translate(${dx}px, ${dy}px) scale(${k})`;
    const to = `translate(0px, 0px) scale(1)`;
    const anim = img.animate([{ transform: reverse ? to : from }, { transform: reverse ? from : to }], { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' });
    return anim.finished.then(() => anim.cancel()).catch(() => {});
  };

  let closed = false;
  async function close() {
    if (closed) return;
    closed = true;
    ts = 1; ttx = 0; tty = 0; s = 1; tx = 0; ty = 0; render();
    root.classList.add('is-leaving');
    await fly(true);
    removeEventListener('keydown', onKey, true);
    removeEventListener('resize', onResize);
    cancelAnimationFrame(raf);
    root.remove();
    document.documentElement.classList.remove('zoom-open');
    prevFocus?.focus?.({ preventScroll: true });
  }
  root.querySelector('[data-close]').addEventListener('click', close);

  render();
  setTimeout(() => root.classList.add('is-open'), 20);
  fly(false);
  root.querySelector('[data-close]').focus({ preventScroll: true });
  return close;
}
