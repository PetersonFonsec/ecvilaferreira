// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// URL pública do site, usada em canonical, Open Graph e sitemap.
// Na Vercel, VERCEL_PROJECT_PRODUCTION_URL já traz o domínio de produção (o próprio, quando configurado).
// SITE_URL, se definida, tem prioridade.
const dominioVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site =
  process.env.SITE_URL ?? (dominioVercel ? `https://${dominioVercel}` : 'https://ecvilaferreira.vercel.app');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
  integrations: [sitemap({ filter: (pagina) => !/\/offline\/?$/.test(pagina) })],
  vite: {
    // O three.js (brasão 3D) fica num pedaço separado, baixado só na home e depois do carregamento.
    build: { chunkSizeWarningLimit: 700 },
  },
});
