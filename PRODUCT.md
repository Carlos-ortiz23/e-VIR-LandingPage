# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Conductores de plataformas de transporte y delivery (Uber, DiDi, apps de reparto) que necesitan un vehículo para trabajar pero no pueden o no quieren afrontar el costo inicial de comprar uno. Buscan un vehículo confiable, económico de operar (eléctrico) y un camino realista hacia la propiedad sin barrera de entrada financiera.

## Product Purpose

e-VIR pone vehículos eléctricos nuevos y automáticos en manos de conductores de plataformas mediante un programa de renta con opción a compra ("Socio"): el conductor usa el carro desde el día uno pagando una cuota periódica, sin cuota inicial ($0), y al cumplir el plazo del programa se convierte en dueño del vehículo. Éxito = conductores activos generando ingresos con el carro desde el primer día y completando el camino hacia la propiedad.

## Positioning

A diferencia de comprar o financiar un carro tradicional (cuota inicial alta, trámites de crédito) o de una suscripción pura (nunca eres dueño), e-VIR combina uso inmediato sin pago inicial con propiedad real al final del plazo, usando vehículos eléctricos (menor costo operativo para alguien que maneja todo el día) en vez de combustión.

## Operating Context

- El sitio actual solo cubre la pantalla "hero" (nav + contenido + stats + carro). El nav ya tiene anclas a secciones futuras aún no construidas: `#carro-milagro` (Carro Milagro), `#linea-verde` (Línea Verde), `#modelo` (Modelo), `#quienes-somos` (Quiénes somos), `#expansion` (Expansión), `#socio` (Ser socio / Quiero mi e-VIR).
- Idioma del sitio: español (mercado hispanohablante).
- Vehículo mostrado en el hero: un modelo eléctrico automático (referenciado en el asset como "e10x" / JMEV en la copia previa de migración).

## Capabilities and Constraints

- Programa "Socio": renta con opción a compra, $0 de cuota inicial, el conductor se vuelve dueño al completar el plazo. Términos exactos del plazo, cuotas y condiciones aún no están definidos/confirmados — no inventar cifras de financiamiento.
- Operación multipaís: el copy actual referencia una meta de expansión a varios países, pero las cifras concretas (número de países, tamaño de flota por año) son aspiracionales/placeholder, no compromisos de negocio confirmados. No tratarlas como hechos duros en trabajo futuro; confirmar antes de citarlas como reales en nuevas secciones.
- Tecnológicamente: sitio estático Astro (sin framework de UI adicional, sin SSR), CSS con sistema de tokens propio (`src/styles/`).

## Brand Commitments

- Nombre: e-VIR.
- Tagline: "Vuela como un canario" — voz de marca en torno a silencio, suavidad y libertad (headline actual: "Silencioso. Suave. Libre.").
- Paleta y tokens de marca ya establecidos en `src/styles/colors.css` (verde lima como color de acción/marca sobre fondo navy oscuro en el hero).

## Evidence on Hand

- Assets reales en `public/assets/`: logo (`evir-logo-cropped.png`, `evir-icon.png`) y foto/render del vehículo (`carro-e10x.png`).
- No hay testimonios, casos de estudio, prensa ni datos de clientes reales todavía — no fabricar ninguno en trabajo futuro.
- Cifras del hero (25 flota 2026, 200 flota 2027, 4 países, $0 cuota inicial) son placeholders aspiracionales confirmados como tales por el usuario, no datos de negocio cerrados.

## Product Principles

1. La barrera de entrada cero (sin cuota inicial) es la promesa central — cualquier nueva sección o copy debe reforzarla, no diluirla.
2. El conductor de plataforma es el usuario, no el consumidor general ni la empresa de flotas — el lenguaje y los casos de uso deben hablarle a alguien que gana dinero manejando.
3. La propiedad real al final del plazo es lo que diferencia a e-VIR de una suscripción; nunca presentar el programa como "solo renta".
4. No inventar cifras de negocio, testimonios ni cobertura geográfica — las cifras actuales son ilustrativas hasta que se confirmen.
5. Cambios visuales o de comportamiento fuera del hero deben construir sobre el sistema de tokens existente (`src/styles/`), no crear uno paralelo.
