/**
 * How a clip behaves once its section is on screen.
 *  - `loop`       plays at 1x and repeats (the crossfaded loop hides the seam)
 *  - `decelerate` eases from 1x down to a standstill, then rests on a frame
 *  - `pingpong`   the asset itself holds a forward leg at 1x followed by the
 *                 same footage reversed at ~0.56x, so looping it natively
 *                 never shows a restart — it just drifts back and goes again
 */
export type Playback = "loop" | "decelerate" | "pingpong";

export type Backdrop = {
  /** The section id this backdrop belongs to. */
  id: string;
  playback: Playback;
  webm: string;
  mp4: string;
  poster: string;
  /**
   * object-position on wide screens, where almost the whole frame is visible.
   */
  focus: string;
  /**
   * object-position on narrow screens, where only about a quarter of the width
   * survives. Centred on the subject box from the asset spec so the person and
   * their immediate surroundings are what remains, rather than empty scenery.
   */
  focusNarrow?: string;
  /**
   * Which side the copy sits on, so the contrast scrim pools there and leaves
   * the subject side clear. "even" is for centre-subject plates whose content
   * orbits rather than sitting to one side.
   */
  scrim?: "left" | "right" | "even";
  /** Spoken description, used for the reduced-motion still image. */
  alt: string;
};

/**
 * Cinematic clips, keyed by section id. Sections without one fall back to the
 * WebGL node network behind them.
 */
export const backdrops: Backdrop[] = [
  {
    // The start of the climb — the whole site is an ascent.
    id: "hero",
    playback: "decelerate",
    webm: "/video/01-hero-ascent.webm",
    mp4: "/video/01-hero-ascent.mp4",
    poster: "/poster/01-hero-ascent.jpg",
    focus: "50% 45%",
    focusNarrow: "25% 46%",
    alt: "Looking up at a mountain and canal at the start of the climb",
  },
  {
    // Beneath the surface — what research does, and what SAR/InSAR does.
    id: "research",
    playback: "pingpong",
    webm: "/video/03-projects-depths.webm",
    mp4: "/video/03-projects-depths.mp4",
    poster: "/poster/03-projects-depths.jpg",
    focus: "50% 50%",
    focusNarrow: "53% 56%",
    scrim: "even",
    alt: "Beneath the surface of the canal, among the fish",
  },
  {
    // Partway up: the canopy, with the valley already below.
    id: "journey",
    playback: "pingpong",
    webm: "/video/02-experience-canopy.webm",
    mp4: "/video/02-experience-canopy.mp4",
    poster: "/poster/02-experience-canopy.jpg",
    focus: "50% 50%",
    focusNarrow: "31% 56%",
    alt: "A monkey in the canopy of a tree above a valley",
  },
  {
    // River crossing — the valley floor, where the journey starts.
    id: "intro",
    playback: "pingpong",
    webm: "/video/05-intro-river.webm",
    mp4: "/video/05-intro-river.mp4",
    poster: "/poster/05-intro-river.jpg",
    focus: "50% 50%",
    focusNarrow: "32% 46%",
    alt: "Standing on a misty riverbank, looking at the turbulent water",
  },
  {
    // Forest uphill climb — the slopes.
    id: "pillars",
    playback: "pingpong",
    webm: "/video/06-pillars-forest.webm",
    mp4: "/video/06-pillars-forest.mp4",
    poster: "/poster/06-pillars-forest.jpg",
    focus: "50% 50%",
    focusNarrow: "32% 48%",
    alt: "Climbing a steep muddy forest trail through heavy mist",
  },
  {
    // Rope work on a log — technical practice.
    id: "skills",
    playback: "pingpong",
    webm: "/video/07-skills.webm",
    mp4: "/video/07-skills.mp4",
    poster: "/poster/07-skills.jpg",
    focus: "50% 50%",
    focusNarrow: "45% 44%",
    alt: "Sitting on a log, tying a rope knot and fixing a carabiner",
  },
  {
    // Reading by the strata cliff — foundations laid down over time.
    id: "education",
    playback: "pingpong",
    webm: "/video/08-education.webm",
    mp4: "/video/08-education.mp4",
    poster: "/poster/08-education.jpg",
    focus: "50% 50%",
    focusNarrow: "37% 48%",
    alt: "Sitting on a mossy rock reading beside a layered sedimentary cliff",
  },
  {
    // The rocky ridge, clouds below — just before the peak.
    id: "achievements",
    playback: "pingpong",
    webm: "/video/09-achievements-ridge.webm",
    mp4: "/video/09-achievements-ridge.mp4",
    poster: "/poster/09-achievements-ridge.jpg",
    focus: "50% 45%",
    focusNarrow: "29% 46%",
    alt: "Climbing a rocky ridge with clouds below, just short of the peak",
  },
  {
    // The lone tree and the fog valley — the reflective beat.
    id: "about",
    playback: "pingpong",
    webm: "/video/10-about-philosophy.webm",
    mp4: "/video/10-about-philosophy.mp4",
    poster: "/poster/10-about-philosophy.jpg",
    focus: "50% 50%",
    focusNarrow: "37% 50%",
    alt: "Sitting by a lone weathered tree, looking out over a fog-filled valley",
  },
  {
    // Map and binoculars over the emerald valley — open threads.
    // The only plate with the subject on the RIGHT, so its copy goes LEFT.
    id: "exploring",
    playback: "pingpong",
    webm: "/video/11-exploring.webm",
    mp4: "/video/11-exploring.mp4",
    poster: "/poster/11-exploring.jpg",
    focus: "50% 50%",
    focusNarrow: "75% 44%",
    scrim: "left",
    alt: "Holding a map and binoculars, surveying an emerald valley below",
  },
  {
    // The summit — the payoff, at the call to action.
    id: "contact",
    playback: "decelerate",
    webm: "/video/04-contact-summit.webm",
    mp4: "/video/04-contact-summit.mp4",
    poster: "/poster/04-contact-summit.jpg",
    focus: "50% 40%",
    focusNarrow: "37% 50%",
    alt: "Sitting on a rock at the summit, looking out over the valley",
  },
];

/** Every section in scroll order, including those with no video. */
export const SECTION_ORDER: readonly string[] = [
  "hero",
  "achievements-strip",
  "intro",
  "pillars",
  "projects",
  "research",
  "skills",
  "journey",
  "education",
  "achievements",
  "about",
  "exploring",
  "contact",
];

export const backdropFor = (id: string) => backdrops.find((b) => b.id === id);
