"use client";

import { Button, Checkbox, IconButton, Input, Textarea } from "../ui";
import type { Experience } from "@/lib/hooks/profile";

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
        <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">Experience</h2>
        {isEditing && (
          <Button variant="secondary" size="sm" onClick={onAdd}>
            + add
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {experience.map((exp, index) => (
          <div key={exp.id ?? `new-${index}`} className="border-l-2 border-neutral-200 pl-4">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {/* Tailwind's preflight sets `font: inherit` on inputs, so the
                      wrapper's weight carries into the field */}
                  <div className="flex-1 font-semibold">
                    <Input
                      value={exp.role}
                      onChange={(value) => onChange(index, "role", value)}
                      placeholder="Role"
                      ariaLabel="Role"
                    />
                  </div>
                  <IconButton
                    ariaLabel={`Remove ${exp.role || "experience"}`}
                    tone="danger"
                    onClick={() => onRemove(index)}
                  >
                    ×
                  </IconButton>
                </div>

                <Input
                  value={exp.company}
                  onChange={(value) => onChange(index, "company", value)}
                  placeholder="Company"
                  ariaLabel="Company"
                />

                <div className="flex items-end gap-3 flex-wrap">
                  <label className="flex flex-col gap-0.5">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Start</span>
                    <Input
                      type="date"
                      size="sm"
                      fullWidth={false}
                      value={exp.started_at ?? ""}
                      onChange={(value) => onChange(index, "started_at", value || null)}
                      ariaLabel="Start date"
                    />
                  </label>

                  {!exp.currently_working && (
                    <label className="flex flex-col gap-0.5">
                      <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">End</span>
                      <Input
                        type="date"
                        size="sm"
                        fullWidth={false}
                        value={exp.ended_at ?? ""}
                        onChange={(value) => onChange(index, "ended_at", value || null)}
                        ariaLabel="End date"
                      />
                    </label>
                  )}

                  <Checkbox
                    label="currently working"
                    checked={exp.currently_working}
                    onChange={(checked) => onChange(index, "currently_working", checked)}
                  />
                </div>

                <Textarea
                  size="sm"
                  rows={2}
                  value={exp.description}
                  onChange={(value) => onChange(index, "description", value)}
                  placeholder="Description"
                  ariaLabel="Description"
                />
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-mono font-semibold text-neutral-800">
                    {exp.role || <span className="text-neutral-300 italic">No role</span>}
                  </h3>
                  <span className="font-mono text-xs text-neutral-400">
                    {exp.started_at ? new Date(exp.started_at).getFullYear() : ""}
                    {exp.started_at ? " – " : ""}
                    {exp.currently_working ? "present" : exp.ended_at ? new Date(exp.ended_at).getFullYear() : ""}
                  </span>
                </div>
                <p className="font-mono text-sm text-neutral-500">{exp.company}</p>
                <p className="font-mono text-sm text-neutral-600 mt-1">{exp.description}</p>
              </>
            )}
          </div>
        ))}
        {experience.length === 0 && !isEditing && (
          <p className="font-mono text-neutral-300 italic">No experience added</p>
        )}
      </div>
    </section>
  );
}
