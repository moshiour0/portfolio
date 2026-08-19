"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { backdrops, SECTION_ORDER, backdropFor } from "@/lib/backdrops";
import { setVideoCovering } from "@/lib/videoCover";

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

/**
 * Fixed, full-page cinematic backdrop that crossfades between one clip per
 * section as the page scrolls. Sections with no clip fade the video layer out
 * entirely, revealing the WebGL node network underneath.
 *
 * Performance rules that keep this from melting a phone:
 *  - exactly one video is ever decoding; every other layer is paused
 *  - clips are armed lazily — only the active one and the next one get a src,
 *    so a visitor who never scrolls downloads a single video
 *  - reduced-motion, Save-Data and 2G visitors get the poster stills instead,
 *    which still crossfade, so the narrative survives without the bandwidth
 */
export default function VideoBackdrop() {
  const [activeId, setActiveId] = useState<string>("hero");
  // Starts false so the very first paint never emits a <source>: a
  // reduced-motion or Save-Data visitor must not fetch a clip before the
  // check below has had a chance to run.
  const [motion, setMotion] = useState(false);
  const [armed, setArmed] = useState<Set<string>>(() => new Set(["hero"]));
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Decide once whether moving video is appropriate for this visitor.
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const conn = (navigator as Navigator & { connection?: NetworkInfo }).connection;

    const sync = () => {
      const frugal = Boolean(
        conn?.saveData || (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)),
      );
      setMotion(!motionQuery.matches && !frugal);
    };

    sync();
    motionQuery.addEventListener("change", sync);
    return () => motionQuery.removeEventListener("change", sync);
  }, []);

  // Track which section owns the viewport, sampled inside rAF.
  useEffect(() => {
    let frame = 0;

    const compute = () => {
      // Bias slightly above centre so the swap lands as a section takes over.
      const line = window.innerHeight * 0.42;
      let current = SECTION_ORDER[0] as string;

      for (const id of SECTION_ORDER) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) {
          current = id;
          break;
        }
      }

      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Arm the current clip plus the next one down the page, and nothing else.
  useEffect(() => {
    setArmed((prev) => {
      const next = new Set(prev);
      if (backdropFor(activeId)) next.add(activeId);

      // Also arm the next clip down the page so the crossfade is never late.
      const from = SECTION_ORDER.indexOf(activeId);
      for (let i = from + 1; i < SECTION_ORDER.length; i++) {
        if (backdropFor(SECTION_ORDER[i])) {
          next.add(SECTION_ORDER[i]);
          break;
        }
      }

      return next.size === prev.size ? prev : next;
    });
  }, [activeId]);

  // Tell the WebGL backdrop when it is fully hidden so it can stop drawing.
  // Covering is announced only once the crossfade has finished, but revealed
  // immediately, so the mesh is never missing while it should be visible.
  useEffect(() => {
    const hasClip = Boolean(backdropFor(activeId)) && motion;
    if (!hasClip) {
      setVideoCovering(false);
      return;
    }
    const t = setTimeout(() => setVideoCovering(true), 1200);
    return () => clearTimeout(t);
  }, [activeId, motion]);

  useEffect(() => () => setVideoCovering(false), []);

  // Exactly one clip is ever live, and it is driven by its own playback mode.
  useEffect(() => {
    // Park everything that is not the active layer.
    for (const backdrop of backdrops) {
      if (backdrop.id === activeId) continue;
      const other = videoRefs.current[backdrop.id];
      if (other && !other.paused) other.pause();
    }

    const backdrop = backdropFor(activeId);
    const el = backdrop ? videoRefs.current[activeId] : null;
    if (!backdrop || !el || !motion) return;

    let frame = 0;
    const play = () => {
      const attempt = el.play();
      if (attempt) attempt.catch(() => {});
    };

    // `loop` and `pingpong` are both native loops. The ping-pong clips carry
    // their reverse leg inside the file (forward at 1x, then the same footage
    // backwards at ~0.56x, ending on frame 0), so looping them natively gives a
    // seamless there-and-back with no seeking, no rAF and no decode stalls.
    if (backdrop.playback === "loop" || backdrop.playback === "pingpong") {
      el.loop = true;
      el.playbackRate = 1;
      play();
      return () => el.pause();
    }

    // `decelerate` clips carry a logarithmic time-warp baked in — they slow to
    // a standstill on their own and rest on the final frame. Driving the rate
    // from script instead produced uneven frame pacing (and Blink refuses any
    // rate below 1/16), so the asset does the easing and we just play it once.
    el.loop = false;
    el.playbackRate = 1;
    if (el.currentTime > 0 && el.ended) el.currentTime = 0;
    play();
    return () => el.pause();
  }, [activeId, motion]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      {backdrops.map((backdrop) => {
        const isActive = backdrop.id === activeId;
        const isArmed = armed.has(backdrop.id);

        return (
          <div
            key={backdrop.id}
            className="absolute inset-0 transition-opacity duration-[1100ms] ease-[var(--ease-out-expo)]"
            style={{ opacity: isActive ? 1 : 0 }}
          >
            <video
              ref={(el) => {
                videoRefs.current[backdrop.id] = el;
              }}
              className="backdrop-video h-full w-full object-cover transition-transform duration-[2400ms] ease-[var(--ease-out-expo)]"
              style={
                {
                  "--focus-wide": backdrop.focus,
                  "--focus-narrow": backdrop.focusNarrow ?? backdrop.focus,
                  transform: isActive ? "scale(1)" : "scale(1.07)",
                } as CSSProperties
              }
              // A layer at opacity 0 is invisible, so its poster is dead weight
              // until the clip is armed — which always happens one section early.
              poster={isArmed ? backdrop.poster : undefined}
              muted
              loop
              playsInline
              preload="none"
              // eslint-disable-next-line jsx-a11y/media-has-caption
              tabIndex={-1}
            >
              {isArmed && motion && (
                <>
                  <source src={backdrop.webm} type="video/webm" />
                  <source src={backdrop.mp4} type="video/mp4" />
                </>
              )}
            </video>
          </div>
        );
      })}

      {/* Contrast scrim, pooled on whichever side the copy sits so the
          subject of the clip is never washed out. */}
      <div
        className={`video-scrim video-scrim--${backdropFor(activeId)?.scrim ?? "right"} absolute inset-0 transition-opacity duration-700`}
      />
    </div>
  );
}
