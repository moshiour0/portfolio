# 01 — Overview

## What this site is

A single-page narrative portfolio with five supporting routes. The page tells one
story — scrolling down is climbing up — and each section has a cinematic video
plate behind it drawn from your own footage.

The visual concept comes straight from the clips you supplied: valley floor →
river → forest → beneath the water → canopy → strata → ridge → lone tree →
survey point → summit. That ordering is not decorative. It is the site's
information architecture.

## The stack

| Layer     | Choice                                 | Why                                                                         |
| --------- | -------------------------------------- | --------------------------------------------------------------------------- |
| Framework | **Next.js 16** (App Router, Turbopack) | Static generation for every route; the whole site is prerendered HTML       |
| UI        | **React 19**                           | Concurrent rendering; all animation deliberately bypasses it                |
| Language  | **TypeScript 5.7**                     | The content model is typed, so a missing field is a build error             |
| Styles    | **Tailwind CSS v4**                    | `@theme` for tokens, `@utility` for the fitted-type system — no config file |
| 3D        | **three.js + react-three-fiber**       | The node-network backdrop behind sections with no clip                      |
| Scroll    | **lenis**                              | Eased wheel scrolling on desktop only                                       |
| Host      | **Vercel**                             | Static output, global CDN, zero server cost                                 |

Total application source: **~4,200 lines** across 40 files. There is no CSS
framework config, no state manager, no animation library.

## Directory map

```
app/                      Routes. Every one is statically prerendered.
  layout.tsx              Fonts, metadata, JSON-LD, the fixed backdrops, nav, footer
  page.tsx                The homepage — composes all 13 sections in order
  globals.css             Design tokens, fitted type, scrims, performance overrides
  icon.tsx                Favicon, generated at build time (the letter M)
  opengraph-image.tsx     Social share card, generated at build time
  projects/page.tsx       Project index
  projects/[slug]/page.tsx  One page per project, statically generated
  research/ about/ achievements/ contact/   Standalone routes

components/
  VideoBackdrop.tsx       The cinematic clip engine  ......... chapter 02
  SmoothScroll.tsx        Lenis + proximity snap  ............ chapter 05
  HashScroll.tsx          Cross-route /#section landing  ..... chapter 05
  Nav.tsx                 Route-aware navigation
  Footer.tsx              Social links
  three/Scene.tsx         WebGL backdrop host + device tiers
  three/NodeNetwork.tsx   The particle/line mesh itself
  sections/*.tsx          One file per homepage section (10)
  ui/Section.tsx          The frame + safe-zone column  ...... chapter 04
  ui/Carousel3D.tsx       The rotating card decks  ........... chapter 03
  ui/Reveal.tsx           Scroll-triggered fade-in
  ui/SplitText.tsx        Per-character heading animation
  ui/SocialIcon.tsx       Inline brand SVGs
  ui/PageHeader.tsx       Sub-route page headers

lib/
  content.ts              All written content, typed  ........ chapter 07
  backdrops.ts            Clip-to-section mapping + framing ... chapter 02
  scroll.ts               Shared Lenis handle
  useScrollProgress.ts    One passive scroll sampler
  videoCover.ts           Tiny pub/sub so WebGL idles under video

public/
  video/*.mp4 .webm       Desktop plates, 1280x720, constant 30fps
  video/m/*.mp4           Phone plates, 854x480 H.264
  poster/*.jpg            First-frame stills, also the reduced-motion fallback
  img/                    Portrait

docs/
  handbook/               This documentation
  asset-spec/             Your original JSON/CSS specs — subject boxes, palettes
  background-video-guide.md  Clip mapping and generation prompts
```

## How a page render actually happens

1. **Build time.** Next prerenders every route to HTML. `lib/content.ts` is
   read at build, so all copy is in the HTML — good for SEO and for anyone
   with JavaScript off.
2. **First paint.** The user sees the aurora gradient, the hero poster image,
   and all text. No video has been requested yet.
3. **Hydration.** `VideoBackdrop` checks reduced-motion, Save-Data and device
   class. Only if all pass does it emit a `<source>` — so a frugal visitor
   never downloads a clip at all.
4. **Scroll.** A single passive listener, sampled inside `requestAnimationFrame`,
   decides which section owns the viewport and crossfades the backdrop.
   Carousels animate by writing transforms straight to the DOM.

## The one architectural rule

**Animation never goes through React.**

Every moving thing — the carousel spin, the drag, the WebGL mesh, the scroll
progress — keeps its state in a `useRef` and writes directly to
`element.style` inside a `requestAnimationFrame` loop. React is used to
_mount_ things and to hold coarse state that changes rarely (which section is
active, is the deck on screen). A carousel spinning at 60fps triggers zero
React renders.

The only exception is deliberate: `setActive` in the carousel updates the dot
indicator, and it is guarded with `prev === index ? prev : index` so it only
fires when the index genuinely changes — a few times a minute, not 60 times a
second.

If you add animation to this codebase, follow the same rule. It is the single
biggest reason the site holds 60fps with a video playing, a WebGL mesh
rendering, and five card decks alive at once.
