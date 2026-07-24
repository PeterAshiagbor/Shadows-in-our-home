// Story content per section (§2, §5 of the build spec).
//
// All story prose below is VERBATIM from the manuscript
// (SHADOWS_IN_OUR_HOME_STORY_updated_Chapter_10.docx), abridged by scene
// selection only — sentences are never rewritten. The manuscript file itself
// is deliberately NOT committed to this repository.
// Only whitespace/spacing artifacts from text extraction were normalised.
//
// Blocks marked `site: true` are website copy (not manuscript prose) —
// conversion/bridge lines written for the page itself.
//
// The `whisper` entries are the foreshadow layer: the author's own
// foreshadowing passages from Chapters 1–3, surfaced as "shadow interludes"
// where the light briefly fails. They gesture at where the story goes
// without revealing anything from Chapters 4–10.

export const story = {
  // Section 0 — Title
  title: {
    bookTitle: 'Shadows in Our Home',
    byline: 'a novel by',
    scrollCue: 'Scroll to begin the story',
  },

  // Section 1 — Hook (two beats)
  hook: {
    line: 'Zarek didn’t believe in love at first sight. But he believed in moments — moments that stayed with you long after they passed.',
    beat: 'This was one of them.',
  },

  // Section 2 — Ch 1 scene A: Zarek watching; Kwame's teasing
  // The teaser is a ~3-minute guided experience, not a full reading: scenes
  // are quoted (still verbatim), cut hard for pace.
  ch1a: {
    kicker: 'Chapter One',
    heading: 'The First Spark',
    blocks: [
      { text: 'The sun was dipping gently behind the tall mango trees surrounding Ganada Teacher Training College, casting a warm, golden glow over the campus. Students moved about in clusters—some rushing to evening prep, others laughing loudly as they teased friends. It was an ordinary day for everyone, except for Zarek Jonathan Quaye, who felt something unusual stirring inside him.' },
      { text: 'He was leaning against the railing of the library staircase, pretending to flip through his notes, though his eyes kept drifting to the girl sitting under the flamboyant tree across the courtyard.' },
      { text: 'Her name was Keziah Richer Mensah.' },
    ],
    dialogue: [
      { line: '“Still looking at her?” his friend Kwame teased, nudging him with his elbow.' },
      { line: 'Zarek snapped the book shut. “I’m not looking at her.”' },
      { line: 'Kwame laughed. “My brother, if you look any harder, the poor girl will catch fire.”' },
    ],
    close: [
      { text: 'Finally, gathering a courage he didn’t know he possessed, he walked toward her.' },
    ],
  },

  // Section 3 — Ch 1 scene B: the approach (pinned; four beats, verbatim)
  ch1b: {
    beats: [
      'As he approached, she looked up. And for a second, the world stilled.',
      '“Hi,” she said first, saving him.',
      '“Uh… hi,” he replied, throat suddenly dry. “Is this seat taken?”',
      '“It isn’t,” she said, smiling softly. “But now it is.”',
    ],
  },

  // Section 4 — Ch 1 close: the conversation, her backstory
  ch1c: {
    blocks: [
      { text: 'They talked—slowly at first, then with surprising ease. What started as innocent questions about classes and assignments grew into a real conversation. She told him she wanted to make a difference, especially for girls who grew up without many opportunities. That day he found out that Keziah was the daughter of a single mum who raised her with money from her sales from the market and being a cleaner at an investment company.' },
      { text: 'He listened, captivated.' },
    ],
    dialogue: [
      { line: '“Can we talk again tomorrow?” he asked before he could stop himself.' },
      { line: 'Keziah looked down shyly, then back at him.' },
      { line: '“Yes,” she said. “I would like that.”' },
    ],
    night: [],
  },

  // Whisper 1 — end of Chapter One, verbatim. The first time the light flickers.
  whisper1: {
    lines: [
      'What he didn’t know — what he couldn’t possibly know — was that this meeting under the flamboyant tree would be the beginning of a story filled with love, pain, choices, consequences… and a journey neither of them saw coming.',
    ],
  },

  // Section 5 — Act break
  actTwo: {
    number: 'CHAPTER TWO',
    title: 'Love Blossoms',
  },

  // Section 6 — Ch 2: the tree becomes theirs; walks; Kwame; the asking
  ch2: {
    blocks: [
      { text: 'The courtyard under the flamboyant tree became their place.' },
      { text: 'Every evening after his shift at the hospital, Zarek would find Keziah there — sometimes reading, sometimes just thinking, her fingers absently tracing the cover of whatever book rested in her lap. He stopped pretending he came to see Kwame.' },
      { text: 'They both knew why he came.' },
      { text: 'It started with conversations that stretched past the prep bell, past supper, until the security guard’s torch swept across the courtyard and Keziah would laugh softly and gather her things. Then it became walks — slow, unhurried ones along the dusty path behind the administration block where the jacaranda trees lined the road like purple sentinels. Then it became something neither of them had a proper word for yet, but both of them felt.' },
    ],
    dialogue: [],
    asking: [
      { text: '“So I’m asking, properly. Keziah. Will you be with me?”' },
      { text: '“Yes,” she said. Simply. Completely.' },
    ],
  },

  // Section 7 — Pull quote (Keziah to her roommate Abena, Chapter Two, verbatim)
  pullQuote: {
    text: 'He listens. Not like he is waiting for his turn to speak. He actually listens.',
    attribution: '— Keziah, about Zarek',
  },

  // Whisper 2 — the end of Chapter Two, verbatim. The book's thesis,
  // spoken by the author before the story turns. This is the title moment.
  whisper2: {
    lines: [
      'What neither of them knew, standing in that golden evening light, was that love is not only what two people feel for each other. It is also everything they carry into the room before they arrive — every lesson their parents taught them, spoken or silent. Every wound. Every pattern passed down like a birthright.',
      'Zarek had said he was not his father. And in that moment, he meant it with his whole heart.',
      'But the shadows in a home are not always cast by the people who built it.',
      'Sometimes they are inherited.',
    ],
    emphasisIndex: 3,
  },

  // Section 8 — Ch 3 scene A: proposal + wedding + the vows
  ch3a: {
    kicker: 'Chapter Three',
    heading: 'The Shape of What We Become',
    blocks: [
      { text: 'After dating for 2 years, Zarek asked Keziah to marry him on a cold Friday evening in May while they were on a romantic date at the only fancy restaurant he could afford.' },
      { text: 'Zarek watched her walk down the aisle and felt, for the first time in his adult life, that he was exactly where he was supposed to be.' },
    ],
    dialogue: [],
    vows: {
      line: 'To have and to hold. To love and to cherish. In sickness and in health.',
      shadow: [
        'She would remember those words later.',
        'She would remember them in the way you remember a warning you didn’t know was a warning at the time.',
      ],
    },
  },

  // Section 9 — Ch 3 scene B: Victoria arrives
  ch3b: {
    blocks: [
      { text: 'Zarek sat in the corridor outside and did what he had never once done in the entire time Keziah had known him.' },
      { text: 'He paced.' },
      { text: '“Mother and baby are both well,” the midwife said. “You have a daughter.”' },
      { text: 'A daughter.', quiet: true },
      { text: '“She’s beautiful,” Keziah said, watching his face.' },
      { text: '“She is,” he said.' },
      { text: 'And he meant that too.' },
      { text: 'But Keziah noticed — could not help but notice — what else was there. Something that moved across his face too quickly for him to catch it and put it away.' },
      { text: 'She held her daughter. And she told herself that everything was going to be fine.' },
    ],
  },

  // Section 10 — The fracture (pinned; verbatim; each beat dims the scene)
  fracture: {
    intro: [
      'Zarek was a capable father in the practical sense. He did the night feeds on his days off without complaint. He was present.',
      'But there was something not quite there, in a way that Keziah felt rather than could point to. A slight distance. The difference between caring for something and being dutiful.',
      'She noticed. She said nothing for a long time.',
    ],
    dialogue: [
      { line: '“You’re good with her.”' },
      { line: '“She’s my daughter,” Zarek said simply, not looking up from the report he was reading.' },
      { line: '“I know.” A pause. “But sometimes I wonder if — ”' },
      { line: '“If what?” He looked up.' },
    ],
  },

  // Section 11 — The last line (verbatim; the story text ends exactly here)
  lastLine: {
    lead: 'She shook her head. She let it go.',
    final: 'But she didn’t stop watching.',
    // Site copy, not manuscript — the bridge out of the story and into the CTA,
    // revealed alone in the dark after a long pause.
    bridge: { site: true, text: 'Neither will you.' },
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
    // What remains — real chapter titles from the manuscript's table of
    // contents, sinking into shadow. Titles from Chapter Seven onward are
    // withheld entirely (rendered as smudges, no text in the DOM) so nothing
    // from the back half can be spoiled, searched, or view-sourced.
    remaining: {
      label: 'What remains',
      visible: [
        { num: 'IV', title: 'The First Crack' },
        { num: 'V', title: 'His Version of Present' },
        { num: 'VI', title: 'Father on Paper' },
      ],
      hidden: ['VII', 'VIII', 'IX', 'X'],
      hiddenNote: 'Chapters Seven to Ten — titles withheld. Some things you have to read in the dark.',
    },
  },
};

// Image manifest — one entry per shot in the §4 shot list.
// `src` is the act-tinted placeholder fallback; `img` describes the processed
// Gemini renders in /assets/shots/ (see scripts/process-picks.mjs). Heroes
// carry an art-directed 16:9 variant served on landscape viewports.
const HERO = { widths: [828, 1440], sizes: '100vw' };
const INLINE = { widths: [640, 1080], sizes: '(max-width: 640px) 92vw, 544px' };

export const shots = [
  { id: 1,  act: 1, src: '/assets/shots/shot-01.svg', img: { base: 'shot-01', wideBase: 'shot-01-16x9', ...HERO }, alt: 'A teacher-training college campus at golden hour, mango trees glowing, students gathered in loose clusters.' },
  { id: 2,  act: 1, src: '/assets/shots/shot-02.svg', img: { base: 'shot-02', ...INLINE }, alt: 'Keziah sitting under the flamboyant tree, a book open in her lap, red blossoms overhead.' },
  { id: 3,  act: 1, src: '/assets/shots/shot-03.svg', img: { base: 'shot-03', ...INLINE }, alt: 'Zarek on the library staircase, holding a book he is not reading, looking across the courtyard.' },
  { id: 4,  act: 1, src: '/assets/shots/shot-04.svg', img: { base: 'shot-04', ...INLINE }, alt: 'Zarek and Keziah talking on a bench as dusk begins, the light still warm.' },
  { id: 5,  act: 2, src: '/assets/shots/shot-05.svg', img: { base: 'shot-05', wideBase: 'shot-05-16x9', ...HERO }, alt: 'Two silhouettes walking the campus road at evening, a security guard’s torchlight sweeping past.' },
  { id: 6,  act: 2, src: '/assets/shots/shot-06.svg', img: { base: 'shot-06', ...INLINE }, alt: 'The flamboyant tree and an empty bench, fallen red blossoms scattered like confetti.' },
  { id: 7,  act: 3, src: '/assets/shots/shot-07.svg', img: { base: 'shot-07', ...INLINE }, alt: 'A small, modest restaurant by candlelight — the proposal.' },
  { id: 8,  act: 3, src: '/assets/shots/shot-08.svg', img: { base: 'shot-08', ...INLINE }, alt: 'A joyful, sunlit wedding in Ghanaian dress.' },
  { id: 9,  act: 3, src: '/assets/shots/shot-09.svg', img: { base: 'shot-09', ...INLINE }, alt: 'Keziah, pregnant, standing at a window in soft light.' },
  { id: 10, act: 3, src: '/assets/shots/shot-10.svg', img: { base: 'shot-10', ...INLINE }, alt: 'Zarek holding baby Victoria — careful and correct, his face partly in shadow.' },
  { id: 11, act: 4, src: '/assets/shots/shot-11.svg', img: { base: 'shot-11', wideBase: 'shot-11-16x9', ...HERO }, alt: 'Keziah watching Zarek and Victoria from a doorway, lamplit, a long shadow across the floor.' },
  { id: 12, act: 4, src: '/assets/shots/shot-12.svg', img: { base: 'shot-12', wideBase: 'shot-12-16x9', ...HERO }, alt: 'A family photo on a wall in near-darkness, one figure’s face fallen into shadow.' },
];

// Real cover art (extracted from the manuscript file; the manuscript itself is
// not committed). Replace with the hi-res original when supplied (§9.4).
export const cover = {
  webp: '/assets/cover-640.webp',
  jpg: '/assets/cover-640.jpg',
  alt: 'Shadows in Our Home book cover: a Ghanaian mother holding her two young daughters in warm light while their father, a nurse in dark scrubs, stands apart in shadow with his arms crossed.',
};
