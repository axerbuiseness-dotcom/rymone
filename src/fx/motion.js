const mq = matchMedia('(prefers-reduced-motion: reduce)');
// ?movimiento=reducido fuerza el modo de movimiento reducido (útil para revisarlo).
const forced = new URLSearchParams(location.search).get('movimiento') === 'reducido';
if (forced) document.documentElement.classList.add('reduce');
export const prefersReducedMotion = () => forced || mq.matches;
