"use client";

import { Input } from "../ui";
import { useProfileField } from "@/lib/hooks/profileEditor";

/** The header's editable fields. Email comes from sign-in and is shown read-only. */
export function ProfileHeaderFields({ email }: { email: string }) {
  const name = useProfileField("name");
  const title = useProfileField("title");
  const location = useProfileField("location");

  return (
    <div className="space-y-2">
      <div className="font-bold text-xl sm:text-2xl">
        <Input {...name} size="inherit" placeholder="Your name" ariaLabel="Name" />
      </div>
      <div className="text-base sm:text-lg">
        <Input {...title} size="inherit" placeholder="Your title" ariaLabel="Title" />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input {...location} placeholder="Location" ariaLabel="Location" />
        </div>
        <div className="flex-1">
          {/* A real disabled input reads as "not editable"; a span styled like one just looks broken. */}
          <Input value={email} onChange={() => {}} disabled ariaLabel="Email (not editable)" />
        </div>
      </div>
    </div>
  );
}
