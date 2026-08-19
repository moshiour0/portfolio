/**
 * Standalone routes reuse homepage sections, whose headings are h2 by design.
 * Each route therefore needs its own h1 so the document outline starts at the
 * top level rather than jumping straight to h2.
 */
export default function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-32 pb-4 sm:px-10">
      <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl">
        {title}
      </h1>
      {lead && <p className="mt-4 max-w-2xl leading-relaxed text-muted">{lead}</p>}
    </header>
  );
}
