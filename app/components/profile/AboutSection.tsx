import { ProfileSection } from "./ProfileSection";
import { PROFILE_TEXT } from "./profileText";

export function AboutSection({ bio }: { bio: string }) {
  return (
    <ProfileSection title="About">
      {bio ? <p className={PROFILE_TEXT.body}>{bio}</p> : <p className={PROFILE_TEXT.empty}>No bio added</p>}
    </ProfileSection>
  );
}
