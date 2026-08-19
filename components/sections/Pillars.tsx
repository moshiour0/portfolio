import Reveal from "@/components/ui/Reveal";
import Carousel3D from "@/components/ui/Carousel3D";
import { Section, SectionHeading } from "@/components/ui/Section";
import { pillars } from "@/lib/content";

export default function Pillars() {
  return (
    <Section id="pillars" side="right" columnPct={50}>
      <SectionHeading
        index="01"
        title="What I Do"
        lead="Five connected domains, from data and AI to Earth observation and systems."
      />

      <Reveal>
        <Carousel3D label="What I do" speed={7} budgetVh={52} variant="coverflow">
          {pillars.map((pillar) => (
            <article key={pillar.index} className="card-face flex flex-col p-5">
              <span className="fit-card-meta font-mono tracking-[0.2em] text-accent uppercase">
                {pillar.index}
              </span>
              <h3 className="fit-card-title mt-2.5 font-display font-semibold tracking-tight text-balance">
                {pillar.title}
              </h3>
              <p className="fit-card-body mt-2.5 text-muted">{pillar.statement}</p>
              <ul className="mt-3 flex flex-wrap gap-1">
                {pillar.focus.map((item) => (
                  <li
                    key={item}
                    className="fit-card-meta rounded-md border border-line bg-white/[0.03] px-2 py-0.5 font-mono text-dim"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </Carousel3D>
      </Reveal>
    </Section>
  );
}
