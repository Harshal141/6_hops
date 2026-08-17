interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Ring colour for emphasis — used by the connection-path view. */
  tone?: "default" | "self" | "target";
}

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-24 h-24 text-4xl",
} as const;

const TONES = {
  default: "border-transparent",
  self: "border-neutral-800",
  target: "border-blue-300",
} as const;

/** Avatar with the initials fallback used everywhere an icon may be null. */
export function Avatar({ src, name, size = "md", tone = "default" }: AvatarProps) {
  return (
    <div
      className={`${SIZES[size]} ${TONES[tone]} shrink-0 overflow-hidden rounded-full border-2
                 bg-neutral-200 flex items-center justify-center font-mono text-neutral-600`}
    >
      {src ? (
        // avatars come from arbitrary provider hosts (LinkedIn, Google, seeded
        // fixtures), each of which next/image would need whitelisted in config
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        (name?.charAt(0).toUpperCase() ?? "?")
      )}
    </div>
  );
}
