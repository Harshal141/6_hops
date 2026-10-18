import { Avatar } from "../ui";

interface ProfileIdentityProps {
  name: string;
  /** The line under the name: where it came from, or the headline. */
  subline: React.ReactNode;
  icon?: string | null;
  /** Off for the compact phone summary, which has no room for it. */
  showAvatar?: boolean;
}

/** Name and one line under it, beside a decorative avatar: the name is read once. */
export function ProfileIdentity({ name, subline, icon = null, showAvatar = true }: ProfileIdentityProps) {
  const shown = name || "You";
  return (
    <div className="flex items-center gap-3 min-w-0">
      {showAvatar && <Avatar src={icon} name={shown} size="md" decorative />}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[13px] font-semibold text-fg truncate">{shown}</span>
        {subline}
      </div>
    </div>
  );
}
