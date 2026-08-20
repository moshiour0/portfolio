# 02 — The video backdrop system

This is the most involved part of the site. Eleven full-screen clips, one
decoder, no stutter, on everything from a desktop to a cheap phone.

Source files: [`components/VideoBackdrop.tsx`](../../components/VideoBackdrop.tsx),
[`lib/backdrops.ts`](../../lib/backdrops.ts), and the `.backdrop-video` /
`.video-scrim` rules in [`app/globals.css`](../../app/globals.css).

---

## 1. The mapping

Each clip is bound to a section by id. The narrative _is_ the ordering.

| Section      | Clip                  | Playback   | Subject sits       |
| ------------ | --------------------- | ---------- | ------------------ |
| hero         | 01-hero-ascent        | decelerate | left, 11–39%       |
| intro        | 05-intro-river        | pingpong   | left, 15–50%       |
| pillars      | 06-pillars-forest     | pingpong   | left, 15–50%       |
| research     | 03-projects-depths    | pingpong   | **centre**, 44–62% |
| skills       | 07-skills             | pingpong   | left, 25–65%       |
| journey      | 02-experience-canopy  | pingpong   | left, 24–39%       |
| education    | 08-education          | pingpong   | left, 20–55%       |
| achievements | 09-achievements-ridge | pingpong   | left, 10–48%       |
| about        | 10-about-philosophy   | pingpong   | left, 22–52%       |
| exploring    | 11-exploring          | pingpong   | **right**, 55–95%  |
| contact      | 04-contact-summit     | decelerate | left, 21–53%       |

Three sections deliberately have **no** clip — `achievements-strip`, `projects`,
and anything left out of `backdrops`. The video layer fades out entirely there
and the WebGL mesh shows through. Constant motion everywhere would make the
cinematic sections stop registering; the quiet gaps are what make them land.

Two plates break the pattern, and the layout responds automatically:
`research` is centre-subject (so its copy orbits rather than sitting to one
side) and `exploring` is the only right-subject plate (so its copy goes left).

---

## 2. Playback semantics — and why they live in the file, not in code

You asked for two behaviours:

- **Hero and Contact** — play at 1x and slow gradually to a standstill.
- **Everything else** — play forward at 1x, then run _backwards more slowly_
  and keep going, so the loop is invisible and never snaps back to the start.

The obvious implementation is to drive `video.playbackRate` from a
`requestAnimationFrame` loop. **That was tried first and it was wrong**, for two
separate reasons:

1. **Blink refuses rates below 1/16.** Setting `playbackRate = 0.0622` throws
   `NotSupportedError`. A deceleration easing toward zero walks straight into
   that floor.
2. **It vibrated.** Even above the floor, changing the rate every frame means
   the decoder is asked for frames at times that do not line up with the
   display refresh. Frames get held for uneven durations, and the eye reads
   that as a shimmer.

The fix was to stop treating this as a runtime problem. **The timing is baked
into the video file**, and the browser just plays it at rate 1.

### Deceleration, baked

A logarithmic time-warp applied with ffmpeg's `setpts`, where `TAU = 2.2` and
`S` is the clip duration plus 0.2s:

    setpts=(-TAU*log(1-T/S))/TB

As `T` approaches `S` the logarithm diverges, so presentation timestamps
stretch without bound — the clip glides to a halt and rests on its final frame.
Set `el.loop = false` and it simply stops. No script, no rate changes, no floor
to hit.

### Ping-pong, baked

The reverse leg is concatenated into the file itself:

    [0:v]split=2[f][r];
    [f]setpts=1.4*PTS[fwd];
    [r]reverse,setpts=2.2*PTS[rev];
    [fwd][rev]concat=n=2:v=1:a=0

Forward stretched to 1.4x duration, then the same footage reversed and
stretched to 2.2x — the "slower reverse" you asked for. Because the reversed
leg ends on frame 0, setting `el.loop = true` gives a seamless there-and-back
forever. **No seeking, no rAF, no decode stalls, no restart flash.**

### The vibration fix

Even with timing baked in, the first encodes still shimmered. Measuring actual
frame durations showed them alternating between 0.0417s and 0.0833s — two
different frame lengths in one clip. Two causes stacked:

- `setpts=1.8` is not an integer ratio, so resampling produced a mix of held
  and fresh frames.
- The sources were 24fps. On a 60Hz display 24fps needs 3:2 pulldown — frames
  shown for 3 refreshes, then 2, then 3. That cadence is visible.

Both are cured by resampling to a constant 30fps **with motion interpolation**,
so the slow leg gets genuinely new frames rather than duplicates:

    minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1

- `mci` — motion-compensated interpolation (synthesises intermediate frames)
- `aobmc` — adaptive overlapped block motion compensation (softens block edges)
- `bidir` — estimate motion in both directions
- `vsbmc=1` — variable-size blocks, better around moving edges

Verification after re-encoding reported **"1 distinct frame duration"** for
every clip. 30 divides evenly into 60, so each frame is held for exactly two
refreshes. The shimmer was gone.

> **The transferable lesson:** if a media behaviour can be expressed in the
> asset, put it in the asset. Runtime control of playback rate fights the
> decoder, the compositor and the display refresh all at once.

---

## 3. The full ffmpeg pipeline

Three scripts were used. They are one-shot asset tooling rather than
application code, so they live outside the repo — reproduced here so you can
re-run them.

Shared filter used by all of them:

    MI=minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1

### Stage 1 — the first four clips

Decelerating clips (hero, contact) — read the duration, then warp:

    ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 in.mp4
    ffmpeg -i in.mp4 -filter_complex "[0:v]setpts=(-2.2*log(1-T/S))/TB,$MI[v]" \
      -map [v] -an -c:v libx264 -crf 23 -preset medium -pix_fmt yuv420p \
      -movflags +faststart out.mp4

Ping-pong clips:

    ffmpeg -i in.mp4 -filter_complex \
      "[0:v]split=2[f][r];[r]reverse,setpts=1.8*PTS[rev];[f][rev]concat=n=2:v=1:a=0,$MI[v]" \
      -map [v] -an -c:v libx264 -crf 24 -preset medium -pix_fmt yuv420p out.mp4

### Stage 2 — the seven later clips

These arrived with a **"CapCut AI" watermark** top-left. Six of seven needed it
removed, which `delogo` does by interpolating from the pixels surrounding the
box:

    delogo=x=14:y=10:w=150:h=48

Full graph, watermark removal first so it happens before any scaling:

    [0:v]delogo=x=14:y=10:w=150:h=48,scale=1280:720:flags=lanczos,setsar=1,split=2[f][r];
    [f]setpts=1.4*PTS[fwd];
    [r]reverse,setpts=2.2*PTS[rev];
    [fwd][rev]concat=n=2:v=1:a=0,$MI[v]

Encoded to a high-quality intermediate (`-crf 16 -preset veryfast`) **first**,
then to delivery formats. This matters: motion interpolation is slow, and doing
it once into an intermediate meant the MP4, the WebM and the poster could all be
derived without repeating it.

Delivery:

    # MP4 (universal)
    ffmpeg -i inter.mp4 -an -c:v libx264 -crf 25 -preset slow \
      -profile:v high -pix_fmt yuv420p -movflags +faststart out.mp4

    # WebM (smaller, desktop)
    ffmpeg -i inter.mp4 -an -c:v libvpx-vp9 -crf 35 -b:v 0 \
      -row-mt 1 -deadline good -cpu-used 4 out.webm

    # Poster
    ffmpeg -i inter.mp4 -frames:v 1 -vf scale=1600:-2 -q:v 4 out.jpg

`-movflags +faststart` moves the MP4 index to the front of the file so playback
can begin before the whole file has arrived. For a streamed backdrop that is
the difference between instant and a two-second wait.

### Stage 3 — the phone encodes

    ffmpeg -i in.mp4 -an -vf scale=854:480:flags=lanczos \
      -c:v libx264 -crf 27 -preset slow -profile:v main -level 3.1 \
      -pix_fmt yuv420p -movflags +faststart m/out.mp4

Three deliberate details:

- **Downscaled from the already-processed 30fps files**, not from the
  originals. All the baked timing survives exactly; only pixels change.
- **H.264 Main, Level 3.1** — the profile every phone hardware decoder
  supports. High profile or VP9 can silently fall back to software decode.
- **854x480**, because a phone crops most of the width away anyway (see §6).

Result — hero clip: **3207KB → 510KB**. Every clip's before/after is in
chapter 06.

---

## 4. One decoder, always

Eleven `<video>` elements exist in the DOM. At most **one** ever decodes.

```tsx
// Park everything that is not the active layer.
for (const backdrop of backdrops) {
  if (backdrop.id === activeId) continue;
  const other = videoRefs.current[backdrop.id];
  if (other && !other.paused) other.pause();
}
```

Every other layer is paused and sits at `opacity: 0`. This is what makes eleven
full-screen clips affordable at all.

### Lazy arming

A layer only receives `<source>` children once it is _armed_, and arming covers
the active clip plus **the next one down the page**:

```tsx
const from = SECTION_ORDER.indexOf(activeId);
for (let i = from + 1; i < SECTION_ORDER.length; i++) {
  if (backdropFor(SECTION_ORDER[i])) {
    next.add(SECTION_ORDER[i]);
    break;
  }
}
```

A visitor who lands and never scrolls downloads **one** video. Measured
first-load media payload: **2421KB across 3 files** — the hero clip, the hero
poster, and the next poster — against 67MB of media in the repository.

The `poster` attribute is gated the same way (`poster={isArmed ? ... : undefined}`),
because a poster on an invisible layer is dead weight. `preload="none"` stops
the browser speculatively fetching armed-but-not-active clips.

---

## 5. The crossfade

Two transitions run at once when the active section changes:

```tsx
// the layer
className="transition-opacity duration-[1100ms] ease-[var(--ease-out-expo)]"
style={{ opacity: isActive ? 1 : 0 }}

// the video inside it
className="transition-transform duration-[2400ms] ease-[var(--ease-out-expo)]"
style={{ transform: isActive ? "scale(1)" : "scale(1.07)" }}
```

Opacity over 1.1s, scale over 2.4s. The mismatch is intentional: the incoming
clip is still settling from 1.07 to 1.0 long after it has finished fading in,
which reads as a slow push-in rather than a cut. Both are compositor-only
properties, so the whole crossfade costs the main thread nothing.

### Telling WebGL to stop drawing

While a clip is fully opaque, everything the WebGL mesh draws is invisible —
and it competes for the same frame budget. [`lib/videoCover.ts`](../../lib/videoCover.ts)
is a 25-line pub/sub that lets the backdrop tell the scene to idle:

```tsx
if (!hasClip) {
  setVideoCovering(false);
  return;
} // reveal immediately
const t = setTimeout(() => setVideoCovering(true), 1200); // announce late
```

Note the asymmetry. Covering is announced **1200ms late** — after the crossfade
finishes, so the mesh is never missing while it should still be partly visible
— but uncovering is announced **immediately**. Scene responds by switching
`frameloop` from `"always"` to `"demand"`.

---

## 6. Framing: full-bleed on a phone without losing the subject

This was a genuine design problem, and it went through a rejected attempt.

A 16:9 plate on a 390x844 phone, filling the height, can only show about
**26% of its width**. _Which_ 26% is the entire question — and in every one of
your plates the subject stands somewhere between 10% and 55%, never dead
centre. A default centre crop lands on empty landscape.

**The rejected attempt:** `object-fit: contain`, which shows the whole frame
letterboxed. You rejected it outright — _"otherwise video background have not
meaning"_ — and that was the right call. A letterboxed strip is not a
background.

**The fix:** stay full-bleed, move the crop window. Every plate carries two
focal points, and the narrow one is centred on the subject box from your asset
spec:

```ts
focus:       "50% 50%",   // wide screens: nearly the whole frame is visible
focusNarrow: "31% 56%",   // phones: crop window centred on the person
```

```css
.backdrop-video {
  object-position: var(--focus-wide, 50% 50%);
}

@media (max-width: 900px) {
  .backdrop-video {
    object-position: var(--focus-narrow, 50% 50%);
  }
}
```

Verified across all 10 plates at 390x844 — every subject box lands inside the
visible window, with `object-fit` still `cover`:

    hero          subject 11.2–38.9%   window 18.5–44.5%   CENTRED
    journey       subject 24–38.5%     window 22.9–48.9%   CENTRED
    exploring     subject 55–95%       window 55.5–81.5%   CENTRED

---

## 7. The scrim

Text over video needs contrast, but a flat dark overlay would mute the footage.
So the scrim is **directional** — it pools on whichever side the copy sits and
falls away before it reaches the subject.

Three variants, selected per clip:

- `--right` (default) — subject left, copy right
- `--left` — the one mirrored plate (`exploring`)
- `--even` — centre-subject plates: vertical wash only, because a lateral pool
  would darken the subject itself

Each is a vertical wash (keeping nav and footer legible on any frame)
composited over a horizontal gradient that reaches `transparent` at 82%.

Below 768px the safe zones collapse — copy takes the full width — so all three
variants become the same vertical wash.

---

## 8. Choosing sources per device

```tsx
narrow ? (
  <>
    {backdrop.mp4Mobile && <source src={backdrop.mp4Mobile} type="video/mp4" />}
    <source src={backdrop.mp4} type="video/mp4" />
  </>
) : (
  <>
    <source src={backdrop.webm} type="video/webm" />
    <source src={backdrop.mp4} type="video/mp4" />
  </>
);
```

Two things worth knowing:

**The `media` attribute on `<source>` does not work inside `<video>`.** It is
honoured inside `<picture>`, but browsers dropped it for video. The selection
_must_ happen in JavaScript — hence the `narrow` state driven by
`matchMedia("(max-width: 900px), (pointer: coarse)")`.

**H.264 goes first on phones, WebM first on desktop.** VP9 is smaller and
desktops decode it in hardware. On phones VP9 hardware decode is inconsistent —
offering it first can silently drop a device into a software decoder, which
costs far more than the extra bytes save.

---

## 9. Pausing during scroll

On touch devices only, the clip pauses while the page is actually moving:

```tsx
const onScroll = () => {
  setScrolling(true);
  clearTimeout(idle);
  idle = setTimeout(() => setScrolling(false), 180);
};
```

Decoding and scrolling compete for the same budget, and nobody studies the
backdrop mid-flick. It resumes 180ms after motion stops. Verified on the live
site: **0.08** videos playing on average during a scroll, and all eight clip
sections resume at rate 1 once it ends.

---

## 10. Who does not get video at all

```tsx
const weakDevice =
  (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
  (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2);

const frugal = Boolean(
  conn?.saveData || (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) || weakDevice,
);
setMotion(!motionQuery.matches && !frugal);
```

Reduced-motion, Save-Data, 2G and genuinely low-end devices get the poster
stills — which still crossfade, so the visual narrative survives without the
bandwidth or the decode cost.

The thresholds are deliberately conservative (≤2 cores, ≤2GB RAM). A mid-range
phone decodes these clips in hardware and should keep them.

`motion` starts as `false` so the very first paint never emits a `<source>` —
otherwise a reduced-motion visitor would begin a download before the check had
a chance to run. Verified: **reduced motion downloads zero video files.**
