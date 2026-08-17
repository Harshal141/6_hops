"use client";

import { Button, Chip } from "../ui";

import { useState, useEffect, useRef } from "react";
import { useSearchSkills, type Skill } from "@/lib/hooks/profile";

// ── Skill search input ──────────────────────────────────────

function SkillSearch({ onAdd, onClose, existing }: {
  onAdd: (skill: Skill) => void;
  onClose: () => void;
  existing: number[];
}) {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: results = [] } = useSearchSkills(query);

  // Focus programmatically — avoids browser click/focus events that would open the dropdown
  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(inputValue), 200);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Adjusting state during render rather than in an effect: an effect would
  // commit a render with a stale highlight first, then immediately re-render.
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setHighlighted(0);
  }

  const visible = results.filter((s) => !existing.includes(s.id));

  const add = (skill: Skill) => {
    onAdd(skill);
    setInputValue("");
    setQuery("");
    setHighlighted(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (!open || visible.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, visible.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (visible[highlighted]) add(visible[highlighted]); }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => { setInputValue(e.target.value); setOpen(true); }}
        onClick={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder="search skills..."
        className="font-mono text-xs px-3 py-1.5 border border-dashed border-neutral-300 text-neutral-600 bg-transparent focus:border-neutral-400 outline-none w-48"
      />
      {open && visible.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-neutral-200 shadow-md z-10 max-h-60 overflow-y-auto">
          {visible.map((s, i) => (
            <button
              key={s.id}
              onMouseDown={() => add(s)}
              className={`w-full text-left font-mono text-xs px-3 py-2 text-neutral-700 ${i === highlighted ? "bg-neutral-100" : "hover:bg-neutral-50"}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Skills section ──────────────────────────────────────────

interface Props {
  skills: Skill[];
  isEditing: boolean;
  onAdd: (skill: Skill) => void;
  onRemove: (skillId: number) => void;
}

export function SkillsSection({ skills, isEditing, onAdd, onRemove }: Props) {
  const [showSearch, setShowSearch] = useState(false);

  // Reset when leaving edit mode — adjusted during render, not in an effect
  const [wasEditing, setWasEditing] = useState(isEditing);
  if (isEditing !== wasEditing) {
    setWasEditing(isEditing);
    if (!isEditing) setShowSearch(false);
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">Skills</h2>
        {isEditing && !showSearch && (
          <Button variant="secondary" size="sm" onClick={() => setShowSearch(true)}>
            + add skill
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Chip
            key={skill.id}
            label={skill.name}
            onRemove={isEditing ? () => onRemove(skill.id) : undefined}
          />
        ))}
        {isEditing && showSearch && (
          <SkillSearch
            onAdd={onAdd}
            onClose={() => setShowSearch(false)}
            existing={skills.map((s) => s.id)}
          />
        )}
      </div>

      {skills.length === 0 && !isEditing && (
        <p className="font-mono text-neutral-300 italic">No skills added</p>
      )}
    </section>
  );
}
