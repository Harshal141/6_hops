import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "hero" | "social";
type Size = "sm" | "md" | "lg";

export interface ButtonProps {
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
  /** Leading mark, e.g. a provider logo. Decorative: give it an empty alt. */
  icon?: React.ReactNode;
  /** Stretch to the container's width. */
  fullWidth?: boolean;
  /**
   * Looks like the button but is not one: no element to focus or click. For
   * illustrations of the UI, such as the landing page demos.
   */
  decorative?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-800",
  secondary: "bg-white text-neutral-600 border border-neutral-300 hover:border-neutral-800 hover:text-neutral-800",
  ghost: "bg-transparent text-neutral-500 border border-transparent hover:bg-neutral-100",
  danger: "bg-red-600 text-white border border-red-600 hover:bg-red-500",
  // the offset-border treatment used by the landing and login CTAs
  hero: "bg-neutral-800 text-white hover:bg-neutral-700",
  // Third-party sign-in ("Sign in with Google"). Not the app's look on purpose: these values
  // are Google's Sign in with Google spec (dark theme, Web), required for brand verification.
  // Fill #131314, 1px stroke #8E918F, text #E3E3E3, Google Sans Medium 14/20, 10px logo to
  // text, at least 12px each side. 52px tall (scaled up from 40, which the spec allows) to
  // match `hero lg`, so it carries the same weight as the button beside it.
  // See prds/google-oauth-identity-linking.md §5.6.1 before changing any of it.
  social:
    "bg-[#131314] text-[#E3E3E3] border border-[#8E918F] hover:bg-[#2A2A2C] h-13 px-4 gap-2.5 " +
    "text-sm leading-5 font-medium font-[family-name:var(--font-google-sans)] " +
    "inline-flex items-center justify-center",
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
  icon,
  fullWidth = false,
  decorative = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isSocial = variant === "social";

  const className = [
    // social carries its own font, box and layout (brand spec), so none of the shared ones apply
    isSocial ? "" : "font-mono inline-block",
    "transition-colors cursor-pointer relative",
    VARIANTS[variant],
    isSocial ? "" : SIZES[size],
    fullWidth ? "w-full text-center" : "",
    isDisabled ? "opacity-50 cursor-not-allowed" : "",
    variant === "hero" ? "group transition-all duration-200" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const label = icon ? (
    <>
      <span className="inline-flex shrink-0">{icon}</span>
      <span>{children}</span>
    </>
  ) : (
    children
  );

  const content =
    variant === "hero" ? (
      <>
        <span className="relative z-10">{label}</span>
        <div
          className="absolute inset-0 border border-neutral-800 translate-x-1 translate-y-1 -z-10
                   group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform"
        />
      </>
    ) : (
      label
    );

  if (decorative) {
    return (
      <span aria-hidden className={`${className} cursor-default`}>
        {content}
      </span>
    );
  }

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
      {/* A brand button keeps its logo and text while pending: the spec has no loading state. */}
      {loading && !isSocial ? "…" : content}
    </button>
  );
}
