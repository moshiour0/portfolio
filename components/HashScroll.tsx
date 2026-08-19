"use client";

import { useEffect } from "react";
import { scrollToId } from "@/lib/scroll";

/**
 * Honours `/#section` when arriving from another route.
 *
 * Two things make this harder than it looks. SmoothScroll lives in the layout
 * and never remounts on a client navigation, so a hash handler there only runs
 * on a full page load — this mounts with the homepage instead. And the homepage
 * grows from roughly 1900px to 14000px as the sections lay out, so scrolling
 * immediately aims at a position that no longer exists a moment later. So we
 * wait for the document height to settle, scroll, then confirm we landed and
 * correct once if the page shifted underneath us.
 */
export default function HashScroll() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    let cancelled = false;
    let raf = 0;
    const timers: number[] = [];

    let lastHeight = -1;
    let stableFor = 0;
    let waited = 0;

    const settleThenScroll = () => {
      if (cancelled) return;

      const el = document.getElementById(id);
      const height = document.documentElement.scrollHeight;

      // Height unchanged for a few consecutive frames means layout has landed.
      stableFor = height === lastHeight ? stableFor + 1 : 0;
      lastHeight = height;
      waited += 1;

      if (!el || (stableFor < 6 && waited < 120)) {
        raf = requestAnimationFrame(settleThenScroll);
        return;
      }

      scrollToId(id);

      // The carousels keep adding height for a while after the scroll starts,
      // and how long depends on which route we came from. So confirm the
      // landing several times and re-issue if the page shifted underneath us;
      // once it is within a few pixels the checks are no-ops.
      for (const delay of [1300, 2200, 3200, 4400]) {
        timers.push(
          window.setTimeout(() => {
            if (cancelled) return;
            const target = document.getElementById(id);
            if (!target) return;
            if (Math.abs(target.getBoundingClientRect().top) > 6) scrollToId(id);
          }, delay),
        );
      }
    };

    raf = requestAnimationFrame(settleThenScroll);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  return null;
}
