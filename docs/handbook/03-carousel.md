# 03 — The 3D carousel

One component, [`components/ui/Carousel3D.tsx`](../../components/ui/Carousel3D.tsx),
665 lines, used by five sections. It auto-rotates, can be grabbed and spun in
any direction, snaps to the nearest card, holds it long enough to read, then
drifts on.

---

## 1. Three layouts, one component

| Variant     | Used by                              | Behaviour                                                                                    |
| ----------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| `coverflow` | pillars, projects, skills, exploring | Active card centred, upright, full size; neighbours scaled down, angled away, stacked behind |
| `orbit`     | research                             | Cards walk _around_ the middle of the frame, leaving the centre permanently clear            |
| `ring`      | fallback                             | Cards on a cylinder rotating toward the viewer                                               |

`coverflow` is the style you specified: centre card in front at full scale and
opacity, neighbours faded and behind.

`orbit` exists for one reason: the `research` plate has the fish **dead
centre**. You asked that the cards move _around_ it rather than sitting on it.

`ring` is the automatic fallback when there is not enough width to orbit — a
phone, mainly.

---

## 2. Sizing: budget first, cards second

Everything is derived from a viewport-height budget so a section always fits in
one frame:

```tsx
const budget = Math.round((window.innerHeight * budgetVh) / 100);
```

Each section passes its own share: `budgetVh={52}` for pillars, `47` for
projects, `45` for research, `50` for skills and exploring. That is the space
left once the heading and controls have taken theirs.

### Card width is derived, not chosen

```tsx
const cardWidth = Math.round(Math.min(540, Math.max(236, w * (w < 560 ? 0.86 : 0.6))));
```

A narrow card makes a _tall_ card, because the same text wraps into more lines.
So wide columns get a wider cap (0.6 of the column, up to 540px) to keep the
deck short enough to sit in one frame with its controls. Below 560px the card
takes 86% of the column.

### The budget is a floor, not a ceiling

```tsx
const cardHeight = Math.round(tallest || budget * 0.85);
const stageHeight = Math.max(budget, cardHeight + 24);
```

This line is the fix for a bug you reported directly — _"cards crops upper and
lower side"_. The original code clamped the stage **to** the budget, so when
the type grew the cards were sliced. Now the stage takes whatever the tallest
card actually needs, and short viewports yield padding instead (see chapter 04).

`tallest` is measured from `scrollHeight` of the real card elements, watched by
a `ResizeObserver` on every card — so it responds to font loading, text
changes and window resizes.

---

## 3. The orbit path — the interesting maths

The obvious path for cards around a centred subject is an ellipse
circumscribing it. **That was the first implementation and it was wrong.**

Measurement showed cards covering **19.5%** of the fish's box (down from 78%
before any keep-out logic, but still visibly wrong).

**Why:** an ellipse keeps the card's _centre point_ clear of the subject. But a
card is a **rectangle**, not a point. At off-axis angles — around 45° — the
card's corner reaches much further than its centre, and cuts straight into the
subject.

### The Minkowski sum

Two rectangles miss each other exactly when the centre of one lies outside the
**Minkowski sum** of the two: a box whose half-size is the sum of their
half-sizes.

So instead of riding an ellipse, cards ride the boundary of that box:

```tsx
const halfW = (geometry.cardWidth * scale) / 2;
const halfH = (geometry.cardHeight * scale) / 2;
const needX = geometry.koW + halfW + 10; // subject half-width + card half-width + margin
const needY = geometry.koH + halfH + 10;

const ct = Math.cos(theta);
const st = Math.sin(theta);
const t = Math.min(needX / Math.max(Math.abs(ct), EPS), needY / Math.max(Math.abs(st), EPS));

const x = ct * t + geometry.ox;
const y = st * t + geometry.oy;
```

`t` is the distance from the centre to the box boundary along heading `theta`.
Because a box is the intersection of two slabs, that distance is simply the
**smaller** of the two axis crossings — `needX/|cos|` and `needY/|sin|`. The
`EPS` guard prevents division by zero on the axes.

Result: subject coverage fell from **19.5% to 0.6%**, at every angle.

Note that `halfW`/`halfH` use the _scaled_ card size, and the scale changes as
the card travels:

```tsx
const side = Math.abs(Math.cos(theta)); // 1 at the flanks, 0 while crossing
const scale = CROSS_SCALE + (1 - CROSS_SCALE) * side; // CROSS_SCALE = 0.4
```

Cards are full size out at the sides and shrink to 40% as they pass above or
below the subject — so they read as passing _behind_ it. That shrinking is also
what makes the whole thing fit in one frame: the vertical radius only has to
clear the shrunk card.

---

## 4. Coverflow positioning

```tsx
let rel = (i + angle / step) % count;
rel = ((rel % count) + count) % count; // JS % keeps sign; this wraps properly
if (rel > count / 2) rel -= count; // signed distance from the centre slot

const dist = Math.min(Math.abs(rel), 2.4); // clamp so far cards stop receding
const x = rel * geometry.spacing;
const scale = Math.max(0.6, 1 - dist * 0.17);
const rotY = Math.max(-38, Math.min(38, -rel * 30));
const z = -dist * 170;
```

The double modulo on line 2 matters: JavaScript's `%` keeps the sign of the
dividend, so `-1 % 5` is `-1`, not `4`. Without normalising, cards jump when
the angle crosses zero.

`spacing` is `cardWidth * 0.62` — just over half a card — so neighbours peek out
either side of the active one instead of hiding behind it completely.

### Z-order and click targets

```tsx
el.style.zIndex = String(30 - Math.round(dist * 8));
el.style.pointerEvents = Math.abs(rel) < 0.4 ? "auto" : "none";
```

Two of your requirements are in these two lines:

- Cards top out at **z-index 30**, and the section heading is `z-50`. That is
  your rule — _"cards will be in front of over any other but other text like
  title"_ — expressed as a hard ceiling.
- Only the centre card takes clicks. Without this, links on faded cards behind
  the active one are still clickable, which feels broken.

---

## 5. Drag, fling, snap, hold

A five-state machine in a `useRef`, ticked by one `requestAnimationFrame` loop:

```
auto  →  drag  →  fling  →  snap  →  hold  →  auto
```

| State   | What happens                                                                     |
| ------- | -------------------------------------------------------------------------------- |
| `auto`  | `angle += speed * dt` — idle drift, 6–9°/s depending on section                  |
| `drag`  | Angle follows the pointer; the loop does not advance it                          |
| `fling` | `angle += velocity * dt`, `velocity *= exp(-3.2 * dt)` — exponential decay       |
| `snap`  | `angle += (target - angle) * (1 - exp(-7 * dt))` — frame-rate-independent easing |
| `hold`  | Sit still for `holdMs` (2600ms default) so the card can be read                  |

The `1 - exp(-k * dt)` form is worth remembering. A naive
`angle += (target - angle) * 0.1` is frame-rate dependent — it eases twice as
fast at 120Hz as at 60Hz. The exponential form gives identical motion on any
display.

`dt` is clamped: `Math.min(0.05, (now - last) / 1000)`. If the tab is
backgrounded for ten seconds, this stops the deck teleporting on the next
frame.

### Drag input

```tsx
a.angle = a.startAngle + dx / 2.4;
if (layout === "ring") a.tilt = Math.max(-16, Math.min(16, -dy / 12));
```

Horizontal drag rotates; vertical drag tilts (ring only). `2.4` px per degree
is the sensitivity — a full 360° sweep takes about 860px of travel, which feels
right on a trackpad and on a phone. Tilt is clamped to ±16° and eases back to
zero whenever you are not dragging.

Velocity is sampled with an 8ms floor:

```tsx
if (dt > 8) {
  a.velocity = ((e.clientX - a.lastX) / 2.4 / dt) * 1000;
  ...
}
```

Without that floor, two pointer events in the same millisecond produce a
division by a near-zero `dt` and a nonsense velocity.

`setPointerCapture` is used so a drag that leaves the element still tracks.
`touch-pan-y` on the stage means vertical page scrolling still works on a
phone while horizontal drags go to the deck.

---

## 6. Not animating when nobody is looking

```tsx
const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), {
  rootMargin: "20% 0px",
});
```

and the loop is gated on it:

```tsx
useEffect(() => {
  if (reduced || !onScreen) return;
  ...
}, [count, holdMs, paint, reduced, onScreen, speed, step]);
```

Before this, **five** `requestAnimationFrame` loops ran continuously whether or
not anything was visible. The `20%` margin means a deck is already moving by
the time it scrolls into view, so it never appears frozen.

Measured effect: rAF calls during a scroll fell from **1014 to 194**.

---

## 7. The blur, and why phones skip it

```tsx
el.style.filter =
  coarse || dist < 0.35 ? "none" : `blur(${Math.min(3.2, dist * 1.5).toFixed(2)}px)`;
```

Animating `filter: blur()` is one of the most expensive things a GPU can be
asked to do — it re-renders the element into a texture and convolves it, every
frame. With five decks on a page over a playing video, it dominated the phone's
frame budget.

On coarse pointers the blur is skipped entirely. The depth still reads through
scale, opacity and z-order. Desktop keeps it.

`dist < 0.35` also skips it on the centre card everywhere, since blurring the
card the reader is looking at would be absurd.

---

## 8. Accessibility

- The stage is `tabIndex={0}` with `role="group"` and
  `aria-roledescription="carousel"`.
- Arrow keys nudge one card either way.
- The dots below are real `role="tab"` buttons with `aria-selected`, so the
  deck is fully operable without a pointer.
- **Reduced motion replaces the whole thing with a plain responsive grid** —
  no rotation, nothing hidden, every card visible at once:

```tsx
if (reduced) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label={label}>
      {items.map((item, i) => (
        <div role="listitem" key={i}>
          {item}
        </div>
      ))}
    </div>
  );
}
```

This is the right fallback rather than a still carousel: content hidden behind
a rotation the user has disabled would be unreachable.

---

## 9. The viewport / stage split

```html
<div class="carousel-viewport">
  <!-- clip box: overflow + mask -->
  <div class="carousel-stage"><!-- the sized element cards position against --></div>
</div>
```

Two elements doing two jobs, and they must stay separate — chapter 08 covers
the bug that proved it.

```css
.carousel-viewport {
  --stage-air: 120px;
  margin-block: calc(-1 * var(--stage-air));
  padding-block: var(--stage-air);
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent 0%, #000 18%, #000 82%, transparent 100%);
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
}
```

- **`overflow: hidden`** keeps cards off the subject of the clip behind and off
  the edge of a phone.
- **The equal padding/negative margin** means the viewport occupies exactly the
  stage's height in layout while still giving the deck 120px of room to
  overhang vertically without being sliced.
- **The mask** fades cards to nothing before they reach the horizontal edge, so
  the clip is never _seen_ — this is your _"box shape cut the cards its
  awkward"_ complaint. Cards now arrive and leave in open space.
- **`mask-repeat: no-repeat`** is essential. Without it the gradient tiles and
  produces extra fade bands mid-deck.
