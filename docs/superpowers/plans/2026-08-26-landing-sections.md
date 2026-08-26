# Secciones restantes de la landing e-VIR — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir los siete bloques que faltan en la landing de e-VIR (Línea Verde, Flota propia, Modelo de negocio, Quiénes somos, Expansión, Ser socio, footer) sobre el hero ya existente.

**Architecture:** Astro estático sin framework de UI. Las clases de componente del design system viven en `src/styles/global.css`; cada sección es un `.astro` con su layout en `<style>` scoped. Un único `Icon.astro` inlinea los glifos de Lucide. La única lógica real de la página —el compositor del mensaje de WhatsApp— vive en un módulo puro con tests unitarios.

**Tech Stack:** Astro 7, pnpm, CSS con tokens propios (`src/styles/`), `lucide-static` y `vitest` como devDependencies.

**Spec:** `docs/superpowers/specs/2026-08-26-landing-sections-design.md`

## Global Constraints

- **Gestor de paquetes: pnpm.** Nunca `npm`.
- **Tokens:** todo valor de color, espaciado, radio, sombra, tipografía y movimiento sale de `src/styles/`. Cero literales nuevos, salvo los `rgba(255,255,255,…)` sobre superficies oscuras que el design system ya define así.
- **Idioma del copy:** español (Colombia), tratamiento **tú**, nunca *usted*.
- **Casing:** sentence case en titulares, botones y etiquetas. UPPERCASE solo en eyebrows, siempre con `--ls-eyebrow`.
- **Marca:** se escribe `e-VIR` siempre.
- **Longitudes:** titulares ≤ 9 palabras, leads ≤ 28 palabras, cuerpos de tarjeta 1–2 frases, botones 1–3 palabras y verbo primero.
- **Cero emoji.** Como máximo un signo de exclamación en toda la página.
- **Cifras:** convención colombiana (`.` miles, `,` decimales). **No inventar cifras** de autonomía, batería, precio, plazo ni cuota. Solo las que ya existen: 25 (dic. 2026), 200 (dic. 2027), 4 países, $0 cuota inicial, 2002, 30 años.
- **Lima racionada:** un elemento lima por vista (el CTA primario) más acentos pequeños.
- **Tarjetas:** relleno **con** hairline **y** sombra, nunca una sola de las dos.
- **Nada de esquinas cuadradas.** Controles y chips son píldoras completas.
- **Prohibido:** "Carro Milagro" en cualquier aparición; gradientes decorativos; ilustración sustituyendo fotografía; iconos que no sean Lucide; emoji como icono.
- **El hero no se toca**, salvo el `alt` del coche (Task 1). Su composición se verifica numéricamente en cada task de verificación.
- **Un solo `<h1>` en la página** (el del hero). Las secciones usan `<h2>`, las tarjetas `<h3>`.

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `src/components/Icon.astro` | Único punto donde vive un path SVG. Recibe `name` y `size`. |
| `src/styles/global.css` *(modificar)* | Vocabulario compartido: `.section`, `.section-head`, `.card` y tonos, `.badge`, `.icon-plate`, `.feature-row`, `.btn--secondary`. |
| `src/config.ts` | Una constante: el número de WhatsApp. |
| `src/lib/whatsapp.ts` | Compone el mensaje y la URL `wa.me`. Puro, sin DOM. |
| `src/lib/whatsapp.test.ts` | Tests del compositor. |
| `src/components/LineaVerde.astro` | Sección 1. Layout scoped. |
| `src/components/Flota.astro` | Sección 2. |
| `src/components/Modelo.astro` | Sección 3. |
| `src/components/QuienesSomos.astro` | Sección 4. |
| `src/components/Expansion.astro` | Sección 5. |
| `src/components/SerSocio.astro` | Sección 6. Tabs, acordeón y submit scoped aquí. |
| `src/components/SiteFooter.astro` | Sección 7. |
| `src/pages/index.astro` *(modificar)* | Única declaración del orden de la página. |

Cada sección se añade a `index.astro` en su propia task, para que sea verificable en el navegador al terminarla.

## Cómo se verifica una task

No hay framework de tests de UI en el proyecto y no se va a introducir uno: para una landing estática el ciclo real es build + aserciones sobre el HTML generado + comprobación visual. Vitest entra **solo** para `whatsapp.ts`, que es la única lógica de la página.

Cada task de sección termina con estos cuatro pasos:

1. `pnpm build` sale con código 0.
2. `grep` sobre `dist/index.html` confirma que el copy y la estructura exigidos están presentes.
3. Ojo con `grep -c`: cuenta **líneas**, no ocurrencias, y Astro emite el HTML
   minificado en una sola línea. Para contar apariciones usa
   `grep -o '<patrón>' dist/index.html | wc -l`. Un `grep -c` que espere un
   número mayor que 1 siempre devolverá 1 y parecerá un fallo.
4. El detector de layout no reporta nada: `node "$HOME/.claude/skills/impeccable/scripts/detect.mjs" --json --scope layout src/components/<Seccion>.astro` devuelve `[]`.
5. Captura en el navegador a 1440×900 y 390×844, y **regresión del hero por proporciones** (ver abajo).

El servidor de desarrollo ya corre en `http://localhost:4321`.

### Regresión del hero: proporciones, no píxeles

En cuanto existe contenido debajo del hero la página hace scroll, aparece una
barra de ~15px y el `<html>` se estrecha. Todo valor en `%` del hero resuelve
contra esa caja más estrecha, así que el coche mide 873px en vez de 880 —
sin que nada esté roto. Y el ancho de esa barra varía por sistema: 0px en macOS
con scrollbars superpuestas, 15 aquí, 17 en algunos Windows. Una baseline en
píxeles absolutos fallaría en otra máquina sin haber ningún defecto.

Lo que hay que conservar son las proporciones. Mide contra `.hero__canvas`:

```js
const canvas = document.querySelector('.hero__canvas').getBoundingClientRect();
const car = document.querySelector('.hero__car').getBoundingClientRect();
const content = document.querySelector('.hero__content').getBoundingClientRect();
({
  carWidthPct:     car.width / canvas.width * 100,              // 45.83
  carRightPct:     (canvas.right - car.right) / canvas.width * 100,   // 1.5
  carBottomPct:    (canvas.bottom - car.bottom) / canvas.height * 100, // 2.5
  contentWidthPct: content.width / canvas.width * 100,          // 35
  heroFillsViewport: canvas.height === innerHeight,             // true
  horizontalOverflow: document.documentElement.scrollWidth >
                      document.documentElement.clientWidth,      // false
})
```

Tolerancia: 0,1 puntos porcentuales. Cualquier desviación mayor significa que
CSS nuevo se filtró al hero.

---

### Task 1: Icon.astro, lucide-static y la corrección del `alt`

**Files:**
- Create: `src/components/Icon.astro`
- Modify: `package.json` (devDependencies)
- Modify: `src/components/Hero.astro:38` (solo el atributo `alt`)

**Interfaces:**
- Consumes: nada.
- Produces: `<Icon name="..." size={20} />` donde `name` es uno de los 16 glifos listados abajo y `size` un número (por defecto 20). Renderiza un `<svg>` con `stroke="currentColor"`, `stroke-width="1.75"`, `fill="none"`, `aria-hidden="true"`. Todas las secciones lo consumen.

- [ ] **Step 1: Instalar lucide-static**

```bash
pnpm add -D lucide-static
```

- [ ] **Step 2: Verificar que los 16 glifos existen en el paquete**

```bash
for g in accessibility heart-handshake clock percent message-circle wallet leaf \
         building-2 bike globe rocket graduation-cap landmark users map-pin mail; do
  test -f "node_modules/lucide-static/icons/$g.svg" && echo "OK   $g" || echo "FALTA $g"
done
```

Esperado: 16 líneas `OK`. Si alguno falta, para y repórtalo — no dibujes el glifo a mano, es una regla del design system.

- [ ] **Step 3: Extraer el contenido interno de cada SVG**

```bash
for g in accessibility heart-handshake clock percent message-circle wallet leaf \
         building-2 bike globe rocket graduation-cap landmark users map-pin mail; do
  echo "--- $g ---"
  sed -e 's/.*<svg[^>]*>//' -e 's|</svg>||' "node_modules/lucide-static/icons/$g.svg" | tr -d '\n' | sed 's/  */ /g'
done
```

Copia cada salida al mapa del paso siguiente, **verbatim**. No la reescribas de memoria.

- [ ] **Step 4: Crear `src/components/Icon.astro`**

```astro
---
/* Sustitución declarada: el design system estandariza Lucide 0.454.0 desde
   CDN. Aquí los glifos van inlineados desde lucide-static (devDependency),
   que da la misma geometría sin una petición externa ni JS en cliente. Los
   paths se copian verbatim del paquete — no se dibujan a mano.
   Reglas del sistema: trazo 1.75px, nunca relleno, nunca duotono, tamaños
   16/18/20/22/24, color heredado de currentColor. */
interface Props {
  name: string;
  size?: number;
  class?: string;
}
const { name, size = 20, class: className } = Astro.props;

const PATHS: Record<string, string> = {
  // Pega aquí la salida del Step 3, una entrada por glifo:
  // 'accessibility': '<circle .../><path .../>',
};

const body = PATHS[name];
if (!body) {
  throw new Error(
    `Icon "${name}" no está en Icon.astro. Añádelo desde lucide-static o usa texto.`
  );
}
---
<svg
  class={className}
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.75"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
  set:html={body}
/>
```

El `throw` es deliberado: un nombre mal escrito rompe el build en vez de renderizar un hueco invisible.

- [ ] **Step 5: Corregir el `alt` del coche del hero**

En `src/components/Hero.astro`, el `<img class="hero__car">` dice `alt="e-VIR JMEV 2 — vehículo eléctrico"` y la imagen es un JAC E10X. Cámbialo por:

```astro
    <img class="hero__car" src="/assets/carro-e10x.png" alt="e-VIR JAC E10X — vehículo eléctrico" />
```

No toques nada más de ese archivo.

- [ ] **Step 6: Verificar que el build compila y el hero no se movió**

```bash
pnpm build
```

Esperado: exit 0. Después, en el navegador a 1920×1080, comprobar que el rect del coche sigue siendo `[1011, 466, 880, 587]` y que `document.documentElement.scrollHeight === 1080`.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/Icon.astro src/components/Hero.astro
git commit -m "Add an Icon component with inlined Lucide glyphs

Sixteen glyphs copied verbatim from lucide-static, a devDependency, so the
page keeps the design system's icon geometry without the CDN request the
system prescribes. An unknown name throws at build time rather than
rendering an invisible gap.

Also fixes the hero car's alt text: it said JMEV 2, the vehicle is a JAC
E10X."
```

---

### Task 2: Vocabulario compartido en global.css

**Files:**
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: tokens de `src/styles/`.
- Produces: las clases `.section`, `.section--sunken`, `.section--ink`, `.section__inner`, `.section-head`, `.section-head__title`, `.section-head__lead`, `.card`, `.card--flat`, `.card--ink`, `.card--lime`, `.card--outline`, `.card--interactive`, `.badge`, `.badge--lime`, `.icon-plate`, `.icon-plate--ink`, `.feature-row`, `.btn--secondary`. Todas las tasks 3–8 y 10 las consumen.

- [ ] **Step 1: Añadir el vocabulario al final de `src/styles/global.css`**

```css
/* ---- Section shells ----
   El design system autoriza dos rellenos de fondo por página además del
   papel; la banda ink es lo que le da ritmo, así que se usa como
   puntuación y nunca dos veces seguidas. */
.section { background: var(--surface-page); }
.section--sunken { background: var(--surface-sunken); }
.section--ink { background: var(--surface-ink); }

.section__inner {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--section-y) var(--gutter-inline);
}

/* ---- Section head ---- */
.section-head {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 680px;
  margin-bottom: var(--space-9);
}
.section-head__title {
  margin: 0;
  font-size: var(--fs-h1);
  color: var(--text-strong);
}
.section-head__lead {
  margin: 0;
  font-size: var(--fs-body-lg);
  color: var(--text-muted);
}
.section--ink .section-head__title { color: var(--text-inverse); }
.section--ink .section-head__lead { color: var(--text-inverse-muted); }
.section--ink .evir-eyebrow { color: var(--evir-lime-400); }

/* ---- Card ----
   Los cinco tonos sancionados. Relleno con hairline Y sombra: nunca una
   sola de las dos. Sin bordes de color a la izquierda, sin gradientes,
   sin glassmorfismo. */
.card {
  padding: var(--card-pad);
  border: var(--border-hairline) solid var(--border-subtle);
  border-radius: var(--radius-card);
  background: var(--surface-card);
  color: var(--text-body);
  box-shadow: var(--shadow-sm);
}
.card--flat {
  background: var(--surface-sunken);
  box-shadow: none;
}
.card--ink {
  background: var(--surface-ink);
  border-color: rgba(255, 255, 255, .06);
  color: var(--text-inverse);
  box-shadow: var(--shadow-lg);
}
.card--lime {
  background: var(--surface-lime);
  border-color: var(--evir-lime-500);
  color: var(--text-on-lime);
}
.card--outline {
  background: transparent;
  border-width: var(--border-emphasis);
  border-color: var(--border-default);
  box-shadow: none;
}
.card--interactive {
  transition: transform var(--dur-base) var(--ease-out),
              box-shadow var(--dur-base) var(--ease-out);
}
.card--interactive:hover {
  transform: translateY(var(--lift-y));
  box-shadow: var(--shadow-lg);
}
.card h3 { margin: 0; }

/* ---- Badge ---- */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: var(--surface-muted);
  color: var(--text-body);
  font-family: var(--font-sans);
  font-size: var(--fs-micro);
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-eyebrow);
  text-transform: uppercase;
  white-space: nowrap;
}
.badge--lime {
  background: var(--surface-lime);
  color: var(--text-on-lime);
}

/* ---- Icon plate ----
   La placa lima-soft que acompaña a los iconos dentro de tarjetas. */
.icon-plate {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  background: var(--surface-lime-soft);
  color: var(--evir-lime-700);
}
.icon-plate--sm { width: 40px; height: 40px; border-radius: var(--radius-sm); }
.section--ink .icon-plate {
  background: rgba(172, 232, 48, .12);
  color: var(--evir-lime-400);
}

/* ---- Feature row ----
   Icono + texto en una línea. Se usa en listas de respaldo y ventajas. */
.feature-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--fs-body-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-body);
}
.feature-row > svg { flex: 0 0 auto; color: var(--evir-lime-600); }
.section--ink .feature-row { color: var(--text-inverse); }
.section--ink .feature-row > svg { color: var(--evir-lime-400); }

/* ---- Secondary button ----
   El sistema define tres variantes; solo existía la primaria. */
.btn--secondary {
  background: var(--action-secondary-bg);
  color: var(--action-secondary-fg);
  border-color: var(--action-secondary-bg);
  box-shadow: var(--shadow-sm);
}
.btn--secondary:hover {
  background: var(--action-secondary-bg-hover);
  border-color: var(--action-secondary-bg-hover);
  color: var(--action-secondary-fg);
}
```

- [ ] **Step 2: Verificar cada tono en el navegador antes de construir secciones**

Crea `src/pages/_vocab.astro` como página de prueba temporal:

```astro
---
import Layout from '../layouts/Layout.astro';
import Icon from '../components/Icon.astro';
const TONES = ['', 'card--flat', 'card--ink', 'card--lime', 'card--outline'];
const GLYPHS = ['accessibility','heart-handshake','clock','percent','message-circle','wallet','leaf','building-2','bike','globe','rocket','graduation-cap','landmark','users','map-pin','mail'];
---
<Layout title="vocab">
  {['', 'section--sunken', 'section--ink'].map((t) => (
    <section class={`section ${t}`}>
      <div class="section__inner">
        <div class="section-head">
          <span class="evir-eyebrow">Eyebrow</span>
          <h2 class="section-head__title">Titular de prueba</h2>
          <p class="section-head__lead">Lead de prueba para medir el color sobre esta banda.</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px">
          {TONES.map((tone) => (
            <div class={`card ${tone} card--interactive`}>
              <span class="icon-plate"><Icon name="wallet" size={22} /></span>
              <h3>Tono {tone || 'default'}</h3>
              <p class="feature-row"><Icon name="leaf" size={18} />Fila de característica</p>
              <span class="badge badge--lime">Badge</span>
            </div>
          ))}
        </div>
        <p style="margin-top:24px;display:flex;gap:14px;flex-wrap:wrap">
          {GLYPHS.map((g) => <Icon name={g} size={24} />)}
        </p>
        <p style="margin-top:24px;display:flex;gap:12px">
          <a class="btn btn--primary btn--md" href="#">Primario</a>
          <a class="btn btn--secondary btn--md" href="#">Secundario</a>
        </p>
      </div>
    </section>
  ))}
</Layout>
```

Abre `http://localhost:4321/_vocab` y comprueba:

- Los 16 glifos se ven completos, con el mismo grosor de trazo, ninguno recortado ni relleno.
- El tono `default` tiene borde **y** sombra a la vez.
- El tono `flat` no tiene sombra.
- El texto de la tarjeta `ink` y de la `lime` es legible en las tres bandas.
- El hover levanta la tarjeta 2px.
- El botón secundario es navy con texto blanco, píldora completa.

- [ ] **Step 3: Comprobar contraste**

En la consola del navegador, sobre `/_vocab`, verifica que el texto de cuerpo sobre cada banda supera 4.5:1 y los titulares 3:1. Las tres combinaciones a medir: `--text-muted` sobre `--surface-page`, `--text-muted` sobre `--surface-sunken`, y `--text-inverse-muted` sobre `--surface-ink`.

Si alguna falla, sube un paso el token de texto (`--text-muted` → `--text-body`) y anótalo; no cambies el valor del token.

- [ ] **Step 4: Borrar la página de prueba**

```bash
rm src/pages/_vocab.astro
```

No se commitea: era un andamio para mirar los tonos, no una página del sitio.

- [ ] **Step 5: Verificar el build**

```bash
pnpm build
```

Esperado: exit 0, y `dist/` sin `_vocab`.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css
git commit -m "Add the design system's component vocabulary to global.css

Section shells with the three sanctioned bands, the section head, the five
card tones, badges, icon plates, feature rows, and the secondary button
variant the system defines but global.css was missing.

Card tones keep the system's rule that a card carries a hairline border and
a soft shadow together, never one alone. Verified every tone and all
sixteen glyphs against the three bands before committing."
```

---

### Task 3: Línea Verde

**Files:**
- Create: `src/components/LineaVerde.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Icon.astro` (`accessibility`, `heart-handshake`, `clock`), y las clases de Task 2.
- Produces: `<section id="linea-verde">`, destino del ancla `#linea-verde` del nav.

- [ ] **Step 1: Crear `src/components/LineaVerde.astro`**

```astro
---
import Icon from './Icon.astro';

/* Sin columna de imagen: la única fotografía de vehículo que existe es el
   render del E10X y está en el hero. El design system prohíbe sustituir
   foto por ilustración, así que la sección se compone en vertical.
   La accesibilidad se describe como característica del servicio, nunca
   como caridad — regla de contenido del sistema. */
const FEATURES = [
  { icon: 'accessibility', label: 'Vehículos adaptados' },
  { icon: 'heart-handshake', label: 'Conductores formados' },
  { icon: 'clock', label: 'Reserva anticipada' },
];
---
<section class="section" id="linea-verde" aria-labelledby="linea-verde-title">
  <div class="section__inner">
    <div class="section-head">
      <span class="evir-eyebrow">Línea Verde</span>
      <h2 class="section-head__title" id="linea-verde-title">
        Movilidad que sí sirve para personas con discapacidad
      </h2>
      <p class="section-head__lead">
        Vehículos adaptados, conductores formados en atención inclusiva y tarifas
        justas. La Línea Verde es la promesa de que nadie se quede esperando en
        la acera.
      </p>
    </div>

    <ul class="lv__features">
      {FEATURES.map((f) => (
        <li class="card card--flat lv__feature">
          <Icon name={f.icon} size={22} />
          <span>{f.label}</span>
        </li>
      ))}
    </ul>

    <div class="card card--lime lv__alliance">
      <div>
        <strong class="lv__alliance-title">Buscamos apoyo institucional</strong>
        <p class="lv__alliance-text">
          Invitamos a entidades públicas, fundaciones y empresas a aliarse con la
          Línea Verde y promover el uso de estos vehículos.
        </p>
      </div>
      <a class="btn btn--secondary btn--md" href="#socio">Proponer una alianza</a>
    </div>
  </div>
</section>

<style>
  .lv__features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--space-5);
    margin: 0 0 var(--space-8);
    padding: 0;
    list-style: none;
  }

  /* Padding propio, más apretado que --card-pad: son etiquetas, no tarjetas
     de contenido. */
  .lv__feature {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-5);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-bold);
    color: var(--text-strong);
  }
  .lv__feature > svg { flex: 0 0 auto; color: var(--evir-lime-600); }

  .lv__alliance {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-5);
  }
  .lv__alliance-title {
    font-family: var(--font-display);
    font-size: var(--fs-h4);
  }
  /* Navy-800 en vez del navy-950 del texto sobre lima: baja un paso para
     que el título mande sobre el cuerpo, sin perder contraste. */
  .lv__alliance-text {
    margin: var(--space-2) 0 0;
    max-width: 46ch;
    font-size: var(--fs-body-sm);
    color: var(--evir-navy-800);
  }

  @media (max-width: 680px) {
    .lv__alliance { flex-direction: column; align-items: flex-start; }
    .lv__alliance .btn { align-self: stretch; }
  }
</style>
```

- [ ] **Step 2: Añadirla a `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
import LineaVerde from '../components/LineaVerde.astro';
---
<Layout>
  <Hero />
  <LineaVerde />
</Layout>
```

- [ ] **Step 3: Verificar build y contenido**

```bash
pnpm build
grep -c 'id="linea-verde"' dist/index.html                    # espera 1
grep -c 'nadie se quede esperando en la acera' dist/index.html # espera 1
grep -c 'Carro Milagro' dist/index.html                        # espera 0
grep -c '<h1' dist/index.html                                  # espera 1
```

- [ ] **Step 4: Detector de layout**

```bash
node "$HOME/.claude/skills/impeccable/scripts/detect.mjs" --json --scope layout src/components/LineaVerde.astro
```

Esperado: `[]`.

- [ ] **Step 5: Comprobación visual y regresión del hero**

A 1440×900 y 390×844: las tres etiquetas caben en una fila en desktop y se apilan en móvil; la franja lima pone el botón debajo del texto en móvil; el enlace `#linea-verde` del nav lleva a la sección.

A 1920×1080, el rect del coche del hero sigue siendo `[1011, 466, 880, 587]` y `scrollHeight` ya no es 1080 (la página ahora es más larga: eso es lo correcto).

- [ ] **Step 6: Commit**

```bash
git add src/components/LineaVerde.astro src/pages/index.astro
git commit -m "Add the Linea Verde section

Composed vertically instead of the design system kit's two columns: the
only vehicle photograph that exists is the E10X render and it is already
spent on the hero, and the system forbids substituting illustration for
photography.

Accessibility is described as a feature of the service, never as charity,
per the system's content rules."
```

---

### Task 4: Flota propia

**Files:**
- Create: `src/components/Flota.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: clases de Task 2. No usa `Icon.astro`.
- Produces: `<section id="flota">`. Sin ancla en el nav (decisión de la spec).

- [ ] **Step 1: Crear `src/components/Flota.astro`**

```astro
---
/* Reusa la misma ruta que el hero a propósito: el navegador ya la tiene en
   caché, así que la segunda aparición no cuesta una descarga. El
   tratamiento es distinto —panel ink, centrado, ficha de producto— para que
   no lea como el hero repetido.
   Las especificaciones son SOLO cualitativas: no hay cifras verificadas de
   autonomía, batería ni precio, y el proyecto no inventa cifras. */
const SPECS = [
  { value: 'Automático', label: 'Transmisión' },
  { value: '100% eléctrico', label: 'Motor' },
  { value: 'Nuevo', label: 'Estado' },
  { value: 'Flota propia', label: 'Titularidad' },
];
---
<section class="section section--sunken" id="flota" aria-labelledby="flota-title">
  <div class="section__inner">
    <div class="section-head">
      <span class="evir-eyebrow">Flota</span>
      <h2 class="section-head__title" id="flota-title">
        Somos propietarios de nuestra propia flota
      </h2>
      <p class="section-head__lead">
        No intermediamos vehículos ajenos: los vehículos son nuestros, nuevos,
        eléctricos y automáticos. Eso nos permite garantizar calidad,
        mantenimiento y condiciones justas para el conductor.
      </p>
    </div>

    <div class="card card--ink flota__panel">
      <img
        class="flota__car"
        src="/assets/carro-e10x.png"
        alt="JAC E10X, el vehículo de la flota de e-VIR"
        loading="lazy"
        decoding="async"
        width="1536"
        height="1024"
      />
      <div class="flota__meta">
        <h3 class="flota__name">JAC E10X</h3>
        <dl class="flota__specs">
          {SPECS.map((s) => (
            <div class="flota__spec">
              <dt class="flota__spec-label">{s.label}</dt>
              <dd class="flota__spec-value">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </div>
</section>

<style>
  .flota__panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
    padding: clamp(var(--space-7), 4vw, var(--space-11));
    border-radius: var(--radius-panel);
  }

  /* Tope del 60% del ancho del panel: bastante menor que en el hero, donde
     el coche llega al 45% del viewport completo. */
  .flota__car {
    width: min(60%, 560px);
    height: auto;
  }

  .flota__meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-5);
    width: 100%;
  }

  .flota__name {
    font-family: var(--font-display);
    font-size: var(--fs-h2);
    color: var(--text-inverse);
  }

  .flota__specs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-5);
    width: 100%;
    max-width: 720px;
    margin: 0;
    padding-top: var(--space-6);
    border-top: var(--border-hairline) solid var(--border-inverse);
    text-align: center;
  }

  .flota__spec { display: flex; flex-direction: column; gap: 4px; }

  .flota__spec-label {
    font-size: var(--fs-caption);
    font-weight: var(--fw-semibold);
    letter-spacing: var(--ls-eyebrow);
    text-transform: uppercase;
    color: var(--text-inverse-muted);
  }

  /* Mono tabular: es una especificación, y el sistema pide la fuente mono
     para datos. */
  .flota__spec-value {
    margin: 0;
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-size: var(--fs-body);
    font-weight: var(--fw-semibold);
    color: var(--text-inverse);
  }

  @media (max-width: 680px) {
    .flota__car { width: min(88%, 420px); }
    .flota__specs { grid-template-columns: 1fr 1fr; text-align: left; }
  }
</style>
```

- [ ] **Step 2: Añadirla a `index.astro`** después de `<LineaVerde />`.

- [ ] **Step 3: Verificar build y contenido**

```bash
pnpm build
grep -c 'id="flota"' dist/index.html                                # espera 1
grep -o 'JAC E10X' dist/index.html | wc -l                          # espera >=2 (hero alt + flota)
grep -o 'carro-e10x.png' dist/index.html | wc -l                    # espera 2
grep -Ec '320 km|18 kWh|\$[0-9]{3}\.[0-9]{3}' dist/index.html       # espera 0 — cero cifras inventadas
```

- [ ] **Step 4: Detector de layout**

```bash
node "$HOME/.claude/skills/impeccable/scripts/detect.mjs" --json --scope layout src/components/Flota.astro
```

Esperado: `[]`.

- [ ] **Step 5: Comprobación visual**

A 1440×900: el coche no supera 560px de ancho y el panel no lee como el hero. A 390×844: las especificaciones caen en dos columnas y siguen legibles. Regresión del hero a 1920×1080: coche en `[1011, 466, 880, 587]`.

Comprobar también en la pestaña de red que `carro-e10x.png` se descarga **una sola vez**.

- [ ] **Step 6: Commit**

```bash
git add src/components/Flota.astro src/pages/index.astro
git commit -m "Add the Flota propia section

The fleet is one model, the JAC E10X, so the section shows that vehicle
rather than the reference kit's three invented product-line cards. It reuses
the hero's image path, which the browser already has cached, under a
different treatment: an ink panel, centred, at 60% of the panel width
against the hero's 45% of the viewport.

Specs are qualitative only. There are no verified range, battery or price
figures for this vehicle and the project does not invent them."
```

---

### Task 5: Modelo de negocio

**Files:**
- Create: `src/components/Modelo.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Icon.astro` (`percent`, `message-circle`, `wallet`, `leaf`), clases de Task 2.
- Produces: `<section id="modelo">`, destino del ancla `#modelo`.

- [ ] **Step 1: Crear `src/components/Modelo.astro`**

```astro
---
import Icon from './Icon.astro';

/* El tercer punto se llamaba "Carro Milagro" en el kit de referencia. El
   nombre está retirado de todo el sitio por decisión del cliente, así que
   el mecanismo se describe sin bautizarlo. */
const ITEMS = [
  {
    icon: 'percent',
    title: 'Bajas comisiones',
    body: 'Plataforma de comisiones bajas para el conductor, en alianza con PideyDale. El ingreso se queda donde se genera.',
  },
  {
    icon: 'message-circle',
    title: 'IA sobre WhatsApp Business',
    body: 'Solicitudes, asignación y soporte operan sobre WhatsApp Business con inteligencia artificial: sin apps que descargar ni fricción para el usuario.',
  },
  {
    icon: 'wallet',
    title: 'Propiedad progresiva',
    body: 'Cada cuota que pagas construye propiedad, no gasto. Al finalizar el plan, el vehículo queda a tu nombre.',
  },
  {
    icon: 'leaf',
    title: 'Cero emisiones',
    body: 'Operación 100% eléctrica y silenciosa, alineada con la agenda de movilidad sostenible de la ciudad.',
  },
];
---
<section class="section" id="modelo" aria-labelledby="modelo-title">
  <div class="section__inner">
    <div class="section-head">
      <span class="evir-eyebrow">Modelo de negocio</span>
      <h2 class="section-head__title" id="modelo-title">
        Un modelo disruptivo, simple para quien lo usa
      </h2>
      <p class="section-head__lead">
        Tecnología donde suma y cero complejidad para el conductor y el pasajero.
      </p>
    </div>

    <ul class="modelo__grid">
      {ITEMS.map((i) => (
        <li class="card card--interactive modelo__item">
          <span class="icon-plate"><Icon name={i.icon} size={22} /></span>
          <h3 class="modelo__title">{i.title}</h3>
          <p class="modelo__body">{i.body}</p>
        </li>
      ))}
    </ul>
  </div>
</section>

<style>
  .modelo__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-5);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .modelo__item {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .modelo__title { font-size: var(--fs-h4); }
  .modelo__body {
    margin: 0;
    font-size: var(--fs-body-sm);
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 2: Añadirla a `index.astro`** después de `<Flota />`.

- [ ] **Step 3: Verificar build y contenido**

```bash
pnpm build
grep -c 'id="modelo"' dist/index.html          # espera 1
grep -c 'PideyDale' dist/index.html            # espera 1
grep -c 'Carro Milagro' dist/index.html        # espera 0
grep -c 'Propiedad progresiva' dist/index.html # espera 1
```

- [ ] **Step 4: Detector de layout**

```bash
node "$HOME/.claude/skills/impeccable/scripts/detect.mjs" --json --scope layout src/components/Modelo.astro
```

Esperado: `[]`.

- [ ] **Step 5: Comprobación visual**

A 1440×900 las cuatro tarjetas caen en una fila o en 2×2 sin que ninguna quede huérfana; el hover levanta 2px. A 390×844 se apilan. Regresión del hero.

- [ ] **Step 6: Commit**

```bash
git add src/components/Modelo.astro src/pages/index.astro
git commit -m "Add the Modelo de negocio section

Four cards: low commissions with PideyDale, AI over WhatsApp Business,
progressive ownership, zero emissions.

The ownership card was named 'Carro Milagro' in the reference kit. The name
is withdrawn from the whole site, so the mechanism is described without it."
```

---

### Task 6: Quiénes somos

**Files:**
- Create: `src/components/QuienesSomos.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Icon.astro` (`building-2`, `bike`, `globe`, `rocket`, `graduation-cap`, `landmark`, `users`), clases de Task 2.
- Produces: `<section id="quienes-somos">`, destino del ancla `#quienes-somos`.

- [ ] **Step 1: Crear `src/components/QuienesSomos.astro`**

```astro
---
import Icon from './Icon.astro';

/* La tarjeta de equipo y advisors del kit de referencia queda fuera: no hay
   nombres ni retratos, y el propio kit la cerraba con un "Pendiente:
   nombres, cargos y fotos". Cuatro avatares grises leen como sitio a medio
   terminar. Entra cuando exista el material. */
const CREDENTIALS = [
  {
    icon: 'building-2',
    title: 'Distracon S.A.S.',
    body: 'Compañía creada en 2002. Respaldo operativo y financiero del proyecto.',
  },
  {
    icon: 'bike',
    title: 'Viral Trans-E',
    body: 'Experiencia en micromovilidad sostenible con bicicletas eléctricas.',
  },
  {
    icon: 'globe',
    title: 'e-VIR Investments LLC',
    body: 'Sociedad registrada en Delaware, con operación en Florida, EE. UU.',
  },
];

const BACKING = [
  { icon: 'rocket', label: 'En proceso de aceleración con HubBog, Colombia' },
  { icon: 'graduation-cap', label: 'Equipo en nivel intermedio de máster en Inteligencia Artificial' },
  { icon: 'landmark', label: 'Con el apoyo de la Cámara de Comercio' },
  { icon: 'users', label: 'Red de inversionistas nacional e internacional' },
];
---
<section class="section section--sunken" id="quienes-somos" aria-labelledby="quienes-somos-title">
  <div class="section__inner qs">
    <div>
      <div class="section-head">
        <span class="evir-eyebrow">Quiénes somos</span>
        <h2 class="section-head__title" id="quienes-somos-title">
          Más de 30 años moviendo a Barranquilla
        </h2>
        <p class="section-head__lead">
          e-VIR nace del sector transporte, no de una presentación. Nuestro equipo
          lleva más de tres décadas operando transporte y micromovilidad
          sostenible con bicicletas eléctricas.
        </p>
      </div>

      <ul class="qs__credentials">
        {CREDENTIALS.map((c) => (
          <li class="card qs__credential">
            <span class="icon-plate icon-plate--sm"><Icon name={c.icon} size={19} /></span>
            <div>
              <h3 class="qs__credential-title">{c.title}</h3>
              <p class="qs__credential-body">{c.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>

    <div class="card qs__backing">
      <span class="evir-eyebrow">Respaldo y aceleración</span>
      <ul class="qs__backing-list">
        {BACKING.map((b) => (
          <li class="feature-row"><Icon name={b.icon} size={18} />{b.label}</li>
        ))}
      </ul>
    </div>
  </div>
</section>

<style>
  .qs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: clamp(var(--space-7), 5vw, var(--space-10));
    align-items: start;
  }

  .qs__credentials {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Padding más apretado que --card-pad: son filas de credencial, no
     tarjetas de contenido. */
  .qs__credential {
    display: flex;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-5);
  }
  .qs__credential-title { font-size: var(--fs-body); }
  .qs__credential-body {
    margin: 4px 0 0;
    font-size: var(--fs-body-sm);
    color: var(--text-muted);
  }

  .qs__backing {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
  }
  .qs__backing-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* La cabecera de sección solo ocupa media rejilla aquí, así que no
     necesita su medida de 680px. */
  .qs .section-head { max-width: none; margin-bottom: var(--space-7); }
</style>
```

- [ ] **Step 2: Añadirla a `index.astro`** después de `<Modelo />`.

- [ ] **Step 3: Verificar build y contenido**

```bash
pnpm build
grep -c 'id="quienes-somos"' dist/index.html   # espera 1
grep -c 'Distracon S.A.S.' dist/index.html     # espera 1
grep -c 'HubBog' dist/index.html               # espera 1
grep -Ec 'Fundador|Advisor|Operaciones' dist/index.html  # espera 0 — la tarjeta de equipo no entra
```

- [ ] **Step 4: Detector de layout**

```bash
node "$HOME/.claude/skills/impeccable/scripts/detect.mjs" --json --scope layout src/components/QuienesSomos.astro
```

Esperado: `[]`.

- [ ] **Step 5: Comprobación visual**

A 1440×900 las dos columnas están equilibradas y la tarjeta de respaldo se alinea arriba. A 390×844 se apila sin que las filas de respaldo se corten. Regresión del hero.

- [ ] **Step 6: Commit**

```bash
git add src/components/QuienesSomos.astro src/pages/index.astro
git commit -m "Add the Quienes somos section

Three credential cards - Distracon S.A.S. (2002), Viral Trans-E, e-VIR
Investments LLC - beside a backing card covering HubBog, the AI masters, the
Camara de Comercio and the investor network.

The reference kit's team and advisor card is left out. It has no names and no
portraits, and the kit itself closed it with a 'pending: names, roles and
photos' note; four grey avatars read as an unfinished site."
```

---

### Task 7: Expansión

**Files:**
- Create: `src/components/Expansion.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Icon.astro` (`map-pin`), clases de Task 2.
- Produces: `<section id="expansion">`, destino del ancla `#expansion`.

- [ ] **Step 1: Crear `src/components/Expansion.astro`**

```astro
---
import Icon from './Icon.astro';

/* Desviación deliberada del kit de referencia: cerraba con tres StatTile de
   25 / 200 / 4, que son exactamente los números que el hero ya muestra.
   Repetirlos dice lo mismo dos veces. La línea de fases aporta lo que el
   hero no puede dar —el cuándo— en una forma visual distinta. */
const COUNTRIES = [
  { name: 'Colombia', detail: 'Sede principal · Barranquilla', active: true },
  { name: 'Costa Rica', detail: 'Expansión inicial', active: false },
  { name: 'Panamá', detail: 'Expansión inicial', active: false },
  { name: 'Paraguay', detail: 'Expansión inicial', active: false },
];

const PHASES = [
  { date: 'Diciembre 2026', value: '25', label: 'vehículos en flota' },
  { date: 'Diciembre 2027', value: '200', label: 'vehículos en flota' },
];
---
<section class="section section--ink" id="expansion" aria-labelledby="expansion-title">
  <div class="section__inner">
    <div class="section-head">
      <span class="evir-eyebrow">Expansión</span>
      <h2 class="section-head__title" id="expansion-title">
        Empezamos en Barranquilla. Vamos por Latinoamérica.
      </h2>
      <p class="section-head__lead">
        Operación e inicio de actividades en Barranquilla, Colombia, con un plan
        de expansión regional por fases.
      </p>
    </div>

    <ul class="exp__countries">
      {COUNTRIES.map((c) => (
        <li class:list={['card', 'card--ink', 'exp__country', { 'exp__country--active': c.active }]}>
          <div class="exp__country-head">
            <Icon name="map-pin" size={18} />
            <h3 class="exp__country-name">{c.name}</h3>
          </div>
          <p class="exp__country-detail">{c.detail}</p>
        </li>
      ))}
    </ul>

    <ol class="exp__phases">
      {PHASES.map((p) => (
        <li class="exp__phase">
          <span class="exp__phase-date">{p.date}</span>
          <span class="exp__phase-value">{p.value}</span>
          <span class="exp__phase-label">{p.label}</span>
        </li>
      ))}
    </ol>
  </div>
</section>

<style>
  .exp__countries {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin: 0 0 var(--space-8);
    padding: 0;
    list-style: none;
  }
  .exp__country { padding: var(--space-5); }
  /* El único acento lima de la sección: marca el mercado activo. */
  .exp__country--active { border-color: var(--evir-lime-400); }
  .exp__country-head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-inverse-muted);
  }
  .exp__country--active .exp__country-head { color: var(--evir-lime-400); }
  .exp__country-name {
    font-family: var(--font-display);
    font-size: var(--fs-h4);
    color: var(--text-inverse);
  }
  .exp__country-detail {
    margin: var(--space-2) 0 0;
    font-size: var(--fs-body-sm);
    color: var(--text-inverse-muted);
  }

  /* Línea de fases: dos hitos con una regla que los une. La regla es
     estructura, no decoración — indica que hay una secuencia. */
  .exp__phases {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-7);
    margin: 0;
    padding: var(--space-7) 0 0;
    border-top: var(--border-hairline) solid var(--border-inverse);
    list-style: none;
    counter-reset: phase;
  }
  .exp__phase {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas: 'date date' 'value label';
    align-items: baseline;
    gap: 4px var(--space-3);
  }
  .exp__phase-date {
    grid-area: date;
    margin-bottom: var(--space-2);
    font-family: var(--font-sans);
    font-size: var(--fs-caption);
    font-weight: var(--fw-bold);
    letter-spacing: var(--ls-eyebrow);
    text-transform: uppercase;
    color: var(--evir-lime-400);
  }
  /* Misma familia y peso que las cifras del hero, para que los números de
     la página lean como un solo sistema. */
  .exp__phase-value {
    grid-area: value;
    font-family: var(--font-display);
    font-size: var(--fs-display-2);
    font-weight: var(--fw-extrabold);
    line-height: 1;
    letter-spacing: var(--ls-display);
    color: var(--text-inverse);
  }
  .exp__phase-label {
    grid-area: label;
    font-size: var(--fs-body-sm);
    color: var(--text-inverse-muted);
  }
</style>
```

- [ ] **Step 2: Añadirla a `index.astro`** después de `<QuienesSomos />`.

- [ ] **Step 3: Verificar build y contenido**

```bash
pnpm build
grep -c 'id="expansion"' dist/index.html      # espera 1
grep -c 'Costa Rica' dist/index.html          # espera 1
grep -c 'Diciembre 2026' dist/index.html      # espera 1
grep -c 'Países' dist/index.html              # espera 1 — solo el del hero, no repetido aquí
```

- [ ] **Step 4: Detector de layout**

```bash
node "$HOME/.claude/skills/impeccable/scripts/detect.mjs" --json --scope layout src/components/Expansion.astro
```

Esperado: `[]`.

- [ ] **Step 5: Comprobación visual**

A 1440×900: los cuatro países en una fila, Colombia con borde lima y el resto con hairline; las dos fases lado a lado bajo la regla. Comprobar que el lima de esta sección son solo dos acentos pequeños (borde activo y fechas), no un bloque. A 390×844 todo apilado. Regresión del hero.

- [ ] **Step 6: Commit**

```bash
git add src/components/Expansion.astro src/pages/index.astro
git commit -m "Add the Expansion section

Four country cards on the ink band, Colombia marked as the active market.

Deliberate deviation from the reference kit, which closed with three stat
tiles reading 25 / 200 / 4 - exactly the numbers the hero already shows.
A two-step phase line replaces them: it carries the dates the hero cannot,
in a different visual form, instead of saying the same thing twice."
```

---

### Task 8: Footer

**Files:**
- Create: `src/components/SiteFooter.astro`
- Add: `public/assets/evir-mark-lime.png`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: clases de Task 2.
- Produces: `<footer>` al final de la página.

- [ ] **Step 1: Copiar el asset del pájaro**

```bash
cp "/mnt/c/Users/cortiz/Downloads/E-VIR Design System.zip" /tmp/ds.zip
unzip -o -j /tmp/ds.zip "assets/evir-mark-lime.png" -d public/assets/
rm /tmp/ds.zip
ls -la public/assets/evir-mark-lime.png
```

Esperado: el archivo existe, ~106KB, 511×456. El design system exige que el pájaro se use tal cual: nunca recoloreado, nunca rotado, nunca con sombra, y nunca sobre lima.

- [ ] **Step 2: Crear `src/components/SiteFooter.astro`**

```astro
---
/* Columna Producto sin "Carro Milagro": el nombre está retirado de todo el
   sitio. Los enlaces apuntan a las secciones que existen de verdad; los que
   no tienen sección todavía van a #socio, que es el destino de contacto. */
const COLUMNS = [
  {
    title: 'Producto',
    links: [
      { label: 'Línea Verde', href: '#linea-verde' },
      { label: 'Flota', href: '#flota' },
      { label: 'Modelo de negocio', href: '#modelo' },
    ],
  },
  {
    title: 'Compañía',
    links: [
      { label: 'Quiénes somos', href: '#quienes-somos' },
      { label: 'Expansión', href: '#expansion' },
    ],
  },
  {
    title: 'Contacto',
    links: [
      { label: 'Ser socio', href: '#socio' },
      { label: 'Ser conductor', href: '#socio' },
    ],
  },
];
---
<footer class="footer">
  <div class="footer__inner">
    <div class="footer__brand">
      <img
        class="footer__mark"
        src="/assets/evir-mark-lime.png"
        alt="e-VIR"
        width="511"
        height="456"
        loading="lazy"
        decoding="async"
      />
      <p class="footer__desc">
        e-VIR — Electric Vehicle I/A Ride. Movilidad eléctrica sostenible,
        inclusiva e inteligente para Latinoamérica.
      </p>
      <p class="footer__legal">
        e-VIR Investments LLC · Delaware, EE. UU.<br />
        Sede de operación: Barranquilla, Colombia
      </p>
    </div>

    {COLUMNS.map((c) => (
      <nav class="footer__col" aria-label={c.title}>
        <span class="evir-eyebrow footer__col-title">{c.title}</span>
        {c.links.map((l) => (
          <a class="footer__link" href={l.href}>{l.label}</a>
        ))}
      </nav>
    ))}
  </div>

  <div class="footer__bar">
    <span>© 2026 e-VIR Investments LLC · Distracon S.A.S.</span>
    <span>Electric Vehicle I/A Ride</span>
  </div>
</footer>

<style>
  .footer {
    background: var(--surface-ink);
    color: var(--text-inverse-muted);
    border-top: var(--border-hairline) solid var(--border-inverse);
  }

  .footer__inner,
  .footer__bar {
    max-width: var(--container-max);
    margin: 0 auto;
    padding-inline: var(--gutter-inline);
  }

  .footer__inner {
    display: grid;
    grid-template-columns: minmax(240px, 1.4fr) repeat(3, minmax(130px, .8fr));
    gap: var(--space-8);
    padding-block: var(--space-10) var(--space-8);
  }

  .footer__brand { display: flex; flex-direction: column; gap: var(--space-4); }
  .footer__mark { align-self: flex-start; width: auto; height: 44px; }
  .footer__desc { margin: 0; max-width: 34ch; font-size: var(--fs-body-sm); }
  .footer__legal { margin: 0; font-size: var(--fs-caption); }

  .footer__col { display: flex; flex-direction: column; gap: var(--space-3); }
  .footer__col-title { color: var(--evir-lime-400); }
  .footer__link {
    color: var(--text-inverse-muted);
    font-size: var(--fs-body-sm);
    text-decoration: none;
  }
  .footer__link:hover { color: var(--evir-lime-300); }

  .footer__bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-4);
    padding-block: var(--space-5) var(--space-8);
    border-top: var(--border-hairline) solid var(--border-inverse);
    font-size: var(--fs-caption);
  }

  @media (max-width: 860px) {
    .footer__inner { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 520px) {
    .footer__inner { grid-template-columns: 1fr; gap: var(--space-7); }
  }
</style>
```

- [ ] **Step 3: Añadirlo a `index.astro`** después de `<Expansion />`.

- [ ] **Step 4: Verificar build y contenido**

```bash
pnpm build
grep -o 'Electric Vehicle I/A Ride' dist/index.html | wc -l   # espera 2
grep -c 'Carro Milagro' dist/index.html               # espera 0
grep -c 'evir-mark-lime.png' dist/index.html          # espera 1
test -f dist/assets/evir-mark-lime.png && echo "asset copiado"
```

- [ ] **Step 5: Detector de layout**

```bash
node "$HOME/.claude/skills/impeccable/scripts/detect.mjs" --json --scope layout src/components/SiteFooter.astro
```

Esperado: `[]`.

- [ ] **Step 6: Comprobación visual**

A 1440×900 las cuatro columnas están alineadas y el pájaro no se deforma (511×456, alto fijo 44px). A 390×844 una sola columna. Todos los enlaces del footer llevan a una sección que existe. Regresión del hero.

- [ ] **Step 7: Commit**

```bash
git add public/assets/evir-mark-lime.png src/components/SiteFooter.astro src/pages/index.astro
git commit -m "Add the site footer

Ink band with the lime bird mark, the product descriptor, the LLC and
operating-base lines, and three link columns.

The Producto column drops 'Carro Milagro' with the rest of the site. Every
link points at a section that actually exists; contact links go to #socio."
```

---

### Task 9: El compositor de WhatsApp

**Files:**
- Create: `src/config.ts`
- Create: `src/lib/whatsapp.ts`
- Create: `src/lib/whatsapp.test.ts`
- Create: `src/lib/leadForm.ts`
- Modify: `package.json` (devDependency `vitest`, script `test`)

**Interfaces:**
- Consumes: nada.
- Produces:
  - `WHATSAPP_NUMBER: string` desde `src/config.ts`
  - `type Intent = 'socio' | 'conductor'`
  - `interface LeadFields { nombre: string; correo: string; whatsapp: string; detalle: string }`
  - `buildMessage(intent: Intent, f: LeadFields): string`
  - `buildWhatsAppUrl(phone: string, intent: Intent, f: LeadFields): string | null` — devuelve `null` si `phone` no tiene dígitos.
  - `INTENT_COPY: Record<Intent, { title, lead, detalleLabel, submit }>` y `INTENT_OPTIONS: Record<Intent, string[]>` desde `src/lib/leadForm.ts`.
  - Task 10 consume `WHATSAPP_NUMBER`, `buildWhatsAppUrl`, `INTENT_COPY` e `INTENT_OPTIONS`. Los importa de verdad, tanto en el frontmatter como en el script de cliente, para que la función que corre en el navegador sea exactamente la que cubren los tests.

Vitest entra solo por este módulo: es la única lógica de la página y es el camino de conversión, donde un bug silencioso pierde contactos.

- [ ] **Step 1: Instalar vitest y declarar el script**

```bash
pnpm add -D vitest
```

En `package.json`, dentro de `"scripts"`, añade:

```json
"test": "vitest run"
```

- [ ] **Step 2: Escribir el test que falla**

Crear `src/lib/whatsapp.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildMessage, buildWhatsAppUrl, type LeadFields } from './whatsapp';

const FIELDS: LeadFields = {
  nombre: 'María Fernanda Rojas',
  correo: 'maria@correo.com',
  whatsapp: '+57 300 000 0000',
  detalle: 'Alianza institucional (Línea Verde)',
};

describe('buildMessage', () => {
  it('abre distinto según la intención', () => {
    expect(buildMessage('socio', FIELDS)).toContain('ser socio');
    expect(buildMessage('conductor', FIELDS)).toContain('conducir');
  });

  it('incluye los cuatro campos', () => {
    const msg = buildMessage('socio', FIELDS);
    expect(msg).toContain('María Fernanda Rojas');
    expect(msg).toContain('maria@correo.com');
    expect(msg).toContain('+57 300 000 0000');
    expect(msg).toContain('Alianza institucional (Línea Verde)');
  });
});

describe('buildWhatsAppUrl', () => {
  it('devuelve null si no hay número configurado', () => {
    expect(buildWhatsAppUrl('', 'socio', FIELDS)).toBeNull();
    expect(buildWhatsAppUrl('   ', 'socio', FIELDS)).toBeNull();
    expect(buildWhatsAppUrl('+ ()-', 'socio', FIELDS)).toBeNull();
  });

  it('deja solo dígitos en el número', () => {
    const url = buildWhatsAppUrl('+57 (300) 000-0000', 'socio', FIELDS);
    expect(url).toMatch(/^https:\/\/wa\.me\/573000000000\?text=/);
  });

  it('codifica acentos, saltos de línea y paréntesis', () => {
    const url = buildWhatsAppUrl('573000000000', 'socio', FIELDS)!;
    expect(url).not.toContain(' ');
    expect(url).not.toContain('\n');
    expect(url).toContain('%0A');
    expect(decodeURIComponent(url.split('?text=')[1])).toContain('María');
  });
});
```

- [ ] **Step 3: Ejecutar el test y confirmar que falla**

```bash
pnpm test
```

Esperado: FAIL — no se puede resolver `./whatsapp`.

- [ ] **Step 4: Escribir la implementación mínima**

Crear `src/config.ts`:

```ts
/* Número de WhatsApp Business al que llegan los formularios de Ser socio.
   Formato: solo dígitos con indicativo de país, sin '+' ni espacios.
   Ejemplo: '573000000000'.
   Mientras esté vacío, el formulario se renderiza deshabilitado en vez de
   fingir un envío que se pierde. */
export const WHATSAPP_NUMBER = '';
```

Crear `src/lib/whatsapp.ts`:

```ts
export type Intent = 'socio' | 'conductor';

export interface LeadFields {
  nombre: string;
  correo: string;
  whatsapp: string;
  /** Tipo de participación (socio) o ciudad donde conduce (conductor). */
  detalle: string;
}

const OPENING: Record<Intent, string> = {
  socio: 'Hola, quiero ser socio de e-VIR.',
  conductor: 'Hola, quiero conducir con e-VIR.',
};

const DETAIL_LABEL: Record<Intent, string> = {
  socio: 'Tipo de participación',
  conductor: 'Ciudad',
};

export function buildMessage(intent: Intent, f: LeadFields): string {
  return [
    OPENING[intent],
    '',
    `Nombre: ${f.nombre}`,
    `Correo: ${f.correo}`,
    `WhatsApp: ${f.whatsapp}`,
    `${DETAIL_LABEL[intent]}: ${f.detalle}`,
  ].join('\n');
}

/**
 * Devuelve la URL de wa.me, o null si no hay un número configurado.
 * El null es lo que la UI usa para deshabilitar el envío.
 */
export function buildWhatsAppUrl(
  phone: string,
  intent: Intent,
  f: LeadFields
): string | null {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(buildMessage(intent, f))}`;
}
```

- [ ] **Step 5: Ejecutar los tests y confirmar que pasan**

```bash
pnpm test
```

Esperado: 5 tests PASS.

- [ ] **Step 6: Crear `src/lib/leadForm.ts`**

Fuente única del copy y las opciones del formulario, para que el frontmatter
de Astro y el script de cliente lean lo mismo y no puedan divergir.

```ts
import type { Intent } from './whatsapp';

export const INTENT_COPY: Record<
  Intent,
  { title: string; lead: string; detalleLabel: string; submit: string }
> = {
  socio: {
    title: 'Sé socio de e-VIR',
    lead: 'Invitamos a inversionistas y aliados institucionales a hacer parte de la expansión de e-VIR en Latinoamérica. Déjanos tus datos y te contactamos.',
    detalleLabel: 'Tipo de participación',
    submit: 'Quiero ser socio',
  },
  conductor: {
    title: 'Sé conductor asociado',
    lead: 'Si conduces, e-VIR te entrega un vehículo eléctrico nuevo y automático, con bajas comisiones y un camino real a la propiedad. Déjanos tus datos.',
    detalleLabel: 'Ciudad donde conduces',
    submit: 'Quiero conducir',
  },
};

export const INTENT_OPTIONS: Record<Intent, string[]> = {
  socio: [
    'Inversionista individual',
    'Fondo o red de inversión',
    'Alianza institucional (Línea Verde)',
    'Aliado corporativo',
  ],
  conductor: [
    'Barranquilla',
    'Otra ciudad de Colombia',
    'Costa Rica',
    'Panamá',
    'Paraguay',
  ],
};
```

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml src/config.ts src/lib/whatsapp.ts src/lib/whatsapp.test.ts src/lib/leadForm.ts
git commit -m "Add the WhatsApp lead composer

Pure module that turns the Ser socio form into a wa.me URL, with vitest
covering it. This is the only real logic on the page and it is the
conversion path, so it gets actual tests rather than a visual check.

buildWhatsAppUrl returns null when no number is configured. The number
lives in one constant in src/config.ts and is empty for now: the client
does not have it yet, so the form will render disabled rather than pretend
to send."
```

---

### Task 10: Ser socio

**Files:**
- Create: `src/components/SerSocio.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `WHATSAPP_NUMBER` de `src/config.ts`, `buildWhatsAppUrl` de `src/lib/whatsapp.ts`, `Icon.astro` (`mail`, `message-circle`), clases de Task 2.
- Produces: `<section id="socio">`, destino del CTA del hero, del nav y del footer.

Es la única sección con estado: tabs, acordeón y submit. Todo en un `<script>` al final del componente, sin framework, igual que el toggle del nav.

- [ ] **Step 1: Crear `src/components/SerSocio.astro`**

```astro
---
import Icon from './Icon.astro';
import { WHATSAPP_NUMBER } from '../config';
import { INTENT_COPY, INTENT_OPTIONS } from '../lib/leadForm';

/* La primera pregunta se llamaba "¿Qué es el Carro Milagro?" en el kit de
   referencia. El nombre está retirado, así que pregunta por el mecanismo. */
const FAQ = [
  {
    q: '¿Cómo funciona la propiedad progresiva?',
    a: 'Con el mismo esfuerzo diario que hoy dedicas a un alquiler, al terminar el plan el vehículo queda a tu nombre.',
  },
  {
    q: '¿Cómo funciona la plataforma?',
    a: 'Operamos con inteligencia artificial sobre WhatsApp Business y con comisiones bajas, en alianza con PideyDale. No necesitas descargar nada.',
  },
  {
    q: '¿Qué respaldo tiene e-VIR?',
    a: 'Más de 30 años de experiencia en transporte, Distracon S.A.S. (2002), Viral Trans-E en micromovilidad, e-VIR Investments LLC (Delaware) y acompañamiento de HubBog y la Cámara de Comercio.',
  },
  {
    q: '¿Qué es la Línea Verde?',
    a: 'Es nuestra línea de vehículos adaptados para personas con discapacidad, con conductores formados en atención inclusiva. Buscamos aliados institucionales para ampliarla.',
  },
];

const configured = WHATSAPP_NUMBER.replace(/\D/g, '').length > 0;
const initial = INTENT_COPY.socio;
---
<section class="section" id="socio" aria-labelledby="socio-title">
  <div class="section__inner ss">
    <div>
      <div class="section-head">
        <span class="evir-eyebrow">Súmate</span>
        <h2 class="section-head__title" id="socio-title" data-title>{initial.title}</h2>
        <p class="section-head__lead" data-lead>{initial.lead}</p>
      </div>

      <div class="ss__faq">
        {FAQ.map((item, i) => (
          <div class="ss__faq-item">
            <h3 class="ss__faq-heading">
              <button
                type="button"
                class="ss__faq-trigger"
                aria-expanded={i === 0 ? 'true' : 'false'}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
              >
                <span>{item.q}</span>
                <span class="ss__faq-glyph" aria-hidden="true">+</span>
              </button>
            </h3>
            <div
              class="ss__faq-panel"
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              hidden={i !== 0}
            >
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <form class="card ss__form" data-form novalidate>
      <!-- role="group" con aria-pressed, no role="tablist": estos botones no
           cambian de panel, mutan este mismo formulario. Un tablist obliga a
           navegación por flechas y a asociar tabpanels; declararlo sin eso es
           peor que no poner ARIA. -->
      <div class="ss__tabs" role="group" aria-label="Tipo de solicitud">
        <button type="button" class="ss__tab" aria-pressed="true" data-intent="socio">
          Ser socio
        </button>
        <button type="button" class="ss__tab" aria-pressed="false" data-intent="conductor">
          Ser conductor
        </button>
      </div>

      <label class="ss__field">
        <span class="ss__label">Nombre completo</span>
        <input class="ss__input" name="nombre" type="text" autocomplete="name" required placeholder="María Fernanda Rojas" />
      </label>

      <label class="ss__field">
        <span class="ss__label">Correo</span>
        <span class="ss__input-wrap">
          <Icon name="mail" size={18} />
          <input class="ss__input" name="correo" type="email" autocomplete="email" required placeholder="tu@correo.com" />
        </span>
      </label>

      <label class="ss__field">
        <span class="ss__label">WhatsApp</span>
        <span class="ss__input-wrap">
          <Icon name="message-circle" size={18} />
          <input class="ss__input" name="whatsapp" type="tel" autocomplete="tel" required placeholder="+57 300 000 0000" />
        </span>
      </label>

      <label class="ss__field">
        <span class="ss__label" data-detalle-label>{initial.detalleLabel}</span>
        <select class="ss__input ss__select" name="detalle" data-detalle>
          {INTENT_OPTIONS.socio.map((o) => <option value={o}>{o}</option>)}
        </select>
      </label>

      <label class="ss__consent">
        <input type="checkbox" name="consent" data-consent />
        <span>
          Autorizo el tratamiento de mis datos.
          <span class="ss__consent-note">Puedes revocarlo en cualquier momento.</span>
        </span>
      </label>

      <button type="submit" class="btn btn--primary btn--lg ss__submit" data-submit disabled>
        <span data-submit-label>{initial.submit}</span>
      </button>

      {!configured && (
        <p class="ss__pending" role="status">
          El canal de WhatsApp todavía no está configurado. Escríbenos mientras tanto
          al correo de contacto.
        </p>
      )}
    </form>
  </div>

  <script>
    /* Script empaquetado, no is:inline: así puede importar de verdad el
       módulo que los tests cubren, en vez de duplicar la lógica en cliente.
       Sin framework, igual que el toggle del nav. */
    import { WHATSAPP_NUMBER } from '../config';
    import { buildWhatsAppUrl, type Intent } from '../lib/whatsapp';
    import { INTENT_COPY, INTENT_OPTIONS } from '../lib/leadForm';

    const form = document.querySelector<HTMLFormElement>('[data-form]');

    if (form) {
      const section = form.closest('section')!;
      const titleEl = section.querySelector('[data-title]')!;
      const leadEl = section.querySelector('[data-lead]')!;
      const detalleLabel = form.querySelector('[data-detalle-label]')!;
      const detalle = form.querySelector<HTMLSelectElement>('[data-detalle]')!;
      const consent = form.querySelector<HTMLInputElement>('[data-consent]')!;
      const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
      const submitLabel = form.querySelector('[data-submit-label]')!;
      const tabs = [...form.querySelectorAll<HTMLButtonElement>('.ss__tab')];
      const configured = WHATSAPP_NUMBER.replace(/\D/g, '').length > 0;

      let intent: Intent = 'socio';

      const syncSubmit = () => {
        submit.disabled = !consent.checked || !configured;
      };

      const applyIntent = (next: Intent) => {
        intent = next;
        const c = INTENT_COPY[intent];
        titleEl.textContent = c.title;
        leadEl.textContent = c.lead;
        detalleLabel.textContent = c.detalleLabel;
        submitLabel.textContent = c.submit;
        detalle.replaceChildren(
          ...INTENT_OPTIONS[intent].map((o) => {
            const opt = document.createElement('option');
            opt.value = o;
            opt.textContent = o;
            return opt;
          })
        );
        tabs.forEach((t) =>
          t.setAttribute('aria-pressed', String(t.dataset.intent === intent))
        );
      };

      tabs.forEach((t) => {
        t.addEventListener('click', () => applyIntent(t.dataset.intent as Intent));
      });

      consent.addEventListener('change', syncSubmit);
      syncSubmit();

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const data = new FormData(form);
        const url = buildWhatsAppUrl(WHATSAPP_NUMBER, intent, {
          nombre: String(data.get('nombre') ?? ''),
          correo: String(data.get('correo') ?? ''),
          whatsapp: String(data.get('whatsapp') ?? ''),
          detalle: String(data.get('detalle') ?? ''),
        });
        if (url) window.open(url, '_blank', 'noopener');
      });

      /* Acordeón: uno abierto a la vez. aria-expanded y hidden se mueven
         siempre juntos. */
      const triggers = [
        ...section.querySelectorAll<HTMLButtonElement>('.ss__faq-trigger'),
      ];
      triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
          const wasOpen = trigger.getAttribute('aria-expanded') === 'true';
          triggers.forEach((t) => {
            t.setAttribute('aria-expanded', 'false');
            const panel = document.getElementById(t.getAttribute('aria-controls')!);
            if (panel) panel.hidden = true;
          });
          if (!wasOpen) {
            trigger.setAttribute('aria-expanded', 'true');
            const panel = document.getElementById(
              trigger.getAttribute('aria-controls')!
            );
            if (panel) panel.hidden = false;
          }
        });
      });
    }
  </script>
</section>

<style>
  .ss {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: clamp(var(--space-7), 4vw, var(--space-9));
    align-items: start;
  }
  .ss .section-head { max-width: none; margin-bottom: var(--space-7); }

  /* ---- FAQ ---- */
  .ss__faq { display: flex; flex-direction: column; gap: var(--space-3); }
  .ss__faq-item {
    border: var(--border-hairline) solid var(--border-subtle);
    border-radius: var(--radius-card);
    background: var(--surface-card);
  }
  .ss__faq-heading { margin: 0; }
  .ss__faq-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-5);
    width: 100%;
    padding: var(--space-5) var(--space-6);
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    font-family: var(--font-display);
    font-size: var(--fs-h4);
    font-weight: var(--fw-semibold);
    letter-spacing: var(--ls-heading);
    color: var(--text-strong);
  }
  /* El glifo rota 45° hasta ser una ×. Es una de las dos marcas mecánicas
     que el sistema permite en unicode. */
  .ss__faq-glyph {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-pill);
    background: var(--surface-muted);
    color: var(--evir-navy-950);
    font-size: 18px;
    line-height: 1;
    transition: transform var(--dur-base) var(--ease-out),
                background var(--dur-base) var(--ease-standard);
  }
  .ss__faq-trigger[aria-expanded='true'] .ss__faq-glyph {
    transform: rotate(45deg);
    background: var(--surface-lime);
  }
  .ss__faq-panel { padding: 0 var(--space-6) var(--space-6); }
  .ss__faq-panel p {
    margin: 0;
    max-width: 62ch;
    font-size: var(--fs-body);
    color: var(--text-muted);
  }

  /* ---- Form ---- */
  .ss__form { display: flex; flex-direction: column; gap: var(--space-5); }

  .ss__tabs {
    display: inline-flex;
    align-self: flex-start;
    gap: 4px;
    padding: 4px;
    border-radius: var(--radius-pill);
    background: var(--surface-muted);
  }
  .ss__tab {
    padding: 8px 18px;
    border: none;
    border-radius: var(--radius-pill);
    background: transparent;
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-bold);
    color: var(--text-body);
    transition: background var(--dur-fast) var(--ease-standard),
                color var(--dur-fast) var(--ease-standard);
  }
  /* Seleccionado es navy sólido, nunca lima: regla del sistema para chips. */
  .ss__tab[aria-pressed='true'] {
    background: var(--action-secondary-bg);
    color: var(--action-secondary-fg);
  }

  .ss__field { display: flex; flex-direction: column; gap: var(--space-2); }
  .ss__label {
    font-size: var(--fs-body-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-body);
  }

  .ss__input-wrap { position: relative; display: block; }
  .ss__input-wrap > svg {
    position: absolute;
    top: 50%;
    left: 14px;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }
  .ss__input-wrap .ss__input { padding-left: 42px; }

  .ss__input {
    width: 100%;
    padding: 13px 16px;
    border: var(--border-emphasis) solid var(--border-default);
    border-radius: var(--radius-input);
    background: var(--surface-card);
    font-family: var(--font-sans);
    font-size: var(--fs-body);
    color: var(--text-body);
  }
  .ss__input::placeholder { color: var(--text-subtle); }
  .ss__input:focus-visible {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
    box-shadow: var(--shadow-ring-focus);
  }

  /* Se conserva el caret nativo del navegador a propósito: con
     appearance:none el select se quedaba sin ningún indicador de que es
     desplegable. El sistema permite el glifo ▾ como sustituto, pero el
     nativo ya es accesible y consistente por plataforma. */
  .ss__select { padding-right: var(--space-5); }

  .ss__consent {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    font-size: var(--fs-body-sm);
    color: var(--text-body);
  }
  .ss__consent input { margin-top: 3px; accent-color: var(--evir-lime-500); }
  .ss__consent-note { display: block; color: var(--text-muted); }

  .ss__submit { width: 100%; }
  .ss__submit:disabled {
    background: var(--action-disabled-bg);
    border-color: var(--action-disabled-bg);
    color: var(--action-disabled-fg);
    box-shadow: none;
    cursor: not-allowed;
  }

  .ss__pending {
    margin: 0;
    font-size: var(--fs-caption);
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 2: Añadirla a `index.astro`** entre `<Expansion />` y `<SiteFooter />`.

- [ ] **Step 3: Verificar build y contenido**

```bash
pnpm build
grep -c 'id="socio"' dist/index.html                       # espera 1
grep -c 'propiedad progresiva' dist/index.html             # espera >=1
grep -c 'Carro Milagro' dist/index.html                    # espera 0
grep -o '<label' dist/index.html | wc -l                   # espera >=5 — cada campo con label
grep -o 'aria-expanded' dist/index.html | wc -l            # espera >=5 — 4 del FAQ + toggle del nav
```

- [ ] **Step 4: Probar la interacción en el navegador**

Con `WHATSAPP_NUMBER = ''`:

- El submit está deshabilitado incluso marcando la casilla, y se ve el aviso de canal no configurado.
- Los dos botones de modo cambian el título, el lead, la etiqueta del select, sus opciones y el texto del botón, y `aria-pressed` los sigue.
- El acordeón abre uno a la vez; el `+` rota a `×` y su fondo pasa a lima.
- `aria-expanded` y `hidden` se mueven juntos.
- Tab recorre tabs → campos → casilla → submit, y el foco siempre se ve.

Luego, temporalmente, pon `WHATSAPP_NUMBER = '573000000000'`, recarga y comprueba que al enviar con la casilla marcada se abre `wa.me/573000000000?text=…` con los cuatro campos en el mensaje. **Devuelve la constante a `''` antes de commitear.**

- [ ] **Step 5: Detector de layout**

```bash
node "$HOME/.claude/skills/impeccable/scripts/detect.mjs" --json --scope layout src/components/SerSocio.astro
```

Esperado: `[]`.

- [ ] **Step 6: Commit**

```bash
git add src/components/SerSocio.astro src/pages/index.astro
git commit -m "Add the Ser socio section

Tabs switch the whole pitch between investor and driver: title, lead, select
label, options and button. The FAQ is an accordion with one panel open at a
time, driven by aria-expanded and hidden together. Submit composes the lead
into a wa.me message.

The submit stays disabled while no WhatsApp number is configured, with a
visible note, rather than pretending to send. Every field has a real label,
not just a placeholder."
```

---

### Task 11: Verificación completa

**Files:**
- Modify: cualquiera que la verificación revele roto.

**Interfaces:**
- Consumes: la página entera.
- Produces: nada nuevo. Es la puerta de salida.

- [ ] **Step 1: Regresión del hero, numérica**

En el navegador, para cada viewport, comprobar que estos valores no se movieron respecto a los que el hero tenía antes de esta rama:

El ápice de la cuña y el tamaño del titular usan `vh`/`vw`, que ignoran la
barra de scroll, así que esos sí son estables en píxeles. El rect del coche
depende de `%`, así que se comprueba por proporción.

| Viewport | ápice cuña | headline | proporciones del coche |
|---|---|---|---|
| 1920×1080 | 72.1% | 77.76px | 45.83 / 1.5 / 2.5 |
| 1920×780 | 65.5% | 65.52px | 45.83 / 1.5 / 2.5 |
| 1440×900 | 67.2% | 58.32px | 45.83 / 1.5 / 2.5 |
| 1366×768 | 72.0% | 55.32px | 45.83 / 1.5 / 2.5 |
| 2560×1080 | 66.4% | 90.72px | 45.83 / 1.5 / 2.5 |

(ancho / margen derecho / margen inferior, en % del canvas. En 1366×1024 y por
debajo de 1.5:1 de aspecto el ancho sube por el término `vh`; ahí solo se
comprueban los márgenes 1.5 / 2.5 y la ausencia de overflow.)

Cualquier desviación significa que algo del vocabulario nuevo se filtró al hero. Búscalo antes de seguir.

- [ ] **Step 2: Barrido visual de la página completa**

Captura de página completa en 1920×1080, 1440×900, 1366×768, 1366×1024, 1024×1366, 390×844. Revisa en cada una:

- Ninguna banda ink aparece dos veces seguidas.
- El ritmo paper → sunken → paper → sunken → ink → paper → ink se lee.
- Ninguna sección tiene scroll horizontal.
- Ninguna tarjeta queda huérfana en su rejilla (una sola en la última fila de cuatro).
- El lima está racionado: como mucho un elemento lima grande por vista.

- [ ] **Step 3: Accesibilidad**

```bash
pnpm build
grep -c '<h1' dist/index.html      # espera exactamente 1
grep -o 'aria-labelledby' dist/index.html | wc -l  # espera >=6, una por sección
```

En el navegador: recorrer toda la página con Tab y confirmar que el foco siempre es visible y que el orden sigue el orden visual. Comprobar contraste del texto de cuerpo sobre las tres bandas.

- [ ] **Step 4: Reglas de copy del design system**

```bash
# Emoji: rangos unicode en python, que no dependen del locale del shell.
python3 -c "
import re,sys
html=open('dist/index.html',encoding='utf-8').read()
emoji=re.findall(r'[\U0001F000-\U0001FAFF\u2600-\u27BF]',html)
print('emoji:',len(emoji),emoji[:5])
print('exclamaciones:',html.count('!'))
print('usted:',len(re.findall(r'\busted\b',html,re.I)))
print('carro milagro:',len(re.findall(r'carro milagro',html,re.I)))
"
```

Esperado: `emoji: 0`, `exclamaciones` como máximo 1, `usted: 0`, `carro milagro: 0`.

Revisar a mano que ningún titular pase de 9 palabras y ningún lead de 28.

- [ ] **Step 5: Detector y build final**

```bash
node "$HOME/.claude/skills/impeccable/scripts/detect.mjs" --json --scope layout src/components src/styles
pnpm build
pnpm test
```

Esperado: `[]`, exit 0, tests en verde.

- [ ] **Step 6: Commit de cualquier arreglo**

```bash
git add -A
git commit -m "Fix findings from the full-page verification pass

<describe cada arreglo concreto; si no hubo ninguno, no hagas este commit>"
```

---

## Dependencias abiertas al terminar

Ninguna bloquea el plan. Quedan anotadas para el cliente:

1. **Número de WhatsApp** — una línea en `src/config.ts`. Hasta entonces el formulario está deshabilitado a propósito.
2. **Fotografía** — el cliente aportará más imágenes. Línea Verde, Quiénes somos y Flota están construidas para admitirlas sin rediseño.
3. **Nombres y retratos de equipo y advisor** — la tarjeta correspondiente entra cuando existan.
4. **Ancla de Flota en el nav** — la sección existe sin enlace. Pendiente de confirmar con el cliente.
5. **Peso de `carro-e10x.png`** — 1,8MB sin optimizar, y ahora carga en la misma página que el hero (una sola descarga, pero pesada). Comprimirlo o servirlo en webp afecta también al hero, así que es un cambio propio.
