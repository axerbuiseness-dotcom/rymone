// Personaje girable a partir de 4 renders. Es una alternativa provisional hasta tener el modelo 3D (.glb).
// Ángulos: 0 frente (vista 4), 45 tres cuartos (vista 3), 90 perfil (vista 1), 180 espalda (vista 2).
// Los ángulos 270 y 315 reutilizan las vistas 1 y 3 en espejo.
const FRAMES = [
  { a: 0, v: 4, name: 'de frente' },
  { a: 45, v: 3, name: 'tres cuartos' },
  { a: 90, v: 1, name: 'de perfil' },
  { a: 180, v: 2, name: 'de espaldas' },
  { a: 270, v: 1, mirror: true, name: 'de perfil, lado contrario (espejada)' },
  { a: 315, v: 3, mirror: true, name: 'tres cuartos, lado contrario (espejada)' },
];

export function createTurntable(root, { reduced }) {
  const stage = root.querySelector('[data-stage]');
  const imgs = [...stage.querySelectorAll('img')];
  let angle = 0, vel = 0, dragging = false, lastX = 0, raf = 0, idleAt = performance.now();

  const frameFor = (deg) => {
    const a = ((deg % 360) + 360) % 360;
    let best = FRAMES[0], bd = 999;
    for (const f of FRAMES) { const d = Math.min(Math.abs(a - f.a), 360 - Math.abs(a - f.a)); if (d < bd) { bd = d; best = f; } }
    return best;
  };
  const show = () => {
    const f = frameFor(angle);
    imgs.forEach((img) => {
      const on = Number(img.dataset.v) === f.v && (img.dataset.mirror === 'true') === !!f.mirror;
      img.classList.toggle('is-on', on);
    });
    const a = Math.round(((angle % 360) + 360) % 360);
    stage.setAttribute('aria-valuenow', String(a));
    stage.setAttribute('aria-valuetext', `Personaje ${f.name}`);
  };
  const loop = (now) => {
    if (!dragging) {
      angle += vel; vel *= 0.94;
      if (!reduced && Math.abs(vel) < 0.05 && now - idleAt > 2500) angle += 0.35; // giro lento en reposo
    }
    show();
    raf = requestAnimationFrame(loop);
  };
  const step = (dir) => { angle = Math.round(angle / 45) * 45 + dir * 45; vel = 0; idleAt = performance.now(); show(); };

  const onDown = (e) => { dragging = true; lastX = e.clientX; vel = 0; stage.setPointerCapture(e.pointerId); };
  const onMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    angle -= dx * 0.6; vel = Math.max(-8, Math.min(8, -dx * 0.6)); idleAt = performance.now();
    if (reduced) show();
  };
  const onUp = () => { dragging = false; idleAt = performance.now(); if (reduced) vel = 0; };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    if (e.key === 'Home') { e.preventDefault(); angle = 0; show(); }
  };
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onUp);
  stage.addEventListener('keydown', onKey);
  root.querySelector('[data-rot="-1"]').addEventListener('click', () => step(-1));
  root.querySelector('[data-rot="1"]').addEventListener('click', () => step(1));

  show();
  if (!reduced) raf = requestAnimationFrame(loop);
  return { destroy() { cancelAnimationFrame(raf); } };
}
