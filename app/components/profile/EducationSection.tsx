"use client";

import { Button, Checkbox, IconButton, Input } from "../ui";

import type { Education } from "@/lib/hooks/profile";

// Parse stored year string into parts
// "2021-2024" → { start: "2021", end: "2024", current: false }
// "2021-"     → { start: "2021", end: "",     current: true  }
// "2021"      → { start: "2021", end: "",     current: false }
// ""          → { start: "",     end: "",     current: false }
function parseYear(year: string): { start: string; end: string; current: boolean } {
  if (!year) return { start: "", end: "", current: false };
  if (year.includes("-")) {
    const [start, end] = year.split("-");
    return { start: start ?? "", end: end ?? "", current: end === "" };
  }
  return { start: year, end: "", current: false };
}

function combineYear(start: string, end: string, current: boolean): string {
  if (!start) return "";
  if (current) return `${start}-`;
  if (end) return `${start}-${end}`;
  return start;
}

function displayYear(year: string): string {
  const { start, end, current } = parseYear(year);
  if (!start) return "";
  if (current) return `${start} – present`;
  if (end) return `${start} – ${end}`;
  return start;
}

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
        <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">Education</h2>
        {isEditing && (
          <Button variant="secondary" size="sm" onClick={onAdd}>
            + add
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {education.map((edu, index) => {
          const { start, end, current } = parseYear(edu.year);
          return (
            <div key={edu.id ?? `new-${index}`}>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      {/* preflight gives inputs `font: inherit`, so the wrapper's
                          weight carries into the field */}
                      <div className="font-semibold">
                        <Input
                          value={edu.degree}
                          onChange={(value) => onChange(index, "degree", value)}
                          placeholder="Degree"
                          ariaLabel="Degree"
                        />
                      </div>
                      <Input
                        value={edu.institution}
                        onChange={(value) => onChange(index, "institution", value)}
                        placeholder="Institution"
                        ariaLabel="Institution"
                      />
                    </div>
                    <div className="mt-1">
                      <IconButton
                        ariaLabel={`Remove ${edu.degree || "education"}`}
                        tone="danger"
                        onClick={() => onRemove(index)}
                      >
                        ×
                      </IconButton>
                    </div>
                  </div>
                  <div className="flex items-end gap-3 flex-wrap">
                    <label className="flex flex-col gap-0.5">
                      <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Start year</span>
                      <div className="w-20">
                        <Input
                          size="sm"
                          value={start}
                          onChange={(value) => onChange(index, "year", combineYear(value, end, current))}
                          placeholder="2020"
                          maxLength={4}
                          ariaLabel="Start year"
                        />
                      </div>
                    </label>
                    {!current && (
                      <label className="flex flex-col gap-0.5">
                        <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">End year</span>
                        <div className="w-20">
                          <Input
                            size="sm"
                            value={end}
                            onChange={(value) => onChange(index, "year", combineYear(start, value, current))}
                            placeholder="2024"
                            maxLength={4}
                            ariaLabel="End year"
                          />
                        </div>
                      </label>
                    )}
                    <Checkbox
                      label="currently studying"
                      checked={current}
                      onChange={(checked) => onChange(index, "year", combineYear(start, end, checked))}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="font-mono font-semibold text-neutral-800">
                      {edu.degree || <span className="text-neutral-300 italic">No degree</span>}
                    </h3>
                    <p className="font-mono text-sm text-neutral-500">{edu.institution}</p>
                  </div>
                  <span className="font-mono text-xs text-neutral-400">{displayYear(edu.year)}</span>
                </div>
              )}
            </div>
          );
        })}
        {education.length === 0 && !isEditing && (
          <p className="font-mono text-neutral-300 italic">No education added</p>
        )}
      </div>
    </section>
  );
}
