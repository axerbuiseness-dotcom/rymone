// Cortina de pintura que gotea: cubre la vista, se cambia el contenido y sigue cayendo.
const root = document.querySelector('[data-drip]');
const path = root.querySelector('[data-drip-path]');
const drops = Array.from({ length: 9 }, (_, i) => ({
  x: 4 + i * 11.5 + Math.random() * 4,
  w: 3 + Math.random() * 3.5,
  len: 6 + Math.random() * 16,
}));

// Forma en un viewBox 100x120: borde superior en `top`, borde inferior en `bottom` con gotas.
function shape(top, bottom, k) {
  let d = `M0 ${top} L100 ${top} L100 ${bottom}`;
  const sorted = [...drops].sort((a, b) => b.x - a.x);
  for (const g of sorted) {
    const L = g.len * k;
    const r = g.w / 2;
    d += ` L${g.x + r} ${bottom} L${g.x + r} ${bottom + L} A${r} ${r} 0 0 1 ${g.x - r} ${bottom + L} L${g.x - r} ${bottom}`;
  }
  return `${d} L0 ${bottom} Z`;
}
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function animate(ms, frame) {
  return new Promise((res) => {
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      frame(ease(t));
      t < 1 ? requestAnimationFrame(step) : res();
    };
    requestAnimationFrame(step);
  });
}

export const drip = {
  async cover(color) {
    root.style.setProperty('--drip', color);
    root.classList.add('is-on');
    await animate(680, (p) => path.setAttribute('d', shape(-30, -30 + p * 150, 0.4 + p * 0.6)));
  },
  async reveal() {
    await animate(680, (p) => path.setAttribute('d', shape(-30 + p * 160, 120 + p * 30, 1)));
    root.classList.remove('is-on');
    path.setAttribute('d', '');
  },
};
