"use client";

import { useState } from "react";
import { Button, IconButton, Input } from "../ui";
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
    <section className="mb-6 sm:mb-8">
      <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">Links</h2>

      {isEditing ? (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={link.id ?? `new-${index}`} className="flex items-center gap-2">
              <div className="w-24">
                <Input
                  value={link.type}
                  onChange={(value) => onChange(index, "type", value)}
                  placeholder="Type"
                  ariaLabel="Link type"
                />
              </div>
              <div className="flex-1">
                <Input
                  value={link.url}
                  onChange={(value) => onChange(index, "url", value)}
                  placeholder="URL"
                  ariaLabel="Link URL"
                />
              </div>
              <IconButton
                ariaLabel={`Remove ${link.type || "link"}`}
                tone="danger"
                onClick={() => onRemove(index)}
              >
                ×
              </IconButton>
            </div>
          ))}

          {showAdd ? (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-32">
                <Input
                  value={newLink.type}
                  onChange={(value) => setNewLink({ ...newLink, type: value })}
                  placeholder="Type (e.g., github)"
                  ariaLabel="New link type"
                />
              </div>
              <div className="flex-1">
                <Input
                  value={newLink.url}
                  onChange={(value) => setNewLink({ ...newLink, url: value })}
                  placeholder="URL"
                  ariaLabel="New link URL"
                />
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleAdd}
                disabled={!newLink.type || !newLink.url}
              >
                Add
              </Button>
              <IconButton ariaLabel="Cancel adding link" onClick={handleCancel}>
                ×
              </IconButton>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setShowAdd(true)}>
              + add link
            </Button>
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
