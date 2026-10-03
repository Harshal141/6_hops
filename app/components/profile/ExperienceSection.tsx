"use client";

import { Button } from "../ui";
import { ExperienceFields } from "./ExperienceFields";
import type { Experience } from "@/lib/hooks/profile";
import { PROFILE_TEXT } from "./profileText";

interface Props {
  experience: Experience[];
  isEditing: boolean;
  onAdd: () => void;
  onChange: (index: number, field: keyof Experience, value: string | boolean | null) => void;
  onRemove: (index: number) => void;
}

export function ExperienceSection({ experience, isEditing, onAdd, onChange, onRemove }: Props) {
  return (
    <section className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className={PROFILE_TEXT.sectionHeading}>Experience</h2>
        {isEditing && (
          <Button variant="secondary" size="sm" onClick={onAdd}>
            + Add
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {experience.map((exp, index) => (
          <div key={exp.id ?? `new-${index}`} className="border-l-2 border-border pl-4">
            {isEditing ? (
              <ExperienceFields
                value={exp}
                onChange={(field, value) => onChange(index, field, value)}
                onRemove={() => onRemove(index)}
              />
            ) : (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className={PROFILE_TEXT.itemTitle}>
                    {exp.role || <span className="text-fg-placeholder italic">No role</span>}
                  </h3>
                  <span className={`${PROFILE_TEXT.meta} shrink-0`}>
                    {exp.started_at ? new Date(exp.started_at).getFullYear() : ""}
                    {exp.started_at ? " – " : ""}
                    {exp.currently_working ? "present" : exp.ended_at ? new Date(exp.ended_at).getFullYear() : ""}
                  </span>
                </div>
                <p className={PROFILE_TEXT.itemSubtitle}>{exp.company}</p>
                {exp.description && <p className={`${PROFILE_TEXT.body} mt-1`}>{exp.description}</p>}
              </>
            )}
          </div>
        ))}
        {experience.length === 0 && !isEditing && (
          <p className={PROFILE_TEXT.empty}>No experience added</p>
        )}
      </div>
    </section>
  );
}
