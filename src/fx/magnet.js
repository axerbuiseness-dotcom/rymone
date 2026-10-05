// Botones y enlaces "magnéticos": se desplazan un poco hacia el puntero (solo ratón).
import { prefersReducedMotion } from './motion.js';

export function initMagnets() {
  if (!matchMedia('(pointer: fine)').matches) return;
  let active = null;
  addEventListener('pointermove', (e) => {
    if (prefersReducedMotion()) return;
    const t = e.target.closest?.('[data-magnet], .btn');
    if (active && active !== t) { active.style.translate = ''; active = null; }
    if (!t) return;
    const r = t.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    const k = t.matches('.btn') ? 12 : 7;
    t.style.translate = `${(dx * k).toFixed(1)}px ${(dy * k).toFixed(1)}px`;
    active = t;
  }, { passive: true });
}
