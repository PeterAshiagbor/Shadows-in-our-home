// Build labeled contact sheets of scene candidates for review.
import { readdir } from 'node:fs/promises';
import sharp from 'sharp';

const n = process.argv[2] || '1'; // candidate number
const dirs = (await readdir('assets/candidates')).filter((d) => /^shot-\d/.test(d)).sort();
const CELL_W = 300, CELL_H = 300, COLS = 4;
const tiles = [];
let idx = 0;
for (const d of dirs) {
  const p = `assets/candidates/${d}/candidate-${n}.png`;
  let img;
  try {
    img = await sharp(p).resize(CELL_W, CELL_H - 24, { fit: 'contain', background: '#111' }).toBuffer();
  } catch { continue; }
  const label = Buffer.from(`<svg width="${CELL_W}" height="24"><rect width="${CELL_W}" height="24" fill="#000"/><text x="6" y="17" font-family="monospace" font-size="14" fill="#e8a33d">${d}</text></svg>`);
  const cell = await sharp({ create: { width: CELL_W, height: CELL_H, channels: 3, background: '#111' } })
    .composite([{ input: img, top: 0, left: 0 }, { input: label, top: CELL_H - 24, left: 0 }])
    .png().toBuffer();
  tiles.push({ input: cell, left: (idx % COLS) * CELL_W, top: Math.floor(idx / COLS) * CELL_H });
  idx++;
}
const rows = Math.ceil(idx / COLS);
await sharp({ create: { width: COLS * CELL_W, height: rows * CELL_H, channels: 3, background: '#111' } })
  .composite(tiles).jpeg({ quality: 85 }).toFile(process.env.OUT || `contact-${n}.jpg`);
console.log('tiles:', idx);
