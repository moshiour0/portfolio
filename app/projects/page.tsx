import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects, research explorations, competition work and architecture studies across AI, Earth observation and software engineering.",
};

export default function ProjectsIndex() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-32 pb-24 sm:px-10">
      <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">Projects</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
        Things I have built, researched and designed.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted">
        Each entry is labelled for what it actually is — a project, a research exploration, a
        competition entry, or an architecture study.
      </p>

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="card-face group flex flex-col p-6 transition-colors hover:border-accent/50"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
                {project.number}
              </span>
              <span className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-dim">
                {project.label}
              </span>
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-balance">
              {project.name}
            </h2>
            <p className="mt-1.5 text-sm text-accent/90">{project.kicker}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">{project.summary}</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-dim"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm text-accent">
              View Case Study
              <span className="transition-transform group-hover:translate-x-1">&#8594;</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
