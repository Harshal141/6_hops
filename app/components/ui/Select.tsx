import { useId } from "react";

interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SelectOption<T>[];
  error?: string;
  disabled?: boolean;
  /** Same scale as Input: `sm` is the compact inline field inside profile sections. */
  size?: "sm" | "md";
  ariaLabel: string;
}

const SIZES = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-4 py-2",
} as const;

/** A native select styled like Input. Options are typed, so onChange only ever yields one of them. */
export function Select<T extends string>({
  value,
  onChange,
  options,
  error,
  disabled = false,
  size = "md",
  ariaLabel,
}: SelectProps<T>) {
  const errorId = useId();
  return (
    <span className="block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full font-mono text-neutral-700 bg-neutral-50 border outline-none transition-colors
                  focus:bg-white disabled:opacity-50 ${SIZES[size]}
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
                  ${error ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-neutral-400"}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={errorId} className="block font-mono text-xs text-red-500 mt-1">
          {error}
        </span>
      )}
    </span>
  );
}
