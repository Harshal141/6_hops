"use client";

import { Checkbox, Chip } from "../ui";
import { ExperienceFields, type ExperienceField } from "../profile/ExperienceFields";
import { EducationFields, type EducationField } from "../profile/EducationFields";
import { ReviewAboutSection } from "./ReviewAboutSection";
import { ReviewListSection } from "./ReviewListSection";
import { ReviewSection } from "./ReviewSection";
import {
  isSelected,
  setSelected,
  type ReviewIssue,
  type ReviewSection as Section,
  type ReviewState,
} from "@/lib/utils/resumeImportDraft";
import type { DraftLinkType } from "@/lib/hooks/resumeImport";

const ISSUE_COPY: Record<ReviewIssue["field"], string> = {
  company: "Add a company or untick this one",
  role: "Add a role or untick this one",
  institution: "Add a school or untick this one",
  started_at: "Use a year like 2021 or a month like 2021-03",
  ended_at: "Use a year like 2021 or a month like 2021-03",
  year: "Use a year like 2020 or a range like 2018-2022",
};

const LINK_NAMES: Record<DraftLinkType, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  twitter: "Twitter",
  portfolio: "Portfolio",
  other: "Other",
};

interface Props {
  state: ReviewState;
  onChange: (state: ReviewState) => void;
  /** Field problems on ticked items, highlighted inline. */
  issues: ReviewIssue[];
  disabled?: boolean;
}

/** The review step: every extracted item, tickable and editable before anything is saved. */
export function ImportReview({ state, onChange, issues, disabled = false }: Props) {
  const toggle = (section: Section) => (key: string, checked: boolean) =>
    onChange(setSelected(state, section, key, checked));

  const errorsFor = (key: string) =>
    Object.fromEntries(issues.filter((issue) => issue.key === key).map((issue) => [issue.field, ISSUE_COPY[issue.field]]));

  const updateExperience = (key: string, field: ExperienceField, value: string | boolean | null) =>
    onChange({
      ...state,
      experience: state.experience.map((exp) =>
        exp.key === key ? { ...exp, [field]: field === "description" ? (value ?? "") : value } : exp,
      ),
    });

  const updateEducation = (key: string, field: EducationField, value: string) =>
    onChange({ ...state, education: state.education.map((edu) => (edu.key === key ? { ...edu, [field]: value } : edu)) });

  return (
    <div className="space-y-6 font-mono">
      <p className="text-xs text-fg-muted">Untick anything that&apos;s wrong. You can edit it all later.</p>

      <ReviewAboutSection state={state} onChange={onChange} disabled={disabled} />

      <ReviewListSection
        title="Experience"
        items={state.experience}
        selected={state.selected.experience}
        onToggle={toggle("experience")}
        label={(exp) => [exp.role || "Untitled role", exp.company].filter(Boolean).join(" at ")}
        disabled={disabled}
        renderFields={(exp) => (
          <ExperienceFields
            value={exp}
            onChange={(field, value) => updateExperience(exp.key, field, value)}
            dateInput="partial"
            errors={errorsFor(exp.key)}
            disabled={disabled}
          />
        )}
      />

      <ReviewListSection
        title="Education"
        items={state.education}
        selected={state.selected.education}
        onToggle={toggle("education")}
        label={(edu) => [edu.degree, edu.institution].filter(Boolean).join(" at ") || "Untitled school"}
        disabled={disabled}
        renderFields={(edu) => (
          <EducationFields
            value={edu}
            onChange={(field, value) => updateEducation(edu.key, field, value)}
            errors={errorsFor(edu.key)}
            disabled={disabled}
          />
        )}
      />

      {(state.skills.length > 0 || state.unmatchedSkills.length > 0) && (
        <ReviewSection title="Skills">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {state.skills.map((skill) => (
              <Checkbox
                key={skill.key}
                label={skill.name}
                checked={isSelected(state, "skills", skill.key)}
                onChange={(checked) => toggle("skills")(skill.key, checked)}
                disabled={disabled}
              />
            ))}
          </div>
          {state.unmatchedSkills.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-fg-subtle">Not in our skill list yet. Add them later from your profile.</p>
              <div className="flex flex-wrap gap-2">
                {state.unmatchedSkills.map((name) => (
                  <Chip key={name} label={name} variant="muted" />
                ))}
              </div>
            </div>
          )}
        </ReviewSection>
      )}

      <ReviewListSection
        title="Links"
        items={state.links}
        selected={state.selected.links}
        onToggle={toggle("links")}
        label={(link) => `${LINK_NAMES[link.type]}: ${link.url}`}
        disabled={disabled}
      />
    </div>
  );
}
