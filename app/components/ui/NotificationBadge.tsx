interface NotificationBadgeProps {
  count: number;
  className?: string;
}

/**
 * A corner-pinned unread indicator, like a mobile app icon badge. Renders
 * nothing at zero.
 */
export function NotificationBadge({ count, className = "" }: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      aria-hidden
      className={`absolute -top-1 -right-1 z-10 w-2.5 h-2.5 rounded-full bg-red-500
                  border-2 border-white ${className}`}
    />
  );
}
