import { NotificationBadge } from "./NotificationBadge";

interface StatTileProps {
  label: string;
  count: number;
  /** Tailwind background class for the leading dot, e.g. "bg-green-500". */
  dot?: string;
  /** Renders as a toggle when provided; a static row otherwise. */
  onClick?: () => void;
  isActive?: boolean;
  ariaLabel?: string;
  /** Unread count shown as a corner notification badge, on top of the count. Omitted or 0 shows nothing. */
  badge?: number;
}

/**
 * A labelled count row — a static stat inside the profile card, or a selectable
 * tile beneath it, so the two read as one system.
 *
 * Square corners and the offset border are the house style: the app has no
 * rounded surfaces anywhere else, and the offset border is the same treatment the
 * landing and login CTAs use.
 */
export function StatTile({
  label,
  count,
  dot,
  onClick,
  isActive = false,
  ariaLabel,
  badge = 0,
}: StatTileProps) {
  const body = (
    <>
      <span className="flex items-center gap-2">
        {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
        {label}
      </span>
      <span className="font-semibold">{count}</span>
    </>
  );

  const shared = "relative w-full flex items-center justify-between text-xs font-mono px-2 py-2";

  if (!onClick) {
    return (
      <div className={`${shared} bg-neutral-50 border border-neutral-200 text-neutral-500`}>
        {body}
        <NotificationBadge count={badge} />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={ariaLabel}
      className={`${shared} group border transition-all cursor-pointer ${
        isActive
          ? "bg-neutral-800 text-white border-neutral-800"
          : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-800 hover:text-neutral-900"
      }`}
    >
      {body}
      <NotificationBadge count={badge} />
      {/* offset border reads as a shadow, and lifts on hover like the CTA buttons */}
      {!isActive && (
        <span
          aria-hidden
          className="absolute inset-0 border border-neutral-300 translate-x-1 translate-y-1 -z-10
                   group-hover:translate-x-0.5 group-hover:translate-y-0.5
                   group-hover:border-neutral-800 transition-transform"
        />
      )}
    </button>
  );
}
