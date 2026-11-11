import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';

const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
const site = env.SITE_URL || 'https://heliumboom.github.io';

export default defineConfig({
  site,
  base: env.SITE_BASE || new URL(site).pathname,
  trailingSlash: 'always',
  redirects: { '/archives': '/posts/', '/timeline': '/posts/' },
  compressHTML: true,
  integrations: [vue()],
  vite: { plugins: [tailwindcss()] },
});
