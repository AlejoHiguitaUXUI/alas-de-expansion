// Datos públicos de los encuentros que lee la función de inscripción
// (así el valor y el estado salen del sitio publicado, no del formulario).
import { getCollection, getEntry } from 'astro:content';
import { ajustes, fecha } from '../../lib/sitio';

export async function GET() {
  const encuentros = await getCollection('encuentros');
  const datos: Record<string, unknown> = {};
  for (const e of encuentros) {
    const exp = await getEntry(e.data.experiencia);
    datos[e.id] = {
      titulo: e.data.titulo,
      camino: exp?.data.nombre,
      fecha: e.data.fecha.toISOString().slice(0, 10),
      cuando: `${fecha(e.data.fecha)}${e.data.hora ? ` · ${e.data.hora}` : ''}`,
      lugar: e.data.lugar,
      valor: e.data.valor,
      cobro: e.data.cobro,
      estado: e.data.estado,
      llevar: e.data.llevar,
    };
  }
  return new Response(JSON.stringify({
    encuentros: datos,
    pago: { transferencia: ajustes.pago_transferencia, nequi: ajustes.pago_nequi },
    contacto: { whatsapp: ajustes.whatsapp, whatsapp_visible: ajustes.whatsapp_visible, correo: ajustes.correo },
  }), { headers: { 'content-type': 'application/json; charset=utf-8' } });
}
