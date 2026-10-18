"use client";

import { useToast } from "../ui";
import { useAddSkill, useRemoveSkill, type Profile, type SectionKey } from "@/lib/hooks/profile";
import { AboutEditor } from "./AboutEditor";
import { AboutSection } from "./AboutSection";
import { EducationEditor } from "./EducationEditor";
import { EducationSection } from "./EducationSection";
import { ExperienceEditor } from "./ExperienceEditor";
import { ExperienceSection } from "./ExperienceSection";
import { LinksEditor } from "./LinksEditor";
import { LinksSection } from "./LinksSection";
import { SkillsSection } from "./SkillsSection";

interface Props {
  profile: Profile;
  /** Which sections, in this order. */
  sections: readonly SectionKey[];
  /** Editors instead of the read view. They must then be inside the editor's FormProvider. */
  isEditing: boolean;
  /** Shown under Skills while editing. */
  skillsHint?: string;
}

/** The profile's sections, read or edited. Shared by the profile page and the setup edit modal. */
export function ProfileSections({ profile, sections, isEditing, skillsHint }: Props) {
  const addSkill = useAddSkill();
  const removeSkill = useRemoveSkill();
  const toast = useToast();

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "about":
        return isEditing ? <AboutEditor key={key} /> : <AboutSection key={key} bio={profile.bio} />;
      case "skills":
        // skills save on their own as they are added or removed, not with the form
        return (
          <SkillsSection
            key={key}
            skills={profile.skills}
            isEditing={isEditing}
            editHint={skillsHint}
            onAdd={(skill) => addSkill.mutate(skill, { onError: () => toast("Couldn't add that skill. Try again.", "error") })}
            onRemove={(id) => removeSkill.mutate(id, { onError: () => toast("Couldn't remove that skill. Try again.", "error") })}
          />
        );
      case "experience":
        return isEditing ? <ExperienceEditor key={key} /> : <ExperienceSection key={key} experience={profile.experience} />;
      case "education":
        return isEditing ? <EducationEditor key={key} /> : <EducationSection key={key} education={profile.education} />;
      case "links":
        return isEditing ? <LinksEditor key={key} /> : <LinksSection key={key} links={profile.links} />;
      default:
        return null;
    }
  };

  return <>{sections.map(renderSection)}</>;
}
