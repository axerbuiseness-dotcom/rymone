// Inclinación 3D de las obras siguiendo el puntero, con un resplandor de color que se mueve detrás.
// Solo se transforma el contenedor: la imagen no cambia de color ni de proporción.
import { prefersReducedMotion } from './motion.js';

export function initTilt(root) {
  if (!matchMedia('(pointer: fine)').matches || prefersReducedMotion()) return () => {};
  const offs = [...root.querySelectorAll('[data-tilt]')].map((el) => {
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 11).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
    };
    const leave = () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  });
  return () => offs.forEach((f) => f());
}
