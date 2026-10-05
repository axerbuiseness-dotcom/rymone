// Catálogo de obras. Añadir una obra = añadir un objeto aquí y sus imágenes con `npm run media`.
// Los campos a null son datos que Rymone aún no ha facilitado: la web muestra "Pendiente".
import manifest from '../media-manifest.json';

const media = (name) => {
  const m = manifest[name];
  return { name, width: m.width, height: m.height, widths: m.widths };
};

export const obras = [
  {
    slug: 'obra-01',
    numero: '01',
    titulo: null, // Título pendiente
    archivo: 'cuadro 1.png',
    imagen: media('obra-01'),
    alt: 'Cuadro enmarcado en madera: letras pompa negras con contorno naranja y goteos, una aureola naranja encima, sobre una pintura figurativa de una figura con un ramo de calas blancas en tonos rojizos.',
    // Colores de la interfaz alrededor de la obra (no se aplican a la imagen)
    acento: 'var(--naranja)',
    niebla: '#5a1d12',
    año: '2026',
    tecnica: null,
    medidas: null,
    disponibilidad: null,
    precio: null,
    descripcion: null,
  },
  {
    slug: 'obra-02',
    numero: '02',
    titulo: null,
    archivo: 'cuadro 2.png',
    imagen: media('obra-02'),
    alt: 'Lienzo apaisado: letras pompa naranjas brillantes con contorno cian sobre fondo negro y magenta de spray, con aureola naranja, destellos blancos y círculos rosa chicle.',
    acento: 'var(--cian)',
    niebla: '#5b1150',
    año: '2021',
    tecnica: null,
    medidas: null,
    disponibilidad: null,
    precio: null,
    descripcion: null,
  },
  {
    slug: 'obra-03',
    numero: '03',
    titulo: null,
    archivo: 'cuadro 3.png',
    imagen: media('obra-03'),
    alt: 'Lienzo apaisado: letras afiladas en lila y verde menta con contorno negro y naranja sobre fondo magenta, con un personaje amarillo con gorro en el centro, manos que agarran las letras y salpicaduras amarillo flúor.',
    acento: 'var(--chicle)',
    niebla: '#6b1050',
    año: '2022',
    tecnica: null,
    medidas: null,
    disponibilidad: null,
    precio: null,
    descripcion: null,
  },
];

// Obra "por desvelar": aparece al final de la sala como un mosaico de píxeles bloqueado, para crear intriga.
// No es ninguna obra real: la imagen es un mosaico generado (scripts/prepare-cutouts.py → locked_assets).
export const obraProxima = {
  slug: 'proxima', numero: '04', locked: true, imagen: media('obra-proxima'),
  alt: 'Obra por desvelar: un mosaico de píxeles en penumbra con un candado.', niebla: '#3a1240', acento: 'var(--chicle)',
};

export const tituloDe = (o) => o.titulo ?? `Obra ${o.numero}`;
export const findObra = (slug) => obras.find((o) => o.slug === slug);
