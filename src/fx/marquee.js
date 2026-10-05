// Cinta de texto que avanza sola y acelera, se inclina o cambia de sentido con el scroll.
// Con "Reducir movimiento" sigue avanzando, pero despacio y sin reaccionar al scroll.
import { prefersReducedMotion } from './motion.js';

export function initMarquees(root) {
  const tracks = [...root.querySelectorAll('[data-marquee]')];
  if (!tracks.length) return () => {};
  const reduced = prefersReducedMotion();
  let raf = 0, lastY = scrollY, boost = 0, x = 0, last = performance.now();
  const loop = (now) => {
    const dt = Math.min(50, now - last) / 16.67; // independiente de los fps (móviles en ahorro de energía)
    last = now;
    if (!reduced) {
      const dy = scrollY - lastY; lastY = scrollY;
      boost += (dy * 0.5 - boost) * 0.1;
    }
    x -= (reduced ? 0.35 : 0.8 + boost) * dt;
    const skew = reduced ? 0 : Math.max(-14, Math.min(14, -boost * 0.8));
    for (const t of tracks) {
      const half = t.scrollWidth / 2;
      if (!half) continue;
      const dir = t.dataset.marquee === 'reverse' ? -1 : 1;
      let pos = (x * dir) % half;
      if (pos > 0) pos -= half;
      t.style.transform = `translate3d(${pos.toFixed(1)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}
