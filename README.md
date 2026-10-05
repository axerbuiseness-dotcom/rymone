# Web de Rymone

Portfolio experimental de Rymone. Primera versión funcional, sin publicar.

## Ejecutar en local

Requisitos: Node 18 o superior (probado con Node 24).

```bash
npm install
npm run dev
```

Abre http://localhost:5173

Versión de producción:

```bash
npm run build
npm run preview
```

Abre http://localhost:4173

Para revisar el modo de movimiento reducido sin cambiar la configuración del sistema, añade `?movimiento=reducido` a la URL (por ejemplo http://localhost:5173/?movimiento=reducido).

## Concepto

Un **muro nocturno de spray que reacciona al visitante**. Se entra pulsando una pompa naranja (como las letras pompa de los cuadros) que estalla y llena la pantalla. Detrás de toda la web hay una niebla magenta en WebGL que sigue al ratón o al dedo y deriva con el scroll. Las obras viven en la misma paleta oscura que el resto, también al abrirlas. Las secciones se conectan con una cortina de pintura que gotea; las obras se abren transformando la imagen en su ficha; los títulos se inflan letra a letra; las obras se inclinan en 3D siguiendo el ratón; los botones son magnéticos; unas cintas de texto aceleran con el scroll; en la ficha hay una lupa; y al pulsar en cualquier sitio salen destellos.

## Tipografía y firma

- **Unbounded** para títulos, **Instrument Sans** para textos e **IBM Plex Mono** para etiquetas y botones.
- La pantalla de entrada muestra la **firma de brillantes** (`marca/firma brillantes.png`). Al pasar el cursor o el dedo, un destello recorre los brillantes, saltan chispas y la firma se inclina hacia el puntero.
- Logos de brillantes (`marca/`): en el móvil, el logo 3 va en la cabecera; en Sobre mí, el logo 3 en grande. Los títulos de las páginas Obra y Música son las imágenes `marca/titulo obra brillantes.png` y `marca/titulo musica brillantes.png`. En escritorio la cabecera y el pie dicen «Rymone®» en texto.
- La firma a rotulador (`IMG_7088.jpeg`) se usa en las cintas que se mueven con el scroll.

Para buscar otras fuentes: https://fonts.google.com (gratuitas y con licencia libre para web) y https://fontsource.org (las mismas, listas para instalar con npm).

## Galería de obras

Las obras se muestran en **"La sala"** (`src/views/sala.js`): una sala oscura en 3D donde cuelgan sin nombres, cada una bajo su foco, con polvo flotando en la luz y reflejo en el suelo. Se recorre arrastrando, deslizando en el móvil, con la rueda horizontal del trackpad, con las flechas del teclado o con los botones. La obra del centro se abre al pulsarla; si pulsas una de los lados, se acerca al centro.

**Acercarse** (`src/fx/zoom.js`): con doble clic en la obra del centro, con el botón «Acercarse» de la sala o desde la ficha de cada obra, la obra vuela a pantalla completa. Con ratón, la vista sigue al cursor y se amplía con la rueda o con un clic. En el móvil se pellizca, se arrastra y se hace doble toque. Incluye un modo **Linterna** que deja la sala a oscuras y solo ilumina alrededor del puntero, y un minimapa para orientarse. Llega hasta un 320 %; con fotos de más resolución se vería más nítido de cerca.

Para volver a la vista anterior (obras en columna con número y título), cambia `galeria: 'sala'` por `galeria: 'muro'` en `src/config.js`.

## Música

Sección `/musica` (también en la portada): un expositor con las cinco canciones (`musica/`, portadas en su caja de CD). Al elegir un CD del estante, el disco sale de la caja con la portada impresa y gira; se puede "scratchear" arrastrándolo. Los datos están en `src/data/musica.js`. El sonido se escucha con «Escuchar»: el disco gira más rápido, unas barras siguen la música, la barra de progreso permite saltar y, arrastrando el disco mientras suena, se adelanta o retrocede (scratch). Al acabar una canción pasa a la siguiente.

Audio: los WAV originales están en la raíz; las copias MP3 (224 kbps) en `public/audio/`, convertidas con ffmpeg (`ffmpeg -i "original.wav" -codec:a libmp3lame -b:a 224k public/audio/nombre.mp3`). «No me arrepiento» llegó ya en MP3 y se copia tal cual.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html`, `src/main.js` | Entrada, navegación, transiciones y foco |
| `src/router.js` | Rutas: `/`, `/obra`, `/obra/:slug`, `/musica`, `/sobre-mi`, `/contacto` |
| `src/views/` | Una vista por sección |
| `src/fx/` | Pantalla de entrada, niebla WebGL, spray, goteo, destellos, títulos que se inflan, inclinación, botones magnéticos, cintas de texto, lupa. `turntable.js` (personaje girable) está desactivado por ahora |
| `src/data/obras.js` | **Catálogo de obras**: título, año, técnica, medidas, disponibilidad, precio, descripción |
| `src/config.js` | **Email, redes y servicio del formulario** |
| `public/media/` | Imágenes optimizadas (generadas) |
| `scripts/` | Generación de recortes e imágenes optimizadas |
| `references.md`, `docs/referencias/` | Análisis de las webs de referencia con capturas |

Los archivos originales de la carpeta raíz no se modifican.

## Añadir o completar obras

1. Rellena los campos que están a `null` en `src/data/obras.js`. Todo lo que siga a `null` se muestra como "Pendiente".
2. Para una obra nueva: copia la imagen a la raíz, añade una entrada en `scripts/optimize-images.mjs` y en `src/data/obras.js`, y ejecuta `npm run media`.

## Regenerar imágenes

```bash
python scripts/prepare-cutouts.py
npm run media
```

`prepare-cutouts.py` (Python con Pillow y NumPy) quita la pared blanca de las fotos de los cuadros (sin tocar la obra), convierte el lettering en trazo transparente sin la firma "2024" y recorta el personaje. `npm run media` genera AVIF y WebP en varios tamaños.

## Pendiente para completar

- Datos de cada obra: título, año, técnica, medidas, disponibilidad, precio y descripción.
- Biografía, trayectoria, exposiciones y prensa.
- Email público (`src/config.js`). El Instagram @aleexriera_ ya está puesto.
- Servicio de envío del formulario (`contactEndpoint` en `src/config.js`, por ejemplo Formspree o un backend propio). Hasta entonces el formulario avisa de que el mensaje **no** se ha enviado.
- Personaje: retirado de la web por ahora. Sus recortes y el giro provisional siguen en el proyecto por si se recupera (idealmente con un modelo 3D `.glb`).
- Fotos de las obras a más resolución (una vez quitada la pared, las actuales miden 925 y 1023 px de ancho) y, si se quiere, fotos de detalle.
- Pagos: no implementados. La venta se canaliza con "Consultar por esta obra".
- Dominio, hosting, textos legales (privacidad y cookies) y analítica, cuando se publique. Al publicar, el servidor debe devolver `index.html` para todas las rutas (fallback de SPA).
