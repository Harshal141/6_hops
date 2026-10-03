"use client";

import { Checkbox, FieldLabel, IconButton, Input, Textarea } from "../ui";
import type { Experience } from "@/lib/hooks/profile";

export type ExperienceField =
  | "company"
  | "role"
  | "started_at"
  | "ended_at"
  | "currently_working"
  | "description";

interface Props {
  value: Pick<Experience, ExperienceField>;
  onChange: (field: ExperienceField, value: string | boolean | null) => void;
  /** Shows the × remove control when provided. */
  onRemove?: () => void;
  /**
   * `date` is a full date picker (the profile editor). `partial` is a text field
   * taking `YYYY` or `YYYY-MM`, for values only as precise as their source.
   */
  dateInput?: "date" | "partial";
  errors?: Partial<Record<ExperienceField, string>>;
  disabled?: boolean;
}

/** One experience entry's editable fields. Shared by the profile editor and the resume-import review. */
export function ExperienceFields({ value, onChange, onRemove, dateInput = "date", errors = {}, disabled = false }: Props) {
  const dateField = (field: "started_at" | "ended_at", label: string, ariaLabel: string) => (
    <FieldLabel label={label}>
      {dateInput === "date" ? (
        <Input
          type="date"
          size="sm"
          fullWidth={false}
          value={value[field] ?? ""}
          onChange={(next) => onChange(field, next || null)}
          ariaLabel={ariaLabel}
          error={errors[field]}
          disabled={disabled}
        />
      ) : (
        <span className="w-28">
          <Input
            size="sm"
            value={value[field] ?? ""}
            onChange={(next) => onChange(field, next || null)}
            placeholder="YYYY-MM"
            maxLength={7}
            ariaLabel={`${ariaLabel} (year, or year and month)`}
            error={errors[field]}
            disabled={disabled}
          />
        </span>
      )}
    </FieldLabel>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* preflight gives inputs `font: inherit`, so this weight reaches the field */}
        <div className="flex-1 font-semibold">
          <Input
            value={value.role}
            onChange={(next) => onChange("role", next)}
            placeholder="Role"
            ariaLabel="Role"
            error={errors.role}
            disabled={disabled}
          />
        </div>
        {onRemove && (
          <IconButton ariaLabel={`Remove ${value.role || "experience"}`} tone="danger" onClick={onRemove}>
            ×
          </IconButton>
        )}
      </div>

      <Input
        value={value.company}
        onChange={(next) => onChange("company", next)}
        placeholder="Company"
        ariaLabel="Company"
        error={errors.company}
        disabled={disabled}
      />

      <div className="flex items-end gap-3 flex-wrap">
        {dateField("started_at", "Start", "Start date")}
        {!value.currently_working && dateField("ended_at", "End", "End date")}
        <Checkbox
          label="Currently working"
          checked={value.currently_working}
          onChange={(checked) => onChange("currently_working", checked)}
          disabled={disabled}
        />
      </div>

      <Textarea
        size="sm"
        rows={2}
        value={value.description}
        onChange={(next) => onChange("description", next)}
        placeholder="Description"
        ariaLabel="Description"
        disabled={disabled}
      />
    </div>
  );
}
