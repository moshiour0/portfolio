# 09 — Extending the site

Recipes for the changes you are most likely to want.

---

## Running it

```bash
npm install
npm run dev            # http://localhost:3000
```

```bash
npm run build          # production build
npm start              # serve the production build
```

```bash
npx tsc --noEmit                          # typecheck
npx prettier --write --print-width 100 .  # format (the width matters — see ch.08 G1)
```

**`--print-width 100`.** The repo is written at roughly 100 columns. Running
Prettier without it reflows everything to 80 and produces a huge meaningless
diff.

---

## Add a new section

Four files, in this order.

**1. Content** — `lib/content.ts`

```ts
export const newThing = {
  title: "New Thing",
  lead: "One sentence.",
  items: [/* … */],
};
```

**2. The section component** — `components/sections/NewThing.tsx`

```tsx
import { Section, SectionHeading } from "@/components/ui/Section";
import { newThing } from "@/lib/content";

export default function NewThing() {
  return (
    <Section id="new-thing" side="right" columnPct={50}>
      <SectionHeading index="07" title={newThing.title} lead={newThing.lead} />
      {/* … */}
    </Section>
  );
}
```

`columnPct` should come from where the backdrop clip's subject ends. Use
`frame={false}` if the section is long-form text that legitimately runs past
one screen.

**3. Register the id** — `lib/backdrops.ts`

```ts
export const SECTION_ORDER = [ …, "new-thing", … ];   // in scroll order
```

This is what binds the section to the backdrop engine and the proximity snap.
A section missing from `SECTION_ORDER` will still render but will not
participate in either.

**4. Compose it** — `app/page.tsx`

Import and place it in the right position.

Add it to `sections` in `lib/content.ts` too if it should appear in the nav.

---

## Add a background clip

**1. Produce the asset.** Follow chapter 02 §3. The essential parts:

```bash
MI="minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"

# ping-pong: forward, then slower reverse, then constant 30fps
ffmpeg -i src.mp4 -filter_complex \
  "[0:v]scale=1280:720:flags=lanczos,setsar=1,split=2[f][r];[f]setpts=1.4*PTS[fwd];[r]reverse,setpts=2.2*PTS[rev];[fwd][rev]concat=n=2:v=1:a=0,$MI[v]" \
  -map [v] -an -c:v libx264 -crf 16 -preset veryfast -pix_fmt yuv420p inter.mp4

ffmpeg -i inter.mp4 -an -c:v libx264 -crf 25 -preset slow -profile:v high \
  -pix_fmt yuv420p -movflags +faststart public/video/12-new.mp4
ffmpeg -i inter.mp4 -an -c:v libvpx-vp9 -crf 35 -b:v 0 -row-mt 1 \
  -deadline good -cpu-used 4 public/video/12-new.webm
ffmpeg -i inter.mp4 -frames:v 1 -vf scale=1600:-2 -q:v 4 public/poster/12-new.jpg
```

**2. Make the phone encode** (do not skip this — it is what keeps mobile
smooth):

```bash
ffmpeg -i public/video/12-new.mp4 -an -vf scale=854:480:flags=lanczos \
  -c:v libx264 -crf 27 -preset slow -profile:v main -level 3.1 \
  -pix_fmt yuv420p -movflags +faststart public/video/m/12-new.mp4
```

**3. Register it** — `lib/backdrops.ts`

```ts
{
  id: "new-thing",              // must match the section id exactly
  playback: "pingpong",         // "loop" | "decelerate" | "pingpong"
  webm:     "/video/12-new.webm",
  mp4:      "/video/12-new.mp4",
  mp4Mobile:"/video/m/12-new.mp4",
  poster:   "/poster/12-new.jpg",
  focus:       "50% 50%",       // wide screens
  focusNarrow: "32% 48%",       // phones — centre of the subject box
  scrim: "right",               // "left" for right-subject plates, "even" for centred
  alt: "Spoken description, used for the reduced-motion still",
}
```

**Deriving `focusNarrow`.** Take the subject's horizontal range from your asset
spec — say 20%–55% — and use its midpoint: `37%`. The vertical value is usually
between 44% and 56%; pick where the subject's head and torso sit.

**4. Verify the framing:**

```bash
node mobileframe.mjs http://localhost:3001 shots/
```

It prints the subject range against the visible crop window for every plate.

Everything else — lazy loading, one-decode-at-a-time, crossfading,
reduced-motion fallback, scroll pausing — picks the new entry up automatically.

---

## Change the palette

Everything derives from `@theme` in `app/globals.css`:

```css
--color-accent: #c9b356;
```

Change that one value and every accent across the site follows — headings,
dots, focus rings, the text gradient, the card glow.

If you change `--color-bg`, also update the scrim gradients, which hard-code
`rgba(10, 15, 14, …)` to match. They are literal because a CSS gradient cannot
take an alpha of a custom property without `color-mix()`, and the scrim is
performance-critical enough that the literal is worth it. Search for
`10, 15, 14`.

---

## Adjust a carousel

All in the section that uses it:

```tsx
<Carousel3D
  label="What I do"
  variant="coverflow" // "coverflow" | "orbit" | "ring"
  speed={7} // degrees per second while idling
  budgetVh={52} // share of viewport height the deck may use
  holdMs={2600} // pause after a snap, so a card can be read
/>
```

For an `orbit` deck you also pass the region to avoid, as percentages of the
**viewport**:

```tsx
keepOut={{ cx: 53.35, cy: 56.4, halfW: 8.95, halfH: 6.5 }}
```

Read those from your asset spec's subject box for that clip. `cx`/`cy` are the
centre; `halfW`/`halfH` are half the width and height.

If a section starts overflowing after you add content, lower `budgetVh` before
touching anything else.

---

## Add a social link

```ts
// lib/content.ts
{ label: "Scholar", href: "https://…", handle: "…", icon: "scholar" },
```

TypeScript will immediately error, because `icon` is a closed union. That is
intentional — it forces you to add the mark:

```ts
export type SocialLink = { …; icon: "linkedin" | "x" | "github" | "mail" | "scholar" };
```

Then add the SVG path to `components/ui/SocialIcon.tsx`. Use `currentColor` for
the fill so it inherits hover states.

---

## Deploy

```bash
git add -A
git commit -m "…"
git push origin main
```

Vercel builds from `main` automatically. To deploy from the machine directly:

```bash
npx vercel deploy --prod --yes
```

Live at **https://moshiour-portfolio.vercel.app**.

Note that per-deployment preview URLs sit behind Vercel's deployment
protection and will return a 302 to an SSO page. That is expected — the
production alias is the public one.

---

## Before you ship anything

```bash
npx tsc --noEmit
npm run build
node fit.mjs        http://localhost:3001 shots/   # every section fits one frame
node cardcrop.mjs   http://localhost:3001          # no card cropped, none over a heading
node navall.mjs     http://localhost:3001          # every nav link lands
node rm-check.mjs   http://localhost:3001          # reduced motion downloads no video
node mobileframe.mjs http://localhost:3001 shots/  # subject visible on phones
node find404.mjs    http://localhost:3001          # no missing assets
```

Chapter 10 explains what each one does and how to write more.
