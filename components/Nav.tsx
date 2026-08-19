"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile, sections } from "@/lib/content";
import { scrollToId } from "@/lib/scroll";

export default function Nav() {
  // Section links only scroll when the sections are actually on the page.
  // From /projects or /research there is nothing to scroll to, so they have to
  // navigate home with a hash instead — that was why they appeared dead.
  const pathname = usePathname();
  const onHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const go = (event: React.MouseEvent, id: string) => {
    setOpen(false);
    if (!onHome) return; // let the Link navigate to /#id
    event.preventDefault();
    scrollToId(id);
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          onClick={(e) => {
            if (!onHome) return;
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="group flex items-center gap-2.5 font-display text-base font-semibold tracking-tight"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="transition-colors group-hover:text-accent">Moshiour</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {sections.map(({ id, label }) => (
            <li key={id}>
              <Link
                href={`/#${id}`}
                onClick={(e) => go(e, id)}
                aria-current={onHome && active === id ? "true" : undefined}
                className={`rounded-full px-4 py-2 text-[0.95rem] transition-colors ${
                  onHome && active === id ? "text-accent" : "text-muted hover:text-text"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="hidden rounded-full border border-line-strong px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-text sm:block"
          >
            Email Me
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full border border-line-strong md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-px w-4 bg-text transition-all duration-300 ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 h-px w-4 bg-text transition-all duration-300 ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </nav>

      <div
        className={`overflow-hidden border-t border-line bg-bg/95 backdrop-blur-xl transition-[max-height] duration-500 md:hidden ${
          open ? "max-h-80" : "max-h-0"
        }`}
      >
        <ul className="px-6 py-4">
          {sections.map(({ id, label }) => (
            <li key={id}>
              <Link
                href={`/#${id}`}
                onClick={(e) => go(e, id)}
                className="block w-full border-b border-line py-3.5 text-left text-base text-muted last:border-0"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
