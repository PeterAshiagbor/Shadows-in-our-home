# Shadows in Our Home — scrollytelling site

A single-page interactive scrollytelling website telling Chapters 1–3 of
*Shadows in Our Home*, then converting readers to buy the book. The signature
mechanic: **the light sets as you scroll** — one continuous scroll-driven
lighting system (`--daylight: 1 → 0`) carries the page from golden hour to
near-darkness, and the book becomes the light source at the CTA.

## Stack

- [Astro](https://astro.build) (static output) — page shell, zero framework JS
- [GSAP ScrollTrigger](https://gsap.com/scrolltrigger/) — pinning + scrubbed choreography
- [Lenis](https://lenis.darkroom.engineering/) — smooth scrolling
- Self-hosted Google Fonts: Fraunces (display), Newsreader (prose), Archivo (utility)
- Gemini image generation at **build time only** (`scripts/generate-images.mjs`)

## Commands

```sh
npm install
npm run dev        # local dev server
npm run build      # static build → dist/
npm run generate:images   # needs GEMINI_API_KEY — see assets/ASSETS.md
```

Deploy target: Vercel (static; no server except the email-capture endpoint).

## ⚠️ Before launch — two hard blockers

1. **Manuscript text.** `SHADOWS_IN_OUR_HOME_STORY_updated_Chapter_10.docx` was
   not available at build time. Every prose block marked `todo: true` in
   `src/content/story.js` is a stand-in and renders with a visible amber
   "stand-in — replace with manuscript text" tag. Replace each with verbatim
   manuscript excerpts (abridge by cutting scenes, never rewriting sentences;
   target ~2,500–3,500 words total). Lines quoted directly in the build spec
   (the hook, the seat exchange, the fracture dialogue, the final line, all
   CTA copy) are already in place verbatim and are not flagged.
2. **Imagery.** No `GEMINI_API_KEY` was available, so the page runs on
   act-tinted placeholder gradients. Follow `assets/ASSETS.md`: generate the
   two character sheets, lock style, generate the 12-shot list, review
   candidates, export web-ready files and update the `shots` manifest in
   `src/content/story.js`.

## Open items (spec §9) — all live in `src/config.js`

| Item | Where |
|---|---|
| Author name | `config.author` |
| Price | `config.price` |
| Books2Read Universal Book Link (primary CTA) | `config.universalBookLink` |
| Per-retailer links (Amazon/Apple/Kobo/Google Play/Selar) | `config.retailers` |
| Email provider endpoint (Chapter 4 lead magnet) | `config.emailEndpoint` |
| Testimonials (omitted entirely when empty — no fake reviews) | `config.testimonials` |
| Socials incl. Wattpad once live | `config.socials` |
| Domain | `astro.config.mjs` `site` |
| Hi-res cover art | replace `public/assets/cover-placeholder.svg` + `public/assets/og-cover.png` |

## Where things live

```
src/config.js            — every open item / placeholder in one place
src/content/story.js     — all story text per section + image manifest
src/pages/index.astro    — the single page, sections 0–13 per spec §5
src/styles/global.css    — tokens, lighting outputs, all section styles
src/scripts/main.js      — Lenis + GSAP choreography, lighting curve,
                           analytics events (§8), email capture, exit intent
scripts/generate-images.mjs — build-time Gemini generation
assets/ASSETS.md         — prompt kit, style blocks, generation log
```

## The lighting system

`src/scripts/main.js` maps scroll position → `--daylight` through per-section
anchors (`ANCHORS`), then interpolates a palette (`STOPS`) and writes
`--ground/--ink/--panel/--glow/--shadow-len` onto `:root` every frame. The
ink/panel flip happens in a deliberately narrow band (daylight 0.60 → 0.47) so
text never lingers on a mid-contrast ground. Tune `ANCHORS` by eye once real
imagery is in. Without JS, sections fall back to static per-act palettes via
`[data-act]`.

## Accessibility & performance

- All story text is real HTML text; semantic headings per chapter; alt text on
  every image.
- `prefers-reduced-motion`: no smooth scroll, no pinning, no scrubbing —
  IntersectionObserver fades only; the montage becomes a plain scrollable strip.
- Analytics events (§8): `scroll_25/50/75/100`, `reached_fracture`,
  `reached_cta`, `cta_click_buy`, `cta_click_sticky`, `email_submit`,
  `exit_intent_shown` — fired to Plausible and/or Vercel Analytics when their
  snippets are present.
- Budget: total JS < 150KB gzipped (GSAP + Lenis + main.js currently ~55KB);
  images must ship < 200KB delivered on mobile once generated.
