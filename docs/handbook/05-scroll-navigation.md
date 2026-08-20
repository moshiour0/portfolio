# 05 — Scroll and navigation

---

## 1. Lenis, on desktop only

[Lenis](https://github.com/darkroomengineering/lenis) replaces the browser's
wheel handling with an eased interpolation, so a mouse wheel glides instead of
stepping.

```tsx
const lenis = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.6 });
```

**It is disabled entirely on touch devices:**

```tsx
if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) {
  return;
}
```

This is the single most important line in the mobile performance work. Lenis
drives scroll position from JavaScript, frame by frame. On a desktop that is a
worthwhile trade — a wheel is a coarse input and smoothing it genuinely helps.
On a phone it _replaces hardware momentum scrolling with main-thread work_, and
every frame then competes with video decoding and compositing. Native touch
scrolling is both smoother and free.

The proximity snap goes with it, because snapping fights a finger far more than
it fights a wheel.

---

## 2. Proximity snap

Each section is a full frame, so once scrolling stops the page looks at the
nearest section edge:

```tsx
const SNAP_THRESHOLD = 0.3; // share of the viewport
const IDLE_MS = 130; // quiet time before settling
```

- If the reader has already brought a section **most of the way in** (within
  30% of a viewport), finish the job for them.
- If they are **mid-journey between two sections**, leave them alone.

That distinction is what makes it _proximity_ snap rather than mandatory
snapping. It never fights someone deliberately scrolling past. This is your
requirement — _"if you get the content section close to the setting position
then it should automatically and smoothly settle its place"_.

Two guards keep it from misbehaving:

```tsx
// Already parked, or too far to be "nearly there" — leave it.
if (!target || Math.abs(closest) < 2 || Math.abs(closest) > viewport * SNAP_THRESHOLD) return;

// Never snap past the end of the document, or the page fights itself.
const maxScroll = document.documentElement.scrollHeight - viewport;
if (window.scrollY + closest > maxScroll - 2) return;
```

Plus a `settling` latch and an 1100ms failsafe timer, in case `onComplete`
is skipped by an interrupting gesture.

---

## 3. Route-aware navigation

You reported that nav links stopped working after navigating to a sub-page.

**The cause:** the nav called `scrollToId(id)` unconditionally. That works on
the homepage, where `#research` exists. From `/projects` there _is_ no
`#research` element — so the click did nothing at all.

**The fix** is in [`components/Nav.tsx`](../../components/Nav.tsx):

```tsx
const pathname = usePathname();
const onHome = pathname === "/";

const go = (event, id) => {
  setOpen(false);
  if (!onHome) return; // let the <Link> navigate to /#id instead
  event.preventDefault();
  scrollToId(id);
  history.replaceState(null, "", `#${id}`);
};
```

On the homepage the click is intercepted and scrolled smoothly. Anywhere else
the default `<Link href="/#id">` navigation is allowed to proceed.

`history.replaceState` rather than `pushState` — so the back button returns to
the previous _page_, not through every section you scrolled past.

---

## 4. HashScroll — the hard half

Navigating to `/#research` from another route is harder than it looks, and it
needed its own component:
[`components/HashScroll.tsx`](../../components/HashScroll.tsx).

**Problem one:** `SmoothScroll` lives in the layout and never remounts on a
client navigation, so a hash handler there only runs on a full page load.
`HashScroll` mounts with the homepage instead.

**Problem two, the serious one:** the homepage grows from roughly **1900px to
14851px** as sections lay out, carousels measure their cards, and fonts load.
Scrolling immediately aims at a position that no longer exists a moment later.

The solution waits for the document height to stop changing:

```tsx
// Height unchanged for a few consecutive frames means layout has landed.
stableFor = height === lastHeight ? stableFor + 1 : 0;
lastHeight = height;
waited += 1;

if (!el || (stableFor < 6 && waited < 120)) {
  raf = requestAnimationFrame(settleThenScroll);
  return;
}

scrollToId(id);
```

Six consecutive equal frames, with a 120-frame (~2s) escape hatch so a page
that never settles still scrolls.

Then it **confirms the landing** four more times, because the carousels keep
adding height for a while afterwards and how long depends on which route you
came from:

```tsx
for (const delay of [1300, 2200, 3200, 4400]) {
  window.setTimeout(() => {
    const target = document.getElementById(id);
    if (target && Math.abs(target.getBoundingClientRect().top) > 6) scrollToId(id);
  }, delay);
}
```

Once it is within 6px the checks are no-ops. Verified: every section link from
every sub-route lands at `sectionTop = 0`.

---

## 5. Shared scroll utilities

**[`lib/scroll.ts`](../../lib/scroll.ts)** holds the Lenis instance in a module
variable so any component can scroll without prop-drilling — and falls back
gracefully when Lenis is not running (which is always, on mobile):

```tsx
if (instance) instance.scrollTo(target, { offset: 0, duration: 1.1 });
else target.scrollIntoView({ behavior: "smooth", block: "start" });
```

**[`lib/useScrollProgress.ts`](../../lib/useScrollProgress.ts)** is one passive
listener shared by the WebGL backdrop. It samples **inside `requestAnimationFrame`**,
which matters: reading `scrollY` and `scrollHeight` in a scroll handler forces
layout synchronously, mid-scroll. Sampling in rAF batches it with the frame.

The same pattern is used in `VideoBackdrop`:

```tsx
const onScroll = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(compute);
};
```

`cancelAnimationFrame` before scheduling means a burst of scroll events
produces exactly **one** computation per frame, not twenty.

---

## 6. Which section owns the viewport

```tsx
const line = window.innerHeight * 0.42; // biased slightly above centre

for (const id of SECTION_ORDER) {
  const el = document.getElementById(id);
  if (!el) continue;
  const rect = el.getBoundingClientRect();
  if (rect.top <= line && rect.bottom > line) {
    current = id;
    break;
  }
}
```

A single horizontal line at 42% of the viewport height. Whichever section
crosses it owns the backdrop.

The 42% bias is deliberate — at exactly 50% the swap happens _after_ the new
section is already dominant, which reads as late. Slightly high, and the
backdrop changes as the section takes over.

The nav uses a different mechanism for the same question — an
`IntersectionObserver` with `rootMargin: "-45% 0px -45% 0px"`, which reduces the
root to a thin band across the middle and reports whichever section intersects
it most. Two mechanisms because they answer slightly different questions: the
backdrop needs a hard single winner every frame, the nav needs a stable
highlight that does not flicker.
