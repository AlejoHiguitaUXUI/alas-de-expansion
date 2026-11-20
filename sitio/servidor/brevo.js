// Utilidades compartidas por las funciones de Cloudflare Pages.
// Variables de entorno (Cloudflare Pages → Settings → Environment variables):
//   BREVO_API_KEY       clave de API de Brevo (plan gratis)
//   CORREO_REMITENTE    correo verificado en Brevo desde el que se envía
//   CORREO_EQUIPO       correo que recibe el aviso de cada inscripción
//   BREVO_LISTA_ID      número de la lista del boletín en Brevo
//   BREVO_PLANTILLA_DOI número de la plantilla de doble confirmación del boletín

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const correoValido = (v) => typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export async function brevo(env, ruta, cuerpo) {
  const r = await fetch(`https://api.brevo.com/v3${ruta}`, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  if (!r.ok && r.status !== 204) {
    const t = await r.text().catch(() => '');
    throw new Error(`Brevo ${r.status}: ${t.slice(0, 200)}`);
  }
  return r;
}

// Plantilla de correo en los tonos Crepúsculo
export const plantilla = (titulo, cuerpoHtml) => `<!doctype html><html lang="es"><body style="margin:0;background:#F5EDE1;font-family:Arial,Helvetica,sans-serif;color:#26203C">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5EDE1;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FBF6EE;border-radius:20px;overflow:hidden">
<tr><td style="background:#14122C;padding:22px 28px;color:#E8C78A;font-size:13px;letter-spacing:3px;font-weight:bold">ALAS DE EXPANSIÓN</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:26px;color:#1E1A3F">${titulo}</h1>
${cuerpoHtml}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #E6D9C8;font-size:12px;color:#625873">Expande tu conciencia, expande tu ser · Medellín, Colombia</td></tr>
</table></td></tr></table></body></html>`;
