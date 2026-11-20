// Prefijo del sitio. Vale '' cuando el sitio vive en la raíz del dominio (Cloudflare Pages, dominio propio)
// y '/alas-de-expansion' cuando se publica como página de proyecto de GitHub Pages.
export const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
export const u = (ruta: string) => base + ruta;

export const urlExp = (id: string) => u(id === 'consultas' ? '/consultas/' : `/experiencias/${id}/`);
export const urlProd = (id: string) => u(`/productos/${id}/`);
export const urlEnc = (id: string) => u(`/agenda/${id}/`);
export const urlArt = (id: string) => u(`/bitacora/${id}/`);
