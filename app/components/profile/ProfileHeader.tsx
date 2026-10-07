import { Avatar } from "../ui";
import type { Profile } from "@/lib/hooks/profile";
import { PROFILE_TEXT } from "./profileText";

interface Props {
  profile: Profile;
  /** Replaces the name/title/location text, e.g. with the editor's fields. */
  children?: React.ReactNode;
}

export function ProfileHeader({ profile, children }: Props) {
  return (
    <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-neutral-200">
      <Avatar src={profile.icon} name={profile.name} size="xl" />

      <div className="flex-1 min-w-0">
        {children ?? (
          <>
            <h1 className="font-mono font-bold text-xl sm:text-2xl text-fg">{profile.name}</h1>
            <p className="font-mono text-sm sm:text-base text-fg-muted mt-1">{profile.title}</p>
            {/* email is only returned to the profile's owner, so it is absent when
                viewing someone else — don't render a dangling separator */}
            <p className={`${PROFILE_TEXT.meta} mt-2`}>
              {[profile.location, profile.email].filter(Boolean).join(" · ")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
