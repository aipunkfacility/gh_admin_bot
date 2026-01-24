import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://greenhill-tours.vn/',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),

  integrations: [sitemap()],

  build: {
    assets: 'assets'
  },

  vite: {
    plugins: [tailwindcss()]
  },

  security: {
    checkOrigin: true
  }
});