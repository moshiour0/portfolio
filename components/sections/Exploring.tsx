import Reveal from "@/components/ui/Reveal";
import Carousel3D from "@/components/ui/Carousel3D";
import { Section, SectionHeading } from "@/components/ui/Section";
import { currentlyExploring } from "@/lib/content";

/**
 * The only mirrored plate in the set: in this clip the subject stands on the
 * RIGHT (55–95%) holding map and binoculars, looking left across the valley.
 * So the copy takes the LEFT — the emerald valley the spec marks as open.
 */
export default function Exploring() {
  return (
    <Section id="exploring" side="left" columnPct={56}>
      <SectionHeading
        index="09"
        title="Currently Exploring"
        lead="Open threads — what I am actively learning and building with right now."
      />

      <Reveal>
        <Carousel3D label="Currently exploring" speed={6.5} budgetVh={50} variant="coverflow">
          {currentlyExploring.map((area, i) => (
            <article key={area.title} className="card-face flex flex-col p-5">
              <span className="fit-card-meta font-mono tracking-[0.2em] text-accent uppercase">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="fit-card-title mt-2 font-display font-semibold tracking-tight">
                {area.title}
              </h3>
              <ul className="mt-2.5 space-y-1">
                {area.items.map((item) => (
                  <li key={item} className="fit-card-body flex gap-2.5 text-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-3" />
                    <span>{item}</span>
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
