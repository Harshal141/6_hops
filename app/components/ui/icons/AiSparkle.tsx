"use client";

import { useId } from "react";

/** The AI gradient: brand purple (globals.css --color-accent) into fuchsia into blue. */
export const AI_GRADIENT_STOPS = ["var(--color-accent)", "#d946ef", "#3b82f6"] as const;

interface AiSparkleProps {
  size?: number;
}

/**
 * The four-point "AI" sparkle with a small companion star, filled with the AI gradient.
 * Decorative: pair it with text that says what the AI does. The gradient id comes from
 * useId, so any number of sparkles can share a page without their fills colliding.
 */
export function AiSparkle({ size = 14 }: AiSparkleProps) {
  // useId's punctuation (":r0:" or "«r0»") isn't safe inside url(#…), so keep only the
  // alphanumerics; they alone are what makes each id unique.
  const id = `ai-sparkle-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fill = `url(#${id})`;
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {AI_GRADIENT_STOPS.map((color, index) => (
            <stop
              key={color}
              offset={index / (AI_GRADIENT_STOPS.length - 1)}
              style={{ stopColor: color }}
            />
          ))}
        </linearGradient>
      </defs>
      <path fill={fill} d="M10 2c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7z" />
      <path
        fill={fill}
        d="M18 13c.3 2.2 1.3 3.2 3.5 3.5-2.2.3-3.2 1.3-3.5 3.5-.3-2.2-1.3-3.2-3.5-3.5 2.2-.3 3.2-1.3 3.5-3.5z"
      />
    </svg>
  );
}
