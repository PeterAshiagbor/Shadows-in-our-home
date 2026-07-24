import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://shadowsinourhome.com', // OPEN ITEM: replace with the real domain (§9.5)
  compressHTML: true,
});
