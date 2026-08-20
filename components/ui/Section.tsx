import type { CSSProperties, ReactNode } from "react";
import Reveal from "./Reveal";

/**
 * One section, one frame.
 *
 * Each backdrop clip places its subject differently, so the copy column is
 * sized per section rather than by a shared preset. `columnPct` is the width
 * of the column as a share of the page shell, derived from where that clip's
 * subject ends — see `docs/asset-spec/new-assets-spec.json`.
 *
 * `side` is normally "right" because most plates put the subject on the left.
 * The Exploring plate is mirrored — subject on the right — so it takes "left".
 *
 * The column is also a container, so type inside can be sized in `cqw`: a
 * share of the measured safe zone rather than a guess.
 */
export function Section({
  id,
  children,
  className = "",
  side = "full",
  columnPct = 100,
  frame = true,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  side?: "full" | "left" | "right";
  columnPct?: number;
  frame?: boolean;
}) {
  const isSafe = side !== "full";

  return (
    <section
      id={id}
      className={`relative px-6 sm:px-10 ${
        frame ? "section-frame flex min-h-[100svh] items-center py-14 md:py-16" : "py-20 md:py-28"
      } ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div
          className={`section-column ${isSafe ? "safe-column" : ""} ${
            side === "left" ? "safe-left" : side === "right" ? "safe-right" : ""
          }`}
          style={isSafe ? ({ "--col": `${columnPct}%` } as CSSProperties) : undefined}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  index,
  title,
  lead,
}: {
  index: string;
  title: string;
  lead?: string;
}) {
  return (
    <Reveal className="relative z-50 mb-4 md:mb-5">
      <div className="flex items-center gap-4">
        <span className="fit-meta font-mono tracking-[0.25em] text-accent">{index}</span>
        <span className="h-px flex-1 bg-line md:max-w-24" />
      </div>
      <h2 className="fit-title mt-2.5 font-display font-semibold tracking-tight text-balance">
        {title}
      </h2>
      {lead && <p className="fit-lead mt-2.5 max-w-2xl text-muted">{lead}</p>}
    </Reveal>
  );
}
