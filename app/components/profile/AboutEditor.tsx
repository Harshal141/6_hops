"use client";

import { Textarea } from "../ui";
import { useProfileField } from "@/lib/hooks/profileEditor";
import { ProfileSection } from "./ProfileSection";

export function AboutEditor() {
  const bio = useProfileField("bio");
  return (
    <ProfileSection title="About">
      <Textarea {...bio} rows={4} placeholder="Write something about yourself..." ariaLabel="Bio" />
    </ProfileSection>
  );
}
