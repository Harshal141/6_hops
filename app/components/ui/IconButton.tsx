interface IconButtonProps {
  children: React.ReactNode;
  /** Required: a glyph like "×" gives a screen reader nothing to announce. */
  ariaLabel: string;
  onClick: () => void;
  tone?: "danger" | "muted";
  disabled?: boolean;
}

const TONES = {
  danger: "text-red-400 hover:text-red-600",
  muted: "text-neutral-400 hover:text-neutral-700",
} as const;

/**
 * A bare glyph action — remove a row, dismiss an inline form. Sized to a 24px
 * target so it is actually tappable; the hand-rolled versions were ~14px.
 */
export function IconButton({
  children,
  ariaLabel,
  onClick,
  tone = "muted",
  disabled = false,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`w-6 h-6 shrink-0 inline-flex items-center justify-center font-mono text-sm
                leading-none transition-colors cursor-pointer disabled:opacity-50
                disabled:cursor-not-allowed ${TONES[tone]}`}
    >
      {children}
    </button>
  );
}
