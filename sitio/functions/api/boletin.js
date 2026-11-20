// POST /api/boletin — suscribe un correo al boletín con doble confirmación (Brevo).
import { json, correoValido, brevo } from '../../servidor/brevo.js';

export async function onRequestPost({ request, env }) {
  let d;
  try { d = await request.json(); } catch { return json({ ok: false }, 400); }
  if (d.sitio) return json({ ok: true });
  const correo = String(d.correo || '').trim();
  if (!correoValido(correo)) return json({ ok: false, mensaje: 'Correo inválido.' }, 400);
  if (!env.BREVO_API_KEY || !env.BREVO_LISTA_ID || !env.BREVO_PLANTILLA_DOI) {
    return json({ ok: false, mensaje: 'El boletín aún no está configurado.' }, 503);
  }
  const origen = new URL(request.url).origin;
  try {
    await brevo(env, '/contacts/doubleOptinConfirmation', {
      email: correo,
      includeListIds: [Number(env.BREVO_LISTA_ID)],
      templateId: Number(env.BREVO_PLANTILLA_DOI),
      redirectionUrl: `${origen}/gracias/`,
    });
  } catch (err) {
    console.error(err);
    return json({ ok: false }, 502);
  }
  return json({ ok: true });
}

export const onRequest = () => json({ ok: false }, 405);
