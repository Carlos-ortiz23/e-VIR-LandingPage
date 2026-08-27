import { defineConfig } from 'astro/config';

export default defineConfig({
  // Las redes sociales exigen URLs absolutas en og:image y og:url: una ruta
  // relativa no la resuelve ningún scraper. Astro las construye a partir de
  // este valor, así que el dominio real debe vivir aquí.
  site: 'https://evirlatam.com',
  vite: { build: { cssTarget: 'safari15' } },
});
