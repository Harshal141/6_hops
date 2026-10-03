"use client";

import { useState } from "react";

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
  lg: "w-10 h-10 text-sm sm:w-14 sm:h-14 sm:text-lg",
  xl: "w-16 h-16 text-2xl sm:w-24 sm:h-24 sm:text-4xl",
} as const;

const TONES = {
  default: "border-transparent",
  self: "border-neutral-800",
  target: "border-blue-300",
} as const;

/**
 * Avatar with the initials fallback used everywhere an icon may be null. Also falls
 * back when the image fails to load (an expired provider URL), instead of showing the
 * browser's broken-image icon with the alt text spilling over the circle.
 */
export function Avatar({ src, name, size = "md", tone = "default" }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const image = src && src !== failedSrc ? src : null;

  return (
    <div
      className={`${SIZES[size]} ${TONES[tone]} shrink-0 overflow-hidden rounded-full border-2
                 bg-neutral-200 flex items-center justify-center font-mono text-neutral-600`}
    >
      {image ? (
        // avatars come from arbitrary provider hosts (LinkedIn, Google, seeded
        // fixtures), each of which next/image would need whitelisted in config
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="w-full h-full object-cover" onError={() => setFailedSrc(image)} />
      ) : (
        (name?.charAt(0).toUpperCase() ?? "?")
      )}
    </div>
  );
}
