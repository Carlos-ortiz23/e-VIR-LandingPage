# Migración de la landing e-VIR a Astro

## Contexto

La landing page de e-VIR existe hoy como HTML/CSS/JS estático en la raíz
del proyecto:

```
index.html
css/ (fonts.css, colors.css, typography.css, spacing.css, radius.css,
      elevation.css, motion.css, base.css, styles.css)
js/nav.js
assets/ (carro-verde.png, evir-icon.png, evir-logo-badge.png, evir-logo.png)
```

Solo la pantalla 1 (hero: nav + contenido + stats + carro) está construida.
El nav ya tiene anclas (`#carro-milagro`, `#linea-verde`, `#modelo`,
`#quienes-somos`, `#expansion`, `#socio`) para secciones futuras que aún no
existen.

El objetivo de este cambio es migrar el proyecto a Astro, manteniendo el
resultado visual y funcional idéntico al actual (mismo sistema de diseño,
mismo hero, mismo menú hamburguesa móvil). No se agregan secciones nuevas
en esta migración — el alcance es exclusivamente technológico/estructural.

## Alcance

**Dentro de alcance:**
- Inicializar un proyecto Astro en la raíz del repo (reemplaza los archivos
  estáticos actuales).
- Portar el hero completo (nav + contenido + stats + carro + menú
  hamburguesa móvil) a componentes Astro, sin cambios visuales ni de
  comportamiento.
- Mantener el sistema de tokens CSS (colors, typography, spacing, radius,
  elevation, motion, fonts) como CSS global, sin modificarlo.
- Configurar `npm run dev` / `npm run build` / `npm run preview`.

**Fuera de alcance:**
- Construir las secciones futuras (Carro Milagro, Línea Verde, Modelo,
  Quiénes somos, Expansión, Socio) — quedan como anclas sin destino, igual
  que hoy.
- Optimización de imágenes vía `astro:assets` — las imágenes se sirven tal
  cual desde `public/`.
- Elegir/configurar hosting o CI de despliegue.
- TypeScript estricto o cualquier framework de UI adicional (React, Vue,
  etc.) — Astro puro, sin islas de framework (el toggle del menú es JS
  vanilla, no necesita hidratación de componente).

## Estructura de archivos objetivo

```
├── package.json
├── astro.config.mjs
├── public/
│   └── assets/
│       ├── carro-verde.png
│       ├── evir-icon.png
│       ├── evir-logo-badge.png
│       └── evir-logo.png
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── components/
│   │   ├── Navbar.astro
│   │   └── Hero.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       ├── fonts.css
│       ├── colors.css
│       ├── typography.css
│       ├── spacing.css
│       ├── radius.css
│       ├── elevation.css
│       ├── motion.css
│       ├── base.css
│       └── global.css
```

Los archivos y directorios actuales (`index.html`, `css/`, `js/`, y
`assets/` en la raíz) se eliminan una vez portado su contenido a la nueva
estructura. Este repo no tiene git inicializado, así que no hay red de
seguridad de historial — se migra por copia/edición directa, verificando
visualmente antes de borrar los originales.

## Componentes

### `Layout.astro`

Responsabilidad única: el documento HTML base.

- `<html lang="es">`, `<head>` con `charset`, `viewport`, `<title>`
  (recibido como prop, default `"e-VIR — Vuela como un canario"`), y los
  `<link>`/imports de todo el CSS global en el mismo orden que hoy: fonts,
  colors, typography, spacing, radius, elevation, motion, base, global.
- `<body><slot /></body>`.
- No contiene markup del hero ni lógica — solo el esqueleto de página, para
  que las secciones futuras (fuera de alcance aquí) puedan añadirse dentro
  del `<slot />` de `index.astro` sin tocar el layout.

Interfaz: `<Layout title?: string>`.

### `Navbar.astro`

Responsabilidad única: el nav superior del hero, incluyendo su
comportamiento móvil (menú hamburguesa).

- Markup: logo, lista de links (`#carro-milagro` … `#socio`, más el botón
  "Ser socio"), botón toggle (3 spans para el ícono hamburguesa/X).
- `<style>` scoped: todas las reglas `.hero__nav*`, `.hero__nav-toggle*`,
  incluida la sección del media query `max-width: 680px` que las afecta
  (overlay fullscreen del menú, animación del ícono). Incluye
  `:global(body.nav-open) { overflow: hidden; }` — usa el escape
  `:global()` de Astro porque `<body>` vive fuera del subárbol que Astro
  puede scopear para este componente, pero la regla pertenece lógicamente
  al comportamiento del nav.
- `<script>`: el contenido actual de `js/nav.js` (toggle de
  `aria-expanded`/`aria-label`, clase `is-open`, clase `nav-open` en body,
  cierre con click en link, cierre con `Escape`). Astro procesa y empaqueta
  este script automáticamente por componente — equivalente a la carga
  `defer` actual.

Interfaz: sin props (contenido estático, igual que hoy).

### `Hero.astro`

Responsabilidad única: la sección `.hero` completa (blobs decorativos,
`<Navbar />`, contenido textual, stats, imagen del carro).

- Markup: `.hero__blob-top`, `.hero__blob-bottom`, `<Navbar />`,
  `.hero__content` (eyebrow, headline, desc, CTA, stats), `.hero__car`.
- `<style>` scoped: `.hero`, `.hero__blob*`, `.hero__content`,
  `.hero__eyebrow`, `.hero__headline`, `.hero__desc`, `.hero__cta`,
  `.hero__stats*`, `.hero__stat*`, `.hero__car`, y la porción del media
  query `max-width: 680px` que afecta a estos selectores (stacking,
  wrap de stats, reposición del carro). Excluye todo lo `.hero__nav*`
  (vive en `Navbar.astro`).

Interfaz: sin props.

### `index.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
---
<Layout>
  <Hero />
</Layout>
```

## Estilos: qué es global vs. qué es scoped

- **Global** (`src/styles/`): los 8 archivos de tokens sin cambios
  (`fonts.css`, `colors.css`, `typography.css`, `spacing.css`,
  `radius.css`, `elevation.css`, `motion.css`, `base.css`) más un nuevo
  `global.css` que contiene únicamente lo que hoy vive en `styles.css` y
  es compartido entre componentes: `.container` y todas las reglas `.btn*`
  (`.btn`, `.btn--sm/md/lg`, `.btn--primary`, `.btn--primary:hover`).
  Razón: tanto `Navbar` (botón "Ser socio") como `Hero` (botón "Quiero mi
  e-VIR") usan estas clases — mantenerlas globales evita duplicar CSS en
  dos componentes.
- **Scoped**: todo lo prefijado `.hero__*` se reparte entre `Navbar.astro`
  (lo `.hero__nav*`) y `Hero.astro` (el resto), como se describe arriba.
  El scoping de Astro (atributo `data-astro-cid-*` autogenerado) no
  requiere cambiar ningún selector — se copian tal cual dentro del
  `<style>` de cada componente.

No se reescribe ninguna regla CSS existente; es una reorganización de
archivos, no un rediseño.

## Assets

Las 4 imágenes (`carro-verde.png`, `evir-icon.png`, `evir-logo-badge.png`,
`evir-logo.png`) se mueven de `assets/` a `public/assets/` sin cambios. Las
referencias en el markup (`src="assets/..."` → `src="/assets/..."`, con
slash inicial porque `public/` se sirve desde la raíz del sitio) se
actualizan en `Navbar.astro` (logo) y `Hero.astro` (carro).

## Tooling

- `npm create astro@latest` con plantilla mínima, sin TypeScript estricto,
  sin instalar integraciones adicionales (no React/Vue/Tailwind — no se
  pidieron y no hay necesidad, el sitio es HTML/CSS estático con un poco
  de JS vanilla).
- Scripts resultantes en `package.json`: `dev`, `build`, `preview`
  (los que trae la plantilla por defecto de Astro).
- Modo de salida: estático (`output: 'static'`, el default de Astro) — no
  se requiere SSR para esta página.

## Verificación

Antes de borrar los archivos estáticos originales:

1. `npm run dev` y comparar visualmente contra el sitio estático actual en:
   - Desktop (1440×900)
   - Tablet (768×1024)
   - Móvil (390×844)
2. Confirmar que el hover de los botones (`Ser socio`, `Quiero mi e-VIR`)
   sigue sin sombra/brillo, solo cambio de verde.
3. Confirmar que el menú hamburguesa abre/cierra correctamente en móvil
   (click en toggle, click en link, tecla `Escape`), y que bloquea el
   scroll del body mientras está abierto.
4. Confirmar que `npm run build` genera `dist/` sin errores y que
   `npm run preview` sirve el resultado sin diferencias visuales frente a
   `npm run dev`.

Solo después de esta verificación se eliminan `index.html`, `css/`, `js/`
y `assets/` de la raíz del proyecto.
