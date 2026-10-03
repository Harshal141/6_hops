"use client";

import { Checkbox, FieldLabel, IconButton, Input } from "../ui";
import type { Education } from "@/lib/hooks/profile";
import { combineYear, parseYear } from "@/lib/utils/educationYear";

export type EducationField = "institution" | "degree" | "year";

interface Props {
  value: Pick<Education, EducationField>;
  onChange: (field: EducationField, value: string) => void;
  /** Shows the × remove control when provided. */
  onRemove?: () => void;
  errors?: Partial<Record<EducationField, string>>;
  disabled?: boolean;
}

/** One education entry's editable fields. Shared by the profile editor and the resume-import review. */
export function EducationFields({ value, onChange, onRemove, errors = {}, disabled = false }: Props) {
  const { start, end, current } = parseYear(value.year);

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          <div className="font-semibold">
            <Input
              value={value.degree}
              onChange={(next) => onChange("degree", next)}
              placeholder="Degree"
              ariaLabel="Degree"
              error={errors.degree}
              disabled={disabled}
            />
          </div>
          <Input
            value={value.institution}
            onChange={(next) => onChange("institution", next)}
            placeholder="Institution"
            ariaLabel="Institution"
            error={errors.institution}
            disabled={disabled}
          />
        </div>
        {onRemove && (
          <div className="mt-1">
            <IconButton ariaLabel={`Remove ${value.degree || "education"}`} tone="danger" onClick={onRemove}>
              ×
            </IconButton>
          </div>
        )}
      </div>
      <div className="flex items-end gap-3 flex-wrap">
        <FieldLabel label="Start year">
          <Input
            size="sm"
            fullWidth={false}
            value={start}
            onChange={(next) => onChange("year", combineYear(next, end, current))}
            placeholder="2020"
            maxLength={4}
            ariaLabel="Start year"
            error={errors.year}
            disabled={disabled}
          />
        </FieldLabel>
        {!current && (
          <FieldLabel label="End year">
            <Input
              size="sm"
              fullWidth={false}
              value={end}
              onChange={(next) => onChange("year", combineYear(start, next, current))}
              placeholder="2024"
              maxLength={4}
              ariaLabel="End year"
              disabled={disabled}
            />
          </FieldLabel>
        )}
        <Checkbox
          label="Currently studying"
          checked={current}
          onChange={(checked) => onChange("year", combineYear(start, end, checked))}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
