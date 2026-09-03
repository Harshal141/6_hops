"use client";

import { Input } from "../ui";

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
    <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-neutral-200">
      <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-neutral-200 shrink-0">
        {view.icon ? (
          <Image src={view.icon} alt={view.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <span className="font-mono text-lg sm:text-2xl text-neutral-400">{view.name?.charAt(0) ?? "?"}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <div className="font-bold text-xl sm:text-2xl">
              <Input
                size="inherit"
                value={view.name}
                onChange={(value) => onChange("name", value)}
                placeholder="Your name"
                ariaLabel="Name"
              />
            </div>
            <div className="text-base sm:text-lg">
              <Input
                size="inherit"
                value={view.title}
                onChange={(value) => onChange("title", value)}
                placeholder="Your title"
                ariaLabel="Title"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  value={view.location}
                  onChange={(value) => onChange("location", value)}
                  placeholder="Location"
                  ariaLabel="Location"
                />
              </div>
              <div className="flex-1">
                {/* Email isn't editable here — a real disabled input reads as
                    "disabled", where a plain span styled to match one just looks broken. */}
                <Input
                  value={view.email}
                  onChange={() => {}}
                  disabled
                  ariaLabel="Email (not editable)"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-mono font-bold text-xl sm:text-3xl text-neutral-800">{view.name}</h1>
            <p className="font-mono text-sm sm:text-lg text-neutral-500 mt-1">{view.title}</p>
            {/* email is only returned to the profile's owner, so it is absent when
                viewing someone else — don't render a dangling separator */}
            <p className="font-mono text-xs sm:text-sm text-neutral-400 mt-2">
              {[view.location, view.email].filter(Boolean).join(" · ")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
