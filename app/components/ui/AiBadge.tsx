import { AiSparkle, AI_GRADIENT_STOPS } from "./icons";

interface AiBadgeProps {
  /** What the AI does, e.g. "Autofill with AI". */
  children: React.ReactNode;
}

/** A tag for an AI-powered action: the sparkle beside gradient text, on a faint brand-purple tint. */
export function AiBadge({ children }: AiBadgeProps) {
  return (
    <span
      className="self-start inline-flex items-center gap-1.5 py-1 pl-2 pr-2.5 border border-accent/20 bg-accent/5
                 font-mono text-[11px] font-semibold"
    >
      <AiSparkle />
      <span
        className="bg-clip-text text-transparent"
        style={{ backgroundImage: `linear-gradient(90deg, ${AI_GRADIENT_STOPS.join(", ")})` }}
      >
        {children}
      </span>
    </span>
  );
}
