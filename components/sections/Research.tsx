import Reveal from "@/components/ui/Reveal";
import Carousel3D from "@/components/ui/Carousel3D";
import { Section, SectionHeading } from "@/components/ui/Section";
import { research } from "@/lib/content";

/**
 * The fish in this section's clip sits dead centre (44.4–62.3% x, 49.9–62.9% y),
 * so the cards orbit it rather than sitting on top of it — the subject of the
 * footage stays visible the whole way round.
 */
export default function Research() {
  return (
    <Section id="research">
      <SectionHeading index="03" title={research.heading} lead={research.intro} />

      <Reveal>
        <Carousel3D
          label="Research and exploration"
          speed={7}
          budgetVh={45}
          variant="orbit"
          /* FISH, from Ai-Text-Placement-Config.json */
          keepOut={{ cx: 53.35, cy: 56.4, halfW: 8.95, halfH: 6.5 }}
        >
          {research.areas.map((area) => (
            <article key={area.title} className="card-face flex flex-col p-5">
              <h3 className="fit-card-title font-display font-semibold tracking-tight">
                {area.title}
              </h3>
              <p className="fit-card-meta mt-2 font-mono tracking-[0.18em] text-dim uppercase">
                Exploring
              </p>
              <ul className="mt-2.5 space-y-1">
                {area.items.map((item) => (
                  <li key={item} className="fit-card-body flex gap-2.5 text-muted">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
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
