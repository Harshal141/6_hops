interface ChipProps {
  label: string;
  /** Renders a remove affordance when provided. */
  onRemove?: () => void;
  variant?: "default" | "accent";
}

const VARIANTS = {
  default: "bg-neutral-100 text-neutral-600 border-neutral-200",
  accent: "bg-blue-50 text-blue-700 border-blue-200",
} as const;

/** A tag pill — skills, statuses. Square, like every other surface. */
export function Chip({ label, onRemove, variant = "default" }: ChipProps) {
  return (
    <span
      className={`font-mono text-xs px-3 py-1.5 border flex items-center gap-2 ${VARIANTS[variant]}`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="text-red-400 hover:text-red-600 cursor-pointer leading-none"
        >
          ×
        </button>
      )}
    </span>
  );
}
