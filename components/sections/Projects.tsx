import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import Carousel3D from "@/components/ui/Carousel3D";
import { Section, SectionHeading } from "@/components/ui/Section";
import { projects } from "@/lib/content";

export default function Projects() {
  return (
    <Section id="projects">
      <SectionHeading
        index="02"
        title="Featured Projects"
        lead="Labelled honestly — project, research exploration, competition entry, or architecture study."
      />

      <Reveal>
        <Carousel3D label="Featured projects" speed={7} budgetVh={47} variant="coverflow">
          {projects.map((project) => (
            <article key={project.slug} className="card-face flex flex-col p-5">
              <div className="flex items-start justify-between gap-4">
                <span className="fit-card-meta font-mono tracking-[0.2em] text-accent uppercase">
                  {project.number}
                </span>
                <span className="fit-card-meta rounded-full border border-line px-2.5 py-1 font-mono text-dim">
                  {project.label}
                </span>
              </div>

              <h3 className="fit-card-title mt-2.5 font-display font-semibold tracking-tight text-balance">
                {project.name}
              </h3>
              <p className="fit-card-kind mt-1 text-accent/90">{project.kicker}</p>

              <p className="fit-card-body mt-2.5 text-muted">{project.summary}</p>

              <div className="fit-card-meta mt-3 font-mono tracking-wider text-dim uppercase">
                {project.category}
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="fit-card-meta rounded-full border border-line px-2.5 py-1 font-mono text-dim"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href={`/projects/${project.slug}`}
                className="fit-card-kind group mt-4 inline-flex items-center gap-2 text-accent transition-colors hover:text-accent-hover"
              >
                View Case Study
                <span className="transition-transform group-hover:translate-x-1">&#8594;</span>
              </Link>
            </article>
          ))}
        </Carousel3D>
      </Reveal>

      <Reveal delay={140}>
        <div className="mt-6 text-center">
          <Link
            href="/projects"
            className="fit-card-meta font-mono tracking-[0.2em] text-dim uppercase underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            All projects &#8594;
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
