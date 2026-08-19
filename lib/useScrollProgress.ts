"use client";

import { useEffect, useRef } from "react";

export type ScrollState = {
  /** 0 at the top of the document, 1 at the bottom. */
  progress: number;
  /** Pixels moved since the previous sample; decays toward 0 in the render loop. */
  velocity: number;
  y: number;
};

/**
 * Single passive scroll listener shared by the WebGL backdrop.
 * Samples inside rAF so it never forces layout mid-scroll.
 */
export function useScrollProgress() {
  const ref = useRef<ScrollState>({ progress: 0, velocity: 0, y: 0 });

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const sample = () => {
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const state = ref.current;
      state.progress = Math.min(1, Math.max(0, y / max));
      state.velocity += y - lastY;
      state.y = y;
      lastY = y;
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sample);
    };

    sample();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return ref;
}
