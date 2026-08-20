# Moshiour Rahman (Shakib) Sarker — Portfolio

Personal portfolio: Data Science, AI, Earth Observation and Software Engineering.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 and
Three.js / react-three-fiber.

## Documentation

**[The Handbook](docs/handbook/)** — full documentation of how this site is
built: the video engine, the carousel maths, the type system, the performance
work, every bug that was hit and how it was fixed, and recipes for extending
it. Start at [docs/handbook/README.md](docs/handbook/README.md).

## What is here

- **Cinematic backdrop** — eleven clips, one per section, crossfading as you
  scroll. Exactly one video decodes at a time and clips are armed lazily, so a
  visitor who never scrolls downloads a single video (~2.4 MB) rather than all
  56 MB.
- **Safe-zone layout** — every clip records where its subject stands
  (`docs/asset-spec/`). Each section's copy column and contrast scrim are
  derived from that, so text never covers the subject. On narrow screens the
  crop window recentres on the subject instead of the frame.
- **3D card decks** — coverflow and orbit variants, drag/touch to spin, with a
  reduced-motion fallback to plain accessible grids.
- **WebGL node network** behind the sections that have no clip. It stops
  drawing entirely while a clip covers it.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm start
```

## Media pipeline

Source clips live outside the repo. Everything served from `public/video/` is
re-encoded to a constant 30 fps with motion interpolation — 24 fps judders on a
60 Hz display, and uneven frame cadence was the cause of visible vibration.
Playback behaviour (slow forward then slower reverse, or a logarithmic
deceleration) is baked into each file so the browser only ever plays natively.

See `docs/background-video-guide.md` for the per-section mapping and the prompts
used to generate new plates.

## Structure

```
app/            routes: home, about, projects (+ case studies), research,
                achievements, contact
components/     sections, UI primitives, WebGL backdrop, video backdrop
lib/            content model, backdrop config, scroll helpers
docs/           asset spec (subject positions + palette) and the video guide
```
