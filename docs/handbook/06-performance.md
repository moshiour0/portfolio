# 06 — Performance

The site runs a playing video, a WebGL mesh and five card decks at once. This
chapter is how that stays at 60fps, and the full record of the mobile
investigation.

---

## 1. The rules that apply everywhere

**Animate only `transform` and `opacity`.** Both are handled by the compositor
without touching layout or paint. Every carousel card, the crossfade, the
reveals and the scale push-in obey this.

**Never animate through React.** All motion state lives in a `useRef` and is
written straight to `element.style` inside one `requestAnimationFrame` loop. A
deck spinning at 60fps causes zero React renders.

**Sample scroll inside rAF.** Reading `getBoundingClientRect()` in a scroll
handler forces synchronous layout mid-scroll. Every scroll listener here
schedules a rAF and cancels the previous one, so a burst of events produces one
computation per frame.

**One decoder.** Ten of eleven video layers are paused at all times.

**Idle anything invisible.** WebGL stops when a clip covers it or the tab is
hidden; carousels stop when off screen; the `Reveal` observer disconnects after
firing once.

---

## 2. First-load payload

The repository carries **67MB** of video. A first-time visitor downloads:

    01-hero-ascent.webm   2116KB
    01-hero-ascent.jpg     201KB
    05-intro-river.jpg     104KB
    ─────────────────────────────
    total                 2421KB   (3 files, 2 of 11 layers armed)

Everything else arrives only as you scroll, one section ahead of need.

Two payload reductions happened during the build:

- **Posters: 4.2MB → 627KB.** They were exported at full resolution; they are
  only ever seen behind a video or as a reduced-motion still.
- **4.7MB of spec files removed from `public/`.** Your asset-spec JSON and CSS
  were sitting in the public directory, which meant they were _served_ — and
  crawlable. They moved to `docs/asset-spec/`, where they are still in the repo
  and still readable, but not shipped.

---

## 3. The mobile problem

Your report: _"mobile experience is not good at all, its not smooth in mobile
phn but in desktop its smooth experience."_

### Measuring it

Profiled with Playwright on an emulated 390x844 phone (`isMobile`, `hasTouch`,
DPR 2) with the Chrome DevTools Protocol throttling the CPU 4x:

```js
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
```

Baseline, scrolling the full page:

    medianMs        266.7        (a smooth frame is 16.7ms)
    p95Ms           666.7
    janky           83 of 86 frames
    longTasks       72  (max 774ms)
    backdropFilters 48
    blurFilters     93
    carousels       5   (all running)
    lenisActive     true

83 of 86 frames janky is not a tuning problem. Something structural was wrong.

### What the numbers pointed at

**48 `backdrop-filter` elements.** Each one forces its own compositing layer
_and_ re-blurs everything behind it every frame. With thirty-odd glass cards
over a playing video, that alone is the whole budget.

**93 blurred elements.** The carousel's per-frame `filter: blur()` on every
card, times five decks.

**Lenis active.** Scroll position being computed in JavaScript on a device with
hardware momentum scrolling.

**A WebGL canvas**, rendering a mesh that is behind an opaque video almost
everywhere on a phone.

**Five carousel rAF loops**, running whether or not visible.

### The four structural fixes

**1 — Native scrolling on touch** ([`SmoothScroll.tsx`](../../components/SmoothScroll.tsx))

```tsx
if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
```

**2 — No WebGL on touch** ([`three/Scene.tsx`](../../components/three/Scene.tsx))

```tsx
const smallOrTouch = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
if (smallOrTouch) {
  setSupported(false);
  setReady(true);
  return;
}
```

Previously this downshifted to a `MOBILE` tier. But on a phone the mesh is
behind a playing clip almost everywhere, so the right answer is not a smaller
mesh — it is no mesh. The aurora gradient underneath still carries the sections
that have no clip.

**3 — Idle and unblurred decks** ([`Carousel3D.tsx`](../../components/ui/Carousel3D.tsx))

IntersectionObserver gating plus `coarse ||` in front of every blur assignment.

**4 — A `pointer: coarse` block in CSS** ([`globals.css`](../../app/globals.css))

```css
@media (pointer: coarse) {
  .card-face,
  .backdrop-blur-md,
  .backdrop-blur-xl,
  .backdrop-blur-sm,
  .backdrop-blur {
    backdrop-filter: none !important;
  }
  .card-face {
    background:
      linear-gradient(165deg, #eef2ec12 0%, #eef2ec06 42%, #eef2ec03 100%), rgba(10, 15, 14, 0.93);
  }
  .spiral-glow {
    filter: none;
    animation: none;
  }
  .hero-orb {
    filter: blur(28px);
    animation: none;
  }
  .reveal {
    filter: none;
  }
  .carousel-viewport {
    mask-image: none;
  }
}
```

The glass becomes flat translucency, with the surface opacity raised from 0.86
to 0.93 to compensate for the lost blur. Over a dark scrim it looks
near-identical and costs nothing.

### Result

|                      | before  | after   |
| -------------------- | ------- | ------- |
| backdrop-filters     | 48      | **0**   |
| blur filters         | 93      | **8**   |
| WebGL canvas         | on      | **off** |
| rAF calls per scroll | 1014    | **194** |
| Lenis                | active  | **off** |
| median frame         | 266.7ms | 200ms   |

Structurally solved — but the median had barely moved. So the next question was
what was left.

### Isolating the remainder

Same build, three conditions:

    current (video playing)      median= 250ms   janky=43/54   longTasks=46
    video stopped                median= 267ms   janky=41/49   longTasks=44
    reduced motion (no video)    median=  17ms   janky= 9/216  longTasks= 0

**17ms with no video versus 250ms with one.** Everything remaining was video
decode.

---

## 4. What was done about video

### Phone-specific encodes

854x480 H.264, downscaled from the finished 30fps files so the baked playback
timing survives:

| clip                  | desktop | mobile    |
| --------------------- | ------- | --------- |
| 01-hero-ascent        | 3207KB  | **510KB** |
| 02-experience-canopy  | 3411KB  | 1174KB    |
| 03-projects-depths    | 5674KB  | 1958KB    |
| 04-contact-summit     | 1076KB  | 299KB     |
| 05-intro-river        | 3079KB  | 1192KB    |
| 06-pillars-forest     | 2730KB  | 1066KB    |
| 07-skills             | 2508KB  | 989KB     |
| 08-education          | 2139KB  | 789KB     |
| 09-achievements-ridge | 2190KB  | 825KB     |
| 10-about-philosophy   | 2714KB  | 1097KB    |
| 11-exploring          | 2104KB  | 861KB     |

### Pausing during scroll

Decode competes with scroll, so on touch the clip pauses while the page moves
and resumes 180ms after it stops. Verified live: 0.08 videos playing on average
mid-scroll; all eight clip sections resume at rate 1 when it ends.

### A floor for weak devices

Devices reporting ≤2 cores or ≤2GB RAM never start a video at all.

---

## 5. An honest limitation

After the mobile encodes landed, the harness median stayed around 200–280ms.
That is **not** a measure of a real phone.

Headless Chromium runs on SwiftShader — a _software_ rasteriser with **no
hardware video decode**. Every video frame is decoded on the CPU and composited
in software, then throttled a further 4x. On a real phone, decode happens in
dedicated silicon and compositing on the GPU; a paused or playing video layer
costs the main thread close to nothing.

So the harness cannot show the video improvement, and no amount of tuning would
have driven its number to 17ms without removing video entirely.

**What the harness _can_ measure honestly is structure**, and those numbers are
device-independent: 48 backdrop-filters really did become 0, 1014 rAF calls
really did become 194, and Lenis really is off. Those are the changes to trust.

This distinction is worth carrying forward: know which of your measurements
describe your code and which describe your measuring instrument.

---

## 6. Desktop is deliberately untouched

Verified on the live site at 1440x900:

    coarse            false
    lenis             true
    webgl             true
    backdropFilters   52
    videos            01-hero-ascent.webm, 05-intro-river.webm, 07-skills.webm, ...
    mobileEncodesUsed false
    errors            []

Every mobile optimisation is gated behind `(pointer: coarse)` or
`(max-width: …)`. None of them reach a desktop.

---

## 7. If you need to profile again

The scripts are in chapter 10. The short version:

```bash
node mobileperf.mjs http://localhost:3001    # frame times under 4x CPU throttle
node isolate.mjs    http://localhost:3001    # video on / off / reduced-motion
node payload.mjs    http://localhost:3001    # first-load bytes
node desktopok.mjs  http://localhost:3001    # confirm desktop is unaffected
```

Always compare against the reduced-motion baseline. It tells you the floor your
page could reach, and therefore how much of what you are seeing is actually
addressable.
