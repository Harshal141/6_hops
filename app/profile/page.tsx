"use client";

import { useState } from "react";
import { GridBackground, Navbar, Footer } from "../components";
import { Button, useToast } from "../components/ui";
import {
  ProfileHeader,
  AboutSection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  LinksSection,
  SectionOrderPanel,
  ProfileViewToolbar,
} from "../components/profile";
import {
  useProfile, useUpdateProfile,
  useAddLink, useUpdateLink, useDeleteLink,
  useAddExperience, useUpdateExperience, useDeleteExperience,
  useAddEducation, useUpdateEducation, useDeleteEducation,
  useUpdateUser, useAddSkill, useRemoveSkill,
  type Profile, type Experience, type Education,
  type SectionKey, type SectionConfig,
  DEFAULT_SECTION_CONFIG,
} from "@/lib/hooks/profile";
import { diffProfile } from "@/lib/utils/profileDiff";

type ListKey = "links" | "experience" | "education";

const changeAt = <T,>(items: T[], index: number, changes: Partial<T>) =>
  items.map((item, i) => (i === index ? { ...item, ...changes } : item));
const removeAt = <T,>(items: T[], index: number) => items.filter((_, i) => i !== index);

export default function ProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useProfile();

  const updateUser    = useUpdateUser();
  const updateProfile = useUpdateProfile();
  const addLink       = useAddLink();
  const updateLink    = useUpdateLink();
  const deleteLink    = useDeleteLink();
  const addExperience = useAddExperience();
  const updateExp     = useUpdateExperience();
  const deleteExp     = useDeleteExperience();
  const addEducation  = useAddEducation();
  const updateEdu     = useUpdateEducation();
  const deleteEdu     = useDeleteEducation();
  const addSkill      = useAddSkill();
  const removeSkill   = useRemoveSkill();
  const toast         = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited]       = useState<Profile | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);

  const sectionConfig: SectionConfig[] = profile?.section_config ?? DEFAULT_SECTION_CONFIG;
  const sectionOrder: SectionKey[]     = sectionConfig.map((s) => s.key);

  const startEditing = () => {
    if (profile) setEdited(structuredClone(profile));
    setIsEditing(true);
  };

  const stopEditing = () => {
    setEdited(null);
    setIsEditing(false);
    setNameError(null);
  };

  const handleSave = async () => {
    if (!edited || !profile) return;
    if (!edited.name.trim()) { setNameError("Name cannot be empty"); return; }

    const diff = diffProfile(profile, edited);
    setSaving(true);
    const results = await Promise.allSettled([
      diff.name !== null && updateUser.mutateAsync({ name: diff.name }),
      diff.details && updateProfile.mutateAsync(diff.details),
      ...diff.links.added.map((link) => addLink.mutateAsync(link)),
      ...diff.links.updated.map((link) => updateLink.mutateAsync(link)),
      ...diff.links.deleted.map((id) => deleteLink.mutateAsync(id)),
      ...diff.experience.added.map((exp) => addExperience.mutateAsync(exp)),
      ...diff.experience.updated.map((exp) => updateExp.mutateAsync(exp)),
      ...diff.experience.deleted.map((id) => deleteExp.mutateAsync(id)),
      ...diff.education.added.map((edu) => addEducation.mutateAsync(edu)),
      ...diff.education.updated.map((edu) => updateEdu.mutateAsync(edu)),
      ...diff.education.deleted.map((id) => deleteEdu.mutateAsync(id)),
    ]);
    setSaving(false);
    stopEditing();

    // Leaving edit mode on failure too: retrying the same edits would re-add the items that did save.
    if (results.some((result) => result.status === "rejected")) {
      refetch();
      toast("Some changes didn't save. Check your profile and try again.", "error");
    } else {
      toast("Profile updated");
    }
  };

  const patch = (changes: Partial<Profile>) => setEdited((prev) => prev && { ...prev, ...changes });
  const updateList = <K extends ListKey>(key: K, update: (items: Profile[K]) => Profile[K]) =>
    setEdited((prev) => prev && { ...prev, [key]: update(prev[key]) });

  const handleLinkAdd = ({ type, url }: { type: string; url: string }) =>
    updateList("links", (links) => [...links, { type, url, sort_order: links.length }]);
  const handleExpAdd = () =>
    updateList("experience", (items) => [...items, { company: "", role: "", started_at: null, ended_at: null, currently_working: false, description: "", sort_order: items.length }]);
  const handleEduAdd = () =>
    updateList("education", (items) => [...items, { institution: "", degree: "", year: "", sort_order: items.length }]);

  const view = isEditing ? (edited ?? profile!) : profile!;

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

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "about":
        return <AboutSection key={key} bio={view.bio} isEditing={isEditing} onChange={(bio) => patch({ bio })} />;
      case "skills":
        return <SkillsSection key={key} skills={profile.skills} isEditing={isEditing} onAdd={(skill) => addSkill.mutate(skill)} onRemove={(id) => removeSkill.mutate(id)} />;
      case "experience":
        return (
          <ExperienceSection key={key} experience={view.experience} isEditing={isEditing} onAdd={handleExpAdd}
            onChange={(index, field, value) => updateList("experience", (items) => changeAt<Experience>(items, index, { [field]: value }))}
            onRemove={(index) => updateList("experience", (items) => removeAt(items, index))} />
        );
      case "education":
        return (
          <EducationSection key={key} education={view.education} isEditing={isEditing} onAdd={handleEduAdd}
            onChange={(index, field, value) => updateList("education", (items) => changeAt<Education>(items, index, { [field]: value }))}
            onRemove={(index) => updateList("education", (items) => removeAt(items, index))} />
        );
      case "links":
        return (
          <LinksSection key={key} links={view.links} isEditing={isEditing} onAdd={handleLinkAdd}
            onChange={(index, field, value) => updateList("links", (items) => changeAt(items, index, { [field]: value }))}
            onRemove={(index) => updateList("links", (items) => removeAt(items, index))} />
        );
      default:
        return null;
    }
  };

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 px-4 sm:px-8 py-6 overflow-auto">
        <div className={`mx-auto ${isEditing ? "max-w-5xl" : "max-w-3xl"}`}>
          <div className={`flex flex-col md:flex-row gap-6 ${isEditing ? "" : "md:justify-center"}`}>

            <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-4 sm:p-8 flex-1 max-w-3xl">

              {!isEditing && (
                <ProfileViewToolbar
                  userId={profile.user_id}
                  onEdit={startEditing}
                  canImport={profile.experience.length === 0 && profile.education.length === 0}
                />
              )}

              {/* Edit mode — in-flow bar so it never overlaps header inputs */}
              {isEditing && (
                <div className="flex items-center justify-end gap-2 mb-6 pb-4 border-b border-neutral-100">
                  {nameError && <span className="font-mono text-xs text-danger mr-auto">{nameError}</span>}
                  <Button variant="secondary" size="md" onClick={stopEditing} disabled={saving}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="md" onClick={handleSave} loading={saving}>
                    Save
                  </Button>
                </div>
              )}

              <ProfileHeader view={view} isEditing={isEditing} onChange={(field, value) => patch({ [field]: value })} />

              {sectionOrder.map((key) => renderSection(key))}
            </div>

            {isEditing && (
              <SectionOrderPanel
                sectionOrder={sectionOrder}
                sectionConfig={sectionConfig}
                onReorder={(newConfig) => updateProfile.mutate({ section_config: newConfig })}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
