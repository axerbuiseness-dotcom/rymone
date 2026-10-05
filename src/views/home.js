import { html, toNode, icons, tituloImg } from '../dom.js';
import { obras } from '../data/obras.js';
import { pieceCard, footer, instagramMarquee, firmaMarquee } from './shared.js';
import { createSpray } from '../fx/spray.js';
import { initTilt } from '../fx/tilt.js';
import { initMarquees } from '../fx/marquee.js';
import { prefersReducedMotion } from '../fx/motion.js';
import { config } from '../config.js';
import { sala, initSala } from './sala.js';
import { expositor, initExpositor } from './musica.js';

export function homeView() {
  const reduced = prefersReducedMotion();

  const node = toNode(html`
    <section class="hero" aria-labelledby="hero-title" data-hero>
      <canvas class="hero__spray" data-spray aria-hidden="true"></canvas>
      <div class="hero__letter" data-parallax>
        <img class="lettering" src="/media/lettering-1800.webp" srcset="/media/lettering-900.webp 900w, /media/lettering-1800.webp 1800w" sizes="(min-width: 1150px) 1100px, 96vw" width="1800" height="882" fetchpriority="high" decoding="async" alt="Lettering de Rymone: letras pompa dibujadas a línea con margaritas, destellos y un personaje con gorro asomando entre las letras.">
      </div>
      <div class="hero__intro">
        <h1 id="hero-title" class="hero__title" data-focus><span class="sr-only">Rymone</span></h1>
      </div>
      <div class="hero__ctas">
        <a class="btn" href="/obra" data-link>Ver la obra ${icons.arrow}</a>
        <a class="btn btn--ghost" href="/contacto" data-link>Consultar una obra</a>
      </div>
      <span class="hero__scroll label" aria-hidden="true"><i></i>Baja para ver la colección</span>
    </section>

    ${instagramMarquee()}

    <section class="section wrap" aria-labelledby="coleccion-title">
      <div class="section__head">
        <h2 id="coleccion-title" class="section__title" data-split>La colección</h2>
      </div>
      ${config.galeria === 'sala' ? sala({ id: 'sala-inicio' }) : html`<div class="wall">${obras.map((o, i) => pieceCard(o, i))}</div>`}
    </section>

    <section class="section wrap" aria-labelledby="musica-inicio-h">
      <div class="section__head">
        <h2 id="musica-inicio-h" class="section__title titulo-h">${tituloImg('musica', 'Música', { cls: 'titulo-img--md', sizes: '(min-width: 900px) 460px, 70vw' })}</h2>
      </div>
      ${expositor({ id: 'disco-inicio' })}
    </section>

    ${firmaMarquee()}

    <section class="section wrap" aria-labelledby="cta-title">
      <div class="callout" data-reveal>
        <p class="label">Compra y encargos</p>
        <h2 id="cta-title" data-split>¿Te interesa una obra?</h2>
        <p>Pregunta por disponibilidad, precio o encargos. Rymone responde personalmente.</p>
        <a class="btn" href="/contacto" data-link>Escribir a Rymone ${icons.arrow}</a>
        <svg class="callout__drips" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0 0h400v10H352v26a6 6 0 0 1-12 0V10H250v40a7 7 0 0 1-14 0V10H140v18a5 5 0 0 1-10 0V10H60v32a6 6 0 0 1-12 0V10H0z"/></svg>
      </div>
    </section>
    ${footer()}
  `);

  const fx = [];
  return {
    node,
    mounted() {
      const hero = document.querySelector('[data-hero]');
      if (!hero) return;
      if (!reduced) fx.push(createSpray(hero.querySelector('[data-spray]')));
      fx.push({ destroy: initTilt(document.querySelector('[data-view]')) });
      fx.push({ destroy: initSala(document.querySelector('[data-view]')) });
      fx.push({ destroy: initExpositor(document.querySelector('[data-view]')) });
      fx.push({ destroy: initMarquees(document.querySelector('[data-view]')) });
      if (!reduced) {
        // El lettering se aleja con el scroll y sigue un poco al puntero
        const letter = hero.querySelector('[data-parallax]');
        let px = 0, py = 0;
        const apply = () => {
          const s = Math.min(1, scrollY / innerHeight);
          letter.style.transform = `translate3d(${px}px, ${py + s * 80}px, 0) scale(${1 - s * 0.12})`;
          letter.style.opacity = String(1 - s * 0.7);
        };
        const onMove = (e) => {
          if (e.pointerType !== 'mouse') return;
          px = (e.clientX / innerWidth - 0.5) * -18;
          py = (e.clientY / innerHeight - 0.5) * -12;
          apply();
        };
        addEventListener('scroll', apply, { passive: true });
        addEventListener('pointermove', onMove, { passive: true });
        fx.push({ destroy: () => { removeEventListener('scroll', apply); removeEventListener('pointermove', onMove); } });
      }
    },
    cleanup() { fx.forEach((f) => f.destroy()); },
  };
}
