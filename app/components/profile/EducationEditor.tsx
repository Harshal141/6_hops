"use client";

import { useProfileRow } from "@/lib/hooks/profileEditor";
import { PROFILE_LIMITS } from "@/lib/schemas/profile";
import { EducationFields } from "./EducationFields";
import { ListEditor } from "./ListEditor";

function EducationRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { value, errors, onChange } = useProfileRow("education", index);
  return <EducationFields value={value} onChange={onChange} onRemove={onRemove} errors={errors} />;
}

export function EducationEditor() {
  return (
    <ListEditor
      title="Education"
      name="education"
      max={PROFILE_LIMITS.education}
      blank={{ institution: "", degree: "", year: "" }}
      empty="No education added"
      renderRow={(index, remove) => <EducationRow index={index} onRemove={remove} />}
    />
  );
}
