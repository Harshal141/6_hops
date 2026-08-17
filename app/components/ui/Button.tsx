import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "hero";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit" | "reset";
  /** Accessible name when the visible label is not descriptive on its own. */
  ariaLabel?: string;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-800",
  secondary: "bg-white text-neutral-600 border border-neutral-300 hover:border-neutral-800 hover:text-neutral-800",
  ghost: "bg-transparent text-neutral-500 border border-transparent hover:bg-neutral-100",
  danger: "bg-red-600 text-white border border-red-600 hover:bg-red-500",
  // the offset-border treatment used by the landing and login CTAs
  hero: "bg-neutral-800 text-white hover:bg-neutral-700",
};

const SIZES: Record<Size, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-xs",
  lg: "px-8 py-4 text-sm tracking-wide",
};

export function Button({
  children,
  variant = "hero",
  size = variant === "hero" ? "lg" : "md",
  disabled = false,
  loading = false,
  onClick,
  href,
  type,
  ariaLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const className = [
    "font-mono transition-colors cursor-pointer inline-block relative",
    VARIANTS[variant],
    SIZES[size],
    isDisabled ? "opacity-50 cursor-not-allowed" : "",
    variant === "hero" ? "group transition-all duration-200" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const content =
    variant === "hero" ? (
      <>
        <span className="relative z-10">{children}</span>
        <div
          className="absolute inset-0 border border-neutral-800 translate-x-1 translate-y-1 -z-10
                   group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform"
        />
      </>
    ) : (
      children
    );

  if (href && !isDisabled) {
    return (
      <Link href={href} className={className} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={className}
    >
      {loading ? "…" : content}
    </button>
  );
}
