"use client";

import { useState } from "react";
import { GridBackground, Navbar, Footer } from "../components";
import { Button } from "../components/ui";
import {
  ProfileHeader,
  AboutSection,
  SkillsSection,
  ExperienceSection,
  EducationSection,
  LinksSection,
  SectionOrderPanel,
} from "../components/profile";
import {
  useProfile, useUpdateProfile,
  useAddLink, useUpdateLink, useDeleteLink,
  useAddExperience, useUpdateExperience, useDeleteExperience,
  useAddEducation, useUpdateEducation, useDeleteEducation,
  useUpdateUser, useAddSkill, useRemoveSkill,
  type Profile, type Link, type Experience, type Education, type Skill,
  type SectionKey, type SectionConfig,
  DEFAULT_SECTION_CONFIG,
} from "@/lib/hooks/profile";

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile();

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

  const [isEditing, setIsEditing]   = useState(false);
  const [edited, setEdited]         = useState<Profile | null>(null);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Copies the invite link, not the plain profile link — signups that go
  // through /invite/<id> get referral-attributed, per prds/referral-signin-redirect.md.
  const handleCopyInviteLink = async () => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/invite/${profile.id}`);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } catch (err) {
      console.error("[profile] failed to copy invite link:", err);
    }
  };

  const sectionConfig: SectionConfig[] = profile?.section_config ?? DEFAULT_SECTION_CONFIG;
  const sectionOrder: SectionKey[]     = sectionConfig.map((s) => s.key);

  // ── Edit mode ──────────────────────────────────────────────

  const startEditing = () => {
    if (profile) setEdited(structuredClone(profile));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEdited(null);
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!edited || !profile) return;
    if (!edited.name.trim()) { setSaveError("Name cannot be empty"); return; }
    setSaveError(null);

    const calls: Promise<unknown>[] = [];

    if (edited.name !== profile.name) calls.push(updateUser.mutateAsync({ name: edited.name }));
    calls.push(updateProfile.mutateAsync({ bio: edited.bio, title: edited.title, location: edited.location }));

    profile.links
      .filter((l) => l.id && !edited.links.find((el) => el.id === l.id))
      .forEach((l) => calls.push(deleteLink.mutateAsync(l.id!)));
    edited.links.filter((l) => !l.id).forEach((l) => calls.push(addLink.mutateAsync(l)));
    edited.links.filter((l) => l.id).forEach((l) => calls.push(updateLink.mutateAsync(l as Link & { id: number })));

    profile.experience
      .filter((e) => e.id && !edited.experience.find((ee) => ee.id === e.id))
      .forEach((e) => calls.push(deleteExp.mutateAsync(e.id!)));
    edited.experience.filter((e) => !e.id).forEach((e) => calls.push(addExperience.mutateAsync(e)));
    edited.experience.filter((e) => e.id).forEach((e) => calls.push(updateExp.mutateAsync(e as Experience & { id: number })));

    profile.education
      .filter((e) => e.id && !edited.education.find((ee) => ee.id === e.id))
      .forEach((e) => calls.push(deleteEdu.mutateAsync(e.id!)));
    edited.education.filter((e) => !e.id).forEach((e) => calls.push(addEducation.mutateAsync(e)));
    edited.education.filter((e) => e.id).forEach((e) => calls.push(updateEdu.mutateAsync(e as Education & { id: number })));

    await Promise.all(calls);
    setEdited(null);
    setIsEditing(false);
  };

  const isSaving = updateUser.isPending || updateProfile.isPending ||
    addLink.isPending || deleteLink.isPending ||
    addExperience.isPending || deleteExp.isPending ||
    addEducation.isPending || deleteEdu.isPending;

  // ── Edited state helpers ───────────────────────────────────

  const e  = edited;
  const setE = setEdited;

  const updateField = (field: "name" | "title" | "location", value: string) => {
    if (!e) return;
    setE({ ...e, [field]: value });
  };

  // Links
  const handleLinkChange = (index: number, field: "type" | "url", value: string) => {
    if (!e) return;
    const updated = [...e.links];
    updated[index] = { ...updated[index], [field]: value };
    setE({ ...e, links: updated });
  };
  const handleLinkRemove = (index: number) => {
    if (!e) return;
    setE({ ...e, links: e.links.filter((_, i) => i !== index) });
  };
  const handleLinkAdd = ({ type, url }: { type: string; url: string }) => {
    if (!e) return;
    setE({ ...e, links: [...e.links, { type, url, sort_order: e.links.length }] });
  };

  // Experience
  const handleExpAdd = () => {
    if (!e) return;
    setE({ ...e, experience: [...e.experience, { company: "", role: "", started_at: null, ended_at: null, currently_working: false, description: "", sort_order: e.experience.length }] });
  };
  const handleExpChange = (index: number, field: keyof Experience, value: string | boolean | null) => {
    if (!e) return;
    const updated = [...e.experience];
    updated[index] = { ...updated[index], [field]: value };
    setE({ ...e, experience: updated });
  };
  const handleExpRemove = (index: number) => {
    if (!e) return;
    setE({ ...e, experience: e.experience.filter((_, i) => i !== index) });
  };

  // Education
  const handleEduAdd = () => {
    if (!e) return;
    setE({ ...e, education: [...e.education, { institution: "", degree: "", year: "", sort_order: e.education.length }] });
  };
  const handleEduChange = (index: number, field: keyof Education, value: string) => {
    if (!e) return;
    const updated = [...e.education];
    updated[index] = { ...updated[index], [field]: value };
    setE({ ...e, education: updated });
  };
  const handleEduRemove = (index: number) => {
    if (!e) return;
    setE({ ...e, education: e.education.filter((_, i) => i !== index) });
  };

  // Skills (fire immediately — no batching with save)
  const handleSkillAdd    = (skill: Skill)    => addSkill.mutate(skill);
  const handleSkillRemove = (skillId: number) => removeSkill.mutate(skillId);

  const view = isEditing ? (e ?? profile!) : profile!;

  // ── Loading / error states ─────────────────────────────────

  if (isLoading) return (
    <GridBackground><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <span className="font-mono text-neutral-400">loading...</span>
      </main>
    <Footer /></GridBackground>
  );

  if (isError || !profile) return (
    <GridBackground><Navbar />
      <main className="flex-1 flex items-center justify-center">
        <span className="font-mono text-neutral-400">failed to load profile</span>
      </main>
    <Footer /></GridBackground>
  );

  // ── Section renderer ───────────────────────────────────────

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "about":
        return <AboutSection key={key} bio={view.bio} isEditing={isEditing} onChange={(v) => { if (e) setE({ ...e, bio: v }); }} />;
      case "skills":
        return <SkillsSection key={key} skills={profile.skills} isEditing={isEditing} onAdd={handleSkillAdd} onRemove={handleSkillRemove} />;
      case "experience":
        return <ExperienceSection key={key} experience={view.experience} isEditing={isEditing} onAdd={handleExpAdd} onChange={handleExpChange} onRemove={handleExpRemove} />;
      case "education":
        return <EducationSection key={key} education={view.education} isEditing={isEditing} onAdd={handleEduAdd} onChange={handleEduChange} onRemove={handleEduRemove} />;
      case "links":
        return <LinksSection key={key} links={view.links} isEditing={isEditing} onChange={handleLinkChange} onRemove={handleLinkRemove} onAdd={handleLinkAdd} />;
      default:
        return null;
    }
  };

  // ── Render ─────────────────────────────────────────────────

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 px-4 sm:px-8 py-6 overflow-auto">
        <div className={`mx-auto ${isEditing ? "max-w-5xl" : "max-w-3xl"}`}>
          <div className={`flex flex-col md:flex-row gap-6 ${isEditing ? "" : "md:justify-center"}`}>

            <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-4 sm:p-8 flex-1 max-w-3xl">

              {/* View mode — in-flow bar, same treatment as the edit-mode bar below so it
                  never overlaps the header (name/title can run long, especially on mobile) */}
              {!isEditing && (
                <div className="flex justify-end gap-2 mb-4">
                  <Button variant="secondary" size="md" onClick={handleCopyInviteLink}>
                    <span className="inline-flex items-center gap-1.5">
                      {linkCopied ? (
                        <svg aria-hidden viewBox="0 0 24 24" width="14" height="14" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg aria-hidden viewBox="0 0 24 24" width="14" height="14" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      )}
                      {linkCopied ? "copied!" : "invite friend"}
                    </span>
                  </Button>
                  <Button variant="secondary" size="md" onClick={startEditing}>
                    edit
                  </Button>
                </div>
              )}

              {/* Edit mode — in-flow bar so it never overlaps header inputs */}
              {isEditing && (
                <div className="flex items-center justify-end gap-2 mb-6 pb-4 border-b border-neutral-100">
                  {saveError && <span className="font-mono text-xs text-red-500 mr-auto">{saveError}</span>}
                  <Button variant="secondary" size="md" onClick={cancelEditing}>
                    cancel
                  </Button>
                  <Button variant="primary" size="md" onClick={handleSave} loading={isSaving}>
                    save
                  </Button>
                </div>
              )}

              <ProfileHeader view={view} isEditing={isEditing} onChange={updateField} />

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
