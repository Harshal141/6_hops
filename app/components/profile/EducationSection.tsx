"use client";

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
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">Education</h2>
        {isEditing && (
          <button onClick={onAdd} className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded cursor-pointer">
            + add
          </button>
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
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => onChange(index, "degree", e.target.value)}
                        placeholder="Degree"
                        className="font-mono font-semibold text-neutral-800 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded"
                      />
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => onChange(index, "institution", e.target.value)}
                        placeholder="Institution"
                        className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded"
                      />
                    </div>
                    <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600 text-sm px-2 mt-1 cursor-pointer">×</button>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="flex flex-col gap-0.5">
                      <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Start year</span>
                      <input
                        type="text"
                        value={start}
                        onChange={(e) => onChange(index, "year", combineYear(e.target.value, end, current))}
                        placeholder="2020"
                        maxLength={4}
                        className="font-mono text-xs text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-20 px-2 py-1 rounded"
                      />
                    </label>
                    {!current && (
                      <label className="flex flex-col gap-0.5">
                        <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">End year</span>
                        <input
                          type="text"
                          value={end}
                          onChange={(e) => onChange(index, "year", combineYear(start, e.target.value, current))}
                          placeholder="2024"
                          maxLength={4}
                          className="font-mono text-xs text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-20 px-2 py-1 rounded"
                        />
                      </label>
                    )}
                    <label className="flex items-center gap-1.5 font-mono text-xs text-neutral-700 cursor-pointer mt-4">
                      <input
                        type="checkbox"
                        checked={current}
                        onChange={(e) => onChange(index, "year", combineYear(start, end, e.target.checked))}
                        className="cursor-pointer"
                      />
                      currently studying
                    </label>
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
