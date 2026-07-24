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

## Story text & the foreshadow layer

All story prose in `src/content/story.js` is **verbatim manuscript text**,
abridged by scene selection only (sentences never rewritten). The manuscript
docx itself is deliberately **not** committed to this repository; only its
cover image was extracted (`public/assets/cover-640.*`).

The site doesn't just tell Chapters 1–3 chronologically — it carries the
essence of where the story goes, using only material from Chapters 1–3:

- **Whisper interludes** (`#w1`, `#w2`): the author's own foreshadowing
  passages, staged as moments where a shadow passes over the page mid-scroll —
  darkness scrubs 0 → 1 → 0 while the lines hold sticky at centre screen.
  `#w2` is the book's thesis ("…the shadows in a home are not always cast by
  the people who built it. Sometimes they are inherited.") — the title moment.
- **The vows' shadow** (`[data-vows]`): the wedding vows, with the narrator's
  warning ("She would remember those words later…") fading in beneath them.
- **The bridge** (`[data-bridge]`): after the final line, alone in the dark —
  "Neither will you." (site copy, not manuscript).
- **"What remains"** in the CTA: real chapter titles IV–VI sinking into
  shadow; VII–X rendered as smudges with **no title text in the DOM**, so
  nothing from the back half can be spoiled, searched, or view-sourced.

Never reveal on the page: the affair, Brielle, or the ending (spec §2).

## Imagery

All 12 scenes + character sheets are generated (`gemini-3-pro-image`, 2K,
reference-conditioned for face consistency) and exported as responsive
AVIF/WebP/JPEG sets — see the generation log in `assets/ASSETS.md`.
Regenerate any scene with `GEMINI_API_KEY=... npm run generate:images -- --only <id>`,
promote a pick into `assets/picks/`, then `node scripts/process-picks.mjs`.

Interactive layers beyond the scroll: a 3-minute weighted auto-scroll
("Watch the story"), ambient flamboyant petals on a fixed canvas that thin
and vanish as the daylight falls, and Keziah's File — one entry open
(Chapter Three), five sealed rows that refuse politely when tapped.

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
