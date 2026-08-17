interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "url" | "date" | "number";
  maxLength?: number;
  error?: string;
  disabled?: boolean;
  /**
   * `sm` is the compact inline field used inside profile sections. `inherit`
   * sets padding only, letting the parent's type scale carry through — inputs
   * get `font: inherit` from preflight, so a wrapper's size and weight apply.
   */
  size?: "sm" | "md" | "inherit";
  /** Off when the parent sizes the field, e.g. a fixed-width year box. */
  fullWidth?: boolean;
  /** Rendered inside the field on the right — a search glyph or spinner. */
  adornment?: React.ReactNode;
  ariaLabel?: string;
}

const SIZES = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-4 py-2",
  inherit: "px-2 py-1",
} as const;

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  error,
  disabled = false,
  size = "md",
  fullWidth = true,
  adornment,
  ariaLabel,
}: InputProps) {
  const field = (
    <span className="relative block">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        aria-label={label ? undefined : ariaLabel}
        aria-invalid={error ? true : undefined}
        className={`font-mono text-neutral-700 placeholder:text-neutral-400 bg-neutral-50
                  border outline-none transition-colors focus:bg-white disabled:opacity-50
                  ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${adornment ? "pr-10" : ""}
                  ${error ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-neutral-400"}`}
      />
      {adornment && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
          {adornment}
        </span>
      )}
    </span>
  );

  if (!label && !error) return field;

  return (
    <label className={`block ${fullWidth ? "" : "w-auto"}`}>
      {label && <span className="block font-mono text-xs text-neutral-500 mb-2">{label}</span>}
      {field}
      {error && <span className="block font-mono text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}
