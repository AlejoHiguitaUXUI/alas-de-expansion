# Alas de Expansión · sitio web

Sitio estático hecho con [Astro](https://astro.build) a partir del prototipo Crepúsculo.
Se publica gratis en Cloudflare Pages y se administra desde un panel gratuito (Pages CMS).
El único costo fijo es el dominio.

## Qué hay en esta carpeta

| Carpeta o archivo | Para qué sirve |
| --- | --- |
| `src/content/` | Todo el contenido editable: encuentros, productos, caminos, bitácora, preguntas y textos legales |
| `src/content/media/` | Las fotos que se suben desde el panel |
| `src/data/ajustes.json` | WhatsApp, correo, redes, datos de pago y Google Analytics |
| `src/pages/` | Las páginas del sitio |
| `src/styles/global.css` | El sistema visual (colores, tipografía, botones, animaciones) |
| `functions/api/` | Funciones de Cloudflare: inscripción a encuentros y boletín (correos con Brevo) |
| `.pages.yml` | La configuración del panel de administración |

## Trabajar en el computador

```bash
npm install
npm run dev
```

El sitio queda en http://localhost:4321. Las inscripciones y el boletín no funcionan en local
(no hay servicio de correo): el formulario de inscripción ofrece terminar por WhatsApp.

## Publicar por primera vez

1. **GitHub.** Crear una cuenta y un repositorio privado (por ejemplo `alas-de-expansion`) y subir esta carpeta `sitio/`.
2. **Cloudflare Pages.** En Cloudflare → Workers & Pages → Create → Pages → conectar el repositorio.
   - Framework: Astro
   - Comando de compilación: `npm run build`
   - Carpeta de salida: `dist`
   - Variable `NODE_VERSION` = `22`
3. **Panel.** Entrar a [app.pagescms.org](https://app.pagescms.org) con GitHub, abrir el repositorio
   y, en *Settings → Collaborators*, invitar por correo a quien administra el sitio. No necesita cuenta de GitHub.
4. **Datos de contacto.** En el panel, sección *Datos de contacto y pagos*: número de WhatsApp
   (con indicativo, por ejemplo `573001234567`), correo y datos de pago.
5. **Correos (Brevo, plan gratis).** Crear la cuenta, verificar el correo remitente y crear una clave de API.
   En Cloudflare Pages → Settings → Environment variables agregar:
   - `BREVO_API_KEY`: la clave de API
   - `CORREO_REMITENTE`: el correo verificado en Brevo
   - `CORREO_EQUIPO`: el correo que recibe cada inscripción
   - `BREVO_LISTA_ID`: el número de la lista del boletín
   - `BREVO_PLANTILLA_DOI`: el número de la plantilla de doble confirmación del boletín
   - `SITE_URL`: la dirección final del sitio, por ejemplo `https://alasdeexpansion.com`
6. **Dominio.** Comprarlo en Cloudflare Registrar y conectarlo en Pages → Custom domains.

## Cómo se edita (para quien administra)

- **Encuentros:** crear uno nuevo por cada fecha. Cuando se llenen los cupos, cambiar *Estado* a *Agotado*.
  Los encuentros que ya pasaron se mueven solos a «Memoria del camino».
- **Productos:** precio solo con números (ej. `28000`). Apagar *Disponible* cuando se agote.
- **Bitácora:** escribir el texto, elegir el tema y una foto.
- Al guardar, el sitio se actualiza solo en uno o dos minutos.

## Pendientes antes de lanzar

- Reemplazar los textos entre corchetes `[ASÍ]` por la información real.
- Cambiar las imágenes generadas con IA por fotos reales.
- Las fechas de los encuentros son de ejemplo.
- Revisión de los textos legales por un abogado.
