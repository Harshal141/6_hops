"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext,
  sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GridBackground, Navbar, Footer } from "../components";
import {
  useProfile, useUpdateProfile,
  useAddLink, useUpdateLink, useDeleteLink,
  useAddExperience, useUpdateExperience, useDeleteExperience,
  useAddEducation, useUpdateEducation, useDeleteEducation,
  useUpdateUser,
  useAddSkill, useRemoveSkill, useSearchSkills,
  type Profile, type Link, type Experience, type Education,
  type Skill, type SectionKey, type SectionConfig,
  DEFAULT_SECTION_CONFIG,
} from "@/lib/hooks/profile";

// ── Sortable section item ──────────────────────────────────

function SortableSectionItem({ id, label, index }: { id: string; label: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      {...attributes}
      {...listeners}
    >
      <span className="text-neutral-400 text-xs">⋮⋮</span>
      <span className="font-mono text-sm text-neutral-600 flex-1">{label}</span>
      <span className="font-mono text-xs text-neutral-300">{index + 1}</span>
    </div>
  );
}

// ── Skill search ───────────────────────────────────────────

function SkillSearch({ onAdd, existing }: { onAdd: (skill: Skill) => void; existing: number[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: results = [] } = useSearchSkills(query);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="search skills..."
        className="font-mono text-xs px-3 py-1.5 border border-dashed border-neutral-300 text-neutral-600 bg-transparent focus:border-neutral-400 outline-none w-48 rounded"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-neutral-200 rounded shadow-md z-10">
          {results.filter((s) => !existing.includes(s.id)).map((s) => (
            <button
              key={s.id}
              onMouseDown={() => { onAdd(s); setQuery(""); setOpen(false); }}
              className="w-full text-left font-mono text-xs px-3 py-2 hover:bg-neutral-50 text-neutral-700"
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile();

  const updateUser     = useUpdateUser();
  const updateProfile  = useUpdateProfile();
  const addLink        = useAddLink();
  const updateLink     = useUpdateLink();
  const deleteLink     = useDeleteLink();
  const addExperience  = useAddExperience();
  const updateExp      = useUpdateExperience();
  const deleteExp      = useDeleteExperience();
  const addEducation   = useAddEducation();
  const updateEdu      = useUpdateEducation();
  const deleteEdu      = useDeleteEducation();
  const addSkill       = useAddSkill();
  const removeSkill    = useRemoveSkill();

  const [isEditing, setIsEditing] = useState(false);
  const [edited, setEdited] = useState<Profile | null>(null);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ type: "", url: "" });
  const [saveError, setSaveError] = useState<string | null>(null);

  // Derive section order from profile config
  const sectionConfig: SectionConfig[] = profile?.section_config ?? DEFAULT_SECTION_CONFIG;
  const sectionOrder: SectionKey[] = sectionConfig.map((s) => s.key);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Edit mode ──────────────────────────────────────────────
  const startEditing = () => {
    if (profile) setEdited(structuredClone(profile));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEdited(null);
    setIsEditing(false);
    setNewLink({ type: "", url: "" });
    setShowAddLink(false);
    setSaveError(null);
  };

  // ── Save — core profile fields only ───────────────────────
  const handleSave = async () => {
    if (!edited || !profile) return;
    if (!edited.name.trim()) { setSaveError("Name cannot be empty"); return; }
    setSaveError(null);

    const calls: Promise<unknown>[] = [];

    // Core fields
    if (edited.name !== profile.name) {
      calls.push(updateUser.mutateAsync({ name: edited.name }));
    }
    calls.push(updateProfile.mutateAsync({
      bio: edited.bio,
      title: edited.title,
      location: edited.location,
    }));

    // Links
    profile.links
      .filter((l) => l.id && !edited.links.find((el) => el.id === l.id))
      .forEach((l) => calls.push(deleteLink.mutateAsync(l.id!)));

    edited.links
      .filter((l) => !l.id)
      .forEach((l) => calls.push(addLink.mutateAsync(l)));

    edited.links
      .filter((l) => l.id)
      .forEach((l) => calls.push(updateLink.mutateAsync(l as Link & { id: number })));

    // Experience
    profile.experience
      .filter((e) => e.id && !edited.experience.find((ee) => ee.id === e.id))
      .forEach((e) => calls.push(deleteExp.mutateAsync(e.id!)));

    edited.experience
      .filter((e) => !e.id)
      .forEach((e) => calls.push(addExperience.mutateAsync(e)));

    edited.experience
      .filter((e) => e.id)
      .forEach((e) => calls.push(updateExp.mutateAsync(e as Experience & { id: number })));

    // Education
    profile.education
      .filter((e) => e.id && !edited.education.find((ee) => ee.id === e.id))
      .forEach((e) => calls.push(deleteEdu.mutateAsync(e.id!)));

    edited.education
      .filter((e) => !e.id)
      .forEach((e) => calls.push(addEducation.mutateAsync(e)));

    edited.education
      .filter((e) => e.id)
      .forEach((e) => calls.push(updateEdu.mutateAsync(e as Education & { id: number })));

    await Promise.all(calls);
    setEdited(null);
    setIsEditing(false);
  };

  const isSaving = updateUser.isPending || updateProfile.isPending ||
    addLink.isPending || deleteLink.isPending ||
    addExperience.isPending || deleteExp.isPending ||
    addEducation.isPending || deleteEdu.isPending;

  // ── Drag end — saves section order immediately ─────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionOrder.indexOf(active.id as SectionKey);
    const newIndex = sectionOrder.indexOf(over.id as SectionKey);
    const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
    const newConfig = newOrder.map((key) => sectionConfig.find((s) => s.key === key) ?? { key, visible: true });
    updateProfile.mutate({ section_config: newConfig });
  };

  // ── Edit state helpers ─────────────────────────────────────
  const e = edited;
  const setE = setEdited;

  const updateField = (field: keyof Pick<Profile, "name" | "email" | "bio" | "title" | "location">, value: string) => {
    if (!e) return;
    setE({ ...e, [field]: value });
  };

  const addLinkRow = () => {
    if (!e || !newLink.type.trim() || !newLink.url.trim()) return;
    setE({ ...e, links: [...e.links, { type: newLink.type.trim(), url: newLink.url.trim(), sort_order: e.links.length }] });
    setNewLink({ type: "", url: "" });
    setShowAddLink(false);
  };

  const updateLinkRow = (index: number, field: "type" | "url", value: string) => {
    if (!e) return;
    const updated = [...e.links];
    updated[index] = { ...updated[index], [field]: value };
    setE({ ...e, links: updated });
  };

  const removeLinkRow = (index: number) => {
    if (!e) return;
    setE({ ...e, links: e.links.filter((_, i) => i !== index) });
  };

  const addExpRow = () => {
    if (!e) return;
    setE({ ...e, experience: [...e.experience, { company: "", role: "", started_at: null, ended_at: null, currently_working: false, description: "", sort_order: e.experience.length }] });
  };

  const updateExpRow = (index: number, field: keyof Experience, value: string | boolean | null) => {
    if (!e) return;
    const updated = [...e.experience];
    updated[index] = { ...updated[index], [field]: value };
    setE({ ...e, experience: updated });
  };

  const removeExpRow = (index: number) => {
    if (!e) return;
    setE({ ...e, experience: e.experience.filter((_, i) => i !== index) });
  };

  const addEduRow = () => {
    if (!e) return;
    setE({ ...e, education: [...e.education, { institution: "", degree: "", year: "", sort_order: e.education.length }] });
  };

  const updateEduRow = (index: number, field: keyof Education, value: string) => {
    if (!e) return;
    const updated = [...e.education];
    updated[index] = { ...updated[index], [field]: value };
    setE({ ...e, education: updated });
  };

  const removeEduRow = (index: number) => {
    if (!e) return;
    setE({ ...e, education: e.education.filter((_, i) => i !== index) });
  };

  // Skills fire immediately (no edit mode)
  const handleAddSkill = (skill: Skill) => addSkill.mutate(skill.id);
  const handleRemoveSkill = (skillId: number) => removeSkill.mutate(skillId);

  // Use edited state in edit mode, profile data in view mode
  const view = isEditing ? (e ?? profile!) : profile!;

  // ── States ─────────────────────────────────────────────────
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

  // ── Section renderers ──────────────────────────────────────
  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "about":
        return (
          <section key={key} className="mb-8">
            <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">About</h2>
            {isEditing ? (
              <textarea
                value={view.bio}
                onChange={(ev) => updateField("bio", ev.target.value)}
                rows={4}
                placeholder="Write something about yourself..."
                className="font-mono text-neutral-700 placeholder:text-neutral-400 leading-relaxed w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none p-3 resize-none rounded"
              />
            ) : view.bio ? (
              <p className="font-mono text-neutral-600 leading-relaxed">{view.bio}</p>
            ) : (
              <p className="font-mono text-neutral-300 italic">No bio added</p>
            )}
          </section>
        );

      case "skills":
        return (
          <section key={key} className="mb-8">
            <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill.id} className="font-mono text-xs px-3 py-1.5 bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center gap-2 rounded">
                  {skill.name}
                  {isEditing && (
                    <button onClick={() => handleRemoveSkill(skill.id)} className="text-red-400 hover:text-red-600 ml-1">×</button>
                  )}
                </span>
              ))}
              {isEditing && (
                <SkillSearch
                  onAdd={handleAddSkill}
                  existing={profile.skills.map((s) => s.id)}
                />
              )}
            </div>
          </section>
        );

      case "experience":
        return (
          <section key={key} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">Experience</h2>
              {isEditing && <button onClick={addExpRow} className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded">+ add</button>}
            </div>
            <div className="space-y-4">
              {view.experience.map((exp, index) => (
                <div key={exp.id ?? `new-${index}`} className="border-l-2 border-neutral-200 pl-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="text" value={exp.role} onChange={(ev) => updateExpRow(index, "role", ev.target.value)} placeholder="Role" className="font-mono font-semibold text-neutral-800 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 flex-1 rounded" />
                        <button onClick={() => removeExpRow(index)} className="text-red-400 hover:text-red-600 text-sm px-2">×</button>
                      </div>
                      <input type="text" value={exp.company} onChange={(ev) => updateExpRow(index, "company", ev.target.value)} placeholder="Company" className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded" />
                      <div className="flex items-center gap-2">
                        <input type="date" value={exp.started_at ?? ""} onChange={(ev) => updateExpRow(index, "started_at", ev.target.value || null)} className="font-mono text-xs text-neutral-700 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 rounded" />
                        {!exp.currently_working && (
                          <input type="date" value={exp.ended_at ?? ""} onChange={(ev) => updateExpRow(index, "ended_at", ev.target.value || null)} className="font-mono text-xs text-neutral-700 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 rounded" />
                        )}
                        <label className="flex items-center gap-1 font-mono text-xs text-neutral-700 cursor-pointer">
                          <input type="checkbox" checked={exp.currently_working} onChange={(ev) => updateExpRow(index, "currently_working", ev.target.checked)} />
                          currently working
                        </label>
                      </div>
                      <textarea value={exp.description} onChange={(ev) => updateExpRow(index, "description", ev.target.value)} placeholder="Description" rows={2} className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 resize-none rounded" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-mono font-semibold text-neutral-800">{exp.role || <span className="text-neutral-300 italic">No role</span>}</h3>
                        <span className="font-mono text-xs text-neutral-400">
                          {exp.started_at ? new Date(exp.started_at).getFullYear() : ""}
                          {exp.started_at ? " – " : ""}
                          {exp.currently_working ? "present" : exp.ended_at ? new Date(exp.ended_at).getFullYear() : ""}
                        </span>
                      </div>
                      <p className="font-mono text-sm text-neutral-500">{exp.company}</p>
                      <p className="font-mono text-sm text-neutral-600 mt-1">{exp.description}</p>
                    </>
                  )}
                </div>
              ))}
              {view.experience.length === 0 && !isEditing && <p className="font-mono text-neutral-300 italic">No experience added</p>}
            </div>
          </section>
        );

      case "education":
        return (
          <section key={key} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">Education</h2>
              {isEditing && <button onClick={addEduRow} className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded">+ add</button>}
            </div>
            <div className="space-y-4">
              {view.education.map((edu, index) => (
                <div key={edu.id ?? `new-${index}`}>
                  {isEditing ? (
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <input type="text" value={edu.degree} onChange={(ev) => updateEduRow(index, "degree", ev.target.value)} placeholder="Degree" className="font-mono font-semibold text-neutral-800 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded" />
                        <input type="text" value={edu.institution} onChange={(ev) => updateEduRow(index, "institution", ev.target.value)} placeholder="Institution" className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded" />
                      </div>
                      <input type="text" value={edu.year} onChange={(ev) => updateEduRow(index, "year", ev.target.value)} placeholder="Year" className="font-mono text-xs text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-20 px-2 py-1 text-right rounded" />
                      <button onClick={() => removeEduRow(index)} className="text-red-400 hover:text-red-600 text-sm px-2 mt-1">×</button>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <div>
                        <h3 className="font-mono font-semibold text-neutral-800">{edu.degree || <span className="text-neutral-300 italic">No degree</span>}</h3>
                        <p className="font-mono text-sm text-neutral-500">{edu.institution}</p>
                      </div>
                      <span className="font-mono text-xs text-neutral-400">{edu.year}</span>
                    </div>
                  )}
                </div>
              ))}
              {view.education.length === 0 && !isEditing && <p className="font-mono text-neutral-300 italic">No education added</p>}
            </div>
          </section>
        );

      case "links":
        return (
          <section key={key} className="mb-8">
            <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">Links</h2>
            {isEditing ? (
              <div className="space-y-2">
                {view.links.map((link, index) => (
                  <div key={link.id ?? `new-${index}`} className="flex items-center gap-2">
                    <input type="text" value={link.type} onChange={(ev) => updateLinkRow(index, "type", ev.target.value)} placeholder="Type" className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 w-24 rounded" />
                    <input type="text" value={link.url} onChange={(ev) => updateLinkRow(index, "url", ev.target.value)} placeholder="URL" className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 flex-1 rounded" />
                    <button onClick={() => removeLinkRow(index)} className="text-red-400 hover:text-red-600 text-sm px-2">×</button>
                  </div>
                ))}
                {showAddLink ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input type="text" value={newLink.type} onChange={(ev) => setNewLink({ ...newLink, type: ev.target.value })} placeholder="Type (e.g., github)" className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 w-32 rounded" />
                    <input type="text" value={newLink.url} onChange={(ev) => setNewLink({ ...newLink, url: ev.target.value })} onKeyDown={(ev) => ev.key === "Enter" && addLinkRow()} placeholder="URL" className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 flex-1 rounded" />
                    <button onClick={addLinkRow} disabled={!newLink.type || !newLink.url} className="font-mono text-xs px-3 py-1.5 bg-neutral-800 text-white rounded hover:bg-neutral-700 disabled:opacity-50">Add</button>
                    <button onClick={() => { setShowAddLink(false); setNewLink({ type: "", url: "" }); }} className="text-neutral-400 hover:text-neutral-600 text-sm px-2">×</button>
                  </div>
                ) : (
                  <button onClick={() => setShowAddLink(true)} className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded">+ add link</button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {view.links.map((link, index) => (
                  <a key={link.id ?? index} href={link.url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-neutral-600 hover:text-neutral-800 transition-colors">
                    [{link.type}]
                  </a>
                ))}
                {view.links.length === 0 && <p className="font-mono text-neutral-300 italic">No links added</p>}
              </div>
            )}
          </section>
        );

      default:
        return null;
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 px-8 py-6 overflow-auto">
        <div className={`mx-auto ${isEditing ? "max-w-5xl" : "max-w-3xl"}`}>
          <div className={`flex gap-6 ${isEditing ? "" : "justify-center"}`}>
            <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-8 relative flex-1 max-w-3xl">

              {/* Edit / Save buttons */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                {isEditing ? (
                  <>
                    <div className="flex gap-2">
                      <button onClick={cancelEditing} className="font-mono text-xs px-3 py-1.5 border border-neutral-300 text-neutral-500 hover:bg-neutral-100 transition-colors rounded">cancel</button>
                      <button onClick={handleSave} disabled={isSaving} className="font-mono text-xs px-3 py-1.5 bg-neutral-800 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50 rounded">
                        {isSaving ? "saving..." : "save"}
                      </button>
                    </div>
                    {saveError && <span className="font-mono text-xs text-red-500">{saveError}</span>}
                  </>
                ) : (
                  <button onClick={startEditing} className="font-mono text-xs px-3 py-1.5 border border-neutral-300 text-neutral-500 hover:bg-neutral-100 transition-colors rounded">edit</button>
                )}
              </div>

              {/* Header */}
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
                <div className="flex-1 min-w-0 pr-28">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input type="text" value={view.name} onChange={(ev) => updateField("name", ev.target.value)} placeholder="Your name" className="font-mono font-bold text-2xl text-neutral-800 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded" />
                      <input type="text" value={view.title} onChange={(ev) => updateField("title", ev.target.value)} placeholder="Your title" className="font-mono text-lg text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded" />
                      <div className="flex gap-2">
                        <input type="text" value={view.location} onChange={(ev) => updateField("location", ev.target.value)} placeholder="Location" className="font-mono text-sm text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none flex-1 px-2 py-1 rounded" />
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

              {sectionOrder.map((key) => renderSection(key))}
            </div>

            {/* Section order panel */}
            {isEditing && (
              <div className="w-56 shrink-0">
                <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-4 sticky top-6">
                  <h3 className="font-mono font-semibold text-sm text-neutral-800 mb-3">Section Order</h3>
                  <p className="font-mono text-xs text-neutral-400 mb-4">Drag to reorder</p>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {sectionOrder.map((key, index) => (
                          <SortableSectionItem key={key} id={key} label={key.charAt(0).toUpperCase() + key.slice(1)} index={index} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
