type Tone = "neutral" | "success" | "warning" | "info";

interface BadgeProps {
  children: React.ReactNode;
  tone?: Tone;
}

const TONES: Record<Tone, string> = {
  neutral: "bg-neutral-100 text-neutral-600 border-neutral-200",
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

/** A non-interactive status pill. Square, like every other surface. */
export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`font-mono text-xs px-3 py-1.5 border inline-block ${TONES[tone]}`}>
      {children}
    </span>
  );
}
