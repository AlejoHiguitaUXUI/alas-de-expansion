// POST /api/inscripcion — registra una inscripción a un encuentro y envía dos correos:
// uno a la persona (confirmación o datos de pago) y otro al equipo.
import { json, esc, correoValido, brevo, plantilla } from '../../servidor/brevo.js';

export async function onRequestPost({ request, env }) {
  let d;
  try { d = await request.json(); } catch { return json({ ok: false, mensaje: 'Solicitud inválida.' }, 400); }

  // Campo trampa para bots: si viene lleno, respondemos "ok" sin hacer nada.
  if (d.sitio) return json({ ok: true });

  const nombre = String(d.nombre || '').trim().slice(0, 120);
  const celular = String(d.celular || '').trim().slice(0, 40);
  const correo = String(d.correo || '').trim().slice(0, 254);
  const id = String(d.encuentro || '').slice(0, 160);
  if (nombre.length < 2 || celular.replace(/\D/g, '').length < 7 || !correoValido(correo) || d.acepta !== true) {
    return json({ ok: false, mensaje: 'Revisa los datos del formulario.' }, 400);
  }
  if (!env.BREVO_API_KEY || !env.CORREO_REMITENTE || !env.CORREO_EQUIPO) {
    return json({ ok: false, mensaje: 'El servicio de correo aún no está configurado.' }, 503);
  }

  // Datos del encuentro desde el sitio publicado
  const datosResp = await env.ASSETS.fetch(new URL('/datos/encuentros.json', request.url));
  if (!datosResp.ok) return json({ ok: false, mensaje: 'No encontramos el encuentro.' }, 500);
  const datos = await datosResp.json();
  const e = datos.encuentros[id];
  if (!e || e.cobro === 'conversar') return json({ ok: false, mensaje: 'No encontramos el encuentro.' }, 404);
  if (e.estado === 'Agotado') return json({ ok: false, mensaje: 'Este encuentro ya no tiene cupos. Escríbenos por WhatsApp para la lista de espera.' }, 409);

  const remitente = { name: 'Alas de Expansión', email: env.CORREO_REMITENTE };
  const wa = datos.contacto.whatsapp ? `https://wa.me/${String(datos.contacto.whatsapp).replace(/\D/g, '')}` : '';
  const ficha = `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:8px 0 18px;background:#F5EDE1;border-radius:14px"><tr><td style="padding:14px 16px;font-size:15px;line-height:1.7">
<strong>${esc(e.titulo)}</strong><br>${esc(e.cuando)}<br>${esc(e.lugar)}<br>Valor: ${esc(e.valor)}</td></tr></table>`;

  let titulo, cuerpo;
  if (e.cobro === 'pago') {
    titulo = 'Recibimos tu inscripción';
    cuerpo = `<p style="font-size:16px;line-height:1.6">Hola, ${esc(nombre)}. Para confirmar tu lugar, envía el comprobante de pago.</p>${ficha}
<p style="font-size:15px;line-height:1.7"><strong>Datos de pago</strong><br>Transferencia: ${esc(datos.pago.transferencia)}<br>Nequi: ${esc(datos.pago.nequi)}</p>
<p style="font-size:15px;line-height:1.6">Tu cupo queda confirmado cuando recibimos el comprobante${wa ? ` por <a href="${wa}" style="color:#4A2C6E">WhatsApp</a>` : ' por WhatsApp'}.</p>`;
  } else {
    titulo = 'Tu lugar está confirmado';
    cuerpo = `<p style="font-size:16px;line-height:1.6">Hola, ${esc(nombre)}. Te esperamos.</p>${ficha}
${e.llevar ? `<p style="font-size:15px;line-height:1.6"><strong>Qué llevar:</strong> ${esc(e.llevar)}</p>` : ''}
<p style="font-size:15px;line-height:1.6">El aporte es voluntario y se da en el lugar. Si no puedes asistir, avísanos${wa ? ` por <a href="${wa}" style="color:#4A2C6E">WhatsApp</a>` : ' por WhatsApp'}.</p>`;
  }

  try {
    await brevo(env, '/smtp/email', {
      sender: remitente,
      to: [{ email: correo, name: nombre }],
      replyTo: { email: env.CORREO_EQUIPO },
      subject: `${titulo} · ${e.titulo}`,
      htmlContent: plantilla(titulo, cuerpo),
    });
    await brevo(env, '/smtp/email', {
      sender: remitente,
      to: [{ email: env.CORREO_EQUIPO }],
      replyTo: { email: correo, name: nombre },
      subject: `Nueva inscripción: ${e.titulo} (${e.fecha})`,
      htmlContent: plantilla('Nueva inscripción', `<p style="font-size:15px;line-height:1.8"><strong>${esc(nombre)}</strong><br>Celular: ${esc(celular)}<br>Correo: ${esc(correo)}<br>Autorizó el tratamiento de datos: sí</p>${ficha}
<p style="font-size:14px;color:#625873">${e.cobro === 'pago' ? 'Pendiente de comprobante de pago.' : 'Cupo confirmado automáticamente (aporte voluntario).'} Si el encuentro se llena, márcalo como «Agotado» en el panel.</p>`),
    });
  } catch (err) {
    console.error(err);
    return json({ ok: false, mensaje: 'No pudimos enviar el correo.' }, 502);
  }
  return json({ ok: true, cobro: e.cobro });
}

export const onRequest = () => json({ ok: false }, 405);
