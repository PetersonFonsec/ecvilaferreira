// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// URL pública do site. Defina SITE_URL na Vercel quando o domínio oficial existir.
const site = process.env.SITE_URL ?? 'https://ecvilaferreira.vercel.app';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
  integrations: [sitemap()],
});
