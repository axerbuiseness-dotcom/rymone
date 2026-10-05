import { homeView } from './views/home.js';
import { obraListView } from './views/obra-list.js';
import { obraDetailView } from './views/obra-detail.js';
import { aboutView } from './views/about.js';
import { contactView } from './views/contact.js';
import { notFoundView } from './views/not-found.js';
import { musicaView } from './views/musica.js';
import { legalView } from './views/legal.js';
import { findObra, tituloDe } from './data/obras.js';

// Cada sección tiene su color de goteo: la transición anticipa a dónde vas.
const routes = [
  { pattern: /^\/$/, section: 'inicio', color: 'var(--niebla)', view: homeView },
  { pattern: /^\/obra\/?$/, section: 'obra', color: 'var(--naranja)', title: 'Obra', view: obraListView, morph: true },
  { pattern: /^\/obra\/([\w-]+)\/?$/, section: 'obra', color: 'var(--niebla)', view: obraDetailView, morph: true, keys: ['slug'] },
  { pattern: /^\/musica\/?$/, section: 'musica', color: 'var(--cian)', title: 'Música', view: musicaView },
  { pattern: /^\/sobre-mi\/?$/, section: 'sobre-mi', color: 'var(--chicle)', title: 'Sobre mí', view: aboutView },
  { pattern: /^\/legal\/?$/, section: null, color: 'var(--niebla)', title: 'Legal', view: legalView },
  { pattern: /^\/contacto\/?$/, section: 'contacto', color: 'var(--cian)', title: 'Contacto', view: contactView },
];

export function resolve(url) {
  for (const r of routes) {
    const m = url.pathname.match(r.pattern);
    if (!m) continue;
    const params = Object.fromEntries((r.keys ?? []).map((k, i) => [k, m[i + 1]]));
    if (params.slug) {
      const obra = findObra(params.slug);
      if (!obra) break;
      return { ...r, params, title: tituloDe(obra) };
    }
    return { ...r, params };
  }
  return { section: null, color: 'var(--niebla)', title: 'No encontrado', view: notFoundView, params: {} };
}
