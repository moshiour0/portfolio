# Background Video Guide

How the four existing clips are used, and exactly what to generate for the
remaining sections so everything reads as one continuous visual world.

Everything below is derived from your own assets:
`docs/asset-spec/` (palette + entity safe zones) and the four
clips already in `public/video/`.

---

## Part 1 — The four clips you already have

| # | Clip | Section | Why it belongs there | Subject sits at | Copy goes |
|---|---|---|---|---|---|
| 01 | `01-hero-ascent` — you in the raincoat, looking up at the mountain and canal | **Hero** | The start of the climb. The whole site is an ascent: curious → learning → building → solving. | left **11.2–38.9%** | right |
| 02 | `02-experience-canopy` — monkey on the mossy branch, valley behind | **Journey** | The timeline section. Partway up, life in the canopy, the valley already below you — progression made literal. | left **24–38.5%** | right |
| 03 | `03-projects-depths` — underwater, fish, riverbed | **Research & Exploration** | Research is going *beneath the surface* to observe what isn't visible from above. Exactly what SAR/InSAR does. | **centre 44.4–62.3%** | top / bottom / edges |
| 04 | `04-contact-summit` — you on the rock at the summit, mist below | **Contact** | The payoff. "Let's Build Something Meaningful" lands hardest at the top, looking out. | left **21.1–52.6%** | top-right |

**The narrative:** scroll down = climb up. Valley floor → forest canopy →
beneath the water → summit. Sections between these stay on the calm WebGL mesh
so the cinematic moments land instead of blurring together.

**Hero note:** per your decision, the hero gets *both* — your climbing clip
**plus** an orbital/data-particle system layered over it (Earth arc, satellite
tracks, drifting data points), so the hero reads as
`DATA + AI + EARTH + SATELLITE + CODE` while still being real footage of you.

---

## Part 2 — The shared style block

Paste this into **every** prompt. It is what keeps eight new clips looking like
they came from the same shoot as the four you have.

```
Cinematic live-wallpaper background plate, 16:9, 1920x1080, 5 seconds,
very slow and subtle motion, shot on a wide lens, shallow depth of field.

COLOUR: dark near-black base (#0a1210 to #05070f). Muted, desaturated,
overcast natural light — never neon, never saturated. Anchor colours pulled
from the existing footage: mist grey-green #9f9b89, slate teal #3b5654,
cool river blue #4a9bc4, deep moss #323318, warm sand #d2c6b4, and a single
restrained accent of dim ochre-yellow #c2ad52.

MOOD: scientific, calm, ambitious, quietly technical. Overcast, misty,
early-morning. Think Earth-observation documentary, not sci-fi movie.

COMPOSITION (critical): keep the LEFT THIRD of the frame as the visual
subject/mass, and keep the RIGHT HALF (45%–95% of the width) visually calm,
dark and uncluttered — website text sits there. No busy detail on the right.

MOTION: one slow continuous move only (a drift, a push-in, or a parallax
pan). No cuts, no camera shake, no fast movement, no zoom bursts.

NEGATIVE: no text, no captions, no watermark, no logo, no UI overlays,
no people looking at camera, no faces in close-up, no neon, no lens flares,
no crypto/hologram/HUD clichés, no rapid motion.
```

> ⚠️ Your current clips carry a small **"CapCut AI" watermark** top-left. It is
> cropped away on most screens but shows faintly on a true 16:9 display. For the
> new clips, generate without a watermark (or crop ~7% off the top).

---

## Part 3 — Prompt per remaining section

Eight sections still need a plate. Each prompt = **style block above + the
block below.**

### 3.1 — Intro · "Turning Data Into Stories"

```
A single wide river/canal seen from above at dawn, cutting an S-curve through
a dark misty valley floor. Water catches faint cool blue light (#4a9bc4).
Thin low fog drifts slowly left to right across the lower third.
The river occupies the LEFT of frame; the right half is soft dark mist.
Motion: extremely slow aerial drift forward, almost imperceptible.
```
*Why:* the river is the through-line of the whole site — data flowing, being
read, becoming a story. It ties directly to the canal in your hero clip.

---

### 3.2 — Pillars · "What I Do" (five domains)

```
Overhead top-down view of a dark braided river delta splitting into many
channels across black volcanic sand, seen from high altitude. The channels
branch like a diagram. Muted teal (#3b5654) water on near-black sediment,
thin pale mineral edges (#9f9b89).
Channels concentrated on the LEFT two-thirds; right side open dark sand.
Motion: very slow vertical descent, as if a satellite lowering its gaze.
```
*Why:* one source branching into five paths — the five pillars — and it reads
instantly as satellite/Earth-observation imagery.

---

### 3.3 — Projects · "Featured Projects"

```
A dark rocky mountain ridgeline in heavy mist, layered receding ridges fading
into pale grey depth, seen side-on. Foreground ridge is sharp and dark
(#191808), each ridge behind it lighter until it dissolves into mist
(#9f9b89). Cold overcast light.
Ridges stack from the LEFT; the right side is open pale mist.
Motion: slow lateral parallax drift right to left, ridges moving at different
speeds.
```
*Why:* layered ridges = a body of distinct work receding into depth, and the
parallax gives real dimension behind the coverflow cards.

---

### 3.4 — Skills · "Technical Skills"

```
Extreme close-up of frost crystals forming on dark wet slate rock, ice
fracturing into fine geometric branching patterns. Near-black stone with pale
ice structure (#d2c6b4) and faint cool blue reflections (#4a9bc4).
Crystal growth concentrated LEFT of frame; right side plain dark wet stone.
Motion: crystals growing outward extremely slowly, macro, no camera movement.
```
*Why:* structure emerging from raw material, naturally — a grid/lattice that
reads technical without a single fake hologram.

---

### 3.5 — Education · Foundations

```
Layered sedimentary rock strata in a cliff face, horizontal bands of dark
stone in ochre, moss and charcoal (#7a7548, #545224, #323318), wet from rain,
soft overcast light. Clean horizontal geological banding.
Cliff fills the LEFT and bottom; upper right is open pale overcast sky.
Motion: very slow vertical tilt upward along the strata.
```
*Why:* strata are literally layers laid down over time — foundations, in the
site's own natural language.

---

### 3.6 — Achievements · Awards

```
Night sky above a dark mountain silhouette, a slow star trail arc rotating
around the pole star, very faint. Deep near-black sky (#05070f) with cool
white-blue stars, one slightly warmer point (#c2ad52) brighter than the rest.
Mountain silhouette occupies the LOWER LEFT; the upper right is open sky.
Motion: slow celestial rotation, timelapse, smooth and continuous.
```
*Why:* NASA Space Apps, the Orrery, astronomy — and a single brighter point
for the standout result, without inventing any statistic.

---

### 3.7 — About · Curiosity & Philosophy

```
A single weathered tree standing alone on a misty ridge at dawn, bare
branches against soft pale fog, tiny in a wide empty landscape. Muted
grey-green mist (#9f9b89), dark wet earth, one faint warm highlight where the
sun breaks through.
The tree stands on the LEFT third; the right is open fog and empty space.
Motion: fog drifting slowly past the tree, branches barely moving.
```
*Why:* the reflective, human beat of the site — solitude, thought, scale.
Deliberately the quietest plate of the set.

---

### 3.8 — Currently Exploring · Open threads

```
Aerial view of a glacier's surface, deep blue meltwater channels carving
through white-grey ice, crevasses branching into unexplored territory. Cool
blues (#4a9bc4, #5fb3d9) against dirty white ice and dark moraine grit.
Ice mass on the LEFT; the right opens into flat unbroken snow.
Motion: slow aerial push forward over the ice, following a meltwater channel.
```
*Why:* glaciers are exactly what your InSAR work monitors, and an unexplored
surface is the honest picture of "currently exploring".

---

### Sections that intentionally get **no** video

`achievements-strip` (a thin band), `projects` cards region, and any section
not listed above stay on the WebGL mesh. Your spec warns against *"constant
background motion"* — the calm gaps are what make the cinematic sections work.

---

## Part 4 — Delivery checklist

For each new clip:

- [ ] **16:9, 1920×1080**, 5 s minimum
- [ ] **No watermark, no text** burned in
- [ ] Subject mass on the **left**, right half calm (this is non-negotiable —
      the whole layout depends on it)
- [ ] Exported as `.mp4` — I handle the rest of the encoding
- [ ] Named by section: `05-intro.mp4`, `06-pillars.mp4`, `07-projects.mp4`,
      `08-skills.mp4`, `09-education.mp4`, `10-achievements.mp4`,
      `11-about.mp4`, `12-exploring.mp4`

Drop them in `public/video/` and tell me. I will:

1. Re-encode to constant **30 fps** with motion interpolation (this is what
   removed the vibration — 24 fps judders on 60 Hz screens)
2. Bake the loop behaviour in (seamless ping-pong or deceleration)
3. Generate matching posters
4. Produce WebM + MP4 and wire each into `lib/backdrops.ts`
5. Measure that no clip's subject is covered by text, at every breakpoint

## Part 5 — Adding one by hand

`lib/backdrops.ts`:

```ts
{
  id: "intro",                        // must match the section id
  playback: "pingpong",               // or "loop" | "decelerate"
  webm: "/video/05-intro.webm",
  mp4:  "/video/05-intro.mp4",
  poster: "/poster/05-intro.jpg",
  focus: "50% 45%",                   // object-position for phone crops
  alt: "A river winding through a misty valley at dawn",
}
```

Everything else — lazy loading, one-decode-at-a-time, crossfades,
reduced-motion fallback — is already in place and picks it up automatically.
