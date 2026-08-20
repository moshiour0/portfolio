# 10 — How everything was verified

Almost every hard problem in this build was solved the same way: **write
something that can see the problem as a number, then change code until the
number is right.** "The cards overlap the fish" is an argument. "19.5% of the
subject box is covered" is a fact you can fix and re-check.

The harness that produced those numbers now lives in
[`tools/verify/`](../../tools/verify/).

---

## Running them

They drive a real Chromium through Playwright, so install it once:

```bash
npm install --no-save playwright
npx playwright install chromium
```

Then serve a production build and point the scripts at it:

```bash
npm run build
npm start                       # port 3000
node tools/verify/fit.mjs http://localhost:3000 shots/
```

Always test the **production** build. A dev build carries HMR machinery,
unminified React and no static optimisation — its performance numbers are
meaningless, and its layout can differ.

---

## The scripts

| Script            | Answers                                                               | Arguments        |
| ----------------- | --------------------------------------------------------------------- | ---------------- |
| `fit.mjs`         | Does every section fit in one frame at 1440x900, 1280x800, 1920x1080? | `<url> <outDir>` |
| `cardcrop.mjs`    | Is any card taller than its stage? Does any card cover a heading?     | `<url>`          |
| `safezone.mjs`    | Does copy overlap the subject of the clip behind it?                  | `<url>`          |
| `mobileframe.mjs` | On a 390x844 phone, is each clip's subject inside the visible crop?   | `<url> <outDir>` |
| `navall.mjs`      | Does every nav link from every sub-route land on its section?         | `<url>`          |
| `rm-check.mjs`    | Does reduced motion download zero video? Any horizontal overflow?     | `<url>`          |
| `payload.mjs`     | What does a first-time visitor actually download?                     | `<url>`          |
| `find404.mjs`     | Any missing assets?                                                   | `<url>`          |
| `mobileperf.mjs`  | Frame times on a 4x-throttled phone, plus a structural census         | `<url>`          |
| `isolate.mjs`     | How much of the cost is video? (on / stopped / reduced-motion)        | `<url>`          |
| `desktopok.mjs`   | Confirms desktop still has Lenis, WebGL, blur and WebM                | `<url>`          |
| `pauseprobe.mjs`  | Which sources a phone loads; is video paused during scroll?           | `<url>`          |
| `resume.mjs`      | Does video resume at 1x on every clip section after scrolling stops?  | `<url>`          |

---

## The techniques worth reusing

### Emulate a phone properly

```js
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true, // ← without this, (pointer: coarse) is false
});
```

`hasTouch` is the one people forget. Without it, every `(pointer: coarse)`
media query evaluates false and you are silently testing the desktop path while
believing you are testing mobile.

### Throttle the CPU

```js
const cdp = await ctx.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
```

A desktop CPU hides mobile problems completely.

### Measure frame times, not vibes

```js
let last = performance.now();
const durations = [];
const step = () => {
  const now = performance.now();
  durations.push(now - last);
  last = now;
  window.scrollBy(0, 22);
  requestAnimationFrame(step);
};
```

Report the **median, p95 and worst** — an average hides exactly the stutters
you are chasing. Count "janky" frames (over ~32ms) as a share of total.

### Catch long tasks

```js
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) longTasks.push(entry.duration);
}).observe({ entryTypes: ["longtask"] });
```

A long task is anything blocking the main thread over 50ms. `longTaskMax` is
often more diagnostic than the median — it points at one specific bad
operation.

### Census the page structure

```js
backdropFilters: [...document.querySelectorAll("*")]
  .filter(e => getComputedStyle(e).backdropFilter !== "none").length,
blurFilters: [...document.querySelectorAll("*")]
  .filter(e => getComputedStyle(e).filter.includes("blur")).length,
```

These counts are **device-independent** — unlike frame times, they mean the
same thing on any machine. When your instrument is unreliable (chapter 06 §5),
structural counts are what you can still trust.

### Always establish a floor

`isolate.mjs` exists because "200ms is bad" is not actionable until you know
what the page could reach. Running the same build with video disabled gave
**17ms**, which proved the entire remaining cost was decode — and therefore
that no amount of DOM tuning would help.

### Prove the negative

```js
page.on("response", (r) => {
  if (/\.(mp4|webm)$/i.test(r.url())) videos.push(r.url());
});
```

`rm-check.mjs` asserts that a reduced-motion visitor downloads **nothing**.
Testing that something does _not_ happen is often more valuable than testing
that it does.

### Measure geometry, not screenshots

```js
const overlap =
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
const pct = (overlap / (b.width * b.height)) * 100;
```

This is what turned "the cards are on the fish" into 78% → 19.5% → 0.6%.
Screenshots tell you something is wrong; geometry tells you how wrong, and
whether your fix helped.

---

## The trap: when the test is wrong, not the code

This happened four times during the build, and each time the honest move was to
fix the test and say so.

- A script still referenced `#experience` after the section was renamed
  `journey`.
- A script used the `cover` crop formula while the code was briefly on
  `contain`.
- A script measured `#projects` looking for the fish, which lives in
  `#research`.
- `fit.mjs` reported a 7px overflow that was **`.carousel-viewport`** — a
  deliberately transparent ±120px air box. No actual card exceeded the frame,
  and the section element measured exactly 800px. The fix was to add it to the
  harness's decorative-exclusions list, not to change the layout.

That last one is the instructive case. The check was:

```js
const DECOR = /curtain|hero-orb|spiral-glow|video-scrim|grain|carousel-viewport/;
```

An element can be present, sized, and `checkVisibility() === true` while
painting nothing at all. If you measure "everything visible", you will measure
invisible things too.

**Before believing a failure, ask whether the test still describes reality.**
Renamed ids, changed CSS strategies and invisible layout helpers all produce
confident, plausible, wrong results.

---

## The current state

Everything below passes on the live production build.

    fit           3 viewports x 7 framed sections   all FIT, 0 errors
    cardcrop      5 decks                            no crop, no card over a heading
    navall        5 routes x 2 links                 all land at sectionTop=0
    rm-check      reduced motion                     0 videos downloaded, 0 overflow
    mobileframe   10 plates at 390x844               every subject CENTRED, fit=cover
    payload       first load                         2421KB / 3 files / 2 of 11 layers
    find404       whole site                         none
    desktopok     1440x900                           Lenis on, WebGL on, 52 blurs, WebM
    pauseprobe    390x844                            /video/m/ sources, paused while scrolling
    resume        8 clip sections                    all resume at 1x, exactly one playing
