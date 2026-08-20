# The Handbook

Everything about how this site is built, why each decision was made, what went
wrong along the way, and how to change it.

You supplied the raw material — 11 video clips, a portrait, an asset spec, and a
36-page written brief. Everything else in this repository was built from that.
This handbook is the record of how, written so that you can pick up any part of
it later and extend it yourself.

## Read in this order

| #   | Chapter                                            | What it covers                                                       |
| --- | -------------------------------------------------- | -------------------------------------------------------------------- |
| 01  | [Overview](01-overview.md)                         | The stack, the architecture, what every file does                    |
| 02  | [The video backdrop system](02-video-system.md)    | The hardest part of the site: 11 clips, one decoder, ffmpeg pipeline |
| 03  | [The 3D carousel](03-carousel.md)                  | Three layouts, the collision maths, the drag physics                 |
| 04  | [Layout, type and colour](04-layout-typography.md) | Safe zones, container queries, why the palette is what it is         |
| 05  | [Scroll and navigation](05-scroll-navigation.md)   | Lenis, proximity snap, cross-route hash scrolling                    |
| 06  | [Performance](06-performance.md)                   | Desktop budget, and the whole mobile smoothness investigation        |
| 07  | [The content model](07-content-model.md)           | How your written brief became typed data                             |
| 08  | [Failures and fixes](08-failures.md)               | Every bug, what caused it, how it was found and fixed                |
| 09  | [Extending the site](09-extending.md)              | Recipes: add a section, swap a clip, change the palette              |
| 10  | [How everything was verified](10-verification.md)  | The measurement harness, and how to re-run it                        |

## The two rules everything else follows

**1. Measure, then fix.** Almost every hard problem in this build was solved by
first writing something that could _see_ the problem as a number, and only then
changing code. "The cards overlap the fish" became "19.5% of the subject box is
covered"; then the fix could be checked, not guessed at. Chapter 10 is the
toolbox this produced.

**2. The assets are the source of truth.** The colour palette, the text column
widths, the mobile framing and the scrim positions are all derived from
measurements of your own footage, not chosen by taste. When you add a clip,
you add its numbers, and the layout follows.
