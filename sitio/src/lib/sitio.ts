import ajustes from '../data/ajustes.json';

export { ajustes };

export const CATEGORIAS = [
  { id: 'mermeladas', label: 'Mermeladas', desc: 'Frutas, hierbas y especias en combinaciones que evocan las estaciones y la riqueza de la tierra.' },
  { id: 'miel', label: 'Miel', desc: 'Una celebración de la naturaleza, el trabajo artesanal y los saberes culinarios.' },
  { id: 'chichas', label: 'Chichas', desc: 'Bebidas fermentadas inspiradas en preparaciones tradicionales. Solo para mayores de 18 años, con entrega en Medellín.' },
  { id: 'esencias', label: 'Esencias', desc: 'Para experiencias olfativas, ambientales o de contemplación. No son aptas para consumo.' },
  { id: 'objetos', label: 'Objetos', desc: 'Piezas para la intención, la contemplación y los ciclos naturales, hechas con cuidado.' },
] as const;

export const CAT_BITACORA: Record<string, string> = {
  practicas: 'Prácticas',
  reflexiones: 'Reflexiones',
  relatos: 'Relatos',
  saberes: 'Saberes y fuentes',
};

export const MENU = [
  { id: 'esencia', label: 'Esencia', href: '/esencia/' },
  { id: 'experiencias', label: 'Experiencias', href: '/experiencias/' },
  { id: 'agenda', label: 'Agenda', href: '/agenda/' },
  { id: 'productos', label: 'Productos', href: '/productos/' },
  { id: 'bitacora', label: 'Bitácora', href: '/bitacora/' },
  { id: 'consultas', label: 'Consultas', href: '/consultas/' },
];

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
export const precio = (n?: number | null) => (typeof n === 'number' && n > 0 ? COP.format(n) : '[PRECIO]');

const FECHA = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const FECHA_CORTA = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const fecha = (d: Date) => {
  const t = FECHA.format(d);
  return t.charAt(0).toUpperCase() + t.slice(1);
};
export const fechaCorta = (d: Date) => FECHA_CORTA.format(d);
/** AAAA-MM-DD, para comparar con la fecha de hoy en el navegador. */
export const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Texto del enlace de WhatsApp; el número sale de los ajustes. */
export const waHref = (msg: string) => {
  const num = (ajustes.whatsapp || '').replace(/\D/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
};
