import Reveal from "@/components/ui/Reveal";
import SocialIcon from "@/components/ui/SocialIcon";
import { Section } from "@/components/ui/Section";
import { contact, links, profile } from "@/lib/content";

export default function Contact() {
  return (
    <Section id="contact" side="right" columnPct={47}>
      <div className="flex items-center gap-4">
        <span className="fit-meta font-mono tracking-[0.25em] text-accent">10</span>
        <span className="h-px flex-1 bg-line md:max-w-24" />
      </div>

      <Reveal>
        <h2 className="fit-title mt-4 font-display font-semibold tracking-tight text-balance">
          {contact.heading}
        </h2>
      </Reveal>

      <Reveal delay={110}>
        <p className="fit-lead mt-5 max-w-2xl text-muted">{contact.description}</p>
      </Reveal>

      <Reveal delay={200}>
        <a
          href={`mailto:${profile.email}`}
          className="fit-card-title group mt-8 inline-flex max-w-full items-center gap-3 border-b border-line-strong pb-2 transition-colors hover:border-accent"
        >
          <span className="break-all transition-colors group-hover:text-accent">
            {profile.email}
          </span>
          <span className="text-accent transition-transform group-hover:translate-x-1.5">
            &#8594;
          </span>
        </a>
      </Reveal>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {links.map((link, i) => (
          <Reveal key={link.label} delay={220 + i * 70}>
            <a
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group flex items-center gap-3 rounded-xl border border-line-strong bg-bg/50 px-4 py-3.5 backdrop-blur-md transition-colors hover:border-accent hover:bg-bg/70"
            >
              <span className="text-muted transition-colors group-hover:text-accent">
                <SocialIcon icon={link.icon} />
              </span>
              <span className="min-w-0">
                <span className="fit-card-kind block font-medium text-text">{link.label}</span>
                <span className="fit-card-meta block truncate font-mono text-dim">
                  {link.handle}
                </span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>

      <Reveal delay={520}>
        <p className="fit-card-meta mt-8 font-mono tracking-wider text-dim uppercase">
          {profile.location}
        </p>
      </Reveal>
    </Section>
  );
}
