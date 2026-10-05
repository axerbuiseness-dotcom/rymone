// Lupa sobre la obra en el detalle (solo ratón): amplía la zona bajo el puntero sin alterarla.
export function initLoupe(figure, src) {
  if (!matchMedia('(pointer: fine)').matches) return () => {};
  const img = figure.querySelector('img');
  const lens = document.createElement('span');
  lens.className = 'loupe';
  lens.setAttribute('aria-hidden', 'true');
  figure.append(lens);
  const zoom = 2.4;
  let loaded = false;
  const move = (e) => {
    const r = img.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (!loaded) { lens.style.backgroundImage = `url("${src}")`; loaded = true; }
    const fr = figure.getBoundingClientRect();
    const half = lens.offsetWidth / 2;
    lens.style.left = `${e.clientX - fr.left}px`;
    lens.style.top = `${e.clientY - fr.top}px`;
    lens.style.backgroundSize = `${r.width * zoom}px ${r.height * zoom}px`;
    lens.style.backgroundPosition = `${-x * zoom + half}px ${-y * zoom + half}px`;
    lens.classList.add('is-on');
  };
  const leave = () => lens.classList.remove('is-on');
  img.addEventListener('pointermove', move, { passive: true });
  img.addEventListener('pointerleave', leave);
  return () => { img.removeEventListener('pointermove', move); img.removeEventListener('pointerleave', leave); lens.remove(); };
}
