import Reveal from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { education, academicDirection, journey } from "@/lib/content";

/** A journey, not an employment history — the spec forbids fabricating jobs. */
export function Journey() {
  return (
    <Section id="journey" side="right" columnPct={56} frame={false}>
      <SectionHeading
        index="05"
        title="Journey"
        lead="How the curiosity progressed — training, competitions, satellite research, and the systems work that followed."
      />

      <ol className="relative border-l border-line pl-8 md:pl-12">
        {journey.map((entry, i) => (
          <li key={entry.period} className="group relative pb-10 last:pb-0">
            <span className="absolute top-2 -left-[calc(2rem+1px)] h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-accent bg-bg transition-all duration-500 group-hover:scale-150 group-hover:bg-accent md:-left-[calc(3rem+1px)]" />
            <Reveal delay={i * 70}>
              <div className="grid gap-3 md:grid-cols-12 md:gap-6">
                <div className="md:col-span-3">
                  <span className="fit-card-meta font-mono tracking-wider text-accent">
                    {entry.period}
                  </span>
                </div>
                <div className="md:col-span-9">
                  <h3 className="fit-card-title font-display font-semibold tracking-tight">
                    {entry.title}
                  </h3>
                  {entry.body && <p className="fit-card-body mt-2 text-muted">{entry.body}</p>}
                  {entry.items && (
                    <ul className="mt-3 flex flex-wrap gap-1">
                      {entry.items.map((item) => (
                        <li
                          key={item}
                          className="fit-card-meta rounded-md border border-line bg-white/[0.03] px-2 py-0.5 font-mono text-muted"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Education() {
  return (
    <Section id="education" side="right" columnPct={44} frame={false}>
      <SectionHeading index="06" title="Education" />

      <div className="grid gap-5">
        {education.map((item, i) => (
          <Reveal key={item.institution} delay={i * 100} className="h-full">
            <article className="card-face flex h-full flex-col p-6">
              <h3 className="fit-card-title font-display font-semibold tracking-tight text-balance">
                {item.institution}
              </h3>
              <p className="fit-card-kind mt-2 text-accent/90">{item.qualification}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <dt className="fit-card-meta font-mono tracking-[0.18em] text-dim uppercase">
                    Period
                  </dt>
                  <dd className="fit-card-body text-muted">{item.period}</dd>
                </div>
                <div>
                  <dt className="fit-card-meta font-mono tracking-[0.18em] text-dim uppercase">
                    Grade
                  </dt>
                  <dd className="fit-card-body text-muted">
                    {item.grade} &middot; GPA {item.gpa}
                  </dd>
                </div>
                {item.location && (
                  <div className="col-span-2">
                    <dt className="fit-card-meta font-mono tracking-[0.18em] text-dim uppercase">
                      Location
                    </dt>
                    <dd className="fit-card-body text-muted">{item.location}</dd>
                  </div>
                )}
              </dl>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <div className="mt-6 rounded-2xl border border-line p-6">
          <h3 className="fit-card-meta font-mono tracking-[0.2em] text-dim uppercase">
            {academicDirection.heading}
          </h3>
          <p className="fit-card-kind mt-3 text-text">{academicDirection.direction}</p>
          <ul className="mt-3 flex flex-wrap gap-1">
            {academicDirection.interests.map((item) => (
              <li
                key={item}
                className="fit-card-meta rounded-md border border-line bg-white/[0.03] px-2 py-0.5 font-mono text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="fit-card-body mt-4 text-dim">
            Potential future postgraduate direction: {academicDirection.postgraduate}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
