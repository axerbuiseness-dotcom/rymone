// Datos de contacto y servicios externos.
// Todo lo que está a null está PENDIENTE: la web lo muestra como tal y no inventa nada.
export const config = {
  // Correo público de Rymone. Ej.: 'hola@rymone.com'
  email: 'rieramartinezalex@gmail.com',
  // Perfil de Instagram (u otra red). Ej.: { label: '@rymone', url: 'https://instagram.com/rymone' }
  social: [{ label: '@aleexriera_', url: 'https://www.instagram.com/aleexriera_/' }],
  // Endpoint que recibe el formulario (Formspree, Netlify Forms, backend propio…).
  // Mientras sea null, el formulario NO envía nada y lo dice claramente.
  // Ej.: 'https://formspree.io/f/xxxxxxx'
  contactEndpoint: null,
  // Cómo se muestran las obras: 'sala' (galería experimental en 3D, sin nombres) o 'muro' (vista anterior con títulos)
  galeria: 'sala',
};
