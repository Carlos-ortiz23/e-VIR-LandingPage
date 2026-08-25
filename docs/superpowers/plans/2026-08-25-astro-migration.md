# Migración a Astro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar la landing page e-VIR (hero: nav + contenido + stats + carro + menú hamburguesa móvil) de HTML/CSS/JS estático a un proyecto Astro, sin cambios visuales ni de comportamiento.

**Architecture:** Proyecto Astro estático (`output: 'static'`, sin frameworks de UI ni islas). Un `Layout.astro` con el documento base y los imports de CSS global; dos componentes (`Navbar.astro`, `Hero.astro`) que se reparten el markup y CSS scoped del hero actual; `index.astro` los compone. Los tokens de diseño (colores, tipografía, spacing, radius, elevation, motion, fonts) quedan como CSS global sin modificar; `.container` y `.btn*` se extraen a un `global.css` nuevo porque los comparten ambos componentes.

**Tech Stack:** Astro 5 (JS vanilla, sin TypeScript estricto, sin integraciones adicionales), npm.

**Spec:** `docs/superpowers/specs/2026-08-25-astro-migration-design.md`

## Global Constraints

- Alcance exclusivo: portar el hero existente. No se construyen las secciones futuras (Carro Milagro, Línea Verde, Modelo, Quiénes somos, Expansión, Socio).
- Cero cambios visuales o de comportamiento respecto al sitio estático actual — es una migración de tecnología, no un rediseño.
- Sin framework de UI adicional (React/Vue/etc.) ni hidratación de islas — el toggle del menú es JS vanilla en un `<script>` de Astro.
- Sin optimización de imágenes vía `astro:assets` — las imágenes se sirven tal cual desde `public/assets/`.
- `output: 'static'` (el default de Astro) — no se requiere SSR.
- Paquetes: npm. No hay `.git` en este repo — ningún paso de este plan incluye `git commit`; en su lugar cada tarea termina con una verificación manual/curl antes de continuar.
- Los archivos estáticos originales (`index.html`, `css/`, `js/`, `assets/` en la raíz) se eliminan solo en la última tarea, después de que la Tarea 5 confirme paridad visual completa.

---

## Task 1: Scaffold del proyecto Astro

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/env.d.ts`
- Create: `src/pages/index.astro` (placeholder temporal, se reemplaza en la Tarea 5)

**Interfaces:**
- Consumes: nada (primera tarea).
- Produces: comandos `npm run dev` / `npm run build` / `npm run preview` funcionando; estructura `src/pages/` lista para que la Tarea 2 en adelante la use.

- [ ] **Step 1: Crear `package.json`**

```json
{
  "name": "e-vir-landing",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
```

- [ ] **Step 2: Crear `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
});
```

- [ ] **Step 3: Crear `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/base"
}
```

- [ ] **Step 4: Crear `src/env.d.ts`**

```ts
/// <reference types="astro/client" />
```

- [ ] **Step 5: Crear el placeholder `src/pages/index.astro`**

```astro
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>e-VIR — scaffold OK</title>
  </head>
  <body>
    <h1>Scaffold OK</h1>
  </body>
</html>
```

- [ ] **Step 6: Instalar dependencias**

Run: `cd /home/coiam/workspace/e-vir-landingPage && npm install`
Expected: termina sin errores, crea `node_modules/` y `package-lock.json`.

- [ ] **Step 7: Verificar que el dev server levanta y sirve el placeholder**

Run:
```bash
cd /home/coiam/workspace/e-vir-landingPage
npm run dev -- --port 4321 &
sleep 3
curl -s http://localhost:4321/ | grep -o "Scaffold OK"
kill %1
```
Expected: imprime `Scaffold OK`.

---

## Task 2: Estilos globales y `Layout.astro`

**Files:**
- Create: `src/styles/fonts.css`, `src/styles/colors.css`, `src/styles/typography.css`, `src/styles/spacing.css`, `src/styles/radius.css`, `src/styles/elevation.css`, `src/styles/motion.css`, `src/styles/base.css` (copias exactas de los archivos actuales en `css/`)
- Create: `src/styles/global.css` (extracto de `.container` y `.btn*` de `css/styles.css`)
- Create: `src/layouts/Layout.astro`
- Modify: `src/pages/index.astro` (usa `Layout` en vez del placeholder plano)

**Interfaces:**
- Consumes: ninguno de tareas anteriores más allá de la estructura `src/` de la Tarea 1.
- Produces: `import Layout from '../layouts/Layout.astro'` con prop opcional `title?: string` (default `'e-VIR — Vuela como un canario'`); todas las variables CSS (`--evir-*`, `--text-*`, `--surface-*`, `--font-*`, `--fs-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--dur-*`) disponibles globalmente para las Tareas 3 y 4; clases `.container`, `.btn`, `.btn--sm/md/lg`, `.btn--primary` disponibles globalmente.

- [ ] **Step 1: Copiar los 8 archivos de tokens sin cambios**

Run:
```bash
cd /home/coiam/workspace/e-vir-landingPage
mkdir -p src/styles
cp css/fonts.css src/styles/fonts.css
cp css/colors.css src/styles/colors.css
cp css/typography.css src/styles/typography.css
cp css/spacing.css src/styles/spacing.css
cp css/radius.css src/styles/radius.css
cp css/elevation.css src/styles/elevation.css
cp css/motion.css src/styles/motion.css
cp css/base.css src/styles/base.css
```
Expected: 8 archivos nuevos en `src/styles/`, contenido idéntico a sus fuentes.

- [ ] **Step 2: Crear `src/styles/global.css`**

```css
/* e-VIR landing page — shared primitives (container, buttons) */

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding-left: var(--gutter-inline);
  padding-right: var(--gutter-inline);
}

/* ---- Buttons ---- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-label);
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  border-radius: var(--radius-control);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: background-color .14s var(--ease-standard), border-color .14s var(--ease-standard), box-shadow .14s var(--ease-standard), transform .08s var(--ease-standard);
}
.btn:active { transform: scale(.975); }

.btn--sm { padding: 8px 16px; font-size: var(--fs-body-sm); min-height: 36px; }
.btn--md { padding: 12px 24px; font-size: var(--fs-body); min-height: 46px; }
.btn--lg { padding: 16px 32px; font-size: var(--fs-body-lg); min-height: 56px; }

.btn--primary {
  background: var(--action-primary-bg);
  color: var(--action-primary-fg);
  border-color: var(--action-primary-bg);
  box-shadow: var(--shadow-sm);
}
.btn--primary:hover {
  background: var(--action-primary-bg-hover);
  border-color: var(--action-primary-bg-hover);
}
```

- [ ] **Step 3: Crear `src/layouts/Layout.astro`**

```astro
---
import '../styles/fonts.css';
import '../styles/colors.css';
import '../styles/typography.css';
import '../styles/spacing.css';
import '../styles/radius.css';
import '../styles/elevation.css';
import '../styles/motion.css';
import '../styles/base.css';
import '../styles/global.css';

interface Props {
  title?: string;
}

const { title = 'e-VIR — Vuela como un canario' } = Astro.props;
---
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 4: Usar el Layout en `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
---
<Layout>
  <h1>Layout OK</h1>
</Layout>
```

- [ ] **Step 5: Verificar que el layout renderiza con el CSS global aplicado**

Run:
```bash
cd /home/coiam/workspace/e-vir-landingPage
npm run dev -- --port 4321 &
sleep 3
curl -s http://localhost:4321/ | grep -o "<title>e-VIR — Vuela como un canario</title>"
curl -s http://localhost:4321/ | grep -o "Layout OK"
kill %1
```
Expected: ambos `grep` imprimen su coincidencia (el título por defecto se aplicó, el contenido del slot se renderizó). Sin errores en la salida de `npm run dev`.

---

## Task 3: `Navbar.astro`

**Files:**
- Create: `src/components/Navbar.astro`
- Modify: `src/pages/index.astro` (temporalmente renderiza `<Navbar />` dentro del `Layout` para poder verificarlo aislado)

**Interfaces:**
- Consumes: `Layout.astro` de la Tarea 2 (variables CSS globales, `.btn*`); imagen `assets/evir-logo-badge.png` (todavía en su ubicación original — la Tarea 5 la mueve a `public/assets/` y actualiza este `src`).
- Produces: `import Navbar from '../components/Navbar.astro'` (sin props); elementos `#heroNavLinks` y `#heroNavToggle` con el comportamiento de menú móvil (clase `.is-open`, `aria-expanded`, clase `nav-open` en `<body>`) que la Tarea 4 no toca pero de los que depende visualmente al colocar `<Navbar />` dentro de `.hero`.

- [ ] **Step 1: Crear `src/components/Navbar.astro`**

```astro
---
---
<nav class="hero__nav">
  <img class="hero__logo" src="/assets/evir-logo-badge.png" alt="e-VIR" />
  <div class="hero__nav-links" id="heroNavLinks">
    <a href="#carro-milagro">Carro Milagro</a>
    <a href="#linea-verde">Línea Verde</a>
    <a href="#modelo">Modelo</a>
    <a href="#quienes-somos">Quiénes somos</a>
    <a href="#expansion">Expansión</a>
    <a class="btn btn--primary btn--sm hero__nav-cta" href="#socio">Ser socio</a>
  </div>
  <button
    type="button"
    class="hero__nav-toggle"
    id="heroNavToggle"
    aria-expanded="false"
    aria-controls="heroNavLinks"
    aria-label="Abrir menú"
  >
    <span></span><span></span><span></span>
  </button>
</nav>

<style>
  .hero__nav {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 7;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: clamp(16px, 2.2vw, 40px);
    padding: clamp(18px, 2.2vw, 30px) var(--gutter-inline);
  }

  .hero__logo {
    height: clamp(30px, 2.6vw, 40px);
    width: auto;
    border-radius: var(--radius-sm);
    display: block;
    flex: 0 0 auto;
  }

  .hero__nav-links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(18px, 2vw, 34px);
  }

  .hero__nav-links a.hero__nav-cta {
    color: var(--action-primary-fg);
    margin-left: clamp(4px, .6vw, 10px);
  }
  .hero__nav-links a.hero__nav-cta:hover { color: var(--action-primary-fg); }

  .hero__nav-links a {
    color: var(--text-inverse);
    font-family: var(--font-sans);
    font-size: clamp(12px, 1.05vw, 15px);
    font-weight: var(--fw-semibold);
    text-decoration: none;
    white-space: nowrap;
    text-shadow: 0 1px 6px rgba(11, 16, 36, .5);
  }
  .hero__nav-links a:hover { color: var(--evir-lime-300); }

  .hero__nav-cta { flex: 0 0 auto; }

  .hero__nav-toggle {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 40px;
    height: 40px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    position: relative;
    z-index: 11;
    flex: 0 0 auto;
  }
  .hero__nav-toggle span {
    display: block;
    width: 22px;
    height: 2px;
    border-radius: 2px;
    background: var(--text-inverse);
    transition: transform .2s var(--ease-standard), opacity .2s var(--ease-standard);
  }
  .hero__nav-toggle[aria-expanded="true"] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .hero__nav-toggle[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
  .hero__nav-toggle[aria-expanded="true"] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  @media (max-width: 680px) {
    :global(body.nav-open) { overflow: hidden; }

    .hero__nav-toggle { display: flex; }

    .hero__nav-links {
      position: fixed;
      inset: 0;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 26px;
      background: var(--surface-ink);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-12px);
      transition: opacity .22s var(--ease-standard), transform .22s var(--ease-standard), visibility .22s;
    }
    .hero__nav-links.is-open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .hero__nav-links a {
      font-size: 19px;
      text-shadow: none;
    }
    .hero__nav-links a.hero__nav-cta { margin: 10px 0 0; }
  }
</style>

<script>
  const toggle = document.getElementById('heroNavToggle');
  const links = document.getElementById('heroNavLinks');

  if (toggle && links) {
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      links.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    };

    const openMenu = () => {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú');
      links.classList.add('is-open');
      document.body.classList.add('nav-open');
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }
</script>
```

Nota: a diferencia del `js/nav.js` original (que usaba una IIFE `(function () {...})()`), aquí el `<script>` no necesita el wrapper — Astro procesa cada `<script>` de componente como módulo aislado, así que las declaraciones `const` de nivel superior ya no colisionan con otros scripts de la página. El comportamiento es idéntico.

Como `assets/` todavía no se movió (eso es la Tarea 5), la imagen del logo con `src="/assets/evir-logo-badge.png"` **no cargará todavía** en esta tarea — es esperado, se verifica solo el toggle del menú, no la imagen.

- [ ] **Step 2: Renderizar `Navbar` temporalmente en `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
---
<Layout>
  <div style="position: relative; height: 100vh; background: var(--surface-ink);">
    <Navbar />
  </div>
</Layout>
```

- [ ] **Step 3: Verificar el menú móvil con Playwright (herramienta `mcp__plugin_playwright_playwright__*`)**

Run:
```bash
cd /home/coiam/workspace/e-vir-landingPage
npm run dev -- --port 4321 &
sleep 3
```

Con el navegador (Playwright MCP):
1. `browser_navigate` a `http://localhost:4321/`.
2. `browser_resize` a 390x844.
3. `browser_evaluate`: confirmar que `getComputedStyle(document.getElementById('heroNavLinks')).opacity === '0'` y `visibility === 'hidden'` (menú cerrado por defecto).
4. `browser_evaluate`: ejecutar `document.getElementById('heroNavToggle').click()` **dentro del propio `evaluate`** (no usar `browser_click` — en la migración anterior de este mismo proyecto, `browser_click` sobre este botón disparó el evento dos veces y dejó el menú en el estado equivocado; `element.click()` vía `evaluate` es el método confiable).
5. `browser_evaluate`: confirmar `aria-expanded === 'true'` y que `heroNavLinks` tiene la clase `is-open`.
6. `browser_take_screenshot`: confirmar visualmente el overlay con los 5 links + botón "Ser socio", ícono en X.
7. `browser_resize` a 1440x900: confirmar que `.hero__nav-toggle` tiene `display: none` (computed) y los links se ven en fila horizontal.

Run: `kill %1`
Expected: todos los checks del paso 3 pasan; sin errores de consola además del 404 esperado de `evir-logo-badge.png` (se resuelve en la Tarea 5).

---

## Task 4: `Hero.astro`

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/pages/index.astro` (temporalmente renderiza `<Hero />` en vez del `<Navbar />` suelto)

**Interfaces:**
- Consumes: `Navbar.astro` de la Tarea 3 (`import Navbar from './Navbar.astro'`); `Layout.astro` de la Tarea 2 (variables CSS, `.btn*`); imagen `assets/carro-verde.png` (todavía sin mover — 404 esperado hasta la Tarea 5).
- Produces: `import Hero from '../components/Hero.astro'` (sin props) — sección `.hero` completa lista para que la Tarea 5 la use en `index.astro` final.

- [ ] **Step 1: Crear `src/components/Hero.astro`**

```astro
---
import Navbar from './Navbar.astro';
---
<section class="hero">
  <div class="hero__blob-top" aria-hidden="true"></div>
  <div class="hero__blob-bottom"></div>

  <Navbar />

  <div class="hero__content">
    <span class="hero__eyebrow">Vuela como un canario</span>
    <h1 class="hero__headline">Silencioso.<br />Suave. Libre.</h1>
    <p class="hero__desc">Vehículos eléctricos nuevos y automáticos, con un modelo en el que el conductor termina siendo dueño.</p>
    <a class="btn btn--primary btn--lg hero__cta" href="#socio">Quiero mi e-VIR</a>
    <div class="hero__stats">
      <div class="hero__stat">
        <span class="hero__stat-value">25</span>
        <span class="hero__stat-label">Meta flota 2026</span>
      </div>
      <div class="hero__stat">
        <span class="hero__stat-value">200</span>
        <span class="hero__stat-label">Meta flota 2027</span>
      </div>
      <div class="hero__stat">
        <span class="hero__stat-value">4</span>
        <span class="hero__stat-label">Países</span>
      </div>
      <div class="hero__stat">
        <span class="hero__stat-value">$0</span>
        <span class="hero__stat-label">Cuota inicial</span>
      </div>
    </div>
  </div>

  <img class="hero__car" src="/assets/carro-verde.png" alt="e-VIR JMEV 2 — vehículo eléctrico" />
</section>

<style>
  .hero {
    position: relative;
    width: 100%;
    min-height: 560px;
    height: min(86vh, 800px);
    overflow: hidden;
    background: var(--surface-ink);
  }

  .hero__blob-top {
    position: absolute;
    left: 0;
    top: 0;
    width: clamp(130px, 12.5vw, 190px);
    height: clamp(96px, 9vw, 138px);
    background: var(--surface-lime);
    border-radius: 0 0 100% 0;
    z-index: 2;
  }

  .hero__blob-bottom {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 11%;
    height: 13%;
    min-width: 60px;
    min-height: 60px;
    background: var(--surface-lime);
    border-radius: 0 100% 0 0;
    z-index: 3;
  }

  .hero__content {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: min(560px, 54%);
    z-index: 5;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: clamp(10px, 1.2vw, 18px);
    padding: clamp(90px, 10vw, 150px) clamp(16px, 2vw, 36px) clamp(48px, 6vw, 88px) clamp(28px, 3.2vw, 56px);
  }

  .hero__eyebrow {
    font-family: var(--font-display);
    font-style: italic;
    font-weight: var(--fw-bold);
    font-size: clamp(18px, 2.3vw, 32px);
    line-height: 1;
    color: var(--evir-lime-400);
  }

  .hero__headline {
    margin: 0;
    font-family: var(--font-display);
    font-weight: var(--fw-extrabold);
    font-size: clamp(34px, 4.6vw, 64px);
    line-height: var(--lh-display);
    letter-spacing: var(--ls-display);
    color: var(--text-inverse);
  }

  .hero__desc {
    margin: 0;
    font-family: var(--font-sans);
    font-size: clamp(13px, 1.1vw, 17px);
    line-height: var(--lh-body);
    color: var(--text-inverse-muted);
    max-width: 30em;
  }

  .hero__cta { align-self: flex-start; margin-top: clamp(4px, .6vw, 10px); }

  .hero__stats {
    display: flex;
    gap: clamp(14px, 1.6vw, 26px);
    margin-top: clamp(10px, 1.4vw, 24px);
    flex-wrap: nowrap;
  }

  .hero__stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-right: clamp(14px, 1.6vw, 26px);
    border-right: 1px solid var(--border-inverse);
    flex: 0 0 auto;
  }
  .hero__stat:last-child { border-right: none; padding-right: 0; }

  .hero__stat-value {
    font-family: var(--font-display);
    font-size: clamp(18px, 1.9vw, 28px);
    font-weight: var(--fw-extrabold);
    color: var(--text-inverse);
    line-height: 1;
    white-space: nowrap;
  }

  .hero__stat-label {
    font-family: var(--font-sans);
    font-size: clamp(10px, .85vw, 13px);
    font-weight: var(--fw-semibold);
    color: var(--text-inverse-muted);
    white-space: nowrap;
  }

  .hero__car {
    position: absolute;
    right: -2%;
    bottom: -4%;
    width: clamp(320px, 52%, 780px);
    z-index: 4;
    pointer-events: none;
  }

  @media (max-width: 680px) {
    .hero {
      height: auto;
      min-height: 100vh;
      padding-bottom: var(--space-9);
    }

    .hero__content {
      position: relative;
      width: auto;
      height: auto;
      padding: 96px var(--gutter-inline) 0;
    }

    .hero__stats {
      flex-wrap: wrap;
      gap: 16px 24px;
    }
    .hero__stat {
      min-width: 42%;
      border-right: none;
      padding-right: 0;
    }
    .hero__stat:nth-child(odd) {
      border-right: 1px solid var(--border-inverse);
      padding-right: 16px;
    }

    .hero__car {
      position: relative;
      inset: auto;
      display: block;
      width: min(420px, 92%);
      margin: 32px auto 0;
    }
  }
</style>
```

- [ ] **Step 2: Renderizar `Hero` en `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
---
<Layout>
  <Hero />
</Layout>
```

- [ ] **Step 3: Verificar layout en desktop, tablet y móvil**

Run:
```bash
cd /home/coiam/workspace/e-vir-landingPage
npm run dev -- --port 4321 &
sleep 3
```

Con Playwright MCP:
1. `browser_navigate` a `http://localhost:4321/`, `browser_resize` 1440x900.
2. `browser_evaluate`: leer `getBoundingClientRect()` de `.hero__eyebrow`, `.hero__headline`, `.hero__desc`, `.hero__cta`, `.hero__stats` — confirmar los 5 bordes izquierdos iguales (~46px), igual que en el sitio estático original.
3. `browser_resize` 390x844: `browser_evaluate` — confirmar que `.hero__stats` tiene `flex-wrap: wrap` (computed) y que ningún `.hero__stat` se superpone con `.hero__car` (comparar `getBoundingClientRect().bottom` de `.hero__stats` contra `getBoundingClientRect().top` de `.hero__car`; el segundo debe ser mayor o igual).
4. `browser_take_screenshot` en 1440x900, 768x1024 y 390x844 para inspección visual.

Run: `kill %1`
Expected: alineación desktop idéntica a la del sitio estático (medida en la conversación previa: left=46px en los 5 elementos); sin overlap en móvil. 404 esperado en `carro-verde.png` (se resuelve en la Tarea 5).

---

## Task 5: Migrar assets, componer `index.astro` final y verificación completa

**Files:**
- Create: `public/assets/carro-verde.png`, `public/assets/evir-icon.png`, `public/assets/evir-logo-badge.png`, `public/assets/evir-logo.png` (copias de `assets/*.png`)
- Modify: `src/pages/index.astro` (versión final, sin el markup temporal de las Tareas 3–4)

**Interfaces:**
- Consumes: `Layout.astro` (Tarea 2), `Hero.astro` (Tarea 4, que a su vez usa `Navbar.astro` de la Tarea 3).
- Produces: página completa en `/` funcionalmente idéntica al `index.html` original.

- [ ] **Step 1: Copiar las imágenes a `public/assets/`**

Run:
```bash
cd /home/coiam/workspace/e-vir-landingPage
mkdir -p public/assets
cp assets/carro-verde.png public/assets/carro-verde.png
cp assets/evir-icon.png public/assets/evir-icon.png
cp assets/evir-logo-badge.png public/assets/evir-logo-badge.png
cp assets/evir-logo.png public/assets/evir-logo.png
```
Expected: 4 archivos nuevos en `public/assets/`, idénticos en bytes a los originales (`Navbar.astro` y `Hero.astro` ya referencian `/assets/...`, no requieren cambios adicionales).

- [ ] **Step 2: Dejar `src/pages/index.astro` en su forma final**

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
---
<Layout>
  <Hero />
</Layout>
```

- [ ] **Step 3: Verificación completa en dev — desktop, tablet, móvil, hover, menú**

Run:
```bash
cd /home/coiam/workspace/e-vir-landingPage
npm run dev -- --port 4321 &
sleep 3
```

Con Playwright MCP:
1. Confirmar que ya no hay 404 de imágenes: `browser_navigate` a `http://localhost:4321/`, revisar `browser_console_messages` con `onlyErrors: true` — el único error tolerable es `favicon.ico` 404 (no hay favicon en el proyecto original tampoco).
2. Desktop 1440x900: `browser_take_screenshot`, comparar visualmente contra la última captura conocida del sitio estático (nav completo, blobs, headline, stats en fila, carro a la derecha).
3. `browser_hover` (o `browser_evaluate` disparando `:hover` real vía mouse move si `browser_hover` resulta poco confiable) sobre el botón "Quiero mi e-VIR": `getComputedStyle(...).boxShadow` debe ser solo la sombra `--shadow-sm` (navy sutil), **sin** `--shadow-lime`; `background-color` debe cambiar a `rgb(194, 240, 92)` (lima-300).
4. Tablet 768x1024: `browser_take_screenshot`, confirmar sin overlaps.
5. Móvil 390x844: `browser_take_screenshot` cerrado; abrir el menú vía `browser_evaluate` (`document.getElementById('heroNavToggle').click()`) y `browser_take_screenshot` de nuevo — debe verse igual al overlay verificado en la Tarea 3, ahora con el logo cargando correctamente.
6. Confirmar `body.nav-open` bloquea el scroll: con el menú abierto, `getComputedStyle(document.body).overflow === 'hidden'`.

Run: `kill %1`
Expected: todos los checks anteriores pasan; paridad visual completa con el sitio estático previo a esta migración.

- [ ] **Step 4: Verificar el build de producción**

Run:
```bash
cd /home/coiam/workspace/e-vir-landingPage
npm run build
ls dist/index.html dist/assets/
npm run preview -- --port 4322 &
sleep 3
curl -s http://localhost:4322/ | grep -o "Silencioso"
kill %1
```
Expected: `npm run build` termina sin errores; `dist/index.html` existe; el `curl` sobre el preview encuentra "Silencioso" (confirma que el HTML estático generado contiene el headline).

---

## Task 6: Limpieza de los archivos estáticos originales

**Files:**
- Delete: `index.html`, `css/`, `js/`, `assets/` (raíz del proyecto)

**Interfaces:**
- Consumes: confirmación de paridad visual completa de la Tarea 5 (Step 3 y Step 4) — **no ejecutar esta tarea si algún check de la Tarea 5 falló**.
- Produces: repo limpio, solo con la estructura Astro.

- [ ] **Step 1: Confirmar de nuevo que el build de producción funciona antes de borrar nada**

Run:
```bash
cd /home/coiam/workspace/e-vir-landingPage
npm run build
echo $?
```
Expected: `0` (build exitoso). Si falla, detenerse aquí y no continuar con el borrado.

- [ ] **Step 2: Eliminar los archivos estáticos originales**

Run:
```bash
cd /home/coiam/workspace/e-vir-landingPage
rm -f index.html
rm -rf css/
rm -rf js/
rm -rf assets/
```
Expected: `index.html`, `css/`, `js/`, `assets/` ya no existen en la raíz. `src/`, `public/`, `package.json`, `astro.config.mjs` siguen intactos.

- [ ] **Step 3: Verificación final — el sitio sigue funcionando sin los archivos originales**

Run:
```bash
cd /home/coiam/workspace/e-vir-landingPage
npm run dev -- --port 4321 &
sleep 3
curl -s http://localhost:4321/ | grep -o "Silencioso"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/assets/carro-verde.png
kill %1
ls
```
Expected: `grep` encuentra "Silencioso"; la imagen responde `200`; `ls` de la raíz muestra solo `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `node_modules/`, `src/`, `public/`, `docs/` (y `dist/` si quedó del build anterior).

---

## Self-Review

**Cobertura del spec:**
- Estructura de archivos objetivo → Tareas 1–5 la construyen completa.
- `Layout.astro` (documento base, CSS global, sin markup del hero) → Tarea 2.
- `Navbar.astro` (markup + estilos scoped `.hero__nav*` + script + `:global(body.nav-open)`) → Tarea 3.
- `Hero.astro` (resto del markup + estilos scoped, excluye `.hero__nav*`) → Tarea 4.
- `.container`/`.btn*` global compartido → Tarea 2 (`global.css`).
- Migración de assets a `public/assets/` con rutas `/assets/...` → Tarea 5.
- Verificación (desktop/tablet/móvil, hover sin sombra, menú hamburguesa, build+preview) → Tareas 3, 4, 5.
- Borrado de archivos originales solo tras verificación → Tarea 6.
- "Sin git commit" (repo sin `.git`) → reflejado en Global Constraints, ninguna tarea incluye `git commit`.

**Escaneo de placeholders:** sin TBD/TODO; cada paso tiene comandos o código exacto, no descripciones vagas.

**Consistencia de tipos/nombres:** `Layout` usado igual en Tareas 2, 3, 4, 5 (`import Layout from '../layouts/Layout.astro'`, prop `title?`); `Navbar` usado igual en Tareas 3 → 4 (`import Navbar from './Navbar.astro'`); `Hero` usado igual en Tareas 4 → 5 (`import Hero from '../components/Hero.astro'`); IDs `heroNavLinks`/`heroNavToggle` y clase `is-open` consistentes entre el markup y el script de la Tarea 3, y entre la verificación de la Tarea 3 y la Tarea 5.
