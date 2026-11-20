// @ts-check
import { defineConfig } from 'astro/config';

// Dirección pública del sitio. Cámbiala cuando se compre el dominio
// (o define SITE_URL en Cloudflare Pages).
const SITE_URL = process.env.SITE_URL || 'https://alas-de-expansion.pages.dev';

// Si el sitio no vive en la raíz (p. ej. GitHub Pages de proyecto), define BASE_PATH=/nombre-del-repo.
const BASE_PATH = process.env.BASE_PATH || '/';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  image: {
    // Las fotos que suben desde el panel pueden ser muy grandes: se optimizan al publicar.
    responsiveStyles: true,
  },
});
