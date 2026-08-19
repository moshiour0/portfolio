"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/scroll";
import { SECTION_ORDER } from "@/lib/backdrops";

/** How close to a section edge counts as "nearly settled", as a share of the viewport. */
const SNAP_THRESHOLD = 0.3;
/** Quiet time after the last scroll event before we settle the page. */
const IDLE_MS = 130;

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    setLenis(lenis);

    let frame = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    // Arriving from another route as /#section: Lenis owns the scroll position,
    // so the browser's native hash jump does not survive. Honour it once the
    // layout has settled.
    const hash = window.location.hash.slice(1);
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        window.setTimeout(() => lenis.scrollTo(target, { duration: 0.9, offset: 0 }), 120);
      }
    }

    // ---- Proximity snap -------------------------------------------------
    // Each section is a full frame, so once scrolling stops we look at the
    // nearest section edge. If the reader has already brought it most of the
    // way in, we finish the job for them; if they are mid-journey between two
    // sections we leave them alone. That is proximity, not mandatory snapping:
    // it never fights someone who is deliberately scrolling past.
    let idle: ReturnType<typeof setTimeout> | undefined;
    let settling = false;

    const settle = () => {
      if (settling) return;

      const viewport = window.innerHeight;
      let target: HTMLElement | null = null;
      let closest = Infinity;

      for (const id of SECTION_ORDER) {
        const el = document.getElementById(id);
        if (!el) continue;
        const offset = el.getBoundingClientRect().top;
        if (Math.abs(offset) < Math.abs(closest)) {
          closest = offset;
          target = el;
        }
      }

      // Already parked, or too far away to be "nearly there" — leave it.
      if (!target || Math.abs(closest) < 2 || Math.abs(closest) > viewport * SNAP_THRESHOLD) {
        return;
      }

      // Never snap past the end of the document, or the page would fight itself.
      const maxScroll = document.documentElement.scrollHeight - viewport;
      if (window.scrollY + closest > maxScroll - 2) return;

      settling = true;
      lenis.scrollTo(target, {
        duration: 0.85,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        onComplete: () => {
          settling = false;
        },
      });
      // Failsafe in case onComplete is skipped by an interrupting gesture.
      window.setTimeout(() => {
        settling = false;
      }, 1100);
    };

    const onScroll = () => {
      if (settling) return;
      clearTimeout(idle);
      idle = setTimeout(settle, IDLE_MS);
    };

    lenis.on("scroll", onScroll);

    return () => {
      clearTimeout(idle);
      cancelAnimationFrame(frame);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
