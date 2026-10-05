// Puente para que las vistas naveguen sin importar main.js (evita dependencias circulares).
let impl = (href) => { location.href = href; };
export const setNavigator = (fn) => { impl = fn; };
export const go = (href, opts) => impl(href, opts);
