"use client";

import { useInView } from "@/lib/hooks/useInView";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger, in ms, for items revealed together. */
  delay?: number;
  /** Stretch to fill a grid or flex cell. */
  fullHeight?: boolean;
}

/**
 * Fades and lifts its content in the first time it scrolls into view. With
 * reduced motion it is simply there: the hidden state only applies under
 * `motion-safe`.
 */
export function Reveal({ children, delay = 0, fullHeight = false }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out
                  ${fullHeight ? "h-full" : ""}
                  ${inView ? "opacity-100 translate-y-0" : "motion-safe:opacity-0 motion-safe:translate-y-6"}`}
    >
      {children}
    </div>
  );
}
