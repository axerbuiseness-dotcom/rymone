import '@fontsource-variable/unbounded';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import './styles.css';

import { resolve } from './router.js';
import { drip } from './fx/drip.js';
import { initSparkles } from './fx/sparkle.js';
import { initMagnets } from './fx/magnet.js';
import { splitTitles } from './fx/split.js';
import { createMist } from './fx/mist.js';
import { openGate } from './fx/gate.js';
import { prefersReducedMotion } from './fx/motion.js';
import { setNavigator } from './nav.js';

const view = document.querySelector('[data-view]');
const announcer = document.querySelector('[data-announcer]');
const navMark = document.querySelector('[data-nav-mark]');
const progress = document.querySelector('[data-progress]');
const scrollMemory = new Map();
let current = null; // { route, cleanup }
let navigating = false;
let renderedPath = location.pathname + location.search;

if (!prefersReducedMotion()) document.documentElement.classList.add('motion');
if (matchMedia('(pointer: fine)').matches) document.documentElement.classList.add('has-fine-pointer');

// ---------- Trazo de pintura bajo la sección activa ----------
function placeNavMark(section) {
  const link = document.querySelector(`[data-nav="${section}"]`);
  document.querySelectorAll('[data-nav]').forEach((a) => a.removeAttribute('aria-current'));
  if (!link) { navMark.style.setProperty('--mo', 0); return; }
  link.setAttribute('aria-current', 'page');
  const navBox = navMark.parentElement.getBoundingClientRect();
  const box = link.getBoundingClientRect();
  const w = Math.max(24, box.width * 0.8);
  navMark.style.setProperty('--mw', `${w}px`);
  navMark.style.setProperty('--mx', `${box.left - navBox.left + (box.width - w) / 2}px`);
  navMark.style.setProperty('--mo', 1);
  navMark.classList.remove('is-drop'); void navMark.offsetWidth; navMark.classList.add('is-drop');
}
addEventListener('resize', () => current && placeNavMark(current.route.section));

// ---------- Progreso de scroll: una línea de pintura que baja ----------
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleY(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
};
addEventListener('scroll', updateProgress, { passive: true });

// ---------- Revelado al hacer scroll ----------
let io;
function observeReveals(root) {
  io?.disconnect();
  const els = root.querySelectorAll('[data-reveal], [data-split]');
  if (!document.documentElement.classList.contains('motion')) { els.forEach((el) => el.classList.add('is-in')); return; }
  io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach((el) => io.observe(el));
}

// ---------- Render ----------
async function render(path, { restoreScroll = false } = {}) {
  const url = new URL(path, location.origin);
  const route = resolve(url);
  current?.cleanup?.();
  const result = route.view(route.params, url);
  view.replaceChildren(result.node);
  document.documentElement.style.setProperty('--drip', route.color);
  document.title = route.title ? `${route.title} · Rymone` : 'Rymone';
  current = { route, cleanup: result.cleanup };
  renderedPath = url.pathname + url.search;
  placeNavMark(route.section);
  splitTitles(view);
  observeReveals(view);
  const y = restoreScroll ? scrollMemory.get(url.pathname) ?? 0 : 0;
  scrollTo({ top: y, behavior: 'instant' });
  updateProgress();
  result.mounted?.();
  return route;
}

function focusView(route) {
  const target = view.querySelector('[data-focus]') ?? view;
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  announcer.textContent = route.title ?? 'Inicio';
}

export async function navigate(href, { replace = false, fromPop = false } = {}) {
  const url = new URL(href, location.origin);
  if (url.origin !== location.origin) { location.href = href; return; }
  if (navigating) return;
  const samePage = url.pathname === location.pathname && url.search === location.search;
  if (samePage && !fromPop) {
    const target = url.hash && document.querySelector(url.hash);
    if (target) target.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
    else scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
    return;
  }

  scrollMemory.set(location.pathname, scrollY);
  if (!fromPop) history[replace ? 'replaceState' : 'pushState']({}, '', url);
  const next = resolve(url);
  const prev = current?.route;
  navigating = true;
  try {
    const isObraMorph = prev && next.morph && prev.morph && document.startViewTransition && !prefersReducedMotion();
    if (isObraMorph) {
      // Obra: la imagen de la tarjeta se transforma en la del detalle (y al revés)
      const slug = next.params.slug ?? prev.params.slug;
      const tag = () => view.querySelectorAll('[data-obra-img]').forEach((img) => { img.style.viewTransitionName = img.dataset.obraImg === slug ? 'obra-img' : ''; });
      tag();
      const vt = document.startViewTransition(async () => {
        await render(url.href, { restoreScroll: fromPop || (next.section === 'obra' && !next.params.slug) });
        tag();
      });
      await vt.finished.catch(() => {});
      view.querySelectorAll('[data-obra-img]').forEach((img) => { img.style.viewTransitionName = ''; });
    } else if (prev && !prefersReducedMotion()) {
      await drip.cover(next.color);
      await render(url.href, { restoreScroll: fromPop });
      await drip.reveal();
    } else {
      await render(url.href, { restoreScroll: fromPop });
    }
    focusView(next);
  } finally {
    navigating = false;
  }
}

// Enlaces internos
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  navigate(a.getAttribute('href'));
});
addEventListener('popstate', () => {
  if (location.pathname + location.search === renderedPath) return; // solo cambió el #ancla (p. ej. "Saltar al contenido")
  navigate(location.href, { fromPop: true });
});
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

setNavigator(navigate);
createMist(document.querySelector('[data-atmos]'), { reduced: prefersReducedMotion() });
initSparkles();
initMagnets();

// Primero la pantalla de entrada; la web se monta debajo para que esté lista al entrar.
document.documentElement.classList.add('is-entering');
// Al entrar en la web siempre se empieza por Inicio
if (location.pathname !== '/') history.replaceState({}, '', '/' + location.search);
render(location.href).then((route) => announcer.textContent = route.title ?? 'Inicio');
openGate({ onClosed: () => focusView(current.route) }).then(() => {
  document.documentElement.classList.remove('is-entering');
  document.documentElement.classList.add('has-entered');
});
