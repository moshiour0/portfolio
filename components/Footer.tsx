import Link from "next/link";
import SocialIcon from "@/components/ui/SocialIcon";
import { links, profile } from "@/lib/content";

const footerLinks = [
  { label: "Projects", href: "/projects" },
  { label: "Research", href: "/research" },
  { label: "Achievements", href: "/achievements" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-line px-6 py-14 sm:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-2">
        <div>
          <p className="font-display text-xl font-semibold tracking-tight">
            {profile.displayName}
          </p>
          <p className="mt-2 font-mono text-sm tracking-wider text-dim">{profile.roleShort}</p>

          <ul className="mt-6 flex flex-wrap gap-3">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={link.label}
                  title={link.label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-line-strong text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <SocialIcon icon={link.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav className="md:justify-self-end" aria-label="Footer">
          <ul className="flex flex-wrap gap-x-7 gap-y-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-mono text-sm tracking-wider text-dim uppercase transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-12 w-full max-w-6xl border-t border-line pt-6">
        <p className="font-mono text-sm tracking-wider text-dim">
          &copy; {new Date().getFullYear()} {profile.displayName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
