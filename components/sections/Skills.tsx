import Reveal from "@/components/ui/Reveal";
import Carousel3D from "@/components/ui/Carousel3D";
import { Section, SectionHeading } from "@/components/ui/Section";
import { skillGroups } from "@/lib/content";

/**
 * Grouped by domain, no proficiency bars — the spec rules those out as
 * subjective. The clip behind this section keeps its subject out to 65%, the
 * narrowest safe zone of the set, so eleven groups ride a coverflow rather
 * than a grid that could never fit the column.
 */
export default function Skills() {
  return (
    <Section id="skills" side="right" columnPct={32}>
      <SectionHeading
        index="04"
        title="Technical Skills"
        lead="Grouped by domain rather than rated."
      />

      <Reveal>
        <Carousel3D label="Technical skills" speed={6} budgetVh={50} variant="coverflow">
          {skillGroups.map((group, i) => (
            <article key={group.title} className="card-face flex flex-col p-5">
              <span className="fit-card-meta font-mono tracking-[0.2em] text-accent uppercase">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="fit-card-kind mt-2 font-display font-semibold tracking-tight">
                {group.title}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-1">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="fit-card-meta rounded-md border border-line bg-white/[0.03] px-2 py-0.5 font-mono text-muted"
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
