"use client";

import { useState } from "react";
import type { Link } from "@/lib/hooks/profile";

interface Props {
  links: Link[];
  isEditing: boolean;
  onChange: (index: number, field: "type" | "url", value: string) => void;
  onRemove: (index: number) => void;
  onAdd: (link: { type: string; url: string }) => void;
}

export function LinksSection({ links, isEditing, onChange, onRemove, onAdd }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newLink, setNewLink] = useState({ type: "", url: "" });

  const handleAdd = () => {
    if (!newLink.type.trim() || !newLink.url.trim()) return;
    onAdd({ type: newLink.type.trim(), url: newLink.url.trim() });
    setNewLink({ type: "", url: "" });
    setShowAdd(false);
  };

  const handleCancel = () => {
    setShowAdd(false);
    setNewLink({ type: "", url: "" });
  };

  return (
    <section className="mb-8">
      <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">Links</h2>

      {isEditing ? (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={link.id ?? `new-${index}`} className="flex items-center gap-2">
              <input
                type="text"
                value={link.type}
                onChange={(e) => onChange(index, "type", e.target.value)}
                placeholder="Type"
                className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 w-24 rounded"
              />
              <input
                type="text"
                value={link.url}
                onChange={(e) => onChange(index, "url", e.target.value)}
                placeholder="URL"
                className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 flex-1 rounded"
              />
              <button onClick={() => onRemove(index)} className="text-red-400 hover:text-red-600 text-sm px-2 cursor-pointer">×</button>
            </div>
          ))}

          {showAdd ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newLink.type}
                onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
                placeholder="Type (e.g., github)"
                className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 w-32 rounded"
              />
              <input
                type="text"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="URL"
                className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 flex-1 rounded"
              />
              <button
                onClick={handleAdd}
                disabled={!newLink.type || !newLink.url}
                className="font-mono text-xs px-3 py-1.5 bg-neutral-800 text-white rounded hover:bg-neutral-700 disabled:opacity-50 cursor-pointer"
              >
                Add
              </button>
              <button onClick={handleCancel} className="text-neutral-400 hover:text-neutral-600 text-sm px-2 cursor-pointer">×</button>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded cursor-pointer"
            >
              + add link
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {links.map((link, index) => (
            <a
              key={link.id ?? index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              [{link.type}]
            </a>
          ))}
          {links.length === 0 && <p className="font-mono text-neutral-300 italic">No links added</p>}
        </div>
      )}
    </section>
  );
}
