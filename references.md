# Análisis de referencias — Web de Rymone

Fecha de análisis: 4 de octubre de 2026. Las tres webs se recorrieron en un navegador real (Chromium, panel de navegador de Claude) a ~800×600 en escritorio y 375×812 en móvil. Se hizo scroll completo, clic en menús y proyectos, hover y arrastre. Se inspeccionó el DOM para identificar tecnologías.

Las capturas están en `docs/referencias/`.

Convención: **[Observado]** lo vi en pantalla o en el DOM. **[Inferido]** es una deducción a partir de lo observado, no comprobada.

---

## 1. A./CHEN — https://a-chen.webflow.io/

Capturas: `achen-01-entrada.jpg` … `achen-05-movil.jpg`

**Composición y jerarquía**
- [Observado] Entrada a pantalla completa con el nombre "A./CHEN" en tipografía condensada gigante que ocupa todo el ancho. Barra superior mínima con logo, ubicación, "about", "works 2018–2024" y "talk to me".
- [Observado] Tras el nombre aparece un personaje 3D (avatar del autor, gorra y sudadera) que domina la pantalla. A su alrededor, titulares enormes ("HELLO I AM ACHEN", "WEB DESIGNER OF YOUR FUTURE") se superponen al personaje.
- [Observado] Sección "WORKS" con imágenes a la izquierda que hacen scroll y el título "WORKS" fijo a la derecha. Las categorías se van listando debajo a medida que avanzas.
- [Observado] Cierre con "let's talk —" enorme, en verde sobre naranja, y enlaces a redes en una línea.

**Tipografía y color**
- [Observado] Mango Grotesque (condensada, display) y Bricolage Grotesque (texto). Mayúsculas gigantes como elemento gráfico.
- [Observado] Paleta de tres colores saturados en choque: naranja rojizo `rgb(255,52,0)`, verde ácido `rgb(24,255,19)` y negro, con un punto cian. Una sección cambia a negro con foto iluminada en naranja para un momento más calmado.

**Navegación e interacción**
- [Observado] Página larga con scroll; "about" carga otra página completa (sin transición SPA). En móvil, el menú se reduce a logo y años; el nombre y el personaje se reorganizan en vertical.

**Movimiento**
- [Observado] El personaje 3D cambia de pose y encuadre con el scroll: empieza de cuerpo entero, gira y acaba en primer plano de la cabeza. El scroll actúa como "cámara".
- [Inferido] Las animaciones de Webflow Interactions (28 elementos `data-w-id`) controlan la entrada de titulares e imágenes con el scroll.

**3D y recursos**
- [Observado] Un único `<canvas>` dentro de un contenedor `.spline`: el personaje es una escena de Spline. No hay vídeo ni audio.

**Qué reinterpretamos para Rymone**
- Un **avatar 3D del artista como guía** del universo. Rymone ya tiene un personaje con 4 vistas, así que lo usamos como presencia girable en "Sobre mí".
- **Color como identidad**: pocos colores muy saturados en choque. En Rymone salen de los propios cuadros (naranja, cian, rosa chicle y ciruela), no de esta web.
- Un cierre de contacto grande y directo.

---

## 2. KODE Immersive — https://kodeimmersive.com/

Capturas: `kode-01-puerta-enter.jpg` … `kode-06-movil.jpg`

**Composición y jerarquía**
- [Observado] Puerta de entrada negra con el logotipo y un botón "[ ENTER ]". Al pulsarlo, un panel naranja sube desde abajo y revela el hero: "INNOVATE WITH PURPOSE" en serif de palo seco muy condensada, con un objeto 3D de cristal naranja (un chevron) delante.
- [Observado] Bloques de manifiesto con texto enorme en mayúsculas sobre blanco roto, alternados con secciones naranjas de servicios ("001 INNOVATE", "002 CREATE"…) presididas por objetos 3D negros brillantes (asterisco, toro/aro).
- [Observado] Contador fijo "[ 001 ]", "[ 013 ]", "[ 026 ]"… en la cabecera, que marca el progreso del scroll.

**Tipografía y color**
- [Observado] "OT Brut" (display serif condensada) y "Aeonik Pro" (texto, mayúsculas pequeñas). Corchetes `[ ]` como lenguaje gráfico de los controles.
- [Observado] Tres estados de color: negro, naranja y blanco roto. Cada cambio de fondo marca un capítulo.

**Navegación e interacción**
- [Observado] Cabecera con "KODE", "[ SOUND ON ]", contador y "CONTACT". En móvil, "MENU".
- [Observado] Texto "SCRATCH AROUND": una zona donde el cursor deja trazos naranjas y las letras se "rascan"; el texto se ve desordenado mientras se mueve (`kode-03`).
- [Observado] El texto aparece con efecto de "scramble": letras que cambian hasta formar la palabra ("MAKN" → "MAKE").

**Movimiento**
- [Observado] Scroll suavizado (clase `lenis` en el documento). Los objetos 3D rotan y escalan con el scroll y se superponen al texto.
- [Observado] La puerta "ENTER" sirve para activar el sonido ("SOUND ON") antes de empezar.
- [Inferido] Nuxt (scripts `_nuxt/`) y varios `<canvas>` WebGL independientes para cada objeto 3D.

**3D y recursos**
- [Observado] Objetos 3D con material brillante tipo plástico o cristal (chevron naranja, asterisco negro, aro negro) y un fondo final con letras 3D cayendo. Hay sonido opcional; no lo escuché.

**Qué reinterpretamos para Rymone**
- **Una interacción que deja marca**: el "scratch around" se convierte en un **spray** con el que el visitante revela el lettering de Rymone en la entrada. Es el gesto del grafiti.
- **Materiales brillantes con reflejos**: los brillos y el "aro" son coherentes con las letras pompa y la aureola de Rymone. Lo traducimos a destellos y aureola en 2D, sin 3D pesado.
- **Capítulos marcados por cambios de fondo**: el paso del muro nocturno a la pared de galería al abrir una obra.
- La puerta de entrada no la copiamos: bloquea el acceso y aquí no hay sonido que activar.

---

## 3. Active Theory — https://activetheory.net/

Capturas: `at-01-loader.jpg` … `at-06-detalle-proyecto.jpg`

**Composición y jerarquía**
- [Observado] Carga con contador de porcentaje ("/14", "/75") dentro de una semiesfera de caracteres. En escritorio tardó unos 12 s; en móvil seguía al 12 % tras 18 s y no llegué a ver la web móvil.
- [Observado] Hero: el logo dentro de un aro de cristal iridiscente sostenido por un cable, en un espacio oscuro verde azulado. Al hacer scroll la cámara atraviesa nubes de partículas que forman escenas (una sala, un coche, una figura) y termina en "CREATIVE DIGITAL EXPERIENCES" con un texto de presentación.
- [Observado] /work: carrusel 3D de tarjetas de cristal con el título del proyecto ("PAPER PLANES") y una lista de filtros a la izquierda ("WEBSITES", "INSTALLATIONS", "XR / VR / AI"…) más un campo "ASK ME ANYTHING".

**Tipografía y color**
- [Observado] "nbarchitekt" (monoespaciada geométrica) para todo, en mayúsculas pequeñas con mucho espaciado. Colores: casi negro con niebla verde azulada, partículas en verde lima, violeta y cian, y reflejos iridiscentes.

**Navegación e interacción**
- [Observado] Cabecera en cápsula con "WORK — CONTACT" y un trazo entre ambos que se ondula. Es la única navegación visible.
- [Observado] Las tarjetas se arrastran. Al hacer clic, la URL cambia a `/work/paper-planes` sin recargar; la imagen se deshace en partículas y se recompone como detalle con año, cliente, descripción, "MEDIUM CASE STUDY", "PROJECT LINK", "← CLOSE" y "SCROLL TO CLOSE".
- [Observado] El DOM contiene una lista de texto oculta con todos los proyectos, además del canvas.

**Movimiento**
- [Observado] La cámara se mueve sin cortes entre estados; las transiciones son disoluciones de partículas y los textos aparecen con efecto de decodificación.
- [Inferido] Todo se renderiza en un único `<canvas>` WebGL (1280×960) con un framework propio (scripts `app.js`/`modules.js`). La lista oculta sirve como alternativa accesible y para SEO.

**3D y recursos**
- [Observado] WebGL a pantalla completa, partículas, aro de cristal con refracción. Botón "Toggle Audio" en el DOM; no activé el audio.

**Qué reinterpretamos para Rymone**
- **El aro como hilo conductor**: su aro de cristal coincide con la **aureola** que Rymone pinta sobre sus letras. En nuestra web, la aureola es el indicador de navegación, el cursor y el símbolo de la marca.
- **La obra se abre sin perder el contexto**: la tarjeta se transforma en el detalle y la URL cambia. Para "cerrar" se vuelve al mismo punto.
- **Una atmósfera que reacciona**: una niebla de spray en WebGL que responde al cursor, mucho más ligera que su escena.
- **Lo que evitamos**: una carga de más de 10 s y una web móvil que no llega a mostrarse. Para un portfolio que quiere vender, la obra tiene que verse en segundos.

---

## Síntesis para Rymone

| Principio | Viene de | Cómo lo aplicamos |
|---|---|---|
| Avatar del autor como guía | A./CHEN | Personaje de Rymone girable (4 vistas) en "Sobre mí", provisional hasta tener el modelo 3D |
| Gesto que deja huella | KODE ("scratch around") | Spray con el cursor o el dedo que revela el lettering en la entrada |
| Capítulos por cambio de fondo | KODE, A./CHEN | Muro nocturno para navegar; pared de galería clara para ver cada obra con fidelidad |
| Aro / anillo como símbolo | Active Theory, y sobre todo la propia obra | La aureola marca la sección activa, es el cursor y se posa sobre la obra enfocada |
| Abrir proyecto sin salir del universo | Active Theory | La tarjeta se transforma en el detalle (View Transitions) y "Volver" regresa al mismo punto |
| Paleta saturada propia | Las tres | Naranja, cian, rosa chicle y ciruela, extraídos de los dos cuadros |

La identidad principal no sale de las referencias: sale de los cuadros (letras pompa, brillos, goteos, aureola, destellos de cuatro puntas, niebla de spray en magenta) y del lettering lineal con margaritas.
