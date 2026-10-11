type Tone = "neutral" | "success" | "warning" | "info" | "contrast";

interface BadgeProps {
  children: React.ReactNode;
  tone?: Tone;
  /** A small rounded pill, for a marker pinned to another element's corner. */
  pill?: boolean;
}

const TONES: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  // The app's own ink on paper (white surface, neutral-800 like the CTAs). Reads on both a
  // light background and on top of a dark button.
  contrast: "bg-white text-neutral-800 border-neutral-800",
};

/** A non-interactive status label. Square, like every other surface, unless `pill`. */
export function Badge({ children, tone = "neutral", pill = false }: BadgeProps) {
  const shape = pill ? "rounded-full text-[10px] leading-none px-2 py-1 whitespace-nowrap" : "text-xs px-3 py-1.5";
  return <span className={`font-mono border inline-block ${shape} ${TONES[tone]}`}>{children}</span>;
}
