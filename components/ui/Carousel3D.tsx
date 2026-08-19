"use client";

import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type Carousel3DProps = {
  children: ReactNode;
  /** Degrees per second while idling. */
  speed?: number;
  /** How long the ring holds still after a drag before resuming, in ms. */
  holdMs?: number;
  label: string;
  className?: string;
  /**
   * `coverflow` holds the active card centred, upright and full size, with its
   * neighbours scaled down, angled away and stacked behind it.
   * `ring` sweeps the cards around a vertical axis toward the viewer.
   * `orbit` walks them around the middle of the frame instead, leaving the
   * centre permanently clear — used where the clip's subject sits dead centre.
   */
  variant?: "coverflow" | "ring" | "orbit";
  /** Share of the viewport height this carousel may occupy. */
  budgetVh?: number;
  /**
   * A region of the *viewport* the cards must never cover, in percent —
   * the subject of the clip behind them. Orbit paths are derived from it.
   */
  keepOut?: { cx: number; cy: number; halfW: number; halfH: number };
};

type Mode = "auto" | "drag" | "fling" | "snap" | "hold";

const DEG = Math.PI / 180;
/** How far a card shrinks while it passes the protected subject. */
const CROSS_SCALE = 0.4;

/**
 * Cards that move on their own and can be grabbed and spun in any direction.
 * Releasing snaps the nearest card to face the reader and holds it there long
 * enough to read before drifting on.
 *
 * Everything is sized from a viewport-height budget so a section always fits
 * inside one frame: the ring is given the space left over once the heading and
 * the controls have taken theirs, and the cards are laid out to fill exactly
 * that, never more.
 */
export default function Carousel3D({
  children,
  speed = 9,
  holdMs = 2600,
  label,
  className = "",
  variant = "ring",
  budgetVh = 52,
  keepOut,
}: Carousel3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const items = Children.toArray(children);
  const count = items.length;
  const step = 360 / Math.max(1, count);

  // Held as primitives: callers pass an inline object, and depending on the
  // object identity would remeasure on every render.
  const koCx = keepOut?.cx ?? 50;
  const koCy = keepOut?.cy ?? 50;
  const koHalfWPct = keepOut?.halfW ?? 0;
  const koHalfHPct = keepOut?.halfH ?? 0;

  // The orbit needs room either side of the subject. Where there isn't any —
  // a phone, mainly — it falls back to the ring rather than overflowing.
  const [layout, setLayout] = useState<"coverflow" | "ring" | "orbit">(variant);

  const [reduced, setReduced] = useState(false);
  const [geometry, setGeometry] = useState({
    cardWidth: 320,
    radius: 420,
    height: 460,
    pitch: 0,
    rx: 240,
    ry: 120,
    ox: 0,
    oy: 0,
    cardHeight: 300,
    spacing: 200,
    koW: 0,
    koH: 0,
  });
  const [active, setActive] = useState(0);

  // All animation state lives in a ref: the loop writes straight to the DOM
  // so a 60fps spin never triggers a React render.
  const anim = useRef({
    angle: 0,
    velocity: 0,
    tilt: 0,
    mode: "auto" as Mode,
    target: 0,
    holdUntil: 0,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startAngle: 0,
    lastX: 0,
    lastT: 0,
  });

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  // Size everything from the container width and the height budget.
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || reduced) return;

    const measure = () => {
      const w = host.clientWidth;
      const budget = Math.round((window.innerHeight * budgetVh) / 100);

      if (variant === "orbit") {
        const cardWidth = Math.round(Math.min(360, Math.max(228, w * 0.31)));
        const tallest = cardRefs.current.reduce(
          (max, el) => (el ? Math.max(max, el.scrollHeight) : max),
          0,
        );
        const cardHeight = Math.round(tallest || budget * 0.8);

        // The keep-out is a fraction of the *viewport*, but the host's viewport
        // position moves with scroll. Measure the host relative to its section
        // instead — the section is one full frame, so section coordinates and
        // viewport coordinates coincide whenever the section is on screen, and
        // the result no longer depends on where the page happens to be.
        const section = host.closest("section");
        const rect = host.getBoundingClientRect();
        const secRect = section ? section.getBoundingClientRect() : rect;
        const hostCx = rect.left - secRect.left + rect.width / 2;
        const hostCy = rect.top - secRect.top + rect.height / 2;

        const kx = (koCx / 100) * window.innerWidth - hostCx;
        const ky = (koCy / 100) * window.innerHeight - hostCy;
        const koHalfW = (koHalfWPct / 100) * window.innerWidth;
        const koHalfH = (koHalfHPct / 100) * window.innerHeight;

        // The ellipse is sized to circumscribe the subject plus the card that
        // has to clear it. Cards shrink to CROSS_SCALE as they pass the
        // subject, so the vertical radius only has to clear the shrunk card —
        // which is what makes this fit inside one frame at all.
        const rx = Math.round(koHalfW + cardWidth / 2 + 14);
        const ry = Math.round(koHalfH + (cardHeight * CROSS_SCALE) / 2 + 14);

        // A card at the flank spans rx ± cardWidth/2 from centre. If that walks
        // outside the container there is no room to orbit — fall through to the
        // ring branch below so ring geometry is actually measured. Returning
        // here would leave the stale initial geometry in place and overflow.
        if (rx + cardWidth / 2 > w / 2) {
          setLayout("ring");
        } else {
          setLayout("orbit");

          setGeometry((prev) =>
            prev.cardWidth === cardWidth &&
            prev.height === budget &&
            prev.rx === rx &&
            prev.ry === ry &&
            prev.ox === Math.round(kx) &&
            prev.oy === Math.round(ky) &&
            prev.cardHeight === cardHeight
              ? prev
              : {
                  ...prev,
                  cardWidth,
                  cardHeight,
                  height: budget,
                  rx,
                  ry,
                  ox: Math.round(kx),
                  oy: Math.round(ky),
                  koW: Math.round(koHalfW),
                  koH: Math.round(koHalfH),
                  radius: rx,
                  pitch: 0,
                },
          );
          return;
        }
      }

      if (variant === "ring") setLayout("ring");
      if (variant === "coverflow") {
        setLayout("coverflow");
        // A narrow card makes a tall card: the same text wraps into more lines.
        // Wide columns get a wider cap so the deck stays short enough to sit in
        // one frame with its controls.
        const cardWidth = Math.round(Math.min(540, Math.max(236, w * (w < 560 ? 0.86 : 0.6))));
        const tallest = cardRefs.current.reduce(
          (max, el) => (el ? Math.max(max, el.scrollHeight) : max),
          0,
        );
        // The stage takes the height the tallest card actually needs. Capping
        // it at the budget is what sliced the tops and bottoms off cards once
        // the type grew — the budget is a floor now, not a ceiling.
        const cardHeight = Math.round(tallest || budget * 0.85);
        const stageHeight = Math.max(budget, cardHeight + 24);
        // Neighbours sit just over half a card away, so they peek out either
        // side of the active one instead of hiding behind it completely.
        const spacing = Math.round(cardWidth * 0.62);

        setGeometry((prev) =>
          prev.cardWidth === cardWidth &&
          prev.height === stageHeight &&
          prev.spacing === spacing &&
          prev.cardHeight === cardHeight
            ? prev
            : { ...prev, cardWidth, cardHeight, height: stageHeight, spacing, pitch: 0 },
        );
        return;
      }

      const ratio = w < 560 ? 0.92 : 0.62;
      const cardWidth = Math.round(Math.min(420, Math.max(248, w * ratio)));
      const radius =
        count >= 3
          ? Math.round(cardWidth / 2 / Math.tan(Math.PI / count))
          : Math.round(cardWidth * 0.85);

      const tallest = cardRefs.current.reduce(
        (max, el) => (el ? Math.max(max, el.scrollHeight) : max),
        0,
      );
      // Spiral pitch is whatever vertical room is left after the tallest card,
      // so the corkscrew never pushes the ring past its budget.
      const slack = Math.max(0, budget - (tallest || 0) - 24);
      const pitch = count > 1 ? Math.round(Math.min(40, slack / (count - 1))) : 0;
      const height = budget;

      setGeometry((prev) =>
        prev.cardWidth === cardWidth &&
        prev.radius === radius &&
        prev.height === height &&
        prev.pitch === pitch
          ? prev
          : { ...prev, cardWidth, radius, height, pitch },
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    cardRefs.current.forEach((el) => el && ro.observe(el));
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [count, reduced, variant, budgetVh, koCx, koCy, koHalfWPct, koHalfHPct]);

  const paint = useCallback(() => {
    const { angle, tilt } = anim.current;

    if (layout === "coverflow") {
      for (let i = 0; i < cardRefs.current.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        // Signed distance from the centre slot, wrapped so the deck is endless.
        let rel = (i + angle / step) % count;
        rel = ((rel % count) + count) % count;
        if (rel > count / 2) rel -= count;

        const dist = Math.min(Math.abs(rel), 2.4);
        const x = rel * geometry.spacing;
        const scale = Math.max(0.6, 1 - dist * 0.17);
        const rotY = Math.max(-38, Math.min(38, -rel * 30));
        const z = -dist * 170;

        el.style.transform =
          `translate(-50%, -50%) translateX(${x.toFixed(1)}px) translateZ(${z.toFixed(1)}px) ` +
          `rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = Math.max(0, 1 - dist * 0.62).toFixed(3);
        el.style.filter = dist < 0.35 ? "none" : `blur(${Math.min(3.2, dist * 1.5).toFixed(2)}px)`;
        // The centre card stacks above its neighbours and is the only one
        // that takes clicks, so links behind it stay inert.
        // Capped below the section heading: cards pass in front of everything
        // else, but never over the title.
        el.style.zIndex = String(30 - Math.round(dist * 8));
        el.style.pointerEvents = Math.abs(rel) < 0.4 ? "auto" : "none";
      }
      return;
    }

    if (layout === "orbit") {
      for (let i = 0; i < cardRefs.current.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const theta = (i * step + angle) * DEG;
        // `side` is 1 at the flanks and 0 while crossing above or below the
        // subject. Cards are full size out at the sides and shrink and fade as
        // they cross, so they read as passing behind it rather than over it.
        const side = Math.abs(Math.cos(theta));
        const scale = CROSS_SCALE + (1 - CROSS_SCALE) * side;

        // A card is a rectangle, not a point, so an elliptical path lets its
        // corners cut into the subject at off-axis angles. Two rectangles miss
        // each other exactly when one centre lies outside the other's
        // Minkowski sum — a box of half-size (subject + card). So ride that
        // box's boundary: the distance to it along this heading is the smaller
        // of the two axis crossings. Cards then track around the subject
        // instead of through it, at every angle.
        const halfW = (geometry.cardWidth * scale) / 2;
        const halfH = (geometry.cardHeight * scale) / 2;
        const needX = geometry.koW + halfW + 10;
        const needY = geometry.koH + halfH + 10;
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        const EPS = 1e-4;
        const t = Math.min(
          needX / Math.max(Math.abs(ct), EPS),
          needY / Math.max(Math.abs(st), EPS),
        );
        const x = ct * t + geometry.ox;
        const y = st * t + geometry.oy;
        el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        el.style.opacity = (0.24 + side * 0.76).toFixed(3);
        el.style.filter = side > 0.86 ? "none" : `blur(${((1 - side) * 2.6).toFixed(2)}px)`;
        el.style.zIndex = String(10 + Math.round(side * 20));
        el.style.pointerEvents = side > 0.8 ? "auto" : "none";
      }
      return;
    }

    const ring = ringRef.current;
    if (!ring) return;
    ring.style.transform = `translateZ(${-geometry.radius}px) rotateX(${tilt}deg) rotateY(${angle}deg)`;

    for (let i = 0; i < cardRefs.current.length; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const facing = Math.cos((i * step + angle) * DEG);
      const front = Math.max(0, facing);
      el.style.opacity = String(0.16 + front * 0.84);
      el.style.filter = front > 0.92 ? "none" : `blur(${((1 - front) * 3.4).toFixed(2)}px)`;
      // Only the card facing the viewer takes clicks, so links behind it are inert.
      el.style.pointerEvents = facing > 0.86 ? "auto" : "none";
    }
  }, [
    geometry.radius,
    geometry.rx,
    geometry.ry,
    geometry.ox,
    geometry.oy,
    geometry.koW,
    geometry.koH,
    geometry.cardWidth,
    geometry.cardHeight,
    geometry.spacing,
    step,
    count,
    layout,
  ]);

  // The render loop.
  useEffect(() => {
    if (reduced) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const a = anim.current;

      switch (a.mode) {
        case "auto":
          a.angle += speed * dt;
          break;

        case "drag":
          break;

        case "fling":
          a.angle += a.velocity * dt;
          a.velocity *= Math.exp(-3.2 * dt);
          if (Math.abs(a.velocity) < 24) {
            a.mode = "snap";
            a.target = Math.round(a.angle / step) * step;
          }
          break;

        case "snap": {
          const ease = 1 - Math.exp(-7 * dt);
          a.angle += (a.target - a.angle) * ease;
          if (Math.abs(a.target - a.angle) < 0.06) {
            a.angle = a.target;
            a.mode = "hold";
            a.holdUntil = now + holdMs;
          }
          break;
        }

        case "hold":
          if (now >= a.holdUntil) a.mode = "auto";
          break;
      }

      if (a.mode !== "drag") {
        a.tilt += (0 - a.tilt) * (1 - Math.exp(-6 * dt));
      }

      paint();

      const index = ((-Math.round(a.angle / step) % count) + count) % count;
      setActive((prev) => (prev === index ? prev : index));

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [count, holdMs, paint, reduced, speed, step]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const a = anim.current;
    a.pointerId = e.pointerId;
    a.mode = "drag";
    a.startX = e.clientX;
    a.startY = e.clientY;
    a.startAngle = a.angle;
    a.lastX = e.clientX;
    a.lastT = performance.now();
    a.velocity = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const a = anim.current;
    if (a.mode !== "drag" || e.pointerId !== a.pointerId) return;

    const dx = e.clientX - a.startX;
    const dy = e.clientY - a.startY;

    a.angle = a.startAngle + dx / 2.4;
    if (layout === "ring") a.tilt = Math.max(-16, Math.min(16, -dy / 12));

    const now = performance.now();
    const dt = now - a.lastT;
    if (dt > 8) {
      a.velocity = ((e.clientX - a.lastX) / 2.4 / dt) * 1000;
      a.lastX = e.clientX;
      a.lastT = now;
    }
    paint();
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const a = anim.current;
    if (a.mode !== "drag" || e.pointerId !== a.pointerId) return;
    a.pointerId = -1;
    a.mode = "fling";
    if (Math.abs(a.velocity) < 24) {
      a.mode = "snap";
      a.target = Math.round(a.angle / step) * step;
    }
  };

  const goTo = useCallback(
    (index: number) => {
      const a = anim.current;
      const current = Math.round(a.angle / step);
      let delta = (-index - current) % count;
      if (delta > count / 2) delta -= count;
      if (delta < -count / 2) delta += count;
      a.target = (current + delta) * step;
      a.mode = "snap";
      a.velocity = 0;
    },
    [count, step],
  );

  const nudge = useCallback(
    (dir: 1 | -1) => {
      const a = anim.current;
      a.target = (Math.round(a.angle / step) - dir) * step;
      a.mode = "snap";
      a.velocity = 0;
    },
    [step],
  );

  // Reduced motion: a plain responsive grid, no rotation, nothing hidden.
  if (reduced) {
    return (
      <div
        className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
        role="list"
        aria-label={label}
      >
        {items.map((item, i) => (
          <div role="listitem" key={i} className="h-full">
            {item}
          </div>
        ))}
      </div>
    );
  }

  const isOrbit = layout === "orbit";
  const isCoverflow = layout === "coverflow";
  const isRing = layout === "ring";

  return (
    <div className={className}>
      {/* The viewport is the clip box; the stage inside it is what has a height.
          Keeping them separate matters: putting the negative margin on the
          sized element pulled the whole deck up into the heading. */}
      <div className="carousel-viewport">
        <div
          ref={hostRef}
          role="group"
          aria-roledescription="carousel"
          aria-label={`${label} — drag to rotate`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              nudge(1);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              nudge(-1);
            }
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          // No overflow clip: a hard container edge slices cards mid-travel and
          // reads as a box drawn around the deck. Instead the stage is allowed to
          // overhang its column and the cards dissolve at the edges (see
          // `carousel-stage`), so they arrive and leave in open space.
          className="carousel-stage relative cursor-grab touch-pan-y select-none outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-4 focus-visible:ring-offset-bg"
          style={{ height: geometry.height, perspective: isOrbit ? undefined : "1500px" }}
        >
          <div className="spiral-glow absolute inset-0" aria-hidden="true" />

          <div
            ref={ringRef}
            className={
              isOrbit ? "absolute inset-0" : "absolute inset-0 [transform-style:preserve-3d]"
            }
            style={isRing ? { transform: `translateZ(${-geometry.radius}px)` } : undefined}
          >
            {items.map((item, i) => {
              const yOffset = (i - (count - 1) / 2) * geometry.pitch;
              return (
                <div
                  key={i}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="absolute top-1/2 left-1/2"
                  style={
                    isRing
                      ? {
                          width: geometry.cardWidth,
                          transform: `translateX(-50%) rotateY(${i * step}deg) translateZ(${geometry.radius}px) translateY(calc(-50% + ${yOffset}px))`,
                          transformStyle: "preserve-3d",
                          willChange: "opacity, filter",
                        }
                      : {
                          // coverflow and orbit are positioned entirely by paint()
                          width: geometry.cardWidth,
                          willChange: "transform, opacity, filter",
                        }
                  }
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          onClick={() => nudge(-1)}
          aria-label="Previous card"
          className="grid h-8 w-8 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:border-accent hover:text-text"
        >
          &#8592;
        </button>

        <div className="flex items-center gap-2" role="tablist" aria-label={`${label} cards`}>
          {items.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={active === i}
              aria-label={`Show card ${i + 1} of ${count}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                active === i ? "w-7 bg-accent" : "w-1.5 bg-line-strong hover:bg-muted"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => nudge(1)}
          aria-label="Next card"
          className="grid h-8 w-8 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:border-accent hover:text-text"
        >
          &#8594;
        </button>

        <span className="ml-1 font-mono text-[10px] tracking-[0.24em] text-dim uppercase">
          Drag
        </span>
      </div>
    </div>
  );
}
