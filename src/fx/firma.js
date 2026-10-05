// Firma de brillantes de la entrada. Al pasar el cursor (o el dedo):
// - un destello de luz recorre los brillantes siguiendo al puntero,
// - saltan chispas de cuatro puntas sobre la firma,
// - la firma se inclina un poco hacia el puntero.
// La imagen no se modifica: el brillo es una capa encima recortada con la forma de la firma.
import { prefersReducedMotion } from './motion.js';
import { icons, unwrap } from '../dom.js';

export function initFirma(el) {
  if (!el) return () => {};
  const art = el.querySelector('[data-firma-art]');
  const reduced = prefersReducedMotion();
  let lastSpark = 0;

  const spark = (x, y) => {
    const s = document.createElement('span');
    s.className = 'firma__spark';
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty('--s', (0.5 + Math.random() * 0.8).toFixed(2));
    s.innerHTML = unwrap(icons.star);
    el.append(s);
    setTimeout(() => s.remove(), 900);
  };

  const move = (e) => {
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width;
    const y = (e.clientY - b.top) / b.height;
    el.classList.add('is-hot');
    art.style.setProperty('--sx', `${(x * 100).toFixed(1)}%`);
    art.style.setProperty('--sy', `${(y * 100).toFixed(1)}%`);
    if (reduced) return;
    art.style.setProperty('--fry', `${((x - 0.5) * 16).toFixed(2)}deg`);
    art.style.setProperty('--frx', `${((0.5 - y) * 12).toFixed(2)}deg`);
    const now = performance.now();
    if (now - lastSpark > 70) {
      lastSpark = now;
      spark(e.clientX - b.left + (Math.random() - 0.5) * 70, e.clientY - b.top + (Math.random() - 0.5) * 70);
    }
  };
  const leave = () => {
    el.classList.remove('is-hot');
    art.style.setProperty('--fry', '0deg');
    art.style.setProperty('--frx', '0deg');
  };
  el.addEventListener('pointermove', move, { passive: true });
  el.addEventListener('pointerdown', move, { passive: true });
  el.addEventListener('pointerleave', leave);
  el.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') leave(); });
  el.addEventListener('pointercancel', leave);
  return () => {};
}
