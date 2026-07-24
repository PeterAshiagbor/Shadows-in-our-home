# SHADOWS IN OUR HOME — Image asset kit

All imagery is Gemini-generated **at build time only** (no runtime API calls).
This file is the single source of truth for prompts, seeds and chosen outputs so
every scene can be regenerated consistently (§4 of the build spec).

**Status:** ⚠️ Not yet generated — no `GEMINI_API_KEY` was available in the build
environment. Run `GEMINI_API_KEY=... npm run generate:images`, review the
candidates in `assets/candidates/`, promote the picks, and record seeds below.

---

## 1. Character sheets (generate FIRST, before any scene)

Generate these, pick the best of 3–4 candidates each, then attach the chosen
reference images (or paste the verbatim description block below) into **every**
scene prompt.

### Character block (include verbatim in every scene prompt)

```
CHARACTERS:
Zarek — Ghanaian man, mid-20s, hospital worker; kind open face, lean build,
short natural hair, thoughtful eyes; modest neat clothing (plain shirts,
slacks).
Keziah — Ghanaian woman, early 20s; hair in a simple bun with escaping curls,
calm warm eyes, gentle expression; modest dress in soft earth tones.
```

### Character sheet prompts

```
[ZAREK SHEET] Character reference sheet, three views (3/4 portrait, front,
profile) of the same man: Ghanaian man, mid-20s, kind open face, lean build,
short natural hair, thoughtful eyes, plain light shirt. Neutral warm-grey
studio background, soft even light, photoreal, 35mm, natural skin tones,
no text, no watermark.
```

```
[KEZIAH SHEET] Character reference sheet, three views (3/4 portrait, front,
profile) of the same woman: Ghanaian woman, early 20s, hair in a simple bun
with escaping curls, calm warm eyes, modest earth-tone dress. Neutral
warm-grey studio background, soft even light, photoreal, 35mm, natural skin
tones, no text, no watermark.
```

---

## 2. Style blocks (reuse VERBATIM per act — never edit between scenes)

```
[STYLE-ACT1] cinematic film still, golden hour, 35mm, warm amber grade, soft
haze, Ghana teacher-training college campus, mango and flamboyant trees,
natural skin tones, shallow depth of field, no text, no watermark
```

```
[STYLE-ACT2] cinematic film still, late golden hour, 35mm, warm amber grade,
long shadows stretching across the frame, deepening vignette at edges, Ghana
teacher-training college campus, flamboyant trees, natural skin tones,
shallow depth of field, no text, no watermark
```

```
[STYLE-ACT3] cinematic film still, dusk interior, 35mm, lamplight not
sunlight, higher contrast, slight desaturation, faces partially in shadow,
Ghanaian home interior, natural skin tones, no text, no watermark
```

```
[STYLE-ACT4] cinematic film still, near-silhouette, almost monochrome with a
single warm light source, figures as shadows against a lit doorway or window,
deep umber and near-black tones, no text, no watermark
```

---

## 3. Shot list (12 minimum)

Sizes: hero/full-bleed shots (1, 5, 12) in **9:16 AND 16:9**; inline shots in
**4:5**. Generate at 2048px+ on the long edge, 3–4 candidates per scene.

| # | Scene prompt (prepend character block; append style block) | Style | Aspect |
|---|---|---|---|
| 1 | Wide establishing shot: teacher-training college campus at golden hour, sun dipping behind mango trees, students in loose clusters on the grass, warm dust in the air | ACT1 | 9:16 + 16:9 |
| 2 | Keziah sitting alone under a flamboyant tree in full red blossom, open book in her lap, dappled light | ACT1 | 4:5 |
| 3 | Zarek standing on an open-air library staircase, book in hand but not reading, gaze fixed across the sunlit courtyard | ACT1 | 4:5 |
| 4 | Zarek and Keziah talking on a wooden bench, first light of dusk, both mid-conversation, warm and tentative | ACT1 | 4:5 |
| 5 | Two silhouettes walking a campus road at evening, a security guard's torchlight beam sweeping across the frame | ACT2 | 9:16 + 16:9 |
| 6 | The flamboyant tree with an empty wooden bench beneath it, fallen red blossoms scattered like confetti on the ground | ACT2 | 4:5 |
| 7 | A small modest restaurant interior by candlelight, Zarek nervous across a table from Keziah, one candle between them | ACT3 | 4:5 |
| 8 | Joyful sunlit wedding, bride and groom in Ghanaian kente dress, guests celebrating — the brightest frame of the set | ACT1 | 4:5 |
| 9 | Keziah visibly pregnant, standing at a window in soft afternoon light, hand resting on the sill | ACT3 | 4:5 |
| 10 | Zarek holding a newborn baby — careful, correct, slightly distant; his face partly fallen into shadow (this image carries the whole foreshadow) | ACT3 | 4:5 |
| 11 | Keziah seen from behind in a doorway, watching Zarek hold the baby in a lamplit room, her long shadow across the floor | ACT4 | 4:5 + 16:9 |
| 12 | A framed family photo on a wall in near-darkness, one figure's face fallen completely into shadow, single warm light source off-frame | ACT4 | 9:16 + 16:9 |

Also needed: **book cover 3D mock** (front + slight angle) for the CTA section.
If the real cover file is supplied (§9.4), composite it; otherwise use the cover
image extracted from the manuscript docx (`word/media/image1.png`).

---

## 4. Generation log (fill in as picks are made)

| Shot | Model | Seed/ID | Candidates | Chosen file | Notes |
|---|---|---|---|---|---|
| Zarek sheet | — | — | — | — | pending |
| Keziah sheet | — | — | — | — | pending |
| 1–12 | — | — | — | — | pending |

---

## 5. Post-processing pipeline

1. Review candidates in `assets/candidates/`, promote picks to `assets/picks/`.
2. Export delivery files to `public/assets/shots/` as AVIF/WebP with JPEG
   fallback, responsive `srcset` sizes (< 200KB delivered per image on mobile).
3. Add tiny base64 blur-up placeholders.
4. Update the `shots` manifest in `src/content/story.js` to point at the real
   files (and their `wide` variants for shots 1, 5, 12).
5. Regenerate `public/assets/og-cover.png` from the real cover art (1200×630).
