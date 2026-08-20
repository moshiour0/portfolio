# 04 — Layout, type and colour

---

## 1. The palette is measured, not chosen

You asked me to _"match all the colors with background, think which color suits
for me and for background"_. So the palette was taken **from the footage**
rather than imposed on it.

Every clip is the same world — overcast, misty, forest — and the one constant
across all eleven is **your dim yellow raincoat**. That became the identity
colour.

```css
@theme {
  --color-bg: #0a0f0e; /* near-black with a green cast, to match forest shadow */
  --color-surface: #121a18;
  --color-surface-2: #1a2422;
  --color-line: #1f2b28;
  --color-line-strong: #35463f;

  --color-text: #eef2ec; /* warm off-white — pure white is harsh over video */
  --color-muted: #aab7ad;
  --color-dim: #78877d;

  --color-accent: #c9b356; /* your jacket */
  --color-accent-hover: #dcc76a;
  --color-accent-2: #83a0ad; /* the river */
  --color-accent-3: #7a9a55; /* the moss */
}
```

Three consequences worth understanding:

- **The background is not neutral grey.** `#0a0f0e` has a deliberate green
  cast so that when the video fades out, the ground underneath still belongs
  to the same world.
- **The accent appears in the footage in every section**, so highlighted text
  never looks pasted on.
- **Text is `#eef2ec`, not `#ffffff`.** Pure white over dark video is
  fatiguing and reads as a UI layer rather than part of the image.

Tailwind v4 has no config file. These tokens in `@theme` generate `bg-bg`,
`text-accent`, `border-line-strong` and so on automatically.

---

## 2. Safe-zone columns

Each clip places its subject differently, so the copy column is sized **per
section** rather than from a shared preset.

```tsx
<Section id="skills"    side="right" columnPct={32}>
<Section id="pillars"   side="right" columnPct={50}>
<Section id="exploring" side="left"  columnPct={56}>
```

`columnPct` is the column width as a share of the page shell, derived from
where that clip's subject ends — the numbers come from
[`docs/asset-spec/new-assets-spec.json`](../asset-spec/new-assets-spec.json),
which you supplied.

`side` is normally `"right"` because most plates put the subject on the left.
`exploring` is mirrored, so it takes `"left"`.

```css
@media (min-width: 1024px) {
  .safe-column {
    width: var(--col);
  }
  .safe-right {
    margin-left: auto;
  }
  .safe-left {
    margin-right: auto;
  }
}
```

Below `lg` the safe zones collapse entirely and copy takes the full width —
matching the mobile rule in your asset spec, and matching the scrim, which also
goes full-width below 768px.

---

## 3. Type that is calculated, not guessed

You asked why the font sizes had no mathematical basis. They do now.

**The mechanism is a container query.** The copy column declares itself a
container, so `cqw` units become a share of the _measured safe zone_ rather
than of the window:

```css
.section-column {
  container-type: inline-size;
}
```

**The derivation**, written out in the stylesheet so it can be checked:

    column width  W  = 56% of a 1152px shell     ≈ 645px on a 1440 frame
    display face advance                         ≈ 0.55em per character
    longest section title "Capabilities"         = 12 characters

    title at 8.4cqw  = 0.084 × 645 ≈ 54px
    line length      = 12 × 0.55 × 54 ≈ 356px ≈ 55% of the column

Comfortably unbroken, with margin to spare.

**Each size carries three bounds:**

```css
@utility fit-title {
  font-size: clamp(2rem, min(9.2cqw, 6vh), 4rem);
  line-height: 1.05;
}
```

- **Floor** in `rem` — never drops below readable.
- **Preferred** is `min(cqw, vh)` — the width-derived size, _capped by height_
  so a short viewport shrinks the type instead of pushing the section past one
  frame.
- **Ceiling** in `rem` — never becomes a billboard on a 4K monitor.

That `min(9.2cqw, 6vh)` is the whole trick, and it is why the site holds "one
section, one frame" across every screen tested.

**Card interiors are budgeted purely in `vh`**, because the carousel is handed
whatever height is left after the heading and controls, and the card must live
inside it:

```css
@utility fit-card-title {
  font-size: clamp(1.35rem, 3.2vh, 2.15rem);
  line-height: 1.12;
}
@utility fit-card-body {
  font-size: clamp(0.9rem, 2vh, 1.0625rem);
  line-height: 1.5;
}
```

The full set is `fit-title`, `fit-lead`, `fit-meta`, `fit-card-title`,
`fit-card-kind`, `fit-card-body`, `fit-card-meta`.

### Three type families

```css
--font-sans: var(--font-body) /* body copy */ --font-display: var(--font-display)
  /* headings — heavier, tighter */ --font-mono: var(--font-mono)
  /* section indices, metadata, labels */;
```

Loaded through `next/font` in `app/layout.tsx`, so they are self-hosted,
preloaded, and emit a `font-display` strategy that avoids layout shift.

---

## 4. One section, one frame

```tsx
frame ? "section-frame flex min-h-[100svh] items-center py-14 md:py-16" : "py-20 md:py-28";
```

`100svh` — _small_ viewport height — not `100vh`. On mobile browsers `vh` is
measured against the viewport with toolbars hidden, so a `100vh` section is
taller than the visible area until you scroll. `svh` measures the smallest
state, so a section always fits.

Sections with `frame={false}` (intro, journey, education, about, achievements)
are the long-form text ones that legitimately run past a screen. Framing them
would force awkward truncation.

### Short-viewport padding

```css
@media (min-width: 768px) and (max-height: 860px) {
  .section-frame {
    padding-top: 2.25rem;
    padding-bottom: 2.25rem;
  }
}
```

A 1280x800 laptop has ~80px less room than a 900px-tall screen. Because the
coverflow deck is sized _from the cards_ rather than clipped to a budget
(chapter 03 §2), the padding yields instead of the cards. **Cropping the cards
is what this design deliberately does not do** — it was your explicit
complaint, and the fix must not quietly reintroduce it.

### Heading z-order

```tsx
<Reveal className="relative z-50 mb-4 md:mb-5">
```

`z-50` against the carousel's ceiling of `z-30`. Cards pass in front of
everything else, but never over the title.

---

## 5. Reveal and SplitText

`Reveal` fades and lifts its children the first time they enter the viewport,
using one `IntersectionObserver` that disconnects after firing:

```tsx
observer.disconnect(); // fires once, then stops observing
```

The stagger is a CSS custom property rather than a timer, so the browser
schedules it:

```tsx
style={{ "--reveal-delay": `${delay}ms` }}
```

```css
@utility reveal {
  opacity: 0;
  transform: translateY(34px) scale(0.985);
  filter: blur(6px);
  transition:
    opacity 1s var(--ease-out-expo),
    transform 1s var(--ease-out-expo),
    filter 0.8s var(--ease-out-expo);
  transition-delay: var(--reveal-delay, 0ms);
}
```

On coarse pointers the `filter: blur(6px)` is removed (the fade and lift stay)
— blur was the expensive part.

`SplitText` animates headings per character, again with a CSS custom property
per character rather than 30 timers.

---

## 6. Two easing curves, used everywhere

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-back: cubic-bezier(0.22, 1.15, 0.36, 1);
```

`ease-out-expo` moves fast then settles slowly — it is what makes the crossfade
and the reveals feel expensive rather than mechanical. `ease-out-back`
overshoots slightly, used sparingly for things that should feel physical.

Using exactly two curves site-wide is deliberate. Inconsistent easing is one of
the quietest ways a design reads as unfinished.
