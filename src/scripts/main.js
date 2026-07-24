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
  { d: 0.6,  ground: '#dfc094', ink: '#2b2118', inkSoft: '#54432f', panel: [245, 235, 220, 0.82], glow: '#e8a33d' },
  { d: 0.47, ground: '#4a3a2d', ink: '#ede2d0', inkSoft: '#c9b79f', panel: [42, 33, 26, 0.82],   glow: '#c98f3a' },
  { d: 0.3,  ground: '#3e3128', ink: '#ede2d0', inkSoft: '#c2b096', panel: [36, 29, 23, 0.84],   glow: '#b27f33' },
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
const ANCHORS = [
  ['s0', 1.0], ['s4', 0.92], ['s5', 0.82], ['s7', 0.65],
  ['s8', 0.55], ['s9', 0.42], ['s10', 0.16], ['s11', 0.03], ['s12', 0.0],
];

function daylightFromScroll() {
  const mid = window.scrollY + window.innerHeight * 0.5;
  const pts = ANCHORS
    .map(([id, d]) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return { y: el.offsetTop + el.offsetHeight * 0.5, d };
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

  // Section 3 — the exchange. Pinned; two lines land with a beat between them.
  const beats3 = gsap.utils.toArray('#s3 [data-beat]');
  beats3.forEach((el) => gsap.set(el, { transition: 'none' }));
  gsap.timeline({
    scrollTrigger: { trigger: '#s3', start: 'top top', end: '+=140%', pin: true, scrub: true },
  })
    .to(beats3[0], { opacity: 1, y: 0, duration: 0.2 }, 0.08)
    .to(beats3[1], { opacity: 1, y: 0, duration: 0.2 }, 0.55)
    .to({}, { duration: 0.25 }); // rest — let the exchange breathe before unpinning

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

  // Section 10 — the fracture. Pinned; each dialogue beat dims the scene.
  const s10 = document.getElementById('s10');
  const beats10 = gsap.utils.toArray('#s10 [data-beat]');
  beats10.forEach((el) => gsap.set(el, { transition: 'none' }));
  const dim = { v: 0 };
  gsap.timeline({
    scrollTrigger: { trigger: '#s10', start: 'top top', end: '+=200%', pin: true, scrub: true },
  })
    .to(beats10[0], { opacity: 1, y: 0, duration: 0.12 }, 0.1)
    .to(dim, { v: 0.35, duration: 0.15, onUpdate: () => s10.style.setProperty('--fracture-dim', dim.v) }, 0.22)
    .to(beats10[1], { opacity: 1, y: 0, duration: 0.12 }, 0.42)
    .to(dim, { v: 0.7, duration: 0.15, onUpdate: () => s10.style.setProperty('--fracture-dim', dim.v) }, 0.54)
    .to(beats10[2], { opacity: 1, y: 0, duration: 0.12 }, 0.72)
    .to(dim, { v: 1, duration: 0.2, onUpdate: () => s10.style.setProperty('--fracture-dim', dim.v) }, 0.8);

  // Section 12 — CTA rises glowing out of the dark
  gsap.from('.cta__inner', {
    opacity: 0,
    y: 60,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: { trigger: '#s12', start: 'top 70%' },
  });
} else {
  // Reduced motion: montage becomes a plain horizontally scrollable strip.
  const m = document.querySelector('[data-montage]');
  if (m) m.style.overflowX = 'auto';
}

/* ------------------------------------------------------------------------- */
/* Email capture (§6)                                                         */
/* ------------------------------------------------------------------------- */
const form = document.getElementById('capture-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('capture-msg');
    const endpoint = form.getAttribute('action');
    const email = form.querySelector('input[type="email"]').value;
    if (!endpoint || endpoint === '#') {
      // OPEN ITEM §9.3: wire config.emailEndpoint to the email provider.
      msg.textContent = 'Email signup is almost ready — check back soon.';
      return;
    }
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track('email_submit', false);
      msg.textContent = 'Chapter 4 is on its way. Check your inbox.';
      form.reset();
    } catch {
      msg.textContent = 'Something went wrong — please try again.';
    }
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
