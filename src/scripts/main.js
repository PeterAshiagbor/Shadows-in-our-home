// Scroll choreography for Shadows in Our Home.
// One global lighting system (§3): --daylight runs 1 → 0 across the story and
// drives ground/ink/panel colours, glow and shadow length everywhere.
// prefers-reduced-motion: no smooth-scroll, no pinning, no scrubbing —
// simple IntersectionObserver fades only. Lighting still follows scroll
// (it is colour, not motion) but with no pinned sections.

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------------- */
/* Analytics (§8) — fires to Plausible and/or Vercel Analytics if present.   */
/* ------------------------------------------------------------------------- */
const fired = new Set();
function track(name, once = true) {
  if (once && fired.has(name)) return;
  fired.add(name);
  window.plausible?.(name);
  window.va?.('event', { name });
}

document.querySelectorAll('[data-event]').forEach((el) => {
  el.addEventListener('click', () => track(el.dataset.event, false));
});

/* ------------------------------------------------------------------------- */
/* Lighting system                                                            */
/* ------------------------------------------------------------------------- */
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = ([r, g, b]) => `rgb(${r},${g},${b})`;

// Palette stops keyed by daylight value. The ink/panel flip happens in a
// narrow band (0.60 → 0.47) so text never lingers on a mid-contrast ground.
const STOPS = [
  { d: 1.0,  ground: '#f0dfc4', ink: '#2b2118', inkSoft: '#5c4a38', panel: [245, 235, 220, 0.88], glow: '#e8a33d' },
  { d: 0.6,  ground: '#d8b483', ink: '#2b2118', inkSoft: '#4e3d29', panel: [245, 235, 220, 0.84], glow: '#e8a33d' },
  { d: 0.5,  ground: '#4a3a2d', ink: '#ede2d0', inkSoft: '#cdbca4', panel: [42, 33, 26, 0.84],   glow: '#c98f3a' },
  { d: 0.3,  ground: '#3e3128', ink: '#ede2d0', inkSoft: '#c2b096', panel: [36, 29, 23, 0.85],   glow: '#b27f33' },
  { d: 0.0,  ground: '#171310', ink: '#ede2d0', inkSoft: '#b9a88f', panel: [30, 24, 19, 0.86],   glow: '#8f6528' },
];

function applyDaylight(d) {
  let hi = STOPS[0];
  let lo = STOPS[STOPS.length - 1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (d <= STOPS[i].d && d >= STOPS[i + 1].d) { hi = STOPS[i]; lo = STOPS[i + 1]; break; }
  }
  const t = hi.d === lo.d ? 0 : (hi.d - d) / (hi.d - lo.d);
  const s = document.documentElement.style;
  s.setProperty('--daylight', d.toFixed(3));
  s.setProperty('--ground', rgb(mix(hex(hi.ground), hex(lo.ground), t)));
  s.setProperty('--ink', rgb(mix(hex(hi.ink), hex(lo.ink), t)));
  s.setProperty('--ink-soft', rgb(mix(hex(hi.inkSoft), hex(lo.inkSoft), t)));
  const p = mix(hi.panel.slice(0, 3), lo.panel.slice(0, 3), t);
  const pa = hi.panel[3] + (lo.panel[3] - hi.panel[3]) * t;
  s.setProperty('--panel', `rgba(${p[0]},${p[1]},${p[2]},${pa.toFixed(2)})`);
  s.setProperty('--glow', rgb(mix(hex(hi.glow), hex(lo.glow), t)));
  s.setProperty('--shadow-len', `${(0.25 + (1 - d) * 0.65).toFixed(2)}rem`);
}

// Daylight anchors: [section id, daylight at that section's centre].
// Tune this curve by eye once real imagery is in (build order step 5).
// No text may REST inside the ink/panel flip band (0.6 → 0.5): the flip is
// pinned to happen across s8's wedding figure — after the Chapter Three
// panel (still warm paper) and before the vows, which sit fully in dusk.
const ANCHORS = [
  ['#s0', 1.0], ['#s4', 0.92], ['#s5', 0.82], ['#s7', 0.68],
  ['#s8 .panel', 0.63], ['#s8 .vows', 0.42], ['#s9', 0.4],
  ['#s10', 0.16], ['#s11', 0.03], ['#s12', 0.0],
];

function daylightFromScroll() {
  const mid = window.scrollY + window.innerHeight * 0.5;
  const pts = ANCHORS
    .map(([sel, d]) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { y: r.top + window.scrollY + r.height * 0.5, d };
    })
    .filter(Boolean);
  if (mid <= pts[0].y) return pts[0].d;
  for (let i = 0; i < pts.length - 1; i++) {
    if (mid >= pts[i].y && mid <= pts[i + 1].y) {
      const t = (mid - pts[i].y) / (pts[i + 1].y - pts[i].y);
      return pts[i].d + (pts[i + 1].d - pts[i].d) * t;
    }
  }
  return pts[pts.length - 1].d;
}

let lightingQueued = false;
function updateLighting() {
  if (lightingQueued) return;
  lightingQueued = true;
  requestAnimationFrame(() => {
    lightingQueued = false;
    applyDaylight(daylightFromScroll());
  });
}

/* ------------------------------------------------------------------------- */
/* Reveals — IntersectionObserver, shared by both motion paths               */
/* ------------------------------------------------------------------------- */
// In full-motion mode, [data-beat] elements are choreographed by GSAP instead.
const revealSelector = reducedMotion ? '.will-reveal' : '.will-reveal:not([data-beat])';
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
);
document.querySelectorAll(revealSelector).forEach((el) => io.observe(el));

// The bridge line out of the story ("Neither will you.") — both motion paths.
const bridgeIO = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('revealed'); bridgeIO.unobserve(e.target); }
  }),
  { threshold: 0.9 }
);
document.querySelectorAll('[data-bridge]').forEach((el) => bridgeIO.observe(el));

/* ------------------------------------------------------------------------- */
/* Scroll-depth + funnel events (§8)                                          */
/* ------------------------------------------------------------------------- */
const depthMarks = [25, 50, 75, 100];
let ctaOnScreen = false;
new IntersectionObserver((entries) => {
  entries.forEach((e) => { ctaOnScreen = e.isIntersecting; });
  checkDepth();
}).observe(document.getElementById('s12'));

function checkDepth() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
  depthMarks.forEach((m) => { if (pct >= m) track(`scroll_${m}`); });
  // Sticky pill after 40% depth (§5) — never before, never a popup,
  // and never while the conversion section's own CTA is on screen.
  document.getElementById('sticky-cta')?.classList.toggle('visible', pct >= 40 && !ctaOnScreen);
}

const funnelIO = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    if (e.target.id === 's10') track('reached_fracture');
    if (e.target.id === 's12') track('reached_cta');
  }),
  { threshold: 0.3 }
);
['s10', 's12'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) funnelIO.observe(el);
});

/* ------------------------------------------------------------------------- */
/* Progress bar                                                               */
/* ------------------------------------------------------------------------- */
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  const bar = document.getElementById('progress');
  if (bar) bar.style.transform = `scaleX(${p})`;
}

function onScroll() {
  updateLighting();
  updateProgress();
  checkDepth();
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
onScroll();

/* ------------------------------------------------------------------------- */
/* Full-motion choreography (§5)                                              */
/* ------------------------------------------------------------------------- */
if (!reducedMotion) {
  document.body.classList.add('js-full');
  gsap.registerPlugin(ScrollTrigger);

  // Smooth scrolling
  const lenis = new Lenis({ lerp: 0.11 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Trigger positions are cached at refresh time; the swapped-in web fonts
  // change every prose block's height, so re-measure once they arrive.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  // Parallax on full-bleed media
  document.querySelectorAll('[data-parallax] img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: img.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Section 1 — background sharpens from blur as the hook line fades up
  const sharpen = document.querySelector('[data-sharpen]');
  if (sharpen) {
    gsap.fromTo(sharpen, { filter: 'blur(14px)' }, {
      filter: 'blur(0px)',
      ease: 'none',
      scrollTrigger: { trigger: '#s1', start: 'top 80%', end: 'center center', scrub: true },
    });
  }

  // Section 3 — the exchange. Pinned; four beats land one at a time,
  // with a rest at the end so the last line can breathe before unpinning.
  const beats3 = gsap.utils.toArray('#s3 [data-beat]');
  beats3.forEach((el) => gsap.set(el, { transition: 'none' }));
  const tl3 = gsap.timeline({
    scrollTrigger: { trigger: '#s3', start: 'top top', end: '+=180%', pin: true, scrub: true },
  });
  beats3.forEach((el, i) => {
    tl3.to(el, { opacity: 1, y: 0, duration: 0.14 }, 0.06 + i * 0.2);
  });
  tl3.to({}, { duration: 0.22 });

  // Whisper interludes — a shadow passes over the page (0 → 1 → 0),
  // and the foreshadow lines are only legible while the light is failing.
  document.querySelectorAll('.whisper').forEach((w) => {
    const v = { t: 0 };
    gsap.timeline({
      scrollTrigger: { trigger: w, start: 'top 65%', end: 'bottom 35%', scrub: true },
    })
      .to(v, { t: 1, duration: 0.42, ease: 'power1.inOut', onUpdate: () => w.style.setProperty('--whisper', v.t) })
      .to(v, { t: 1, duration: 0.16, onUpdate: () => w.style.setProperty('--whisper', v.t) })
      .to(v, { t: 0, duration: 0.42, ease: 'power1.inOut', onUpdate: () => w.style.setProperty('--whisper', v.t) });
  });

  // The vows' shadow — the warning fades in beneath the vows as they pass.
  document.querySelectorAll('[data-vows]').forEach((el) => {
    const v = { t: 0 };
    gsap.to(v, {
      t: 1,
      ease: 'none',
      onUpdate: () => el.style.setProperty('--vows-shadow', v.t),
      scrollTrigger: { trigger: el, start: 'top 75%', end: 'top 35%', scrub: true },
    });
  });

  // Section 6 — horizontal montage scrub (the only horizontal moment)
  const track6 = document.querySelector('[data-montage] .montage__track');
  if (track6) {
    const scrollAmount = () => -(track6.scrollWidth - window.innerWidth + 40);
    gsap.to(track6, {
      x: scrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: '[data-montage]',
        start: 'top top',
        end: '+=120%',
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }

  // Sections 8/9 — crossfading figures
  document.querySelectorAll('[data-crossfade]').forEach((fig) => {
    const imgs = fig.querySelectorAll('img');
    if (imgs.length < 2) return;
    gsap.to(imgs[1], {
      opacity: 1,
      ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top 70%', end: 'bottom 40%', scrub: true },
    });
  });

  // Section 10 — the fracture. Pinned; each beat dims the scene a step
  // further, so the room literally darkens as the conversation closes down.
  const s10 = document.getElementById('s10');
  const beats10 = gsap.utils
    .toArray('#s10 [data-beat]')
    .sort((a, b) => Number(a.dataset.beat) - Number(b.dataset.beat));
  beats10.forEach((el) => gsap.set(el, { transition: 'none' }));
  const dim = { v: 0 };
  const tl10 = gsap.timeline({
    scrollTrigger: { trigger: '#s10', start: 'top top', end: '+=240%', pin: true, scrub: true },
  });
  const n10 = beats10.length;
  beats10.forEach((el, i) => {
    const at = 0.08 + (i * 0.8) / n10;
    tl10.to(el, { opacity: 1, y: 0, duration: 0.1 }, at);
    tl10.to(
      dim,
      { v: (i + 1) / n10, duration: 0.08, onUpdate: () => s10.style.setProperty('--fracture-dim', dim.v) },
      at + 0.09
    );
  });
  tl10.to({}, { duration: 0.12 });

  // Section 12 — CTA rises glowing out of the dark
  gsap.from('.cta__inner', {
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: { trigger: '#s12', start: 'top 70%' },
  });

  /* ----------------------------------------------------------------------- */
  /* Word-lift — prose paragraphs raise their words in sequence as they       */
  /* scroll into view. Scrubbed, so it reads the same whether the reader is   */
  /* thumb-scrolling or the auto-scroll is carrying them. Screen readers get  */
  /* the intact sentence via aria-label; the spans are presentation only.     */
  /* ----------------------------------------------------------------------- */
  document.querySelectorAll('.panel p.will-reveal').forEach((p) => {
    const text = p.textContent;
    p.setAttribute('aria-label', text);
    p.classList.add('revealed'); // word spans take over from the block reveal
    p.style.transition = 'none';
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((tok) => {
      if (!tok) return;
      if (/^\s+$/.test(tok)) {
        frag.appendChild(document.createTextNode(tok));
      } else {
        const s = document.createElement('span');
        s.className = 'w';
        s.setAttribute('aria-hidden', 'true');
        s.textContent = tok;
        frag.appendChild(s);
      }
    });
    p.textContent = '';
    p.appendChild(frag);
    gsap.fromTo(
      p.querySelectorAll('.w'),
      { opacity: 0.1, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: 'none',
        stagger: { amount: 0.65 },
        scrollTrigger: { trigger: p, start: 'top 90%', end: 'top 52%', scrub: true },
      }
    );
  });

  // Triggers above are not created in strict document order (pins vs whispers),
  // so re-sort before measuring or pin spacers throw every later start off.
  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  /* ----------------------------------------------------------------------- */
  /* Ambient flamboyant petals.                                               */
  /* A single fixed canvas of drifting red blossoms — dense and warm while    */
  /* the light is golden, thinning as dusk falls, gone entirely by Act III.   */
  /* The tree sheds while the love story is alive; the shadows get no petals. */
  /* ----------------------------------------------------------------------- */
  const petalCanvas = document.createElement('canvas');
  petalCanvas.className = 'petals';
  petalCanvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(petalCanvas);
  const pctx = petalCanvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  let pw = 0;
  let ph = 0;
  const sizePetals = () => {
    pw = petalCanvas.width = Math.round(innerWidth * DPR);
    ph = petalCanvas.height = Math.round(innerHeight * DPR);
  };
  sizePetals();
  window.addEventListener('resize', sizePetals, { passive: true });

  const PETAL_COLORS = ['#c4452a', '#d95b32', '#a33a22'];
  const spawnPetal = (anywhere) => ({
    x: Math.random() * pw,
    y: anywhere ? Math.random() * ph : -20 * DPR,
    s: (Math.random() * 5 + 4) * DPR,
    vy: (Math.random() * 0.5 + 0.35) * DPR,
    drift: Math.random() * Math.PI * 2,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.02,
    o: Math.random() * 0.35 + 0.25,
    c: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0],
  });
  const petals = Array.from({ length: 26 }, () => spawnPetal(true));
  let petalClock = 0;

  gsap.ticker.add((time, deltaMs) => {
    const d = parseFloat(document.documentElement.style.getPropertyValue('--daylight')) || 1;
    const vis = Math.max(0, Math.min(1, (d - 0.4) / 0.25)); // fully gone by dusk
    pctx.clearRect(0, 0, pw, ph);
    if (vis <= 0 || document.hidden) return;
    petalClock += deltaMs * 0.001;
    const step = deltaMs / 16.7;
    for (const p of petals) {
      p.y += p.vy * step;
      p.x += Math.sin(petalClock * 0.9 + p.drift) * 0.4 * DPR * step;
      p.rot += p.vr * step;
      if (p.y > ph + 20 * DPR) Object.assign(p, spawnPetal(false));
      pctx.save();
      pctx.translate(p.x, p.y);
      pctx.rotate(p.rot);
      pctx.globalAlpha = p.o * vis;
      pctx.fillStyle = p.c;
      pctx.beginPath();
      pctx.ellipse(0, 0, p.s, p.s * 0.45, 0, 0, Math.PI * 2);
      pctx.fill();
      pctx.restore();
    }
  });

  /* ----------------------------------------------------------------------- */
  /* Auto-scroll — the 3-minute guided watch.                                 */
  /* One button starts a paced scroll through the whole story; any manual     */
  /* input (wheel, touch, keys) pauses it instantly. Pace is weighted by      */
  /* each section's word count, with extra dwell on pinned scenes and         */
  /* whisper interludes, and it lands on (never scrolls past) the CTA.        */
  /* ----------------------------------------------------------------------- */
  const playBtn = document.getElementById('autoplay-btn');
  const ctl = document.getElementById('autoplay-ctl');
  const TOTAL_MS = 172000;
  const auto = { active: false, raf: 0, plan: [], seg: 0, elapsed: 0, last: 0 };

  const docY = (el) => el.getBoundingClientRect().top + window.scrollY;

  function buildPlan() {
    const stopY = docY(document.getElementById('s12'));
    const pts = [];
    document.querySelectorAll('section').forEach((el) => {
      const y = docY(el);
      if (y >= stopY - 10) return;
      const words = (el.textContent || '').trim().split(/\s+/).filter(Boolean).length;
      let weight = 2500 + words * 150;
      if (el.hasAttribute('data-pin')) weight += 6000;
      if (el.classList.contains('whisper')) weight += 3500;
      if (el.classList.contains('last-line')) weight += 4000; // let it land
      pts.push({ y, weight });
    });
    pts.sort((a, b) => a.y - b.y);
    pts.push({ y: stopY, weight: 0 });
    const totalWeight = pts.reduce((s, p) => s + p.weight, 0);
    const plan = [];
    for (let i = 0; i < pts.length - 1; i++) {
      plan.push({
        from: pts[i].y,
        to: pts[i + 1].y,
        ms: Math.max((pts[i].weight / totalWeight) * TOTAL_MS, 400),
      });
    }
    return plan;
  }

  function tick(now) {
    if (!auto.active) return;
    const dt = Math.min(now - auto.last, 100);
    auto.last = now;
    auto.elapsed += dt;
    const seg = auto.plan[auto.seg];
    const t = Math.min(auto.elapsed / seg.ms, 1);
    lenis.scrollTo(seg.from + (seg.to - seg.from) * t, { immediate: true });
    if (t >= 1) {
      auto.seg += 1;
      auto.elapsed = 0;
      if (auto.seg >= auto.plan.length) {
        stopAuto(true);
        return;
      }
    }
    auto.raf = requestAnimationFrame(tick);
  }

  function startAuto() {
    // The guided watch will pass every image — fetch them all now so photos
    // are ready before the scroll reaches them, even on slow connections.
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
    auto.plan = buildPlan();
    const yNow = window.scrollY;
    auto.seg = auto.plan.findIndex((s) => s.to > yNow + 10);
    if (auto.seg === -1) return; // already at/past the CTA
    const seg = auto.plan[auto.seg];
    const span = seg.to - seg.from || 1;
    auto.elapsed = Math.max(0, ((yNow - seg.from) / span) * seg.ms);
    auto.active = true;
    auto.last = performance.now();
    ctl.hidden = false;
    ctl.textContent = '❚❚  Pause';
    track('autoplay_start');
    auto.raf = requestAnimationFrame(tick);
  }

  function stopAuto(done) {
    auto.active = false;
    cancelAnimationFrame(auto.raf);
    if (done) {
      ctl.hidden = true;
      track('autoplay_complete');
    } else {
      ctl.textContent = '▶  Resume';
    }
  }

  playBtn?.addEventListener('click', () => { if (!auto.active) startAuto(); });
  ctl?.addEventListener('click', () => (auto.active ? stopAuto(false) : startAuto()));

  // Any manual input hands control back to the reader immediately.
  ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((evt) => {
    window.addEventListener(
      evt,
      (e) => {
        if (!auto.active) return;
        if (ctl.contains(e.target) || playBtn?.contains(e.target)) return;
        stopAuto(false);
      },
      { passive: true }
    );
  });
} else {
  // Reduced motion: montage becomes a plain horizontally scrollable strip;
  // whispers and the vows' shadow are simply visible (no scrubbing).
  const m = document.querySelector('[data-montage]');
  if (m) m.style.overflowX = 'auto';
  document.querySelectorAll('.whisper').forEach((w) => w.style.setProperty('--whisper', '1'));
  const rmIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); rmIO.unobserve(e.target); }
    }),
    { threshold: 0.4 }
  );
  document.querySelectorAll('.vows__shadow').forEach((el) => rmIO.observe(el));
}

/* ------------------------------------------------------------------------- */
/* Keziah's File — sealed rows refuse politely (both motion paths)            */
/* ------------------------------------------------------------------------- */
const fileCaption = document.getElementById('file-caption');
document.querySelectorAll('[data-sealed]').forEach((row) => {
  const deny = () => {
    row.classList.remove('denied');
    void row.offsetWidth; // restart the shake animation
    row.classList.add('denied');
    if (fileCaption) fileCaption.textContent = fileCaption.dataset.text || '';
  };
  row.addEventListener('click', deny);
  row.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); deny(); }
  });
});

/* ------------------------------------------------------------------------- */
/* Email capture (§6)                                                         */
/* ------------------------------------------------------------------------- */
document.querySelectorAll('.capture-form').forEach((form) => {
  const msg = form.parentElement.querySelector('.capture__msg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const endpoint = form.getAttribute('action');
    const email = form.querySelector('input[type="email"]').value;
    if (!endpoint || endpoint === '#') {
      msg.textContent = 'Email signup is almost ready — check back soon.';
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: form.dataset.source || 'site' }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track('email_submit', false);
      msg.textContent = msg.dataset.success || 'Chapter 4 is on its way. Check your inbox.';
      form.reset();
    } catch {
      msg.textContent = 'Something went wrong — please try again.';
    } finally {
      btn.disabled = false;
    }
  });
});

/* ------------------------------------------------------------------------- */
/* Release modal — the primary CTA opens the September announcement           */
/* ------------------------------------------------------------------------- */
const releaseModal = document.getElementById('release-modal');
const buyCta = document.getElementById('buy-cta');
if (releaseModal && buyCta && buyCta.getAttribute('href') === '#capture') {
  buyCta.addEventListener('click', (e) => {
    e.preventDefault();
    releaseModal.showModal();
    track('release_modal_open', false);
  });
  document.getElementById('release-close')?.addEventListener('click', () => releaseModal.close());
  releaseModal.addEventListener('click', (e) => {
    // click on the backdrop (outside the panel) closes
    if (e.target === releaseModal) releaseModal.close();
  });
}

/* ------------------------------------------------------------------------- */
/* Exit intent — desktop only, once per session, offers Chapter 4 (§6)        */
/* ------------------------------------------------------------------------- */
const isDesktop = window.matchMedia('(pointer: fine) and (min-width: 768px)').matches;
if (isDesktop && !sessionStorage.getItem('exitIntentShown')) {
  const panel = document.getElementById('exit-intent');
  const show = (e) => {
    if (e.clientY > 24 || sessionStorage.getItem('exitIntentShown')) return;
    sessionStorage.setItem('exitIntentShown', '1');
    panel.classList.add('visible');
    panel.setAttribute('aria-hidden', 'false');
    track('exit_intent_shown');
    document.removeEventListener('mouseout', show);
  };
  document.addEventListener('mouseout', show);
  document.getElementById('exit-close')?.addEventListener('click', () => {
    panel.classList.remove('visible');
    panel.setAttribute('aria-hidden', 'true');
  });
}
