// Interacciones del sitio: cabecera, menú, pedido por WhatsApp, filtros, edad, avisos,
// inscripción a encuentros y boletín. Sin dependencias.

type Prod = { id: string; nombre: string; precio: number | null; cat: string; soloMedellin: boolean; disponible: boolean; img: string };

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const leer = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const guardar = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };

const PRODUCTOS: Prod[] = (() => { try { return JSON.parse($('#datos-productos')?.textContent || '[]'); } catch { return []; } })();
const prodPor = (id: string) => PRODUCTOS.find((p) => p.id === id);
const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const precioTxt = (n: number | null) => (typeof n === 'number' && n > 0 ? COP.format(n) : '[PRECIO]');

export const waUrl = (msg: string) => `https://wa.me/${document.body.dataset.waNum || ''}?text=${encodeURIComponent(msg)}`;
const abrirWa = (msg: string) => { window.open(waUrl(msg), '_blank', 'noopener'); };

// ---------- Avisos ----------
let tToast = 0;
export const aviso = (t: string) => {
  const el = $('[data-toast]'); if (!el) return;
  el.textContent = t; el.classList.add('on');
  clearTimeout(tToast); tToast = window.setTimeout(() => el.classList.remove('on'), 2600);
};

// ---------- Cabecera ----------
const cab = $('[data-cabecera]');
const alScroll = () => cab?.classList.toggle('oscura', scrollY > 120);
addEventListener('scroll', alScroll, { passive: true }); alScroll();

// Brillo que sigue al puntero en los botones dorados
document.addEventListener('pointermove', (e) => {
  const b = (e.target as Element | null)?.closest?.('.brillo') as HTMLElement | null; if (!b) return;
  const r = b.getBoundingClientRect(); const x = e.clientX - r.left;
  b.style.setProperty('--mx', `${x}px`); b.style.setProperty('--my', `${e.clientY - r.top}px`);
  const ring = b.parentElement; if (ring?.classList.contains('tornasol')) ring.style.setProperty('--tx', `${Math.round((x / Math.max(1, r.width)) * 100)}%`);
}, { passive: true });

// ---------- Capas: menú, pedido y hojas ----------
const velo = $('[data-velo]');
const menu = $('[data-menu]');
const menuBtn = $('[data-menu-boton]');
const pedido = $('[data-pedido]');
let capa: HTMLElement | null = null;
let volverA: HTMLElement | null = null;

const tactil = matchMedia('(pointer: coarse)');
const enfocar = (el: HTMLElement) => {
  // En pantallas táctiles no se enfoca un campo de texto al abrir: subiría el teclado y taparía la hoja.
  const f = tactil.matches ? undefined
    : Array.from(el.querySelectorAll<HTMLElement>('input:not([type=hidden]), button, a[href]')).find((x) => !x.closest('.trampa, [hidden]'));
  if (f) requestAnimationFrame(() => f.focus({ preventScroll: true }));
  else { el.tabIndex = -1; el.style.outline = 'none'; requestAnimationFrame(() => el.focus({ preventScroll: true })); }
};
export const cerrarCapas = () => {
  if (!capa) return;
  capa.classList.remove('abierto', 'abierta'); capa.setAttribute('aria-hidden', 'true');
  velo?.classList.remove('on'); document.body.classList.remove('bloqueo');
  capa = null; volverA?.focus({ preventScroll: true }); volverA = null;
};
export const abrirCapa = (el: HTMLElement | null) => {
  if (!el) return;
  if (capa && capa !== el) { capa.classList.remove('abierto', 'abierta'); capa.setAttribute('aria-hidden', 'true'); }
  cerrarMenu();
  volverA = volverA || (document.activeElement as HTMLElement | null);
  el.classList.add(el.classList.contains('cajon') ? 'abierto' : 'abierta'); el.setAttribute('aria-hidden', 'false');
  velo?.classList.add('on'); document.body.classList.add('bloqueo'); capa = el; enfocar(el);
};
export const abrirHoja = (nombre: string) => abrirCapa($(`[data-hoja="${nombre}"]`));

function cerrarMenu() {
  if (!menu?.classList.contains('abierto')) return;
  menu.classList.remove('abierto'); menu.setAttribute('inert', ''); menuBtn?.setAttribute('aria-expanded', 'false');
  menuBtn?.setAttribute('aria-label', 'Abrir menú');
  $('[data-menu-icono="abrir"]')?.removeAttribute('hidden'); $('[data-menu-icono="cerrar"]')?.setAttribute('hidden', '');
  if (!capa) document.body.classList.remove('bloqueo');
}
menuBtn?.addEventListener('click', () => {
  if (menu?.classList.contains('abierto')) { cerrarMenu(); return; }
  menu?.classList.add('abierto'); menu?.removeAttribute('inert'); menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Cerrar menú');
  $('[data-menu-icono="abrir"]')?.setAttribute('hidden', ''); $('[data-menu-icono="cerrar"]')?.removeAttribute('hidden');
  document.body.classList.add('bloqueo');
});
velo?.addEventListener('click', cerrarCapas);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { cerrarCapas(); cerrarMenu(); } });
document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-cerrar]')) cerrarCapas();
  const h = t.closest<HTMLElement>('[data-abrir-hoja]'); if (h) { e.preventDefault(); volverA = h; abrirHoja(h.dataset.abrirHoja!); }
  if (t.closest('[data-abrir-pedido]')) { volverA = t.closest('button'); cerrarAsomo(); abrirCapa(pedido); }
});

// ---------- Arrastrar para cerrar (hoja inferior y cajón del pedido) ----------
// Sigue al dedo 1:1, resiste con elasticidad hacia adentro y, al soltar, decide con la
// velocidad proyectada (no con el punto donde se soltó). La salida usa el mismo camino de entrada.
const proyectar = (v: number, d = 0.998) => ((v / 1000) * d) / (1 - d);
const elastico = (sobre: number, dim: number, c = 0.55) => (sobre * dim * c) / (dim + c * Math.abs(sobre));
const movil = matchMedia('(max-width: 760px)');

function arrastrable(el: HTMLElement, asa: HTMLElement, eje: 'x' | 'y', activo: () => boolean) {
  let id = -1; let x0 = 0; let y0 = 0; let delta = 0; let vivo = false;
  let hist: Array<[number, number]> = [];
  const dim = () => (eje === 'y' ? el.offsetHeight : el.offsetWidth);
  const poner = (d: number) => {
    el.style.transform = eje === 'y' ? `translateY(${d}px)` : `translateX(${d}px)`;
    if (velo) velo.style.opacity = String(Math.max(0, 1 - Math.max(0, d) / dim()));
  };
  const limpiar = () => { el.style.transition = ''; el.style.transform = ''; if (velo) { velo.style.transition = ''; velo.style.opacity = ''; } };
  asa.addEventListener('pointerdown', (e) => {
    if (!activo() || !e.isPrimary || e.pointerType === 'mouse' || capa !== el) return;
    id = e.pointerId; x0 = e.clientX; y0 = e.clientY; delta = 0; vivo = false; hist = [[performance.now(), 0]];
  });
  asa.addEventListener('pointermove', (e) => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - x0; const dy = e.clientY - y0;
    const d = eje === 'y' ? dy : dx; const o = eje === 'y' ? dx : dy;
    if (!vivo) {
      if (Math.abs(d) < 10 && Math.abs(o) < 10) return; // histéresis antes de decidir la dirección
      if (Math.abs(o) > Math.abs(d)) { id = -1; return; }
      vivo = true; try { asa.setPointerCapture(id); } catch { /* el puntero ya terminó */ }
      el.style.transition = 'none'; if (velo) velo.style.transition = 'none';
    }
    delta = d >= 0 ? d : -elastico(-d, 120); // hacia adentro: resistencia progresiva
    poner(delta);
    hist.push([performance.now(), delta]); if (hist.length > 6) hist.shift();
  });
  const soltar = (e: PointerEvent) => {
    if (e.pointerId !== id) return; id = -1;
    if (!vivo) return; vivo = false;
    const ahora = performance.now();
    const ref = hist.find(([t]) => ahora - t < 120) || hist[0];
    const dt = Math.max(16, ahora - ref[0]);
    const v = e.type === 'pointercancel' ? 0 : ((delta - ref[1]) / dt) * 1000; // px/s
    const final = delta + proyectar(v);
    const total = dim();
    if (final > total * 0.5 && !reduce) {
      // continúa a la velocidad del dedo: el tiempo sale de lo que falta recorrer
      const falta = Math.max(0, total - delta);
      const ms = Math.round(Math.min(420, Math.max(180, v > 200 ? (falta / v) * 1000 : 320)));
      const ease = 'cubic-bezier(.2,.8,.2,1)';
      el.style.transition = eje === 'y'
        ? `opacity 260ms ease, transform ${ms}ms ${ease}, visibility 0s linear ${ms}ms`
        : `transform ${ms}ms ${ease}, visibility 0s linear ${ms}ms`;
      el.style.transform = '';
      if (velo) { velo.style.transition = `opacity ${ms}ms ease`; velo.style.opacity = ''; }
      cerrarCapas();
      setTimeout(limpiar, ms + 40);
    } else if (final > total * 0.5) {
      limpiar(); cerrarCapas();
    } else {
      // vuelve a su sitio con el mismo resorte de entrada
      el.style.transition = 'transform 420ms var(--ease-sheet)'; if (velo) velo.style.transition = 'opacity 300ms ease';
      el.style.transform = ''; if (velo) velo.style.opacity = '';
      setTimeout(limpiar, 440);
    }
  };
  asa.addEventListener('pointerup', soltar);
  asa.addEventListener('pointercancel', soltar);
}
$$('.hoja').forEach((h) => {
  const asa = document.createElement('span'); asa.className = 'asa'; asa.setAttribute('aria-hidden', 'true'); h.prepend(asa);
  arrastrable(h, asa, 'y', () => movil.matches);
});
if (pedido) {
  const cab = pedido.firstElementChild as HTMLElement | null;
  if (cab) { cab.classList.add('cab-cajon'); arrastrable(pedido, cab, 'x', () => true); }
}

// ---------- Mayoría de edad (chichas) ----------
let pendiente: (() => void) | null = null;
const edadOk = () => leer('alas-edad') === 'si';
export const conEdad = (accion: () => void) => { if (edadOk()) { accion(); return; } pendiente = accion; abrirHoja('edad'); };
$$('[data-edad]').forEach((b) => b.addEventListener('click', () => {
  const si = b.dataset.edad === 'si'; const acc = pendiente; pendiente = null; volverA = null; cerrarCapas();
  if (si) { guardar('alas-edad', 'si'); acc?.(); }
}));
// Enlaces que requieren mayoría de edad (fichas de chichas)
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-edad-requerida]');
  if (!a || edadOk()) return;
  e.preventDefault(); conEdad(() => { location.href = a.href; });
});
// Ficha de chicha abierta directamente: pide la edad al entrar
if (document.body.querySelector('[data-pagina-edad]') && !edadOk()) {
  conEdad(() => {});
  $$('[data-edad="no"]').forEach((b) => b.addEventListener('click', () => { location.href = '/productos/'; }, { once: true }));
}

// ---------- Pedido ----------
type Carro = Record<string, number>;
const carro: Carro = (() => { try { return JSON.parse(leer('alas-pedido') || '{}'); } catch { return {}; } })();
for (const k of Object.keys(carro)) if (!prodPor(k) || !(carro[k] > 0)) delete carro[k];
let entrega = leer('alas-entrega') === 'nacional' ? 'nacional' : 'medellin';
const ciudadInp = $<HTMLInputElement>('[data-ciudad]');
if (ciudadInp) ciudadInp.value = leer('alas-ciudad') || '';

const total = () => Object.values(carro).reduce((a, b) => a + b, 0);
const conChichaFuera = () => entrega === 'nacional' && Object.keys(carro).some((k) => prodPor(k)?.soloMedellin);
const persistir = () => guardar('alas-pedido', JSON.stringify(carro));

const pintarTarjetas = () => {
  $$('[data-prod-card]').forEach((c) => {
    const id = c.dataset.prodCard!; const n = carro[id] || 0;
    const fuera = $('[data-fuera]', c); const dentro = $('[data-dentro]', c);
    if (!fuera || !dentro) return;
    const antes = !dentro.hidden;
    fuera.hidden = n > 0; dentro.hidden = n === 0;
    const cant = $('[data-cant]', c); if (cant) cant.textContent = String(n);
    if (n > 0 && !antes && !reduce) { dentro.classList.remove('pop'); void dentro.offsetWidth; dentro.classList.add('pop'); }
  });
};
const insignia = $('[data-insignia]');
const pintarInsignia = (saltar = false) => {
  if (!insignia) return; const n = total();
  insignia.hidden = n === 0; insignia.textContent = String(n);
  if (saltar && !reduce) { insignia.classList.add('salta'); setTimeout(() => insignia.classList.remove('salta'), 260); }
};
const pintarPedido = () => {
  const ids = Object.keys(carro).filter((k) => carro[k] > 0);
  const lleno = ids.length > 0;
  $('[data-pedido-vacio]')!.hidden = lleno; $('[data-pedido-lleno]')!.hidden = !lleno; $('[data-pedido-pie]')!.hidden = !lleno;
  const lista = $('[data-pedido-items]')!;
  lista.replaceChildren(...ids.map((id) => {
    const p = prodPor(id)!; const fila = document.createElement('div'); fila.className = 'item';
    fila.innerHTML = `<img alt="" width="60" height="60" src="${p.img}"><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px"><span style="font-family:var(--display);font-size:18px;color:#1E1A3F"></span><span style="font-size:14px;color:#5E5670">${precioTxt(p.precio)}</span><button type="button" class="press" data-quitar style="align-self:flex-start;min-height:32px;padding:0;border:0;background:transparent;color:#A24A28;font-size:14px;font-weight:600;cursor:pointer">Quitar</button></div><div class="contador"><button type="button" class="press" data-d="-1" aria-label="Quitar uno">−</button><span style="min-width:18px;text-align:center;font-weight:600">${carro[id]}</span><button type="button" class="press" data-d="1" aria-label="Agregar uno">+</button></div>`;
    (fila.querySelector('span') as HTMLElement).textContent = p.nombre;
    fila.querySelector('[data-quitar]')!.addEventListener('click', () => cambiar(id, -carro[id]));
    fila.querySelectorAll<HTMLElement>('[data-d]').forEach((b) => b.addEventListener('click', () => cambiar(id, Number(b.dataset.d))));
    return fila;
  }));
  const conPrecio = ids.every((id) => (prodPor(id)!.precio || 0) > 0);
  const sub = ids.reduce((a, id) => a + (prodPor(id)!.precio || 0) * carro[id], 0);
  $('[data-subtotal]')!.textContent = conPrecio ? COP.format(sub) : '[SUBTOTAL]';
  $$('[data-entrega]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.entrega === entrega)));
  $('[data-aviso-chicha]')!.hidden = !conChichaFuera();
};
const pintar = (saltar = false) => { pintarTarjetas(); pintarInsignia(saltar); pintarPedido(); };

function cambiar(id: string, d: number) {
  carro[id] = Math.max(0, (carro[id] || 0) + d); if (!carro[id]) delete carro[id];
  persistir(); pintar(true);
}

const asomo = $('[data-asomo]'); let tAsomo = 0;
function cerrarAsomo() { asomo?.classList.remove('on'); asomo?.setAttribute('inert', ''); }
const mostrarAsomo = (p: Prod) => {
  if (!asomo || capa) return;
  ($('[data-asomo-img]', asomo) as HTMLImageElement).src = p.img;
  $('[data-asomo-nombre]', asomo)!.textContent = p.nombre;
  $('[data-asomo-cant]', asomo)!.textContent = `${carro[p.id] || 0} de este producto · ${total()} en total`;
  asomo.classList.add('on'); asomo.removeAttribute('inert'); clearTimeout(tAsomo); tAsomo = window.setTimeout(cerrarAsomo, 3600);
};
$('[data-asomo-cerrar]')?.addEventListener('click', cerrarAsomo);

// El producto "vuela" hasta la bolsa
const volar = (desde: Element, p: Prod, fin: () => void) => {
  const fl = $<HTMLImageElement>('[data-volador]'); const bolsa = $('[data-carrito]');
  if (!fl || !bolsa || reduce || !fl.animate) { fin(); return; }
  const b = desde.getBoundingClientRect(); const t = bolsa.getBoundingClientRect(); const sz = 72;
  const x0 = b.left + b.width / 2 - sz / 2; const y0 = b.top + b.height / 2 - sz / 2;
  const x1 = t.left + t.width / 2 - sz / 2; const y1 = t.top + t.height / 2 - sz / 2;
  const xm = (x0 + x1) / 2; const ym = Math.min(y0, y1) - 140;
  fl.src = p.img;
  const a = fl.animate([
    { transform: `translate(${x0}px, ${y0}px) scale(.5)`, opacity: 0 },
    { transform: `translate(${x0}px, ${y0 - 24}px) scale(1)`, opacity: 1, offset: 0.16 },
    { transform: `translate(${xm}px, ${ym}px) scale(.72) rotate(-10deg)`, opacity: 1, offset: 0.58 },
    { transform: `translate(${x1}px, ${y1}px) scale(.16)`, opacity: 0.2 },
  ], { duration: 780, easing: 'cubic-bezier(.45,0,.25,1)' });
  a.onfinish = () => {
    bolsa.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(1.2) rotate(-9deg)' }, { transform: 'scale(.95) rotate(6deg)' }, { transform: 'scale(1)' }], { duration: 440, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    fin();
  };
};

const agregar = (id: string, n: number, desde: Element) => {
  const p = prodPor(id); if (!p || !p.disponible) return;
  const hacer = () => {
    carro[id] = (carro[id] || 0) + n; persistir(); pintarTarjetas(); pintarPedido();
    volar(desde, p, () => { pintarInsignia(true); mostrarAsomo(p); });
  };
  if (p.cat === 'chichas') conEdad(hacer); else hacer();
};

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  const add = t.closest<HTMLElement>('[data-agregar]');
  if (add) {
    const fuente = add.dataset.cantDe ? $<HTMLElement>(add.dataset.cantDe) : null;
    agregar(add.dataset.agregar!, fuente ? Number(fuente.textContent) || 1 : 1, add);
    return;
  }
  const card = t.closest<HTMLElement>('[data-prod-card]');
  if (card && t.closest('[data-mas]')) cambiar(card.dataset.prodCard!, 1);
  if (card && t.closest('[data-menos]')) cambiar(card.dataset.prodCard!, -1);
});
// Selector de cantidad en la ficha de producto
$$('[data-paso]').forEach((box) => {
  const v = $('[data-paso-valor]', box)!;
  box.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-paso-d]'); if (!b) return;
    v.textContent = String(Math.max(1, (Number(v.textContent) || 1) + Number(b.dataset.pasoD)));
  });
});
$$('[data-entrega]').forEach((b) => b.addEventListener('click', () => { entrega = b.dataset.entrega!; guardar('alas-entrega', entrega); pintarPedido(); }));
ciudadInp?.addEventListener('input', () => guardar('alas-ciudad', ciudadInp.value));
$('[data-enviar-pedido]')?.addEventListener('click', () => {
  if (conChichaFuera()) { aviso('Las chichas solo se entregan en Medellín'); return; }
  const ids = Object.keys(carro).filter((k) => carro[k] > 0);
  const lineas = ids.map((id) => { const p = prodPor(id)!; return `• ${carro[id]} × ${p.nombre}${p.precio ? ` (${precioTxt(p.precio)} c/u)` : ''}`; });
  const sub = $('[data-subtotal]')?.textContent || '';
  const msg = `Hola, quiero hacer este pedido:\n${lineas.join('\n')}\nSubtotal: ${sub}\nCiudad: ${ciudadInp?.value.trim() || '[CIUDAD]'}\nEntrega: ${entrega === 'medellin' ? 'domicilio en Medellín' : 'envío nacional'}`;
  abrirWa(msg);
});
addEventListener('storage', (e) => { if (e.key === 'alas-pedido') location.reload(); });
pintar();

// ---------- Filtros (agenda, productos, bitácora) ----------
$$('[data-filtros]').forEach((grupo) => {
  const nombre = grupo.dataset.filtros!;
  const items = $$(`[data-grupo="${nombre}"]`);
  const aplicar = (v: string) => {
    $$('[data-filtro]', grupo).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === v)));
    items.forEach((it) => {
      const coincide = v === 'todos' ? !it.hasAttribute('data-es-destacado') : (it.dataset.cat || '').split(' ').includes(v);
      it.hidden = !coincide || it.dataset.oculto === '1';
    });
    $$(`[data-intro-de="${nombre}"]`).forEach((i) => { i.hidden = i.dataset.cat !== v; });
    const visibles = items.filter((i) => !i.hidden).length;
    const vacio = $(`[data-vacio-de="${nombre}"]`); if (vacio) vacio.hidden = visibles > 0;
    const destacado = $(`[data-destacado-de="${nombre}"]`); if (destacado) destacado.hidden = v !== 'todos';
  };
  grupo.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-filtro]'); if (!b) return;
    const v = b.dataset.filtro!;
    const ir = () => { aplicar(v); history.replaceState(null, '', v === 'todos' ? location.pathname : `#${v}`); };
    if (b.hasAttribute('data-edad-requerida')) conEdad(ir); else ir();
  });
  const h = decodeURIComponent(location.hash.slice(1));
  const botones = $$('[data-filtro]', grupo);
  const porDefecto = botones.some((b) => b.dataset.filtro === 'todos') ? 'todos' : botones[0]?.dataset.filtro || 'todos';
  const inicial = botones.some((b) => b.dataset.filtro === h) ? h : porDefecto;
  if (inicial === 'chichas' && !edadOk()) aplicar(porDefecto); else aplicar(inicial);
});

// ---------- Encuentros próximos y pasados (según la fecha de hoy) ----------
const hoy = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
$$('[data-fecha]').forEach((el) => {
  const pasado = el.dataset.fecha! < hoy;
  if (el.hasAttribute('data-proximo') && pasado) { el.hidden = true; el.dataset.oculto = '1'; }
  if (el.hasAttribute('data-pasado') && !pasado) { el.hidden = true; el.dataset.oculto = '1'; }
});
$$('[data-lista-fechas]').forEach((l) => {
  const vacio = $(`[data-vacio-fechas="${l.dataset.listaFechas}"]`);
  if (vacio) vacio.hidden = $$('[data-fecha]', l).some((i) => !i.hidden);
  const limite = Number(l.dataset.limite || 0);
  if (limite) $$('[data-fecha]', l).filter((i) => !i.hidden).slice(limite).forEach((i) => { i.hidden = true; });
});
// Ficha de un encuentro que ya pasó
const fichaEnc = $<HTMLElement>('[data-encuentro-fecha]');
if (fichaEnc && fichaEnc.dataset.encuentroFecha! < hoy) {
  $$('[data-solo-proximo]').forEach((e) => { e.hidden = true; });
  $$('[data-solo-pasado]').forEach((e) => { e.hidden = false; });
}

// ---------- Preguntas frecuentes ----------
document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('.pq button'); if (!b) return;
  const pq = b.closest<HTMLElement>('.pq')!; const abierta = pq.hasAttribute('data-abierta');
  pq.toggleAttribute('data-abierta', !abierta); b.setAttribute('aria-expanded', String(!abierta));
});

// ---------- Boletín ----------
const correoOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
$$<HTMLFormElement>('form[data-boletin]').forEach((f) => f.addEventListener('submit', async (e) => {
  e.preventDefault();
  const inp = $<HTMLInputElement>('input[type=email]', f)!; const chk = $<HTMLInputElement>('input[type=checkbox]', f);
  const correo = inp.value.trim();
  if (!correoOk(correo)) { aviso('Escribe un correo válido para suscribirte.'); inp.focus(); return; }
  if (chk && !chk.checked) { aviso('Acepta la política de datos para suscribirte.'); return; }
  const btn = $<HTMLButtonElement>('button[type=submit]', f); if (btn) btn.disabled = true;
  try {
    const r = await fetch('/api/boletin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ correo, sitio: ($<HTMLInputElement>('.trampa input', f)?.value || '') }) });
    if (!r.ok) throw new Error(String(r.status));
    $('[data-sus-correo]')!.textContent = correo; volverA = btn; abrirHoja('suscripcion'); f.reset();
  } catch {
    aviso('No pudimos suscribirte ahora. Intenta más tarde o escríbenos por WhatsApp.');
  } finally { if (btn) btn.disabled = false; }
}));

// ---------- Inscripción a encuentros ----------
const fIns = $<HTMLFormElement>('form[data-inscripcion]');
if (fIns) {
  const hoja = fIns.closest<HTMLElement>('.hoja')!;
  const paneles = (n: string) => $$('[data-panel]', hoja).forEach((p) => { p.hidden = p.dataset.panel !== n; });
  $$('[data-abrir-hoja="inscripcion"]').forEach((b) => b.addEventListener('click', () => paneles('form')));
  fIns.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(fIns)) as Record<string, string>;
    const nombre = (d.nombre || '').trim(); const celular = (d.celular || '').trim(); const correo = (d.correo || '').trim();
    if (nombre.length < 2) { aviso('Escribe tu nombre.'); return; }
    if (celular.replace(/\D/g, '').length < 7) { aviso('Escribe un número de celular válido.'); return; }
    if (!correoOk(correo)) { aviso('Escribe un correo válido.'); return; }
    if (!d.acepta) { aviso('Autoriza el tratamiento de datos para inscribirte.'); return; }
    const btn = $<HTMLButtonElement>('button[type=submit]', fIns)!; btn.disabled = true; btn.textContent = 'Enviando…';
    const ficha = fIns.dataset;
    try {
      const r = await fetch('/api/inscripcion', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ encuentro: ficha.encuentro, nombre, celular, correo, acepta: true, sitio: d.sitio || '' }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 409) { aviso(j.mensaje || 'Este encuentro ya no tiene cupos.'); return; }
      if (!r.ok) throw new Error(String(r.status));
      paneles(ficha.cobro === 'pago' ? 'pago' : 'confirmado'); fIns.reset();
    } catch {
      // Sin servicio de correo: la inscripción sigue por WhatsApp con los datos ya escritos.
      const msg = `Hola, quiero inscribirme a ${ficha.nombre} (${ficha.fecha}).\nNombre: ${nombre}\nCelular: ${celular}\nCorreo: ${correo}\nAutorizo el tratamiento de mis datos.`;
      ($('[data-wa-respaldo]', hoja) as HTMLAnchorElement).href = waUrl(msg);
      paneles('respaldo');
    } finally { btn.disabled = false; btn.textContent = 'Confirmar inscripción'; }
  });
}

// ---------- Indicador de sección en el inicio ----------
const spies = $$('[data-spy]');
if (spies.length) {
  const links = $$('[data-spy-link]');
  const marcar = () => {
    const mid = innerHeight * 0.45; let act = '';
    spies.forEach((s) => { const r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom >= mid) act = s.dataset.spy!; });
    links.forEach((l) => { if (l.dataset.spyLink === act) l.setAttribute('aria-current', 'page'); else l.removeAttribute('aria-current'); });
  };
  addEventListener('scroll', marcar, { passive: true }); marcar();
}

// ---------- Medición con consentimiento ----------
const ga = document.body.dataset.ga;
if (ga) {
  const banner = $('[data-cookies]');
  const cargar = () => {
    const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`; document.head.appendChild(s);
    const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
    w.dataLayer = w.dataLayer || []; w.gtag = function () { w.dataLayer.push(arguments); }; w.gtag('js', new Date()); w.gtag('config', ga);
    document.addEventListener('click', (e) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="wa.me"]'); if (a) w.gtag('event', 'clic_whatsapp', { pagina: location.pathname });
    });
  };
  const pref = leer('alas-cookies');
  if (pref === 'si') cargar(); else if (!pref && banner) banner.hidden = false;
  $('[data-cookies-si]')?.addEventListener('click', () => { guardar('alas-cookies', 'si'); banner!.hidden = true; cargar(); });
  $('[data-cookies-no]')?.addEventListener('click', () => { guardar('alas-cookies', 'no'); banner!.hidden = true; });
  $('[data-cookies-abrir]')?.addEventListener('click', () => { if (banner) banner.hidden = false; });
}
