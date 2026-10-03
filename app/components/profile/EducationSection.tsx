"use client";

import { Button } from "../ui";
import { EducationFields } from "./EducationFields";
import type { Education } from "@/lib/hooks/profile";
import { displayYear } from "@/lib/utils/educationYear";
import { PROFILE_TEXT } from "./profileText";

interface Props {
  education: Education[];
  isEditing: boolean;
  onAdd: () => void;
  onChange: (index: number, field: keyof Education, value: string) => void;
  onRemove: (index: number) => void;
}

export function EducationSection({ education, isEditing, onAdd, onChange, onRemove }: Props) {
  return (
    <section className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className={PROFILE_TEXT.sectionHeading}>Education</h2>
        {isEditing && (
          <Button variant="secondary" size="sm" onClick={onAdd}>
            + Add
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={edu.id ?? `new-${index}`}>
            {isEditing ? (
              <EducationFields
                value={edu}
                onChange={(field, value) => onChange(index, field, value)}
                onRemove={() => onRemove(index)}
              />
            ) : (
              <div className="flex items-baseline justify-between gap-3">
                {/* With no degree, the school is the title rather than a "No degree" placeholder. */}
                <div>
                  <h3 className={PROFILE_TEXT.itemTitle}>{edu.degree || edu.institution}</h3>
                  {edu.degree && <p className={PROFILE_TEXT.itemSubtitle}>{edu.institution}</p>}
                </div>
                <span className={`${PROFILE_TEXT.meta} shrink-0`}>{displayYear(edu.year)}</span>
              </div>
            )}
          </div>
        ))}
        {education.length === 0 && !isEditing && (
          <p className={PROFILE_TEXT.empty}>No education added</p>
        )}
      </div>
    </section>
  );
}
