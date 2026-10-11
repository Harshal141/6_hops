"use client";

import { useRef } from "react";

type Tone = "solid" | "glass";
type Padding = "none" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** `glass` lets what is behind the card show through, blurred. */
  tone?: Tone;
  padding?: Padding;
  /** The house offset border, the same one the hero CTA and stat tiles carry. */
  offset?: boolean;
  /** Stretch to fill a grid or flex cell. */
  fullHeight?: boolean;
  /** A soft light that follows the cursor across the card. */
  spotlight?: boolean;
  /** Extra behaviour on hover, e.g. replaying a demo inside. */
  onPointerEnter?: () => void;
}

const TONES: Record<Tone, string> = {
  solid: "bg-white/90 backdrop-blur-sm border-neutral-200",
  glass: "bg-white/40 backdrop-blur-md border-white shadow-[0_8px_40px_-12px_rgb(0_0_0/0.18)]",
};

const PADDING: Record<Padding, string> = {
  none: "",
  md: "p-4 sm:p-5",
  lg: "p-6 sm:p-10",
};

/** The panel surface. Square, like every other surface in the app. */
export function Card({
  children,
  header,
  footer,
  tone = "solid",
  padding = "md",
  offset = false,
  fullHeight = false,
  spotlight = false,
  onPointerEnter,
}: CardProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  // written straight to CSS variables: a re-render per mouse move is not needed
  const trackSpotlight = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = surfaceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className={`relative ${fullHeight ? "h-full" : ""}`}>
      {offset && (
        <span aria-hidden className="absolute inset-0 border border-neutral-300 translate-x-1.5 translate-y-1.5" />
      )}
      <div
        ref={surfaceRef}
        onPointerMove={spotlight ? trackSpotlight : undefined}
        onPointerEnter={onPointerEnter}
        className={`group/card relative overflow-hidden border flex flex-col ${fullHeight ? "h-full" : ""} ${TONES[tone]}
                    ${spotlight ? "transition-colors hover:border-neutral-400" : ""}`}
      >
        {spotlight && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100
                       bg-[radial-gradient(280px_circle_at_var(--spot-x,50%)_var(--spot-y,50%),rgb(0_0_0/0.06),transparent_70%)]"
          />
        )}
        {header && <div className="relative px-4 py-2 border-b border-neutral-200 font-mono text-xs text-neutral-500">{header}</div>}
        <div className={`relative flex-1 ${PADDING[padding]}`}>{children}</div>
        {footer && <div className="relative px-4 py-2 border-t border-neutral-200">{footer}</div>}
      </div>
    </div>
  );
}
