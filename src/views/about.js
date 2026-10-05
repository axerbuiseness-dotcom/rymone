import { html, toNode, picture, icons, logo } from '../dom.js';
import { obras, tituloDe } from '../data/obras.js';
import { footer, instagramMarquee } from './shared.js';
import { initMarquees } from '../fx/marquee.js';
import { prefersReducedMotion } from '../fx/motion.js';

const MOTIVOS = ['Letras pompa', 'Aureolas', 'Goteos', 'Destellos', 'Spray magenta', 'Margaritas'];

export function aboutView() {
  const node = toNode(html`
    <section class="about wrap" aria-labelledby="about-h">
      <p class="label" data-reveal>Sobre mí</p>
      <h1 id="about-h" class="about__title" data-focus>${logo(3, { cls: 'about__logo', sizes: '(min-width: 900px) 760px, 90vw' })}</h1>
      <div class="about__grid">
        <div class="about__copy">
          <p class="about__bio" data-reveal>Pinto, canto, produzco y a veces lo comparto.</p>
          <div class="placeholder-card" data-reveal style="--d:.08s">
            <strong>Exposiciones, prensa y trayectoria</strong>
            <p>Pendiente de datos.</p>
          </div>
          <div class="about__ctas" data-reveal style="--d:.16s">
            <a class="btn" href="/obra" data-link>Ver la obra ${icons.arrow}</a>
            <a class="btn btn--ghost" href="/contacto" data-link>Contactar</a>
          </div>
        </div>
        <div class="motifs-box" data-reveal style="--d:.1s">
          <p class="label">Lo que aparece en los cuadros</p>
          <p class="sr-only">${matchMedia('(pointer: coarse)').matches ? 'Toca las pompas' : 'Empuja las pompas con el ratón'}</p>
          <ul class="motifs" data-motifs>
            ${MOTIVOS.map((m, i) => html`<li style="--i:${i}"><button type="button" class="motif">${m}</button></li>`)}
          </ul>
        </div>
      </div>
    </section>

    ${instagramMarquee()}

    <section class="section wrap" aria-labelledby="mini-h">
      <h2 id="mini-h" class="section__title" data-split>En la colección</h2>
      <div class="mini-wall">
        ${obras.map((o, i) => html`
          <a class="mini" href="/obra/${o.slug}" data-link data-reveal style="--d:${i * 0.1}s; --niebla-obra:${o.niebla}">
            ${picture(o.imagen, { alt: o.alt, sizes: '(min-width: 800px) 40vw, 90vw', attrs: `data-obra-img="${o.slug}"` })}
            <span class="label">${o.numero} · ${tituloDe(o)} →</span>
          </a>`)}
      </div>
    </section>
    ${footer()}
  `);

  const offs = [];
  return {
    node,
    mounted() {
      const v = document.querySelector('[data-view]');
      offs.push(initMarquees(v));
      // Pompas con los motivos: al tocarlas "rebotan"; con ratón se apartan del puntero.
      const box = v.querySelector('[data-motifs]');
      const bounce = (b) => { b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop'); };
      box.addEventListener('click', (e) => { const b = e.target.closest('.motif'); if (b) bounce(b); });
      if (!prefersReducedMotion() && matchMedia('(pointer: fine)').matches) {
        const items = [...box.querySelectorAll('.motif')];
        const move = (e) => {
          for (const b of items) {
            const r = b.getBoundingClientRect();
            const dx = r.left + r.width / 2 - e.clientX;
            const dy = r.top + r.height / 2 - e.clientY;
            const d = Math.hypot(dx, dy);
            const f = Math.max(0, 1 - d / 160) * 26;
            b.style.translate = f ? `${(dx / d) * f}px ${(dy / d) * f}px` : '';
          }
        };
        const leave = () => items.forEach((b) => { b.style.translate = ''; });
        box.parentElement.addEventListener('pointermove', move, { passive: true });
        box.parentElement.addEventListener('pointerleave', leave);
        offs.push(() => { box.parentElement.removeEventListener('pointermove', move); box.parentElement.removeEventListener('pointerleave', leave); });
      }
    },
    cleanup() { offs.forEach((f) => f()); },
  };
}
