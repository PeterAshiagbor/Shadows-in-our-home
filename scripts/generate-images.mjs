#!/usr/bin/env node
// Build-time Gemini image generation for the §4 shot list.
// Usage: GEMINI_API_KEY=... npm run generate:images [-- --only 1,5,12]
//
// Writes candidate images to assets/candidates/<shot>/<n>.png for human review
// (build order step 2: generate 3-4 candidates per scene, pick the best, log
// seeds/prompts in assets/ASSETS.md). Never runs at page runtime.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error(
    'GEMINI_API_KEY is not set.\n' +
      'Get a key from https://aistudio.google.com/apikey and run:\n' +
      '  GEMINI_API_KEY=... npm run generate:images'
  );
  process.exit(1);
}

const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const CANDIDATES_PER_SHOT = 4;

const CHARACTER_BLOCK = `CHARACTERS:
Zarek — Ghanaian man, mid-20s, hospital worker; kind open face, lean build, short natural hair, thoughtful eyes; modest neat clothing (plain shirts, slacks).
Keziah — Ghanaian woman, early 20s; hair in a simple bun with escaping curls, calm warm eyes, gentle expression; modest dress in soft earth tones.`;

const STYLES = {
  ACT1: 'cinematic film still, golden hour, 35mm, warm amber grade, soft haze, Ghana teacher-training college campus, mango and flamboyant trees, natural skin tones, shallow depth of field, no text, no watermark',
  ACT2: 'cinematic film still, late golden hour, 35mm, warm amber grade, long shadows stretching across the frame, deepening vignette at edges, Ghana teacher-training college campus, flamboyant trees, natural skin tones, shallow depth of field, no text, no watermark',
  ACT3: 'cinematic film still, dusk interior, 35mm, lamplight not sunlight, higher contrast, slight desaturation, faces partially in shadow, Ghanaian home interior, natural skin tones, no text, no watermark',
  ACT4: 'cinematic film still, near-silhouette, almost monochrome with a single warm light source, figures as shadows against a lit doorway or window, deep umber and near-black tones, no text, no watermark',
};

// Keep in sync with assets/ASSETS.md.
const SHOTS = [
  { id: 'zarek-sheet', style: null, aspects: ['4:5'], scene: 'Character reference sheet, three views (3/4 portrait, front, profile) of the same man: Ghanaian man, mid-20s, kind open face, lean build, short natural hair, thoughtful eyes, plain light shirt. Neutral warm-grey studio background, soft even light, photoreal, 35mm, natural skin tones, no text, no watermark.' },
  { id: 'keziah-sheet', style: null, aspects: ['4:5'], scene: 'Character reference sheet, three views (3/4 portrait, front, profile) of the same woman: Ghanaian woman, early 20s, hair in a simple bun with escaping curls, calm warm eyes, modest earth-tone dress. Neutral warm-grey studio background, soft even light, photoreal, 35mm, natural skin tones, no text, no watermark.' },
  { id: '01', style: 'ACT1', aspects: ['9:16', '16:9'], scene: "Wide establishing shot: teacher-training college campus at golden hour, sun dipping behind mango trees, students in loose clusters on the grass, warm dust in the air" },
  { id: '02', style: 'ACT1', aspects: ['4:5'], scene: 'Keziah sitting alone under a flamboyant tree in full red blossom, open book in her lap, dappled light' },
  { id: '03', style: 'ACT1', aspects: ['4:5'], scene: 'Zarek standing on an open-air library staircase, book in hand but not reading, gaze fixed across the sunlit courtyard' },
  { id: '04', style: 'ACT1', aspects: ['4:5'], scene: 'Zarek and Keziah talking on a wooden bench, first light of dusk, both mid-conversation, warm and tentative' },
  { id: '05', style: 'ACT2', aspects: ['9:16', '16:9'], scene: "Two silhouettes walking a campus road at evening, a security guard's torchlight beam sweeping across the frame" },
  { id: '06', style: 'ACT2', aspects: ['4:5'], scene: 'The flamboyant tree with an empty wooden bench beneath it, fallen red blossoms scattered like confetti on the ground' },
  { id: '07', style: 'ACT3', aspects: ['4:5'], scene: 'A small modest restaurant interior by candlelight, Zarek nervous across a table from Keziah, one candle between them' },
  { id: '08', style: 'ACT1', aspects: ['4:5'], scene: 'Joyful sunlit wedding, bride and groom in Ghanaian kente dress, guests celebrating — the brightest frame of the set' },
  { id: '09', style: 'ACT3', aspects: ['4:5'], scene: 'Keziah visibly pregnant, standing at a window in soft afternoon light, hand resting on the sill' },
  { id: '10', style: 'ACT3', aspects: ['4:5'], scene: 'Zarek holding a newborn baby — careful, correct, slightly distant; his face partly fallen into shadow' },
  { id: '11', style: 'ACT4', aspects: ['4:5', '16:9'], scene: 'Keziah seen from behind in a doorway, watching Zarek hold the baby in a lamplit room, her long shadow across the floor' },
  { id: '12', style: 'ACT4', aspects: ['9:16', '16:9'], scene: "A framed family photo on a wall in near-darkness, one figure's face fallen completely into shadow, single warm light source off-frame" },
];

function buildPrompt(shot, aspect) {
  const parts = [];
  if (shot.style) parts.push(CHARACTER_BLOCK);
  parts.push(shot.scene);
  if (shot.style) parts.push(STYLES[shot.style]);
  parts.push(`Aspect ratio ${aspect}. Generate at high resolution, 2048px or more on the long edge.`);
  return parts.join('\n\n');
}

async function generate(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'] },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error('No image in response');
  return Buffer.from(part.inlineData.data, 'base64');
}

const only = (() => {
  const i = process.argv.indexOf('--only');
  return i > -1 ? process.argv[i + 1].split(',') : null;
})();

for (const shot of SHOTS) {
  if (only && !only.includes(shot.id)) continue;
  for (const aspect of shot.aspects) {
    const dir = path.join('assets', 'candidates', `shot-${shot.id}${shot.aspects.length > 1 ? `-${aspect.replace(':', 'x')}` : ''}`);
    await mkdir(dir, { recursive: true });
    const prompt = buildPrompt(shot, aspect);
    await writeFile(path.join(dir, 'prompt.txt'), prompt);
    for (let n = 1; n <= CANDIDATES_PER_SHOT; n++) {
      const out = path.join(dir, `candidate-${n}.png`);
      try {
        const img = await generate(prompt);
        await writeFile(out, img);
        console.log(`ok  ${out} (${(img.length / 1024).toFixed(0)}KB)`);
      } catch (err) {
        console.error(`ERR ${out}: ${err.message}`);
      }
    }
  }
}

console.log('\nDone. Review assets/candidates/, promote picks, log them in assets/ASSETS.md,');
console.log('then export web-ready AVIF/WebP to public/assets/shots/ and update src/content/story.js.');
