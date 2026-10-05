import { icons, unwrap } from '../dom.js';
import { prefersReducedMotion } from './motion.js';
// Destello de cuatro puntas (como los de los cuadros) donde se pulsa o toca.
export function initSparkles() {
  addEventListener('pointerdown', (e) => {
    if (prefersReducedMotion()) return;
    if (e.target.closest('input, textarea, select, [data-no-sparkle]')) return;
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.style.left = `${e.clientX}px`;
    s.style.top = `${e.clientY}px`;
    s.innerHTML = unwrap(icons.star);
    document.body.append(s);
    setTimeout(() => s.remove(), 650);
  }, { passive: true });
}
