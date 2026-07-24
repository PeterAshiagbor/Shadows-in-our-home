#!/usr/bin/env node
// Build-time Gemini image generation for the §4 shot list.
// Usage:
//   GEMINI_API_KEY=... npm run generate:images -- --only zarek-sheet,keziah-sheet
//   GEMINI_API_KEY=... npm run generate:images -- --candidates 2
//
// Writes candidate images to assets/candidates/<shot>/candidate-N.png for
// review. If character-sheet picks exist at assets/picks/zarek-sheet.png and
// assets/picks/keziah-sheet.png they are attached to every scene prompt as
// reference images, which is what keeps faces consistent across scenes.
// Never runs at page runtime; the API key is read from the environment and
// must never be committed.

import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
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

const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image';

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
  { id: '01', style: 'ACT1', aspects: ['9:16', '16:9'], scene: "Wide establishing shot: teacher-training college campus at golden hour, sun dipping behind mango trees, students in loose clusters on the grass, warm dust in the air. No recognisable faces in close-up." },
  { id: '02', style: 'ACT1', aspects: ['4:5'], scene: 'Keziah sitting alone under a flamboyant tree in full red blossom, open book in her lap, dappled light' },
  { id: '03', style: 'ACT1', aspects: ['4:5'], scene: 'Zarek standing on an open-air library staircase, book in hand but not reading, gaze fixed across the sunlit courtyard' },
  { id: '04', style: 'ACT1', aspects: ['4:5'], scene: 'Zarek and Keziah talking on a wooden bench, first light of dusk, both mid-conversation, warm and tentative' },
  { id: '05', style: 'ACT2', aspects: ['9:16', '16:9'], scene: "Two silhouettes (Zarek and Keziah) walking a campus road at evening, a security guard's torchlight beam sweeping across the frame" },
  { id: '06', style: 'ACT2', aspects: ['4:5'], scene: 'The flamboyant tree with an empty wooden bench beneath it, fallen red blossoms scattered like confetti on the ground, no people' },
  { id: '07', style: 'ACT3', aspects: ['4:5'], scene: 'A small modest restaurant interior by candlelight, Zarek nervous across a table from Keziah, one candle between them' },
  { id: '08', style: 'ACT1', aspects: ['4:5'], scene: 'Joyful sunlit wedding: Zarek and Keziah as bride and groom in Ghanaian kente dress, guests celebrating — the brightest frame of the set' },
  { id: '09', style: 'ACT3', aspects: ['4:5'], scene: 'Keziah visibly pregnant, standing at a window in soft afternoon light, hand resting on the sill' },
  { id: '10', style: 'ACT3', aspects: ['4:5'], scene: 'Zarek holding a newborn baby — careful, correct, slightly distant; his face partly fallen into shadow' },
  { id: '11', style: 'ACT4', aspects: ['4:5', '16:9'], scene: 'Keziah seen from behind in a doorway, watching Zarek hold a baby in a lamplit room, her long shadow across the floor' },
  { id: '12', style: 'ACT4', aspects: ['9:16', '16:9'], scene: "A framed family photo on a wall in near-darkness, one figure's face fallen completely into shadow, single warm light source off-frame, no people in the room" },
];

const exists = (p) => access(p).then(() => true, () => false);

async function loadRefs() {
  const refs = [];
  for (const name of ['zarek-sheet', 'keziah-sheet']) {
    const p = path.join('assets', 'picks', `${name}.png`);
    if (await exists(p)) {
      refs.push({ inlineData: { mimeType: 'image/png', data: (await readFile(p)).toString('base64') } });
    }
  }
  return refs;
}

function buildPrompt(shot) {
  const parts = [];
  if (shot.style) {
    parts.push('Use the attached reference sheets for the exact appearance of Zarek (first image) and Keziah (second image). Keep their faces consistent with the references.');
    parts.push(CHARACTER_BLOCK);
  }
  parts.push(shot.scene);
  if (shot.style) parts.push(STYLES[shot.style]);
  return parts.join('\n\n');
}

async function generate(prompt, refs, aspect) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const body = {
    contents: [{ parts: [...refs, { text: prompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: aspect, imageSize: '2K' },
    },
  };
  let res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify(body),
  });
  if (res.status === 400) {
    // some models reject imageSize — retry without it
    delete body.generationConfig.imageConfig.imageSize;
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
      body: JSON.stringify(body),
    });
  }
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error('No image in response: ' + JSON.stringify(data).slice(0, 300));
  return Buffer.from(part.inlineData.data, 'base64');
}

const argv = process.argv;
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i > -1 ? argv[i + 1] : fallback;
};
const only = flag('only', null)?.split(',') ?? null;
const CANDIDATES = Number(flag('candidates', 3));

const refs = await loadRefs();
if (refs.length < 2) {
  console.log('NOTE: character-sheet picks not found in assets/picks/ — scene prompts will run without reference images.');
}

for (const shot of SHOTS) {
  if (only && !only.includes(shot.id)) continue;
  const shotRefs = shot.style ? refs : [];
  for (const aspect of shot.aspects) {
    const dir = path.join('assets', 'candidates', `shot-${shot.id}${shot.aspects.length > 1 ? `-${aspect.replace(':', 'x')}` : ''}`);
    await mkdir(dir, { recursive: true });
    const prompt = buildPrompt(shot);
    await writeFile(path.join(dir, 'prompt.txt'), `model: ${MODEL}\naspect: ${aspect}\nrefs: ${shotRefs.length}\n\n${prompt}`);
    for (let n = 1; n <= CANDIDATES; n++) {
      const out = path.join(dir, `candidate-${n}.png`);
      if (await exists(out)) { console.log(`skip ${out} (exists)`); continue; }
      try {
        const img = await generate(prompt, shotRefs, aspect);
        await writeFile(out, img);
        console.log(`ok  ${out} (${(img.length / 1024).toFixed(0)}KB)`);
      } catch (err) {
        console.error(`ERR ${out}: ${err.message}`);
      }
    }
  }
}

console.log('\nDone. Review assets/candidates/, promote picks to assets/picks/, log them in assets/ASSETS.md,');
console.log('then export web-ready files to public/assets/shots/ and update src/content/story.js.');
