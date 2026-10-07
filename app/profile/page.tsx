"use client";

import { FormProvider } from "react-hook-form";
import { GridBackground, Navbar, Footer } from "../components";
import { useToast } from "../components/ui";
import {
  ProfileHeader, ProfileHeaderFields, ProfileEditToolbar, ProfileViewToolbar, SectionOrderPanel,
  AboutSection, AboutEditor,
  SkillsSection,
  ExperienceSection, ExperienceEditor,
  EducationSection, EducationEditor,
  LinksSection, LinksEditor,
} from "../components/profile";
import {
  useProfile, useAddSkill, useRemoveSkill,
  type SectionKey, type SectionConfig,
  DEFAULT_SECTION_CONFIG,
} from "@/lib/hooks/profile";
import { useProfileEditor } from "@/lib/hooks/profileEditor";

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile();
  const addSkill    = useAddSkill();
  const removeSkill = useRemoveSkill();
  const toast       = useToast();
  const editor = useProfileEditor(profile, {
    onSaved: () => toast("Profile updated"),
    onError: (message) => toast(message, "error"),
  });

  if (isLoading) return (
    <GridBackground><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <span className="font-mono text-neutral-400">Loading...</span>
      </main>
    <Footer /></GridBackground>
  );

  if (isError || !profile) return (
    <GridBackground><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <span className="font-mono text-neutral-400">Failed to load profile</span>
      </main>
    <Footer /></GridBackground>
  );

  const { isEditing } = editor;
  const { errors } = editor.form.formState;
  const sectionConfig: SectionConfig[] = profile.section_config ?? DEFAULT_SECTION_CONFIG;

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

  const card = (
    <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-4 sm:p-8 flex-1 max-w-3xl">
      {isEditing ? (
        <ProfileEditToolbar
          error={errors.root?.message ?? (Object.keys(errors).length ? "Fix the highlighted fields" : undefined)}
          saving={editor.isSaving}
          onCancel={editor.stop}
          onSave={editor.submit}
        />
      ) : (
        <ProfileViewToolbar
          userId={profile.user_id}
          onEdit={editor.start}
          canImport={profile.experience.length === 0 && profile.education.length === 0}
        />
      )}

      <ProfileHeader profile={profile}>
        {isEditing ? <ProfileHeaderFields email={profile.email} /> : undefined}
      </ProfileHeader>

      {sectionConfig.map((s) => renderSection(s.key))}
    </div>
  );

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 px-4 sm:px-8 py-6 overflow-auto">
        <div className={`mx-auto ${isEditing ? "max-w-5xl" : "max-w-3xl"}`}>
          <div className={`flex flex-col md:flex-row gap-6 ${isEditing ? "" : "md:justify-center"}`}>
            {isEditing ? <FormProvider {...editor.form}>{card}</FormProvider> : card}

            {isEditing && (
              <SectionOrderPanel
                sectionOrder={sectionConfig.map((s) => s.key)}
                sectionConfig={sectionConfig}
                onReorder={editor.changeOrder}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
