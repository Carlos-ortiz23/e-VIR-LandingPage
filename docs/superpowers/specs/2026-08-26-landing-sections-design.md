# Secciones restantes de la landing e-VIR

## Contexto

Hoy la landing solo tiene el hero (`Hero.astro` + `Navbar.astro`). El nav
promete anclas a secciones que no existen. El objetivo de este cambio es
construir el resto de la página.

El material de contenido llega de `E-VIR Design System.zip`, un design system
completo con fundamentos de contenido, reglas visuales, contratos de componente
y un kit de referencia de landing (`ui_kits/web/Sections.jsx`) con copy real.
Hallazgo relevante: **los tokens del repo (`src/styles/`) ya son los del design
system** — idénticos en 7 de 8 archivos, cero tokens faltantes. La base está
puesta; esto es una extensión del mundo visual existente, no un rediseño.

Dirección acordada con el usuario: tomar copy, hechos y reglas de marca del
design system, pero **ejecutar visualmente en la línea del hero ya construido**
(navy ink, lima racionada, Sora grande, generosidad vertical) en vez de copiar
el kit de referencia tal cual.

## Alcance

**Dentro de alcance** — siete bloques nuevos, en este orden:

1. Línea Verde
2. Flota propia
3. Modelo de negocio
4. Quiénes somos
5. Expansión
6. Ser socio (`#socio`)
7. Footer

**Fuera de alcance** (decidido explícitamente):

- **Carro Milagro** — el usuario lo quitó del nav y del copy por completo. No
  hay sección, ni ancla, ni el nombre en ninguna aparición.
- **Barra de anuncio** (HubBog / ronda abierta) — contenido temporal, y
  empujaría el hero 40px rompiendo el encaje a 100vh recién calibrado.
- **Dos caminos** (tarjetas conductor / inversionista bajo el hero).
- **Tarjeta de equipo y advisors** dentro de Quiénes somos — sin nombres ni
  retratos serían cuatro avatares grises.
- **Filtro por líneas** en Flota — no hay líneas reales que filtrar.
- Cambios al hero, salvo un `alt` incorrecto (ver Correcciones).

## Decisiones tomadas

| Pregunta | Decisión |
|---|---|
| Alcance de secciones | Las 4 del nav + Ser socio + footer, **más** Flota propia |
| Destino de los formularios | WhatsApp Business (`wa.me`), sin backend |
| Fotos y nombres que no existen | Rediseñar esas secciones sin foto, no usar placas placeholder |
| Nombre "Carro Milagro" | Fuera del todo |
| El JMEV 2 lima | Es solo un color, no identifica la Línea Verde |
| Estructura de código | Clases de componente en `global.css` + una sección por archivo |
| Iconos | Lucide inlineado desde `lucide-static` (dev dependency), no CDN |
| Reuso del render E10X en Flota | Aprobado, con tratamiento distinto |

## Inventario de imágenes

La restricción más importante del proyecto.

| Asset | Estado |
|---|---|
| `carro-e10x.png` — JAC E10X, fondo transparente | **Único vehículo de la flota.** Ya usado en el hero |
| `evir-mark-lime.png` — pájaro lima, transparente, 511×456 | Usable, footer |
| `hero-carros-malecon.png` — 5 vehículos | **Descartado: son JMEV 2, otra marca** |
| `carro-blanco.png`, `carro-verde.png`, `evir-vehicle-lime.png` | **Descartados: JMEV 2** |

**Consecuencia:** toda la página por debajo del hero se construye sin
fotografía nueva. El design system prohíbe expresamente sustituir foto por
ilustración ("Where no photograph exists, ship the neutral labelled placeholder
plate — do not substitute an illustration"), y el usuario descartó las placas
placeholder. La salida es composición tipográfica y de datos, con el hero como
único momento fotográfico y el E10X reusado una vez en Flota.

El usuario aportará más imágenes después; las secciones deben admitirlas como
mejora, no requerir un rediseño para aceptarlas.

## Arquitectura

### Archivos

Nuevos en `src/components/`: `LineaVerde.astro`, `Flota.astro`,
`Modelo.astro`, `QuienesSomos.astro`, `Expansion.astro`, `SerSocio.astro`,
`SiteFooter.astro`, `Icon.astro`.

Nuevo: `src/config.ts` (una constante: el número de WhatsApp).

Editados: `src/styles/global.css` (vocabulario compartido), `src/pages/index.astro`
(composición de la página), `src/components/Hero.astro` (solo el `alt`).

`index.astro` queda como la única declaración del orden de la página.

### Ritmo de bandas

El design system dice que la banda ink es lo que da ritmo a la página, así que
se usa como puntuación en tres momentos —la promesa, la ambición, el cierre— y
nunca dos veces seguidas.

| Bloque | Fondo |
|---|---|
| Hero | ink |
| Línea Verde | paper |
| Flota propia | sunken |
| Modelo de negocio | paper |
| Quiénes somos | sunken |
| Expansión | **ink** |
| Ser socio | paper |
| Footer | **ink** |

`sunken` (`#f6f7f5`) contra `paper` (`#fbfcfa`) es un escalón casi
imperceptible a propósito: es una de las dos combinaciones de fondo que el
design system autoriza por página.

### Vocabulario compartido (`global.css`)

Se portan las clases de componente con los tonos exactos de sus contratos
(`components/**/*.d.ts` y `.jsx` del design system):

- `.section` + `.section__inner` (padding `--section-y`, ancho `--container-max`),
  tonos `.section--sunken` y `.section--ink`
- `.section-head` — eyebrow + h2 + lead, medida 680px
- `.card` con los cinco tonos sancionados: default, `--flat`, `--ink`, `--lime`,
  `--outline`. Relleno blanco **con** hairline `--border-subtle` **y** sombra
  `--shadow-sm`; nunca una sola de las dos. Radio `--radius-card`, padding
  `--card-pad`. `.card--interactive` añade lift de `--lift-y` y `--shadow-lg`
- `.badge`, `.icon-plate` (placa lima-soft para iconos), `.feature-row`

El acordeón y los tabs **no** entran aquí: los usa una sola sección, así que
viven en el `<style>` scoped de `SerSocio.astro`. `global.css` es para lo que
se repite.

Se reutiliza `.evir-eyebrow` (`base.css`) y `.btn` (`global.css`). `.container`
queda como está para uso futuro; las secciones nuevas usan `.section__inner`,
que además aplica el padding vertical.

### Iconos

El design system estandariza Lucide 0.454.0 desde CDN. Aquí se inlinean los
glifos usados en `Icon.astro` mediante `lucide-static` como `devDependency`:
misma geometría, trazo 1.75px, sin relleno, tamaños 16–24; cero peticiones
externas y cero JS en cliente. La sustitución se documenta en el propio
`Icon.astro`.

Los 16 glifos que la página usa de verdad: `accessibility`, `heart-handshake`,
`clock`, `percent`, `message-circle`, `wallet`, `leaf`, `building-2`, `bike`,
`globe`, `rocket`, `graduation-cap`, `landmark`, `users`, `map-pin`, `mail`.
Nada más: cada glifo que entra tiene que estar en uso.

### Imágenes

Flota reusa **exactamente la misma ruta** que el hero,
`/assets/carro-e10x.png`, con un `<img>` plano. Se descartó `astro:assets` para
este caso: obligaría a tener el PNG también en `src/assets/`, duplicando 1,8MB
en el repo, mientras que reusar la ruta hace que el navegador lo descargue una
sola vez y lo sirva de caché en la segunda aparición. El hero no se toca — su
CSS está calibrado al píxel.

Hay que copiar `evir-mark-lime.png` del design system a `public/assets/` para el
footer.

Aparte: `carro-e10x.png` pesa 1,8MB sin optimizar y ahora carga en la misma
página. Comprimirlo o servirlo en webp es una mejora que afecta también al
hero, así que se trata como cambio propio y no se mete aquí.

## Los siete bloques

### 1 · Línea Verde — paper

Head del design system sin cambios: eyebrow `LÍNEA VERDE`, h2 "Movilidad que sí
sirve para personas con discapacidad", lead "Vehículos adaptados, conductores
formados en atención inclusiva y tarifas justas. La Línea Verde es la promesa
de que nadie se quede esperando en la acera."

Luego tres `.card--flat` en fila (`accessibility` Vehículos adaptados /
`heart-handshake` Conductores formados / `clock` Reserva anticipada), y cierre
con una franja `.card--lime` a todo el ancho: "Buscamos apoyo institucional" +
"Invitamos a entidades públicas, fundaciones y empresas a aliarse con la Línea
Verde y promover el uso de estos vehículos." + botón secundario "Proponer una
alianza".

Composición vertical, sin columna de imagen vacía. La accesibilidad se describe
como característica del servicio, nunca como caridad — regla del design system.

### 2 · Flota propia — sunken

Eyebrow `FLOTA`, h2 "Somos propietarios de nuestra propia flota", lead "No
intermediamos vehículos ajenos: los vehículos son nuestros, nuevos, eléctricos
y automáticos. Eso nos permite garantizar calidad, mantenimiento y condiciones
justas para el conductor."

El E10X sobre panel `.card--ink` (radio `--radius-panel`), centrado y ocupando
como máximo el 60% del ancho del panel — bastante menor que en el hero, donde
llega al 45% del viewport completo. Debajo, una fila de especificaciones en la
fuente mono, pares valor/etiqueta sin iconos, como manda el contrato de
`VehicleCard`, y **solo cualitativas**: Automático · 100% eléctrico · Nuevo ·
Flota propia. No se inventan cifras de
autonomía, batería ni precio. El tratamiento distinto (panel ink, centrado,
ficha) es lo que evita que lea como el hero repetido.

### 3 · Modelo de negocio — paper

Eyebrow `MODELO DE NEGOCIO`, h2 "Un modelo disruptivo, simple para quien lo
usa", lead "Tecnología donde suma y cero complejidad para el conductor y el
pasajero."

Cuatro `.card--interactive` con `.icon-plate`:

1. `percent` **Bajas comisiones** — "Plataforma de comisiones bajas para el
   conductor, en alianza con PideyDale. El ingreso se queda donde se genera."
2. `message-circle` **IA sobre WhatsApp Business** — "Solicitudes, asignación y
   soporte operan sobre WhatsApp Business con inteligencia artificial: sin apps
   que descargar ni fricción para el usuario."
3. `wallet` **Propiedad progresiva** — reescrito sin "Carro Milagro": "Cada
   cuota que pagas construye propiedad, no gasto. Al finalizar el plan, el
   vehículo queda a tu nombre."
4. `leaf` **Cero emisiones** — "Operación 100% eléctrica y silenciosa, alineada
   con la agenda de movilidad sostenible de la ciudad."

### 4 · Quiénes somos — sunken

Eyebrow `QUIÉNES SOMOS`, h2 "Más de 30 años moviendo a Barranquilla", lead
"e-VIR nace del sector transporte, no de una presentación. Nuestro equipo lleva
más de tres décadas operando transporte y micromovilidad sostenible con
bicicletas eléctricas."

Izquierda, tres `.card` de credencial:

- `building-2` **Distracon S.A.S.** — "Compañía creada en 2002. Respaldo
  operativo y financiero del proyecto."
- `bike` **Viral Trans-E** — "Experiencia en micromovilidad sostenible con
  bicicletas eléctricas."
- `globe` **e-VIR Investments LLC** — "Sociedad registrada en Delaware, con
  operación en Florida, EE. UU."

Derecha, una `.card` "Respaldo y aceleración" con cuatro filas: `rocket` HubBog,
`graduation-cap` máster en Inteligencia Artificial, `landmark` Cámara de
Comercio, `users` red de inversionistas nacional e internacional.

### 5 · Expansión — ink

Eyebrow `EXPANSIÓN` en lima sobre ink, h2 "Empezamos en Barranquilla. Vamos por
Latinoamérica.", lead "Operación e inicio de actividades en Barranquilla,
Colombia, con un plan de expansión regional por fases."

Cuatro `.card--ink` de país con `map-pin`: Colombia (borde lima, activo, "Sede
principal · Barranquilla"), Costa Rica, Panamá y Paraguay ("Expansión inicial",
borde hairline).

**Desviación deliberada del kit de referencia:** el kit cierra con tres
`StatTile` de 25 / 200 / 4, que son exactamente los números que el hero ya
muestra. Repetirlos dice lo mismo dos veces. Se sustituyen por una línea de
fases —dic 2026: 25 vehículos → dic 2027: 200 vehículos— que aporta lo que el
hero no puede dar, el cuándo, en una forma visual distinta.

### 6 · Ser socio — paper

Eyebrow `SÚMATE`. Tabs "Ser socio" / "Ser conductor" que conmutan h2, lead y un
campo del formulario.

- Socio: "Sé socio de e-VIR" — "Invitamos a inversionistas y aliados
  institucionales a hacer parte de la expansión de e-VIR en Latinoamérica.
  Déjanos tus datos y te contactamos."
- Conductor: "Sé conductor asociado" — "Si conduces, e-VIR te entrega un
  vehículo eléctrico nuevo y automático, con bajas comisiones y un camino real
  a la propiedad. Déjanos tus datos."

Izquierda, FAQ en acordeón (uno abierto a la vez, el glifo `+` rota 45° a `×`):

1. "¿Cómo funciona la propiedad progresiva?" — reescrita sin "Carro Milagro":
   "Con el mismo esfuerzo diario que hoy dedicas a un alquiler, al terminar el
   plan el vehículo queda a tu nombre."
2. "¿Cómo funciona la plataforma?" — copy del design system sin cambios.
3. "¿Qué respaldo tiene e-VIR?" — copy del design system sin cambios.
4. "¿Qué es la Línea Verde?" — copy del design system sin cambios.

Derecha, `.card` con el formulario: Nombre completo, Correo, WhatsApp, un
`select` que cambia con el tab (tipo de participación / ciudad donde conduces),
checkbox de autorización de tratamiento de datos, y submit.

### 7 · Footer — ink

Pájaro lima (`evir-mark-lime.png`), descriptor "e-VIR — Electric Vehicle I/A
Ride. Movilidad eléctrica sostenible, inclusiva e inteligente para
Latinoamérica.", y "e-VIR Investments LLC · Delaware, EE. UU. / Sede de
operación: Barranquilla, Colombia".

Tres columnas: Producto (Línea Verde, Flota, Modelo de negocio — sin "Carro
Milagro"), Compañía (Quiénes somos, Expansión, Inversionistas, Aliados),
Contacto (WhatsApp Business, Ser socio, Ser conductor).

Barra inferior: "© 2026 e-VIR Investments LLC · Distracon S.A.S." y "Electric
Vehicle I/A Ride".

## Interacción

Tres comportamientos, todos en JavaScript sin framework, dentro de la sección
que los usa — igual que el toggle del nav que ya existe:

1. **Tabs** de Ser socio: conmutan `aria-selected`, el título, el lead y el
   campo `select`.
2. **Acordeón** del FAQ: `<button aria-expanded>` + panel; uno abierto a la vez.
3. **Compositor de WhatsApp:** al enviar, arma el texto del mensaje con los
   campos y abre `https://wa.me/<numero>?text=<mensaje urlencoded>`.

### El número de WhatsApp

No existe todavía. Vive como una única constante en `src/config.ts`, vacía por
defecto. Mientras esté vacía, el submit se renderiza deshabilitado con estado
visible en vez de fingir un envío que se pierde. Cuando el usuario aporte el
número, es una línea.

## Accesibilidad

- Cada sección es un `<section>` con el `id` que el nav ancla y un `aria-labelledby`
  apuntando a su `<h2>`.
- Un solo `<h1>` en la página (el del hero); las secciones usan `<h2>`, las
  tarjetas `<h3>`.
- El acordeón usa `<button aria-expanded>` y los tabs `role="tablist"` con
  navegación por teclado.
- Los campos del formulario llevan `<label>` asociado, no solo `placeholder`.
- Foco nunca se elimina: contorno lima de 2px a 2px de offset, ya definido en
  `base.css`.
- Contraste: texto de cuerpo ≥ 4.5:1, texto grande ≥ 3:1, verificado sobre las
  tres bandas (paper, sunken, ink).
- `prefers-reduced-motion` colapsa las duraciones a 0.

## Verificación

- Los cinco viewports desktop ya calibrados para el hero (1920×1080, 1920×780,
  1440×900, 1366×768, 2560×1080) más iPad Pro en ambas orientaciones y móvil
  390×844.
- El hero debe quedar **idéntico al píxel** después del cambio: la posición y
  el tamaño del coche, los anclajes de la cuña y el encaje a 100vh se verifican
  numéricamente, no a ojo.
- `pnpm build` limpio y el detector de layout de impeccable sin hallazgos.
- Copy revisado contra las reglas de contenido del design system: sentence case,
  titulares ≤ 9 palabras, leads ≤ 28 palabras, tú y nunca usted, cero emoji,
  como máximo un signo de exclamación en toda la página, convenciones numéricas
  colombianas.

## Secuencia de implementación

El orden importa: el vocabulario primero, para que ninguna sección invente sus
propias tarjetas.

1. `global.css` (vocabulario) + `Icon.astro` + `src/config.ts`
2. Corrección del `alt` del hero y copia de `evir-mark-lime.png`
3. Las secciones sin interacción, de arriba abajo: Línea Verde, Flota, Modelo,
   Quiénes somos, Expansión, Footer
4. Ser socio, que es la única con estado (tabs, acordeón, compositor)
5. Verificación completa en los ocho viewports

## Correcciones de paso

- El `alt` del coche del hero dice "e-VIR JMEV 2 — vehículo eléctrico" y la
  imagen es un **JAC E10X**. Se corrige.
- `PRODUCT.md` sigue listando `#carro-milagro` en Operating Context. Se
  actualiza solo si el usuario lo pide.

## Dependencias abiertas

Ninguna bloquea la implementación; todas son mejoras posteriores.

1. **Número de WhatsApp** — el formulario queda inerte hasta que llegue.
2. **Fotografía** — el usuario aportará más imágenes. Las secciones deben
   aceptarlas sin rediseño.
3. **Nombres y retratos de equipo y advisor** — la tarjeta correspondiente
   queda fuera hasta que existan.
4. **Ancla de Flota en el nav** — la sección no tiene enlace. Se deja sin
   enlace para no volver a congestionar la barra; pendiente de confirmar.
5. **Discrepancia de audiencia** — `PRODUCT.md` describe conductores de
   plataformas (Uber, DiDi); el design system describe tres audiencias
   (conductores, familias y pasajeros, instituciones e inversionistas) y a
   PideyDale como aliado de plataforma. La página se construye sobre la versión
   del design system, que es la más reciente y la que trae el copy.
