import Reveal from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { achievementSignals, intro } from "@/lib/content";

/** Trust strip — real results only, no manufactured statistics. */
export function AchievementStrip() {
  return (
    <section id="achievements-strip" className="relative px-6 py-14 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line/60 lg:grid-cols-4">
          {achievementSignals.map((signal, i) => (
            <Reveal key={signal.org} delay={i * 80}>
              <div className="h-full bg-bg/72 p-5 backdrop-blur-md">
                <div className="fit-card-meta font-mono tracking-[0.2em] text-dim uppercase">
                  {signal.org}
                </div>
                <div className="fit-card-kind mt-2 font-display font-semibold tracking-tight text-accent">
                  {signal.result}
                </div>
                {signal.note && (
                  <div className="fit-card-meta mt-1 text-dim">{signal.note}</div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Intro() {
  return (
    <Section id="intro" side="right" columnPct={50} frame={false}>
      <div className="grid gap-6">
        <div>
          <Reveal>
            <h2 className="fit-title font-display font-semibold tracking-tight text-balance">
              {intro.heading}
            </h2>
          </Reveal>
        </div>
        <div>
          {intro.body.map((paragraph, i) => (
            <Reveal key={i} delay={i * 110}>
              <p className={`fit-lead text-muted ${i > 0 ? "mt-5" : ""}`}>{paragraph}</p>
            </Reveal>
          ))}
          <Reveal delay={360}>
            <p className="fit-card-meta mt-7 font-mono tracking-[0.2em] text-accent uppercase">
              {intro.closing}
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
