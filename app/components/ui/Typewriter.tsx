"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface TypewriterProps {
  text: string;
  /** Starts typing when true. Remount (change `key`) to type it again. */
  play: boolean;
  /** Milliseconds per character. */
  speed?: number;
  /** Milliseconds to wait before the first character. */
  delay?: number;
}

/**
 * Types `text` out one character at a time. The untyped rest is laid out but
 * invisible, so the block never reflows while it types. Reduced motion shows
 * the whole text at once.
 */
export function Typewriter({ text, play, speed = 40, delay = 0 }: TypewriterProps) {
  const reducedMotion = useReducedMotion();
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (!play || reducedMotion) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setTyped((n) => {
          if (n >= text.length) clearInterval(interval);
          return Math.min(n + 1, text.length);
        });
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [play, reducedMotion, text, speed, delay]);

  const shown = reducedMotion ? text.length : play ? typed : 0;
  const done = shown >= text.length;

  return (
    <span>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, shown)}
        <span
          className={`inline-block w-[0.55ch] h-[1.1em] -mb-[0.2em] bg-current
                      ${play && !done ? "" : "opacity-0"}`}
        />
        <span className="opacity-0">{text.slice(shown)}</span>
      </span>
    </span>
  );
}
