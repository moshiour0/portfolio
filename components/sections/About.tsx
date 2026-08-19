import Reveal from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { about, learningPhilosophy, philosophy, values } from "@/lib/content";

export default function About() {
  return (
    <Section id="about" side="right" columnPct={47} frame={false}>
      <SectionHeading index="08" title={about.heading} />

      <div className="grid gap-8">
        <div>
          {about.body.map((paragraph, i) => (
            <Reveal key={i} delay={i * 70}>
              <p className={`fit-card-body text-muted ${i > 0 ? "mt-4" : ""}`}>{paragraph}</p>
            </Reveal>
          ))}
          <Reveal delay={420}>
            <p className="fit-card-meta mt-6 font-mono tracking-[0.2em] text-accent uppercase">
              {about.closing}
            </p>
          </Reveal>

          <Reveal delay={480}>
            <div className="card-face mt-8 p-6">
              <h3 className="fit-card-title font-display font-semibold tracking-tight">
                {learningPhilosophy.heading}
              </h3>
              {learningPhilosophy.body.map((line, i) => (
                <p key={i} className={`fit-card-body text-muted ${i === 0 ? "mt-3" : "mt-2"}`}>
                  {line}
                </p>
              ))}
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal>
            <h3 className="fit-card-meta font-mono tracking-[0.2em] text-dim uppercase">
              What I care about
            </h3>
          </Reveal>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={i * 60}>
                <div className="rounded-xl border border-line bg-white/[0.02] p-4">
                  <h4 className="fit-card-kind font-medium text-accent">{value.title}</h4>
                  <p className="fit-card-meta mt-1.5 leading-relaxed text-muted">{value.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="card-face mt-6 p-6">
              <h3 className="fit-card-title font-display font-semibold tracking-tight">
                {philosophy.heading}
              </h3>
              <p className="fit-card-body mt-2.5 text-muted">{philosophy.statement}</p>
              <ul className="mt-3 flex flex-wrap gap-1">
                {philosophy.topics.map((topic) => (
                  <li
                    key={topic}
                    className="fit-card-meta rounded-md border border-line bg-white/[0.03] px-2 py-0.5 font-mono text-dim"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
