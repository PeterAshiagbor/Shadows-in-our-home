import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://shadows-in-our-home.vercel.app', // swap when a custom domain is bought (§9.5)
  compressHTML: true,
});
