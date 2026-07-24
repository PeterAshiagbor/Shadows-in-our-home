// Story content per section (§2, §5 of the build spec).
//
// IMPORTANT — manuscript status:
// The manuscript file (SHADOWS_IN_OUR_HOME_STORY_updated_Chapter_10.docx) was not
// available in this repository at build time. Blocks marked `todo: true` are
// STAND-IN text written only so pacing/typography could be built and tuned —
// they are NOT the author's prose and MUST be replaced with verbatim manuscript
// excerpts before launch (abridge by cutting scenes, never by rewriting sentences).
// Lines quoted in the build spec itself are included verbatim and are not flagged.
//
// Stand-in blocks render with a visible amber "replace with manuscript" marker
// until the `todo` flag is removed.

export const story = {
  // Section 0 — Title
  title: {
    bookTitle: 'Shadows in Our Home',
    byline: 'a novel by',
    scrollCue: 'Scroll to begin the story',
  },

  // Section 1 — Hook line (verbatim, from spec)
  hook: "Zarek didn't believe in love at first sight. But he believed in moments.",

  // Section 2 — Ch 1 scene A: Zarek watching; Kwame's teasing
  ch1a: {
    heading: 'One',
    kicker: 'Chapter One',
    blocks: [
      {
        todo: true,
        text: 'The sun was dipping behind the mango trees when Zarek first saw her, from the library staircase at Ganada Teacher Training College, a book open in his hands that he had stopped pretending to read.',
      },
      {
        todo: true,
        text: 'She sat beneath the flamboyant tree across the courtyard, and he watched her the way you watch something you are afraid to want.',
      },
    ],
    dialogue: [
      { speaker: 'Kwame', line: '“You’ve read that same page four times.”', todo: true },
      { speaker: 'Zarek', line: '“I’m a slow reader.”', todo: true },
      { speaker: 'Kwame', line: '“Then go and be a slow talker instead. She’s right there.”', todo: true },
    ],
  },

  // Section 3 — Ch 1 scene B: the approach (the shareable exchange — verbatim, from spec)
  ch1b: {
    setup: { todo: true, text: 'It took him three days to cross the courtyard.' },
    exchange: [
      { speaker: 'Zarek', line: '“Is this seat taken?”' },
      { speaker: 'Keziah', line: '“It isn’t. But now it is.”' },
    ],
  },

  // Section 4 — Ch 1 close: her backstory, his captivation (abridged)
  ch1c: {
    blocks: [
      {
        todo: true,
        text: 'She told him about her mother — a single woman who had raised her on market-stall arithmetic and borrowed schoolbooks, who had walked her to every examination and waited outside every gate.',
      },
      {
        todo: true,
        text: 'Zarek listened the way he did everything then: completely. By the time the prep bell rang he knew he was already lost.',
      },
    ],
  },

  // Section 5 — Act break
  actTwo: {
    number: 'TWO',
    title: 'Love Blossoms',
  },

  // Section 6 — Ch 2 montage: the tree becomes theirs; walks
  ch2: {
    blocks: [
      {
        todo: true,
        text: 'The flamboyant tree became their place. Nobody agreed to it; it simply happened, the way true things do.',
      },
      {
        todo: true,
        text: 'They walked the campus roads long past the prep bell, past the security guard whose torchlight swept over them and moved on, as if even he understood that some things should be left alone in the dark to grow.',
      },
    ],
  },

  // Section 7 — Pull quote.
  // OPEN ITEM: replace with the most romantic single line from Chapter 2, verbatim.
  pullQuote: {
    todo: true,
    text: 'He did not remember deciding to love her. He only remembered the day he stopped being able to imagine anything else.',
  },

  // Section 8 — Ch 3 scene A: proposal + wedding
  ch3a: {
    heading: 'Three',
    kicker: 'Chapter Three',
    blocks: [
      {
        todo: true,
        text: 'He proposed at the only fancy restaurant he could afford, one candle between them, the ring box sweating in his pocket through two courses before he found his voice.',
      },
      {
        todo: true,
        text: 'They married in sunlight. Everyone who loved them was there, and for one whole day there was not a shadow in sight.',
      },
    ],
  },

  // Section 9 — Ch 3 scene B: Victoria arrives
  ch3b: {
    blocks: [
      {
        todo: true,
        text: 'Victoria arrived one October morning, small and furious and perfect, and Keziah watched Zarek hold their daughter with careful, correct hands.',
      },
    ],
  },

  // Section 10 — The fracture (framing line + dialogue verbatim, from spec)
  fracture: {
    intro: {
      text: 'A slight distance. The difference between caring for something and being dutiful.',
    },
    dialogue: [
      { speaker: 'Keziah', line: '“You’re good with her.”' },
      { speaker: 'Zarek', line: '“She’s my daughter.”' },
    ],
    after: {
      todo: true,
      text: 'It was the correct answer. It was not the right one.',
    },
  },

  // Section 11 — The last line (verbatim, from spec — ends the story text exactly here)
  lastLine: {
    lead: 'She shook her head. She let it go.',
    final: 'But she didn’t stop watching.',
  },

  // Section 12 — Conversion (copy as written in §6)
  conversion: {
    eyebrow: 'THE STORY DOESN’T END HERE',
    headline: 'You’ve read the light. The shadows are next.',
    subhead:
      'Seven more chapters. A marriage tested by distance, temptation, and a loss no family should survive. Keziah kept watching — find out what she saw.',
    ctaLabel: 'Get the full book',
    riskReducer: 'Read Chapters 1–3 free above. The rest is waiting.',
    emailHeading: 'Not ready? Get Chapter 4 free by email.',
    emailButton: 'Send me Chapter 4',
  },
};

// Image manifest — one entry per shot in the §4 shot list.
// `src` currently points at act-tinted placeholders; scripts/generate-images.mjs
// writes real Gemini renders to /assets/shots/ and these paths swap to them.
export const shots = [
  { id: 1,  act: 1, src: '/assets/shots/shot-01.svg', wide: '/assets/shots/shot-01-wide.svg', alt: 'A teacher-training college campus at golden hour, mango trees glowing, students gathered in loose clusters.' },
  { id: 2,  act: 1, src: '/assets/shots/shot-02.svg', alt: 'Keziah sitting under the flamboyant tree, a book open in her lap, red blossoms overhead.' },
  { id: 3,  act: 1, src: '/assets/shots/shot-03.svg', alt: 'Zarek on the library staircase, holding a book he is not reading, looking across the courtyard.' },
  { id: 4,  act: 1, src: '/assets/shots/shot-04.svg', alt: 'Zarek and Keziah talking on a bench as dusk begins, the light still warm.' },
  { id: 5,  act: 2, src: '/assets/shots/shot-05.svg', wide: '/assets/shots/shot-05-wide.svg', alt: 'Two silhouettes walking the campus road at evening, a security guard’s torchlight sweeping past.' },
  { id: 6,  act: 2, src: '/assets/shots/shot-06.svg', alt: 'The flamboyant tree and an empty bench, fallen red blossoms scattered like confetti.' },
  { id: 7,  act: 3, src: '/assets/shots/shot-07.svg', alt: 'A small, modest restaurant by candlelight — the proposal.' },
  { id: 8,  act: 3, src: '/assets/shots/shot-08.svg', alt: 'A joyful, sunlit wedding in Ghanaian dress.' },
  { id: 9,  act: 3, src: '/assets/shots/shot-09.svg', alt: 'Keziah, pregnant, standing at a window in soft light.' },
  { id: 10, act: 3, src: '/assets/shots/shot-10.svg', alt: 'Zarek holding baby Victoria — careful and correct, his face partly in shadow.' },
  { id: 11, act: 4, src: '/assets/shots/shot-11.svg', alt: 'Keziah watching Zarek and Victoria from a doorway, lamplit, a long shadow across the floor.' },
  { id: 12, act: 4, src: '/assets/shots/shot-12.svg', wide: '/assets/shots/shot-12-wide.svg', alt: 'A family photo on a wall in near-darkness, one figure’s face fallen into shadow.' },
];

export const coverSrc = '/assets/cover-placeholder.svg'; // OPEN ITEM §9.4: replace with hi-res cover art
