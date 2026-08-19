"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type SplitTextProps = {
  text: string;
  /** Milliseconds before the first character moves. */
  delay?: number;
  /** Milliseconds between consecutive characters. */
  stagger?: number;
  className?: string;
  /** Applied to every character span — used for the gradient fill. */
  charClassName?: string;
};

/**
 * Reveals a line character by character, each one rising out of its own
 * clipping mask with a slight 3D rotation. Words never break mid-line
 * because each word is an inline-block unit.
 *
 * The full string stays in the accessibility tree via a visually hidden
 * copy, so screen readers read one sentence rather than a pile of letters.
 */
export default function SplitText({
  text,
  delay = 0,
  stagger = 34,
  className = "",
  charClassName = "",
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlay(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");
  let index = 0;

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={w} className="inline-block whitespace-nowrap">
            {[...word].map((char, c) => {
              const i = index++;
              return (
                <span key={c} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <span
                    className={`char inline-block ${play ? "char-in" : ""} ${charClassName}`}
                    style={{ "--char-delay": `${delay + i * stagger}ms` } as CSSProperties}
                  >
                    {char}
                  </span>
                </span>
              );
            })}
            {w < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    </span>
  );
}
