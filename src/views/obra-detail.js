import { html, toNode, picture, icons } from '../dom.js';
import { obras, findObra, tituloDe } from '../data/obras.js';
import { go } from '../nav.js';
import { footer } from './shared.js';
import { initLoupe } from '../fx/loupe.js';
import { openZoom } from '../fx/zoom.js';

const fact = (label, value) => html`<dt class="label">${label}</dt><dd>${value ?? html`<span class="pending">Pendiente</span>`}</dd>`;

export function obraDetailView({ slug }) {
  const o = findObra(slug);
  const i = obras.indexOf(o);
  const prev = obras[(i - 1 + obras.length) % obras.length];
  const next = obras[(i + 1) % obras.length];
  const max = o.imagen.widths[o.imagen.widths.length - 1];
  const multiple = obras.length > 1;

  const node = toNode(html`
    <article class="detail" style="--acento:${o.acento}; --niebla-obra:${o.niebla}" aria-labelledby="obra-h">
      <a class="detail__back label" href="/obra" data-link data-magnet>${icons.back} Volver a la obra</a>
      <div class="detail__grid">
        <figure class="detail__figure" data-figure>
          ${picture(o.imagen, { alt: o.alt, sizes: '(min-width: 960px) 60vw, 100vw', eager: true, attrs: `data-obra-img="${o.slug}"` })}
          <div class="detail__zoom"><button class="btn btn--ghost" type="button" data-zoom>${icons.zoom} Acercarse</button></div>
        </figure>
        <div class="detail__info">
          <span class="detail__num" aria-hidden="true">${o.numero}</span>
          <div style="display:grid; gap:10px">
            <h1 id="obra-h" class="detail__title" data-focus data-split>${tituloDe(o)}</h1>
            ${o.titulo ? '' : html`<span class="pending" style="justify-self:start">Título pendiente</span>`}
          </div>
          <dl class="facts">
            ${fact('Año', o.año)}
            ${fact('Técnica', o.tecnica)}
            ${fact('Medidas', o.medidas)}
            ${fact('Disponibilidad', o.disponibilidad)}
            ${fact('Precio', o.precio)}
          </dl>
          <p class="detail__desc">${o.descripcion ?? 'Descripción pendiente: Rymone añadirá aquí la historia de la pieza.'}</p>
          <div class="detail__ctas">
            <a class="btn" href="/contacto?obra=${o.slug}" data-link>Consultar por esta obra ${icons.arrow}</a>
          </div>
          ${multiple ? html`
          <nav class="detail__pager" aria-label="Otras obras">
            <a href="/obra/${prev.slug}" data-link><span class="label">← Anterior</span>${tituloDe(prev)}</a>
            <a href="/obra/${next.slug}" data-link><span class="label">Siguiente →</span>${tituloDe(next)}</a>
          </nav>` : ''}
          <p class="sr-only">Teclado: Esc vuelve · ← → cambian de obra</p>
        </div>
      </div>
    </article>

    ${footer()}
  `);

  node.querySelector('[data-zoom]').addEventListener('click', () => {
    openZoom({ src: `/media/${o.imagen.name}-${max}.webp`, alt: o.alt, width: o.imagen.width, height: o.imagen.height, label: tituloDe(o), fromEl: document.querySelector('[data-figure] img') });
  });

  const onKey = (e) => {
    if (document.documentElement.classList.contains('zoom-open') || e.target.closest?.('input, textarea, select')) return;
    if (e.key === 'Escape') go('/obra');
    if (multiple && e.key === 'ArrowLeft') go(`/obra/${prev.slug}`);
    if (multiple && e.key === 'ArrowRight') go(`/obra/${next.slug}`);
  };
  addEventListener('keydown', onKey);
  let offLoupe = () => {};
  return {
    node,
    mounted() { offLoupe = initLoupe(document.querySelector('[data-figure]'), `/media/${o.imagen.name}-${max}.webp`); },
    cleanup() { removeEventListener('keydown', onKey); offLoupe(); },
  };
}
