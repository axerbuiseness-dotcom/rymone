import { html, toNode, icons } from '../dom.js';
export function notFoundView() {
  return { node: toNode(html`
    <section class="section wrap" style="padding-top: calc(var(--bar-h) + 64px); display:grid; gap:24px; justify-items:start">
      <p class="label">Error 404</p>
      <h1 class="section__title" data-focus>Esta pared está en blanco</h1>
      <p class="section__lede">La página que buscas no existe o ha cambiado de sitio.</p>
      <a class="btn" href="/obra" data-link>Ir a la obra ${icons.arrow}</a>
    </section>`) };
}
