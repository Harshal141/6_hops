interface IconButtonProps {
  children: React.ReactNode;
  /** Required: a glyph like "×" gives a screen reader nothing to announce. */
  ariaLabel: string;
  onClick: () => void;
  tone?: "danger" | "muted";
  disabled?: boolean;
  size?: "sm" | "md";
}

const TONES = {
  danger: "text-red-400 hover:text-red-600",
  muted: "text-neutral-400 hover:text-neutral-700",
} as const;

const SIZES = {
  sm: "w-6 h-6 text-sm",
  md: "w-8 h-8 text-lg",
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
  size = "sm",
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`shrink-0 inline-flex items-center justify-center font-mono
                leading-none transition-colors cursor-pointer disabled:opacity-50
                disabled:cursor-not-allowed ${SIZES[size]} ${TONES[tone]}`}
    >
      {children}
    </button>
  );
}
