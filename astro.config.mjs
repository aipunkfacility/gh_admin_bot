// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // site: 'https://aipunkfacility.github.io',
  // base: '/gh_static/',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),

  build: {
    assets: 'assets'
  },

  vite: {
    plugins: [tailwindcss()]
  }
});