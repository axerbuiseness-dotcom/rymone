// Spray del visitante sobre la pared de la portada.
// Ratón: pintar al moverse (más carga manteniendo pulsado). Táctil: cada toque deja una ráfaga.
// La pintura se desvanece poco a poco, como niebla que se asienta.
const COLORS = ['255,91,26', '70,213,230', '255,134,216'];

export function createSpray(canvas) {
  const ctx = canvas.getContext('2d');
  const host = canvas.parentElement;
  let dpr = 1, raf = 0, color = 0, last = null, idle = 0;

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
  };
  const burst = (x, y, amount, size) => {
    const c = COLORS[color];
    for (let i = 0; i < amount; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.pow(Math.random(), 1.8) * size;
      const r = Math.random() * 2.2 + 0.4;
      ctx.fillStyle = `rgba(${c},${0.18 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc((x + Math.cos(a) * d) * dpr, (y + Math.sin(a) * d) * dpr, r * dpr, 0, 7);
      ctx.fill();
    }
    const g = ctx.createRadialGradient(x * dpr, y * dpr, 0, x * dpr, y * dpr, size * dpr);
    g.addColorStop(0, `rgba(${c},0.10)`); g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g; ctx.fillRect((x - size) * dpr, (y - size) * dpr, size * 2 * dpr, size * 2 * dpr);
    idle = 0; if (!raf) raf = requestAnimationFrame(fade);
  };
  const fade = () => {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.018)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    idle++;
    raf = idle < 400 ? requestAnimationFrame(fade) : (ctx.clearRect(0, 0, canvas.width, canvas.height), 0);
  };
  const pos = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const [x, y] = pos(e);
    const pressed = e.buttons & 1;
    if (last) {
      const steps = Math.ceil(Math.hypot(x - last[0], y - last[1]) / 10);
      for (let s = 1; s <= steps; s++) burst(last[0] + ((x - last[0]) * s) / steps, last[1] + ((y - last[1]) * s) / steps, pressed ? 26 : 7, pressed ? 34 : 22);
    }
    last = [x, y];
  };
  const onDown = (e) => {
    if (e.target.closest('a, button')) return;
    const [x, y] = pos(e);
    color = (color + 1) % COLORS.length;
    burst(x, y, e.pointerType === 'mouse' ? 60 : 140, e.pointerType === 'mouse' ? 40 : 60);
  };
  const onLeave = () => { last = null; };
  host.addEventListener('pointermove', onMove, { passive: true });
  host.addEventListener('pointerdown', onDown, { passive: true });
  host.addEventListener('pointerleave', onLeave);
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();
  return {
    destroy() {
      cancelAnimationFrame(raf); ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointerleave', onLeave);
    },
  };
}
