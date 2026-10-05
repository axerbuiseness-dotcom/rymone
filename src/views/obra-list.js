import { html, toNode, tituloImg } from '../dom.js';
import { obras, tituloDe } from '../data/obras.js';
import { pieceCard, footer, instagramMarquee } from './shared.js';
import { initTilt } from '../fx/tilt.js';
import { initMarquees } from '../fx/marquee.js';
import { config } from '../config.js';
import { sala, initSala } from './sala.js';

export function obraListView() {
  const node = toNode(html`
    <section class="section wrap obra-head" aria-labelledby="obra-title">
      <div class="section__head">
        <div>
          <p class="label" data-reveal>${obras.length} ${obras.length === 1 ? 'pieza' : 'piezas'}</p>
          <h1 id="obra-title" class="section__title titulo-h" data-focus>${tituloImg('obra', 'Obra', { sizes: '(min-width: 900px) 640px, 86vw' })}</h1>
        </div>
      </div>
      ${config.galeria === 'sala' ? '' : html`<nav class="index-list" aria-label="Índice de obras" data-reveal style="--d:.15s">
        ${obras.map((o) => html`<a class="label" href="/obra/${o.slug}" data-link data-magnet>${o.numero} · ${tituloDe(o)}</a>`)}
      </nav>`}
    </section>
    ${instagramMarquee()}
    <section class="section wrap" aria-label="Piezas">
      ${config.galeria === 'sala' ? sala({ id: 'sala-obra' }) : html`<div class="wall">${obras.map((o, i) => pieceCard(o, i, { headingLevel: 2 }))}</div>`}
    </section>
    ${footer()}
  `);
  const offs = [];
  return {
    node,
    mounted() {
      const v = document.querySelector('[data-view]');
      offs.push(initTilt(v), initMarquees(v), initSala(v));
    },
    cleanup() { offs.forEach((f) => f()); },
  };
}
