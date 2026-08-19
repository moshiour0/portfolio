import Reveal from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { awards } from "@/lib/content";

export default function Achievements() {
  return (
    <Section id="achievements" side="right" columnPct={52} frame={false}>
      <SectionHeading index="07" title="Awards & Achievements" />

      <div className="grid gap-5 md:grid-cols-2">
        {awards.map((award, i) => (
          <Reveal key={award.title} delay={i * 100} className="h-full">
            <article className="card-face flex h-full flex-col p-6">
              <h3 className="fit-card-title font-display font-semibold tracking-tight text-balance">
                {award.title}
              </h3>
              <p className="fit-card-kind mt-2 text-accent">{award.result}</p>
              {award.notes.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {award.notes.map((note) => (
                    <li key={note} className="fit-card-body flex gap-2.5 text-muted">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-3" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </Reveal>
        ))}
      </div>

    </Section>
  );
}
