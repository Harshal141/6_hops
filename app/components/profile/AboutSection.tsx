"use client";

import { Textarea } from "../ui";

interface Props {
  bio: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}

export function AboutSection({ bio, isEditing, onChange }: Props) {
  return (
    <section className="mb-8">
      <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">About</h2>
      {isEditing ? (
        <Textarea
          value={bio}
          onChange={onChange}
          rows={4}
          placeholder="Write something about yourself..."
          ariaLabel="Bio"
        />
      ) : bio ? (
        <p className="font-mono text-neutral-600 leading-relaxed">{bio}</p>
      ) : (
        <p className="font-mono text-neutral-300 italic">No bio added</p>
      )}
    </section>
  );
}
