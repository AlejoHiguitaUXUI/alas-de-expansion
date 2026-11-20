import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// El panel puede guardar la ruta completa del archivo (src/content/productos/x.md): nos quedamos con el nombre.
const idDe = z.string().optional().transform((v) => (v ? v.replace(/^.*\//, '').replace(/\.(md|ya?ml)$/, '') : undefined));

// Cada colección corresponde a una sección del panel de administración (.pages.yml).

const productos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/productos' }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      categoria: z.enum(['mermeladas', 'miel', 'chichas', 'esencias', 'objetos']),
      precio: z.number().nullish(),
      presentacion: z.string().default(''),
      imagen: image(),
      disponible: z.boolean().default(true),
      destacado: z.boolean().default(false),
      orden: z.number().default(10),
      historia: z.string().default(''),
      composicion: z.string().default(''),
      cuidados: z.string().default(''),
      registro_sanitario: z.string().default(''),
      solo_medellin: z.boolean().default(false),
      advertencia: z.string().default(''),
    }),
});

const experiencias = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/experiencias' }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      etiqueta: z.string(),
      orden: z.number().default(10),
      carta: image(),
      imagen: image(),
      resumen: z.string(),
      intro: z.string(),
      origen: z.string().default(''),
      desarrollo: z.string().default(''),
      cuidados: z.string().default(''),
      guia: z.string().default(''),
      tipos: z.array(z.string()).default([]),
      pasos: z.array(z.object({ titulo: z.string(), texto: z.string() })).default([]),
      ficha: z.array(z.object({ dato: z.string(), valor: z.string() })).default([]),
    }),
});

const encuentros = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/encuentros' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      experiencia: reference('experiencias'),
      fecha: z.coerce.date(),
      hora: z.string().default(''),
      lugar: z.string().default(''),
      valor: z.string().default(''),
      // voluntario: el cupo se confirma al inscribirse · pago: se confirma con el comprobante
      // conversar: sin formulario, todo por WhatsApp (ceremonias)
      cobro: z.enum(['voluntario', 'pago', 'conversar']).default('voluntario'),
      estado: z.enum(['Disponible', 'Agotado']).default('Disponible'),
      imagen: image().optional(),
      guia: z.string().default(''),
      descripcion: z.string().default(''),
      desarrollo: z.string().default(''),
      llevar: z.string().default(''),
      cuidados: z.string().default(''),
      edad: z.string().default(''),
      producto: idDe,
      relato: z.string().default(''),
    }),
});

const bitacora = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/bitacora' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      categoria: z.enum(['practicas', 'reflexiones', 'relatos', 'saberes']),
      fecha: z.coerce.date(),
      autor: z.string().default(''),
      resumen: z.string(),
      imagen: image(),
      minutos: z.number().default(4),
      destacado: z.boolean().default(false),
      cita: z.string().default(''),
      fuentes: z.string().default(''),
      experiencia: reference('experiencias').optional(),
      producto: idDe,
    }),
});

const preguntas = defineCollection({
  loader: glob({ pattern: '*.yml', base: './src/content/preguntas' }),
  schema: z.object({
    tema: z.string(),
    orden: z.number().default(10),
    preguntas: z.array(z.object({ pregunta: z.string(), respuesta: z.string() })).default([]),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    titulo: z.string(),
    orden: z.number().default(10),
    intro: z.string().default(''),
    actualizado: z.string().default(''),
    secciones: z.array(z.object({ titulo: z.string(), texto: z.string() })).default([]),
  }),
});

export const collections = { productos, experiencias, encuentros, bitacora, preguntas, legal };
