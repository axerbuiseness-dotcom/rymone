// Canciones de Rymone. Las portadas están en musica/ (originales) y public/media/cd-*.webp (optimizadas).
// Audio: los WAV originales están en la raíz de la carpeta; las copias MP3 para la web, en public/audio.
// `audio: null` = todavía no hay sonido: el reproductor lo indica. «No me arrepiento» llegó ya en MP3 y se copia tal cual.
// Títulos y artista facilitados por Rymone (en la música firma como One).
import manifest from '../media-manifest.json';

const media = (name) => ({ name, ...manifest[name] });

export const canciones = [
  { slug: 'no-me-arrepiento', numero: '01', titulo: 'No me arrepiento', artista: 'One', imagen: media('cd-1'), audio: '/audio/no-me-arrepiento.mp3', tinte: '#6f6f78', alt: 'Portada de «No me arrepiento» en caja de CD: nubes en blanco y negro con tres ornamentos blancos en el centro.' },
  { slug: 'demonios', numero: '02', titulo: 'Demonios', artista: 'One', imagen: media('cd-2'), audio: '/audio/demonios.mp3', tinte: '#d9d9d2', alt: 'Portada en caja de CD: dos coches chocando dibujados en negro sobre fondo blanco, con el texto «Demonios» y «One».' },
  { slug: 'dime', numero: '03', titulo: 'Dime', artista: 'One', imagen: media('cd-3'), audio: '/audio/dime.mp3', tinte: '#2f8fd0', alt: 'Portada en caja de CD: ilustración en blanco y negro de una chica con gorro de cuernos sobre fondo azul, con el texto «Dime» y «One».' },
  { slug: 'ahora-me-mata', numero: '04', titulo: 'Ahora me mata', artista: 'One', imagen: media('cd-4'), audio: '/audio/ahora-me-mata.mp3', tinte: '#8c8c8c', alt: 'Portada en caja de CD: foto desenfocada en blanco y negro de un rostro con el texto ondulado «Ahora me mata».' },
  { slug: 'lady', numero: '05', titulo: 'Lady', artista: 'One', imagen: media('cd-5'), audio: '/audio/lady.mp3', tinte: '#c46a3c', alt: 'Portada en caja de CD: collage con un perro y una mano de uñas rojas, con el texto «Lady».' },
];

// CD "por desvelar": último del estante, con la portada en mosaico de píxeles. No se puede escuchar.
canciones.push({ slug: 'proximamente', numero: '06', titulo: 'Próximamente', artista: 'One', locked: true, imagen: media('cd-proximo'), audio: null, tinte: '#6d1a5b', alt: 'CD por desvelar: caja de CD con la portada en un mosaico de píxeles.' });
export const cancionesPublicadas = canciones.filter((c) => !c.locked);

export const tituloCancion = (c) => c.titulo ?? `Canción ${c.numero}`;
