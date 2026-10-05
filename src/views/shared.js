import { html, picture, icons } from '../dom.js';
import { tituloDe } from '../data/obras.js';
import { config } from '../config.js';

export const footer = () => html`
  <footer class="foot">
    <span class="foot__brand"><span class="foot__name">Rymone<sup class="reg">®</sup></span></span>
    <nav class="foot__legal" aria-label="Información legal">
      <a class="label" href="/legal#aviso-legal" data-link>Aviso legal</a>
      <a class="label" href="/legal#privacidad" data-link>Privacidad</a>
      <a class="label" href="/legal#cookies" data-link>Cookies</a>
    </nav>
    <a class="label" href="/contacto" data-link data-magnet>Consultar una obra</a>
  </footer>`;

// Cinta de texto que se mueve con el scroll. El texto se duplica para que el bucle no tenga cortes.
export const marquee = (words, { reverse = false, outline = false } = {}) => {
  const run = html`${words.map((w) => html`<span>${w}</span><span class="marquee__star" aria-hidden="true">✦</span>`)}`;
  return html`
  <div class="marquee ${outline ? 'marquee--outline' : ''}" aria-hidden="true">
    <div class="marquee__track" data-marquee="${reverse ? 'reverse' : ''}">${Array(10).fill(run)}</div>
  </div>`;
};

// Cinta con la firma de Rymone en pequeño, repetida muchas veces.
export const firmaMarquee = ({ reverse = true } = {}) => html`
  <div class="marquee marquee--firma" aria-hidden="true">
    <div class="marquee__track" data-marquee="${reverse ? 'reverse' : ''}">${Array(24).fill(html`<span class="marquee__firma"></span>`)}</div>
  </div>`;

// Cinta con el Instagram de Rymone: se mueve con el scroll y lleva al perfil.
export const instagramMarquee = () => {
  const ig = config.social[0];
  if (!ig) return '';
  const pair = html`<span class="marquee__ig">${ig.label}</span><span class="marquee__firma marquee__firma--blanca"></span>`;
  return html`<a class="marquee-link" href="${ig.url}" target="_blank" rel="noopener" aria-label="Instagram de Rymone: ${ig.label}">
    <div class="marquee marquee--firma" aria-hidden="true"><div class="marquee__track" data-marquee="">${Array(12).fill(pair)}</div></div>
  </a>`;
};

// Obra en la colección: se muestra entera, sin recortes ni filtros; el movimiento y el color van en el contenedor.
export const pieceCard = (o, i, { headingLevel = 3 } = {}) => html`
  <a class="piece" href="/obra/${o.slug}" data-link data-reveal style="--acento:${o.acento}; --niebla-obra:${o.niebla}; --d:${i * 0.08}s" aria-label="${tituloDe(o)}: ver la obra">
    <div class="piece__stage" data-tilt>
      <div class="piece__frame">
        ${picture(o.imagen, { alt: o.alt, sizes: '(min-width: 900px) 58vw, 92vw', attrs: `data-obra-img="${o.slug}"` })}
      </div>
    </div>
    <div class="piece__meta">
      <span class="piece__num" aria-hidden="true">${o.numero}</span>
      ${headingLevel === 2 ? html`<h2 class="piece__title">${tituloDe(o)}</h2>` : html`<h3 class="piece__title">${tituloDe(o)}</h3>`}
      ${o.titulo ? '' : html`<span class="pending">Título pendiente</span>`}
      <span class="piece__cta label">Ver obra ${icons.arrow}</span>
    </div>
  </a>`;
