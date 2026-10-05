// Pantalla de entrada: una pompa que hay que pulsar. Mientras está abierta, el resto de la web queda inerte
// y se aprovecha para precargar las imágenes de la portada. Al pulsar, la pompa estalla y llena la pantalla.
import { prefersReducedMotion } from './motion.js';
import { initFirma } from './firma.js';

export function openGate({ preload = [], onClosed = () => {} } = {}) {
  const gate = document.querySelector('[data-gate]');
  const btn = gate.querySelector('[data-gate-enter]');
  const behind = [document.querySelector('[data-bar]'), document.querySelector('[data-view]')];
  behind.forEach((el) => el.setAttribute('inert', ''));
  document.documentElement.classList.add('gate-open');
  preload.forEach((src) => { const i = new Image(); i.src = src; });
  initFirma(gate.querySelector('[data-firma]'));
  requestAnimationFrame(() => btn.focus({ preventScroll: true }));

  return new Promise((resolve) => {
    const enter = async () => {
      btn.disabled = true;
      const r = btn.getBoundingClientRect();
      gate.style.setProperty('--px', `${r.left + r.width / 2}px`);
      gate.style.setProperty('--py', `${r.top + r.height / 2}px`);
      gate.classList.add('is-leaving');
      behind.forEach((el) => el.removeAttribute('inert'));
      document.documentElement.classList.remove('gate-open');
      resolve(); // la portada empieza su animación mientras la pompa se abre
      await new Promise((res) => setTimeout(res, prefersReducedMotion() ? 200 : 1200));
      gate.hidden = true;
      onClosed();
    };
    btn.addEventListener('click', enter, { once: true });
    // Tocar cualquier punto de la pantalla también entra (salvo la firma, que es para jugar con ella)
    gate.addEventListener('click', (e) => { if (!e.target.closest('button, [data-firma]') && !btn.disabled) btn.click(); });
  });
}
