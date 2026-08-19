import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

/** Scroll to a section by id, using Lenis when it is active. */
export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  if (instance) {
    instance.scrollTo(target, { offset: 0, duration: 1.1 });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
