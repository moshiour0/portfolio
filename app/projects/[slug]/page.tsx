import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: project.name, description: project.summary };
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-8">
      <h2 className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-md border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-muted"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 leading-relaxed text-muted">
          <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const d = project.detail;

  return (
    <div className="relative z-10 mx-auto w-full max-w-4xl px-6 pt-32 pb-24 sm:px-10">
      <Link
        href="/projects"
        className="font-mono text-xs tracking-wider text-dim uppercase transition-colors hover:text-accent"
      >
        &#8592; All projects
      </Link>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
          {project.number}
        </span>
        <span className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-dim">
          {project.label}
        </span>
      </div>

      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl">
        {project.name}
      </h1>
      <p className="mt-3 text-lg text-accent/90">{project.kicker}</p>
      {project.tagline && (
        <p className="mt-4 font-mono text-sm tracking-wider text-muted">{project.tagline}</p>
      )}
      <p className="mt-6 text-lg leading-relaxed text-muted">{project.summary}</p>
      <p className="mt-4 font-mono text-xs tracking-wider text-dim uppercase">{project.category}</p>

      <div className="mt-14 space-y-10">
        {d.problem && (
          <Block title="Problems addressed">
            <Bullets items={d.problem} />
          </Block>
        )}

        {d.context && (
          <Block title="Context">
            <Bullets items={d.context} />
          </Block>
        )}

        {d.approach && (
          <Block title="Objective">
            <Bullets items={d.approach} />
          </Block>
        )}

        {d.flow?.map((flow) => (
          <Block key={flow.title} title={flow.title}>
            <ol className="space-y-1.5">
              {flow.steps.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="w-7 shrink-0 font-mono text-xs text-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-md border border-line bg-white/[0.03] px-3 py-1.5 text-sm text-muted">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </Block>
        ))}

        {d.phases && (
          <Block title="Roadmap">
            <div className="space-y-6">
              {d.phases.map((phase) => (
                <div key={phase.title} className="rounded-xl border border-line p-5">
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {phase.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{phase.body}</p>
                  {phase.items && (
                    <div className="mt-4">
                      <Tags items={phase.items} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Block>
        )}

        {d.data && (
          <Block title="Data">
            <div className="space-y-4">
              {d.data.map((group) => (
                <div key={group.label}>
                  <p className="font-mono text-xs tracking-wider text-dim uppercase">
                    {group.label}
                  </p>
                  <div className="mt-2">
                    <Tags items={group.items} />
                  </div>
                </div>
              ))}
            </div>
          </Block>
        )}

        {d.services && (
          <Block title="Services">
            <Tags items={d.services} />
          </Block>
        )}

        {d.infrastructure && (
          <Block title="Infrastructure">
            <Tags items={d.infrastructure} />
          </Block>
        )}

        <Block title="Technology">
          <Tags items={d.technology} />
        </Block>

        {d.concepts && (
          <Block title="Concepts">
            <Tags items={d.concepts} />
          </Block>
        )}

        {d.focus && (
          <Block title="Focus">
            <Tags items={d.focus} />
          </Block>
        )}

        {d.achievement && (
          <Block title="Recognition">
            <dl className="grid gap-3 sm:grid-cols-2">
              {d.achievement.map((row) => (
                <div key={row.label} className="rounded-xl border border-line p-4">
                  <dt className="font-mono text-xs tracking-wider text-dim uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-1.5 text-muted">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Block>
        )}

        {d.whyItMatters && (
          <Block title="Why it matters">
            {d.whyItMatters.map((line) => (
              <p key={line} className="leading-relaxed text-muted">
                {line}
              </p>
            ))}
          </Block>
        )}
      </div>
    </div>
  );
}
