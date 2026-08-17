interface TextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  error?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  ariaLabel?: string;
}

const SIZES = {
  sm: "text-xs px-2 py-1",
  md: "text-sm p-3",
} as const;

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  error,
  disabled = false,
  size = "md",
  ariaLabel,
}: TextareaProps) {
  const field = (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      disabled={disabled}
      aria-label={label ? undefined : ariaLabel}
      aria-invalid={error ? true : undefined}
      className={`font-mono text-neutral-700 placeholder:text-neutral-400 leading-relaxed w-full
                bg-neutral-50 border outline-none resize-none transition-colors focus:bg-white
                disabled:opacity-50 ${SIZES[size]}
                ${error ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-neutral-400"}`}
    />
  );

  if (!label && !error) return field;

  return (
    <label className="block">
      {label && <span className="block font-mono text-xs text-neutral-500 mb-2">{label}</span>}
      {field}
      {error && <span className="block font-mono text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}
