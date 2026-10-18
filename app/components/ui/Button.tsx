import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "hero" | "social" | "accent" | "link" | "plain";
/** `tile` is a square-ish share/action tile: icon over label on mobile, side by side from `sm`. */
type Size = "sm" | "md" | "lg" | "tile";

export interface ButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  /** Internal paths render a Next `Link`; anything else (https:, mailto:) a plain anchor. */
  href?: string;
  /** Opens `href` in a new tab, with `rel="noopener noreferrer"`. */
  external?: boolean;
  type?: "button" | "submit" | "reset";
  /** Accessible name when the visible label is not descriptive on its own. */
  ariaLabel?: string;
  /** Leading mark, e.g. a provider logo. Decorative: give it an empty alt. */
  icon?: React.ReactNode;
  /** Stretch to the container's width. `mobile` stretches only below the `sm` breakpoint. */
  fullWidth?: boolean | "mobile";
  /**
   * Looks like the button but is not one: no element to focus or click. For
   * illustrations of the UI, such as the landing page demos.
   */
  decorative?: boolean;
  /**
   * Renders the button's box as plain, readable text: same size and baseline, nothing to
   * focus or click. For a state that replaces a button in place ("✓ Request sent"), so the
   * row doesn't shift when it swaps in. Use with `variant="plain"`.
   */
  asText?: boolean;
  /** The rendered <button>, e.g. for a modal to return focus to. */
  buttonRef?: React.Ref<HTMLButtonElement>;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-800",
  secondary: "bg-white text-neutral-600 border border-neutral-300 hover:border-neutral-800 hover:text-neutral-800",
  ghost: "bg-transparent text-neutral-500 border border-transparent hover:bg-neutral-100",
  danger: "bg-red-600 text-white border border-red-600 hover:bg-red-500",
  // the offset-border treatment used by the landing and login CTAs
  hero: "bg-neutral-800 text-white hover:bg-neutral-700",
  // the brand purple (globals.css --color-accent), e.g. a confirmed "Copied" state. The fill
  // stays exactly the token on hover (one purple everywhere); hover darkens the edge instead.
  accent: "bg-accent text-white border border-accent hover:border-fg",
  // reads as a text link but keeps a full-height tap target: "Skip this step", "Back"
  link: "bg-transparent text-neutral-600 hover:text-neutral-900 border border-transparent underline-offset-2 hover:underline",
  // no surface at all, for `asText`: the box of a button with only its label showing
  plain: "bg-transparent text-fg-body border border-transparent whitespace-nowrap",
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
  tile:
    "h-[72px] sm:h-[50px] px-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2.5 " +
    "text-[11px] sm:text-[13px]",
};

// Link-styled buttons keep their padding vertical only, so the text lines up with the copy
// around it while the tap target stays at least 40px tall.
const LINK_SIZES: Record<Size, string> = {
  sm: "py-2.5 text-xs",
  md: "py-3 text-xs sm:text-[13px]",
  lg: "py-3 text-sm",
  tile: "py-3 text-xs sm:text-[13px]",
};

const FULL_WIDTH = {
  true: "w-full text-center",
  mobile: "w-full sm:w-auto text-center",
  false: "",
} as const;

export function Button({
  children,
  variant = "hero",
  size = variant === "hero" ? "lg" : "md",
  disabled = false,
  loading = false,
  onClick,
  href,
  external = false,
  type,
  ariaLabel,
  icon,
  fullWidth = false,
  decorative = false,
  asText = false,
  buttonRef,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isSocial = variant === "social";
  // social (brand spec) and tile carry their own box and layout, so the inline-block base doesn't apply
  const ownsLayout = isSocial || size === "tile";
  const sizeClass = isSocial ? "" : variant === "link" ? LINK_SIZES[size] : SIZES[size];

  const className = [
    isSocial ? "" : "font-mono",
    ownsLayout ? "" : "inline-block",
    "transition-colors relative",
    asText || decorative ? "cursor-default" : "cursor-pointer",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    VARIANTS[variant],
    sizeClass,
    FULL_WIDTH[`${fullWidth}`],
    isDisabled ? "opacity-50 cursor-not-allowed" : "",
    variant === "hero" ? "group transition-all duration-200" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const iconAndText = (
    <>
      <span className="inline-flex shrink-0">{icon}</span>
      <span>{children}</span>
    </>
  );
  // Outside a layout-owning box, the icon and text need their own row to sit side by side.
  const label = !icon ? (
    children
  ) : ownsLayout ? (
    iconAndText
  ) : (
    <span className="inline-flex items-center justify-center gap-2">{iconAndText}</span>
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

  if (asText) {
    return <span className={className}>{content}</span>;
  }

  if (decorative) {
    return (
      <span aria-hidden className={className}>
        {content}
      </span>
    );
  }

  if (href && !isDisabled) {
    const newTab = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
    if (!href.startsWith("/")) {
      return (
        <a href={href} className={className} aria-label={ariaLabel} onClick={onClick} {...newTab}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={className} aria-label={ariaLabel} onClick={onClick} {...newTab}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={buttonRef}
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
