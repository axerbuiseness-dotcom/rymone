// Genera versiones web de los materiales en public/media sin tocar los originales.
// Uso: npm run media   (antes: python scripts/prepare-cutouts.py para los recortes)
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'public', 'media');
const cache = path.join(root, 'scripts', '.cache');
await mkdir(out, { recursive: true });

const jobs = [
  // Cuadros: sin la pared blanca de la foto (prepare-cutouts.py), sin ajustes de color; solo redimensionado proporcional.
  { src: path.join(cache, 'obra-01.png'), name: 'obra-01', widths: [640, 1100, 1600], alpha: false },
  { src: path.join(cache, 'obra-02.png'), name: 'obra-02', widths: [640, 1100, 1600], alpha: false },
  { src: path.join(cache, 'obra-03.png'), name: 'obra-03', widths: [640, 1100, 1600], alpha: false },
  ...[1, 2, 3, 4].map((i) => ({ src: path.join(cache, `personaje-vista-${i}.png`), name: `personaje-${i}`, widths: [360, 720], alpha: true })),
  { src: path.join(cache, 'lettering-trazo.png'), name: 'lettering', widths: [900, 1800], alpha: true, onlyWebp: true },
  // Marca con brillantes (marca/): firma de la entrada y logos que sustituyen la palabra "Rymone"
  { src: path.join(root, 'marca', 'firma brillantes.png'), name: 'firma-brillantes', widths: [600, 1200], alpha: true, trim: true },
  { src: path.join(root, 'marca', 'logo rymone brillantes 1.png'), name: 'logo-1', widths: [400, 900, 1600], alpha: true, trim: true },
  { src: path.join(root, 'marca', 'logo rymone brillantes 3.png'), name: 'logo-3', widths: [400, 900, 1600], alpha: true, trim: true },
  { src: path.join(root, 'marca', 'titulo obra brillantes.png'), name: 'titulo-obra', widths: [500, 1000, 1600], alpha: true, trim: true },
  { src: path.join(root, 'marca', 'titulo musica brillantes.png'), name: 'titulo-musica', widths: [500, 1000, 1600], alpha: true, trim: true },
  // Portadas de las canciones en su caja de CD (musica/): se quita solo el fondo negro sobrante
  ...['cd 1', 'cd 2 demonios', 'cd 3 dime', 'cd 4 ahora me mata', 'cd 5 lady'].map((f, i) => ({ src: path.join(root, 'musica', `${f}.png`), name: `cd-${i + 1}`, widths: [420, 840], alpha: false, trim: true })),
  // Obra y CD "próximamente" (mosaico de píxeles, sin contenido real)
  { src: path.join(cache, 'obra-proxima.png'), name: 'obra-proxima', widths: [640, 1100], alpha: false },
  { src: path.join(cache, 'cd-proximo.png'), name: 'cd-proximo', widths: [420, 840], alpha: false, trim: true },
  // Firma de Rymone (IMG_7088.jpeg) para la pantalla de entrada
  { src: path.join(cache, 'firma.png'), name: 'firma', widths: [700, 1400], alpha: true, onlyWebp: true },
];

const manifest = {};
for (const job of jobs) {
  const input = job.trim ? await sharp(job.src).trim({ threshold: 18 }).toBuffer() : job.src;
  const meta = await sharp(input).metadata();
  manifest[job.name] = { width: meta.width, height: meta.height, widths: [] };
  for (const w of job.widths) {
    const width = Math.min(w, meta.width);
    if (manifest[job.name].widths.includes(width)) continue;
    manifest[job.name].widths.push(width);
    const base = sharp(input).resize({ width, withoutEnlargement: true });
    await base.clone().webp({ quality: job.alpha ? 86 : 90, alphaQuality: 90, effort: 5 }).toFile(path.join(out, `${job.name}-${width}.webp`));
    if (!job.onlyWebp) {
      await base.clone().avif({ quality: 62, effort: 5 }).toFile(path.join(out, `${job.name}-${width}.avif`));
    }
  }
  console.log(job.name, manifest[job.name]);
}
await writeFile(path.join(root, 'src', 'media-manifest.json'), JSON.stringify(manifest, null, 2));
