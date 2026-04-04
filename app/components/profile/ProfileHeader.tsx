"use client";

import Image from "next/image";
import type { Profile } from "@/lib/hooks/profile";

type EditableField = "name" | "title" | "location";

interface Props {
  view: Profile;
  isEditing: boolean;
  onChange: (field: EditableField, value: string) => void;
}

export function ProfileHeader({ view, isEditing, onChange }: Props) {
  return (
    <div className="flex items-start gap-6 mb-8 pb-6 border-b border-neutral-200">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-200 shrink-0">
        {view.icon ? (
          <Image src={view.icon} alt={view.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <span className="font-mono text-2xl text-neutral-400">{view.name?.charAt(0) ?? "?"}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={view.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Your name"
              className="font-mono font-bold text-2xl text-neutral-800 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded"
            />
            <input
              type="text"
              value={view.title}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="Your title"
              className="font-mono text-lg text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={view.location}
                onChange={(e) => onChange("location", e.target.value)}
                placeholder="Location"
                className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none flex-1 px-2 py-1 rounded"
              />
              <span className="font-mono text-sm text-neutral-500 flex-1 px-2 py-1">{view.email}</span>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-mono font-bold text-3xl text-neutral-800">{view.name}</h1>
            <p className="font-mono text-lg text-neutral-500 mt-1">{view.title}</p>
            <p className="font-mono text-sm text-neutral-400 mt-2">{view.location} · {view.email}</p>
          </>
        )}
      </div>
    </div>
  );
}
