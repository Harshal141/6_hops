"use client";

import { useProfileRow } from "@/lib/hooks/profileEditor";
import { PROFILE_LIMITS } from "@/lib/schemas/profile";
import { ExperienceFields } from "./ExperienceFields";
import { ListEditor } from "./ListEditor";

function ExperienceRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { value, errors, onChange } = useProfileRow("experience", index);
  return <ExperienceFields value={value} onChange={onChange} onRemove={onRemove} errors={errors} />;
}

export function ExperienceEditor() {
  return (
    <ListEditor
      title="Experience"
      name="experience"
      max={PROFILE_LIMITS.experience}
      blank={{ company: "", role: "", started_at: null, ended_at: null, currently_working: false, description: "" }}
      empty="No experience added"
      rowClassName="border-l-2 border-border pl-4"
      renderRow={(index, remove) => <ExperienceRow index={index} onRemove={remove} />}
    />
  );
}
