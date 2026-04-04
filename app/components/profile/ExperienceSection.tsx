"use client";

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
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">Experience</h2>
        {isEditing && (
          <button onClick={onAdd} className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded cursor-pointer">
            + add
          </button>
        )}
      </div>

      <div className="space-y-4">
        {experience.map((exp, index) => (
          <div key={exp.id ?? `new-${index}`} className="border-l-2 border-neutral-200 pl-4">
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => onChange(index, "role", e.target.value)}
                    placeholder="Role"
                    className="font-mono font-semibold text-neutral-800 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 flex-1 rounded"
                  />
                  <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600 text-sm px-2 cursor-pointer">×</button>
                </div>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => onChange(index, "company", e.target.value)}
                  placeholder="Company"
                  className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex flex-col gap-0.5">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Start</span>
                    <input
                      type="date"
                      value={exp.started_at ?? ""}
                      onChange={(e) => onChange(index, "started_at", e.target.value || null)}
                      className="font-mono text-xs text-neutral-700 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 rounded cursor-pointer"
                    />
                  </label>
                  {!exp.currently_working && (
                    <label className="flex flex-col gap-0.5">
                      <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">End</span>
                      <input
                        type="date"
                        value={exp.ended_at ?? ""}
                        onChange={(e) => onChange(index, "ended_at", e.target.value || null)}
                        className="font-mono text-xs text-neutral-700 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 rounded cursor-pointer"
                      />
                    </label>
                  )}
                  <label className="flex items-center gap-1.5 font-mono text-xs text-neutral-700 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={exp.currently_working}
                      onChange={(e) => onChange(index, "currently_working", e.target.checked)}
                      className="cursor-pointer"
                    />
                    currently working
                  </label>
                </div>
                <textarea
                  value={exp.description}
                  onChange={(e) => onChange(index, "description", e.target.value)}
                  placeholder="Description"
                  rows={2}
                  className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 resize-none rounded"
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
