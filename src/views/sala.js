// "La sala": galería experimental. Las obras cuelgan sin nombres en una sala oscura en 3D, cada una bajo
// su foco con polvo flotando en la luz y reflejo en el suelo. Se recorre arrastrando, deslizando,
// con la rueda horizontal, las flechas del teclado o los botones. La obra del centro se abre al pulsarla.
// Para volver a la vista anterior (el muro con títulos), pon `galeria: 'muro'` en src/config.js.
import { html, picture, icons } from '../dom.js';
import { obras, obraProxima } from '../data/obras.js';

const piezas = [...obras, obraProxima];
import { prefersReducedMotion } from '../fx/motion.js';
import { openZoom } from '../fx/zoom.js';
import { go as goTo } from '../nav.js';

export const sala = ({ id = 'sala' } = {}) => html`
  <section class="sala" data-sala aria-roledescription="galería" aria-label="Colección: ${obras.length} obras" style="--tinte:${obras[0].niebla}">
    <div class="sala__room" data-room tabindex="0" aria-describedby="${id}-hint">
      <div class="sala__light" aria-hidden="true"></div>
      <canvas class="sala__dust" data-dust aria-hidden="true"></canvas>
      <div class="sala__track">
        ${piezas.map((o, i) => o.locked ? html`
          <a class="sala__work sala__work--locked" href="#" data-work="${i}" data-locked style="--acento:${o.acento}" aria-label="Obra ${o.numero}: próximamente, todavía bloqueada" aria-disabled="true">
            <span class="sala__frame" data-frame>
              ${picture(o.imagen, { alt: o.alt, sizes: '(min-width: 900px) 46vw, 76vw' })}
              <span class="sala__lock" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                <b>Próximamente</b>
              </span>
              <span class="sala__shade" aria-hidden="true"></span>
            </span>
          </a>` : html`
          <a class="sala__work" href="/obra/${o.slug}" data-link data-work="${i}" style="--acento:${o.acento}" aria-label="Obra ${o.numero} de ${String(obras.length).padStart(2, '0')}: ver la obra">
            <span class="sala__frame" data-frame>
              ${picture(o.imagen, { alt: o.alt, sizes: '(min-width: 900px) 46vw, 76vw', eager: i === 0, attrs: `data-obra-img="${o.slug}"` })}
              <span class="sala__shade" aria-hidden="true"></span>
            </span>
          </a>`)}
      </div>
      <div class="sala__floor" aria-hidden="true"></div>
    </div>
    <div class="sala__ui">
      <button class="icon-btn" type="button" data-prev aria-label="Obra anterior">${icons.back}</button>
      <span class="sala__count label" aria-live="polite"><b data-count>01</b> / ${String(piezas.length).padStart(2, '0')}</span>
      <button class="icon-btn" type="button" data-next aria-label="Obra siguiente">${icons.arrow}</button>
      <button class="btn btn--ghost sala__zoom" type="button" data-zoom-sala>${icons.zoom} Acercarse</button>
    </div>
    <p class="sr-only" id="${id}-hint">${matchMedia('(pointer: coarse)').matches ? 'Desliza para recorrer la sala · toca la obra del centro para ver su ficha · «Acercarse» para verla de cerca' : 'Arrastra o usa las flechas para recorrer la sala · doble clic o «Acercarse» para verla de cerca · clic para su ficha'}</p>
  </section>`;

export function initSala(root) {
  const el = root.querySelector('[data-sala]');
  if (!el) return () => {};
  const reduced = prefersReducedMotion();
  const room = el.querySelector('[data-room]');
  const works = [...el.querySelectorAll('[data-work]')];
  const countEl = el.querySelector('[data-count]');
  const n = works.length;
  let pos = 0, target = 0, raf = 0, gap = 600, active = -1;
  let drag = null, moved = false;

  const measure = () => { gap = Math.min(innerWidth * (innerWidth < 700 ? 0.8 : 0.5), 820); };
  const clamp = (v) => Math.max(0, Math.min(n - 1, v));

  const layout = () => {
    for (let i = 0; i < n; i++) {
      const d = i - pos;
      const a = Math.min(Math.abs(d), 2.5);
      const w = works[i];
      w.style.transform = `translate3d(${d * gap}px, ${a * 18}px, ${-a * 320}px) rotateY(${Math.max(-50, Math.min(50, -d * 32))}deg)`;
      w.style.setProperty('--dim', (Math.min(a, 1.2) * 0.62).toFixed(3));
      w.style.zIndex = String(100 - Math.round(a * 10));
    }
    const now = Math.round(pos);
    if (now !== active) {
      active = now;
      works.forEach((w, i) => { w.classList.toggle('is-active', i === active); w.tabIndex = i === active ? 0 : -1; });
      countEl.textContent = String(active + 1).padStart(2, '0');
      el.style.setProperty('--tinte', obrasTint[active]);
      el.classList.toggle('is-locked', !!piezas[active]?.locked);
      zoomBtn.disabled = !!piezas[active]?.locked;
    }
  };
  const obrasTint = piezas.map((o) => o.niebla);
  const zoomBtn = el.querySelector('[data-zoom-sala]');
  const loop = () => {
    pos += (target - pos) * (reduced ? 1 : 0.12);
    layout();
    raf = Math.abs(target - pos) > 0.001 || drag ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const go = (i) => { target = clamp(i); if (reduced) { pos = target; layout(); } else kick(); };

  // Arrastrar / deslizar
  const down = (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, start: target, t: performance.now(), lastX: e.clientX, v: 0 };
    moved = false;
  };
  const move = (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 6) { moved = true; room.classList.add('is-dragging'); }
    if (!moved) return;
    const now = performance.now();
    drag.v = (e.clientX - drag.lastX) / Math.max(1, now - drag.t);
    drag.t = now; drag.lastX = e.clientX;
    target = Math.max(-0.35, Math.min(n - 0.65, drag.start - dx / gap));
    pos = reduced ? target : pos;
    kick();
  };
  const up = () => {
    if (!drag) return;
    const fling = -drag.v * 0.9;
    drag = null;
    room.classList.remove('is-dragging');
    if (moved) go(Math.round(target + fling));
  };
  room.addEventListener('pointerdown', down);
  room.addEventListener('dragstart', (e) => e.preventDefault());
  addEventListener('pointermove', move, { passive: true });
  addEventListener('pointerup', up);
  addEventListener('pointercancel', up);
  // Tras arrastrar no se abre la obra; pulsar una obra lateral la trae al centro
  // La obra bajo el puntero; si el navegador no la detecta por el 3D, se comprueba la caja de la obra activa
  const workAt = (e) => {
    const w = e.target.closest?.('[data-work]');
    if (w) return w;
    const a = works[active]?.querySelector('[data-frame]')?.getBoundingClientRect();
    return a && e.clientX >= a.left && e.clientX <= a.right && e.clientY >= a.top && e.clientY <= a.bottom ? works[active] : null;
  };
  const click = (e) => {
    const w = workAt(e);
    if (!w) return;
    if (moved) { e.preventDefault(); e.stopImmediatePropagation(); moved = false; return; }
    const i = Number(w.dataset.work);
    e.preventDefault(); e.stopImmediatePropagation();
    if (i !== active) { go(i); return; }
    if (w.hasAttribute('data-locked')) { w.classList.remove('is-denied'); void w.offsetWidth; w.classList.add('is-denied'); return; }
    // Clic en la obra del centro: abre su ficha, salvo que sea un doble clic (que la amplía)
    if (e.detail > 1) { clearTimeout(clickTimer); return; }
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => goTo(w.getAttribute('href')), matchMedia('(pointer: fine)').matches ? 260 : 0);
  };
  let clickTimer = 0;
  room.addEventListener('click', click, true);
  // Rueda horizontal (trackpad); la vertical sigue haciendo scroll de la página
  let wheelLock = 0;
  const wheel = (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 8) return;
    e.preventDefault();
    const now = performance.now();
    if (now < wheelLock) return;
    wheelLock = now + 420;
    go(active + Math.sign(e.deltaX));
  };
  room.addEventListener('wheel', wheel, { passive: false });
  // Teclado
  const key = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
  };
  room.addEventListener('keydown', key);
  const zoomActive = () => {
    const o = piezas[active];
    if (!o || o.locked) return;
    const max = o.imagen.widths[o.imagen.widths.length - 1];
    openZoom({ src: `/media/${o.imagen.name}-${max}.webp`, alt: o.alt, width: o.imagen.width, height: o.imagen.height, label: `Obra ${o.numero}`, fromEl: works[active].querySelector('img') });
  };
  el.querySelector('[data-zoom-sala]').addEventListener('click', zoomActive);
  room.addEventListener('dblclick', (e) => { if (workAt(e)?.classList.contains('is-active')) { e.preventDefault(); zoomActive(); } });
  el.querySelector('[data-prev]').addEventListener('click', () => go(active - 1));
  el.querySelector('[data-next]').addEventListener('click', () => go(active + 1));

  // La obra activa se inclina hacia el puntero y el foco la sigue un poco
  const tilt = (e) => {
    if (reduced || drag || e.pointerType !== 'mouse') return;
    const w = works[active];
    const r = w.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const inside = Math.abs(x) < 0.7 && Math.abs(y) < 0.7;
    w.style.setProperty('--rx', inside ? `${(-y * 8).toFixed(2)}deg` : '0deg');
    w.style.setProperty('--ry', inside ? `${(x * 10).toFixed(2)}deg` : '0deg');
    el.style.setProperty('--lx', `${((e.clientX / innerWidth) * 100).toFixed(1)}%`);
  };
  room.addEventListener('pointermove', tilt, { passive: true });
  room.addEventListener('pointerleave', () => works.forEach((w) => { w.style.setProperty('--rx', '0deg'); w.style.setProperty('--ry', '0deg'); }));

  // Polvo flotando en el haz de luz
  const stopDust = reduced ? () => {} : dust(el.querySelector('[data-dust]'));

  const onResize = () => { measure(); layout(); };
  addEventListener('resize', onResize);
  measure(); layout();

  return () => {
    cancelAnimationFrame(raf); stopDust();
    removeEventListener('pointermove', move); removeEventListener('pointerup', up);
    removeEventListener('pointercancel', up); removeEventListener('resize', onResize);
  };
}

function dust(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, raf = 0, visible = true;
  const motes = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.3, v: Math.random() * 0.00025 + 0.00008, p: Math.random() * 6.28 }));
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const frame = (t) => {
    ctx.clearRect(0, 0, w, h);
    for (const m of motes) {
      m.y -= m.v * 16; m.p += 0.01;
      if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
      // Solo se ven dentro del cono de luz (centro de la sala), más brillantes cerca del foco
      const cx = 0.5 + Math.sin(m.p) * 0.01;
      const spread = 0.08 + m.y * 0.22;
      const inBeam = 1 - Math.min(1, Math.abs(m.x - cx) / spread);
      if (inBeam <= 0) continue;
      ctx.globalAlpha = inBeam * (0.25 + 0.5 * (1 - m.y)) * (0.6 + 0.4 * Math.sin(t / 700 + m.p));
      ctx.fillStyle = '#ffe7d6';
      ctx.beginPath(); ctx.arc((m.x + Math.sin(m.p) * 0.005) * w, m.y * h, m.r, 0, 6.29); ctx.fill();
    }
    raf = visible ? requestAnimationFrame(frame) : 0;
  };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); });
  io.observe(canvas);
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
  raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
}
