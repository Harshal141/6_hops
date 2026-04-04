"use client";

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
        <textarea
          value={bio}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="Write something about yourself..."
          className="font-mono text-neutral-700 placeholder:text-neutral-400 leading-relaxed w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none p-3 resize-none rounded"
        />
      ) : bio ? (
        <p className="font-mono text-neutral-600 leading-relaxed">{bio}</p>
      ) : (
        <p className="font-mono text-neutral-300 italic">No bio added</p>
      )}
    </section>
  );
}
