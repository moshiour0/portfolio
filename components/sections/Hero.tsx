"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import SplitText from "@/components/ui/SplitText";
import { profile } from "@/lib/content";
import { scrollToId } from "@/lib/scroll";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [raised, setRaised] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRaised(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Cursor parallax: content and the glow drift a few px in opposite directions.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        section.style.setProperty("--parallax-x", `${px * -12}px`);
        section.style.setProperty("--parallax-y", `${py * -9}px`);
        section.style.setProperty("--parallax-x2", `${px * 18}px`);
        section.style.setProperty("--parallax-y2", `${py * 13}px`);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden px-6 sm:px-10"
    >
      <div className={`curtain absolute inset-0 z-40 bg-bg ${raised ? "curtain-raised" : ""}`} />

      <div
        className="hero-orb pointer-events-none absolute top-1/2 right-[6%] z-0 h-[36rem] w-[36rem] rounded-full"
        style={{ transform: "translate(var(--parallax-x2, 0), calc(-50% + var(--parallax-y2, 0)))" }}
        aria-hidden="true"
      />

      <div
        className="relative z-10 mx-auto w-full max-w-6xl pt-[4.25rem] pb-8"
        style={{ transform: "translate(var(--parallax-x, 0), var(--parallax-y, 0))" }}
      >
        <div className="section-column lg:ml-auto lg:w-[61%]">
          <Reveal delay={80}>
            <span className="fit-card-meta inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-surface/60 px-4 py-1.5 font-mono tracking-wider text-muted backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-3 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-3" />
              </span>
              {profile.displayName}
            </span>
          </Reveal>

          <h1 className="mt-4 font-display text-[clamp(1.9rem,min(8.4cqw,5.8vh),3.5rem)] leading-[1.06] font-semibold tracking-tight">
            <SplitText
              text="Building with Data, AI & Technology"
              delay={240}
              stagger={16}
              className="block"
              charClassName="text-gradient"
            />
            <SplitText
              text="to Solve Real-World Problems."
              delay={780}
              stagger={16}
              className="block"
              charClassName="text-gradient"
            />
          </h1>

          <Reveal delay={1200}>
            <p className="fit-lead mt-4 max-w-2xl text-muted">{profile.heroDescription}</p>
          </Reveal>

          <Reveal delay={1320}>
            <p className="fit-card-meta mt-3 font-mono tracking-[0.2em] text-accent uppercase">
              {profile.supportingLine}
            </p>
          </Reveal>

          <Reveal delay={1440}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => scrollToId("projects")}
                className="group relative overflow-hidden rounded-full bg-text px-7 py-3.5 text-sm font-medium text-bg transition-transform duration-300 hover:scale-[1.04] active:scale-100"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">
                  Explore My Work
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    &#8594;
                  </span>
                </span>
              </button>
              <button
                onClick={() => scrollToId("contact")}
                className="rounded-full border border-line-strong bg-bg/40 px-7 py-3.5 text-sm text-text backdrop-blur-md transition-colors hover:border-accent hover:bg-bg/60"
              >
                Let&apos;s Connect
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
        <span className="font-mono text-[10px] tracking-[0.3em] text-dim uppercase">Scroll</span>
        <span className="relative h-12 w-px overflow-hidden bg-line-strong">
          <span className="absolute inset-x-0 top-0 h-4 animate-[scrollcue_2s_ease-in-out_infinite] bg-accent" />
        </span>
      </div>

      <style>{`
        @keyframes scrollcue {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
      `}</style>
    </section>
  );
}
