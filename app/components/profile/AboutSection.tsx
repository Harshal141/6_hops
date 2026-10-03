"use client";

import { Textarea } from "../ui";
import { PROFILE_TEXT } from "./profileText";

interface Props {
  bio: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}

export function AboutSection({ bio, isEditing, onChange }: Props) {
  return (
    <section className="mb-6 sm:mb-8">
      <h2 className={`${PROFILE_TEXT.sectionHeading} mb-3`}>About</h2>
      {isEditing ? (
        <Textarea
          value={bio}
          onChange={onChange}
          rows={4}
          placeholder="Write something about yourself..."
          ariaLabel="Bio"
        />
      ) : bio ? (
        <p className={PROFILE_TEXT.body}>{bio}</p>
      ) : (
        <p className={PROFILE_TEXT.empty}>No bio added</p>
      )}
    </section>
  );
}
