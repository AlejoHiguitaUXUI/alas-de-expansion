# Alas de Expansión — Respuestas a las preguntas ★

Fecha: 16 de noviembre de 2026 · Insumo para el documento maestro v1

## Respuestas

| # | Pregunta | Respuesta |
|---|---|---|
| 1 | Alcance | Colombia, nacional, en COP |
| — | Ciudad base | Medellín |
| 2 | Situación legal | Persona natural con RUT |
| 4 | Lanzamiento | Experiencias y productos a la vez |
| 7 | Venta de productos | Catálogo + WhatsApp (sin pago en línea) |
| 8 | Pago de experiencias | Transferencia / Nequi y efectivo en el lugar |
| 9 | Registro sanitario | No, en trámite |
| 10 | Chichas | Sí, tienen alcohol (fermentadas) |
| 12 | Entregas | Domicilio local (Medellín) y transportadora nacional |
| 16 | Reservas | Eventos grupales con cupos y citas individuales |
| 17 | Modalidad de pago | Pago total, aporte voluntario o gratis con inscripción, según el evento |
| 19 | Consentimiento | Fuera de la web (en persona o por WhatsApp) |
| 20 | Ceremonias con plantas | Sí, algunas, de origen ancestral. El cliente dice que no son alucinógenas ni ilícitas. Los detalles se dan por WhatsApp |
| 30 | Público | Buscador espiritual · Bienestar y naturaleza · Comprador de productos |
| 36 | Técnico | No hay dominio, hosting ni licencia. Se propuso Firebase o Vercel |
| 41 | Fecha | De 1 a 2 meses (mediados de enero de 2027) |

## Qué implican para la arquitectura

**1. La web no tiene pasarela de pago en el lanzamiento.**
Productos y experiencias se cierran por WhatsApp, transferencia o efectivo. Eso simplifica mucho la primera versión, porque no hay que integrar pagos, impuestos en el checkout ni conciliación automática. Usamos WooCommerce en **modo catálogo**: así los productos ya quedan bien estructurados y se puede activar el carrito más adelante sin rehacer nada.

**2. Una reserva es una solicitud, no una compra confirmada.**
La persona se inscribe en la web → recibe los datos de pago → envía el comprobante por WhatsApp → el equipo confirma el cupo. Esto significa:
- los cupos se descuentan cuando el equipo confirma, no de forma automática
- hay que diseñar estados claros para la persona: *solicitud recibida → pago pendiente → cupo confirmado*
- los eventos grupales y las citas individuales necesitan herramientas distintas (calendario de eventos y agenda de citas)

**3. Las ceremonias con plantas se presentan de forma informativa.**
La web describe la ceremonia, su origen y las condiciones de cuidado, y lleva el detalle a WhatsApp. No recoge datos de salud, porque el consentimiento va fuera de la web. Esto encaja con la decisión de no cobrar en línea. Dos cosas a tener en cuenta:
- la redacción de estas páginas se revisa con especial cuidado en la fase de contenido
- la publicidad pagada (Meta, Google) suele restringir este tipo de contenido aunque sea legal. La estrategia de promoción se apoya en lo orgánico y en el boletín

**4. Los alimentos sin registro y las chichas con alcohol necesitan reglas propias.**
- Mientras el registro sanitario esté en trámite, falta decidir cómo se muestran: *próximamente*, *por encargo* o publicados con normalidad. **Decisión pendiente.**
- Las chichas con alcohol necesitan un aviso de mayoría de edad. Además, muchas transportadoras no llevan bebidas alcohólicas, así que lo más probable es que solo se entreguen a domicilio en Medellín. **Hay que verificarlo con la transportadora.**

**5. El público no incluye al principiante.**
Los perfiles elegidos ya conocen el camino o llegan por los productos. La web puede hablar con más profundidad y menos explicación básica, y los productos funcionan como puerta de entrada a las experiencias. Lo validamos en la fase de experiencia de usuario.

**6. ⚠️ Hosting: WordPress no funciona en Firebase ni en Vercel.**
Firebase y Vercel alojan sitios estáticos o aplicaciones JavaScript. WordPress necesita PHP y una base de datos MySQL, y Elementor Pro genera las páginas desde el propio WordPress. La opción "headless" (WordPress en un servidor y el frente en Vercel) deja a Elementor sin función.
Opciones compatibles:
- **Hosting compartido o gestionado para WordPress** (por ejemplo Hostinger o SiteGround). Es la opción más económica y suficiente para este volumen.
- **Hosting en la nube gestionado** (por ejemplo Cloudways). Da más rendimiento y control, con un costo mensual mayor.
**Decisión pendiente:** elegir proveedor, dominio y licencia de Elementor Pro.

**7. El plazo de 1 a 2 meses obliga a un alcance acotado.**
Para llegar a mediados de enero de 2027 con las cuatro fases (documento maestro → experiencia de usuario → look and feel → construcción), la primera versión debe limitarse a lo esencial. Bitácora, boletín y cuentas de usuario pueden salir con contenido mínimo o pasar a la fase 2.

## Decisiones pendientes

1. Proveedor de hosting, dominio y licencia de Elementor Pro
2. Cómo mostrar los alimentos mientras el registro sanitario está en trámite
3. Si la transportadora nacional acepta las chichas
4. Si se necesita facturación electrónica como persona natural (depende de los ingresos; consultar con contador)
5. Herramientas para eventos y citas (se definen en el documento maestro)
