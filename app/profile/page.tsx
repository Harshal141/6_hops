"use client";

import { FormProvider } from "react-hook-form";
import { GridBackground, Navbar, Footer } from "../components";
import { useToast } from "../components/ui";
import {
  ProfileHeader, ProfileHeaderFields, ProfileEditToolbar, ProfileViewToolbar, SectionOrderPanel,
  ProfileSections,
} from "../components/profile";
import { useProfile, type SectionConfig, DEFAULT_SECTION_CONFIG } from "@/lib/hooks/profile";
import { useProfileEditor } from "@/lib/hooks/profileEditor";
import { hasProfileDetails } from "@/lib/utils/profileSummary";

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile();
  const toast       = useToast();
  const editor = useProfileEditor(profile, {
    onSaved: ({ changed }) => { if (changed) toast("Profile updated"); },
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
  const sectionConfig: SectionConfig[] = profile.section_config ?? DEFAULT_SECTION_CONFIG;

  const card = (
    <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-4 sm:p-8 flex-1 max-w-3xl">
      {isEditing ? (
        <ProfileEditToolbar
          error={editor.error}
          saving={editor.isSaving}
          onCancel={editor.stop}
          onSave={editor.submit}
        />
      ) : (
        <ProfileViewToolbar
          userId={profile.user_id}
          onEdit={editor.start}
          canImport={!hasProfileDetails(profile)}
        />
      )}

      <ProfileHeader profile={profile}>
        {isEditing ? <ProfileHeaderFields email={profile.email} /> : undefined}
      </ProfileHeader>

      <ProfileSections profile={profile} sections={sectionConfig.map((s) => s.key)} isEditing={isEditing} />
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
