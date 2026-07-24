#!/usr/bin/env node
// Export web-ready images from assets/picks/ to public/assets/shots/.
// Picks are named shot-01.png … shot-12.png plus wide variants
// (shot-01-16x9.png, shot-05-16x9.png, shot-11-16x9.png, shot-12-16x9.png)
// and 9:16 heroes keep the base name.
//
// For each pick: AVIF + WebP + JPEG at two widths (1x/2x for its slot),
// sized to stay under ~200KB delivered on mobile (§7 budget).

import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const IN = 'assets/picks';
const OUT = 'public/assets/shots';

// slot widths: inline 4:5 figures render at ≤544px; full-bleed heroes at viewport width
const WIDTHS = {
  inline: [640, 1080],
  hero: [828, 1440],
};

const isHero = (name) => /^shot-(01|05|11|12)(-|\.)/.test(name) || /16x9/.test(name);

await mkdir(OUT, { recursive: true });
const files = (await readdir(IN)).filter((f) => f.startsWith('shot-') && f.endsWith('.png'));
if (files.length === 0) {
  console.error('No shot-*.png picks found in assets/picks/');
  process.exit(1);
}

const manifest = {};
for (const f of files) {
  const base = f.replace('.png', '');
  const widths = WIDTHS[isHero(f) ? 'hero' : 'inline'];
  const src = sharp(path.join(IN, f));
  const meta = await src.metadata();
  for (const w of widths) {
    const width = Math.min(w, meta.width);
    await src.clone().resize(width).avif({ quality: 55 }).toFile(path.join(OUT, `${base}-${w}.avif`));
    await src.clone().resize(width).webp({ quality: 74 }).toFile(path.join(OUT, `${base}-${w}.webp`));
    await src.clone().resize(width).jpeg({ quality: 74, mozjpeg: true }).toFile(path.join(OUT, `${base}-${w}.jpg`));
  }
  manifest[base] = { widths, aspect: meta.width / meta.height };
  console.log(`ok ${base} (${meta.width}x${meta.height}) -> ${widths.join('/')}w avif+webp+jpg`);
}

console.log('\nManifest data (for src/content/story.js):');
console.log(JSON.stringify(manifest, null, 2));
