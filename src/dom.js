// Plantillas mínimas: html`...` devuelve un DocumentFragment. Los valores se escapan salvo raw().
const RAW = Symbol('raw');
export const raw = (s) => ({ [RAW]: s });
export const unwrap = (r) => r[RAW];
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const val = (v) => (v == null || v === false ? '' : Array.isArray(v) ? v.map(val).join('') : v[RAW] ?? esc(v));
export function html(strings, ...values) {
  return raw(strings.reduce((acc, s, i) => acc + s + (i < values.length ? val(values[i]) : ''), ''));
}
export function toNode(tpl) {
  const t = document.createElement('template');
  t.innerHTML = tpl[RAW];
  return t.content;
}
// Logo "Rymone" de brillantes (n = 1 o 3, de marca/). Sustituye a la palabra escrita en títulos y marca.
const LOGOS = { 1: { w: 1928, h: 541 }, 3: { w: 1861, h: 626 } };
export const logo = (n, { cls = '', sizes = '50vw', alt = 'Rymone' } = {}) => {
  const set = [400, 900, 1600].map((w) => `/media/logo-${n}-${w}.webp ${w}w`).join(', ');
  const h = Math.round((LOGOS[n].h * 900) / LOGOS[n].w);
  return raw(`<img class="logo ${cls}" src="/media/logo-${n}-900.webp" srcset="${set}" sizes="${sizes}" width="900" height="${h}" alt="${esc(alt)}" decoding="async" draggable="false">`);
};

// Títulos de brillantes (marca/): «obra» y «musica»
const TITULOS = { obra: { w: 1641, h: 750 }, musica: { w: 1668, h: 728 } };
export const tituloImg = (n, alt, { cls = '', sizes = '60vw' } = {}) => {
  const set = [500, 1000, 1600].map((w) => `/media/titulo-${n}-${w}.webp ${w}w`).join(', ');
  const h = Math.round((TITULOS[n].h * 1000) / TITULOS[n].w);
  return raw(`<img class="titulo-img ${cls}" src="/media/titulo-${n}-1000.webp" srcset="${set}" sizes="${sizes}" width="1000" height="${h}" alt="${esc(alt)}" decoding="async" draggable="false">`);
};

export const icons = {
  arrow: raw('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>'),
  back: raw('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>'),
  rotL: raw('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>'),
  rotR: raw('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'),
  zoom: raw('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M11 8v6M8 11h6"/></svg>'),
  star: raw('<svg viewBox="0 0 40 40" aria-hidden="true"><path fill="currentColor" d="M20 0c1 11 4 16 20 20-16 4-19 9-20 20-1-11-4-16-20-20 16-4 19-9 20-20z"/></svg>'),
};

// <picture> con AVIF/WebP y tamaños; nunca recorta (width/height reales para evitar saltos).
export function picture(img, { alt, sizes, eager = false, cls = '', attrs = '' }) {
  const set = (ext) => img.widths.map((w) => `/media/${img.name}-${w}.${ext} ${w}w`).join(', ');
  const max = img.widths[img.widths.length - 1];
  const h = Math.round((img.height * max) / img.width);
  return raw(`<picture>
    <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
    <img class="${cls}" src="/media/${img.name}-${max}.webp" srcset="${set('webp')}" sizes="${sizes}" width="${max}" height="${h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" ${attrs}>
  </picture>`);
}
