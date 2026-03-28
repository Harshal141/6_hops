"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GridBackground, Navbar, Footer } from "../components";

// ── Types ──────────────────────────────────────────────────

interface Link {
  id?: number;
  type: string;
  url: string;
  sort_order: number;
}

interface Experience {
  id?: number;
  company: string;
  role: string;
  started_at: string | null;
  ended_at: string | null;
  currently_working: boolean;
  description: string;
  sort_order: number;
}

interface Education {
  id?: number;
  institution: string;
  degree: string;
  year: string;
  sort_order: number;
}

interface Skill {
  id: number;
  name: string;
  level: number;
  parent_id: number | null;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  icon: string;
  bio: string;
  title: string;
  location: string;
  links: Link[];
  experience: Experience[];
  education: Education[];
  skills: Skill[];
}

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

function SkillSearch({ onAdd }: { onAdd: (skill: Skill) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Skill[]>([]);
  const [open, setOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = (q: string) => {
    setQuery(q);
    if (debounce.current) clearTimeout(debounce.current);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    debounce.current = setTimeout(async () => {
      const res = await fetch(`/api/skill/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    }, 250);
  };

  const pick = (skill: Skill) => {
    onAdd(skill);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => search(e.target.value)}
        placeholder="search skills..."
        className="font-mono text-xs px-3 py-1.5 border border-dashed border-neutral-300 text-neutral-600 bg-transparent focus:border-neutral-400 outline-none w-48 rounded"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-neutral-200 rounded shadow-md z-10">
          {results.map((s) => (
            <button
              key={s.id}
              onClick={() => pick(s)}
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

// ── Helpers ────────────────────────────────────────────────

const normalize = (data: Record<string, unknown>): Profile => ({
  id: (data.id as string) ?? "",
  name: (data.name as string) ?? "",
  email: (data.email as string) ?? "",
  icon: (data.icon as string) ?? "",
  bio: (data.bio as string) ?? "",
  title: (data.title as string) ?? "",
  location: (data.location as string) ?? "",
  links: ((data.links as Link[]) ?? []).map((l, i) => ({ ...l, sort_order: l.sort_order ?? i })),
  experience: ((data.experience as Experience[]) ?? []).map((e, i) => ({
    ...e,
    started_at: e.started_at ?? null,
    ended_at: e.ended_at ?? null,
    currently_working: e.currently_working ?? false,
    description: e.description ?? "",
    sort_order: e.sort_order ?? i,
  })),
  education: ((data.education as Education[]) ?? []).map((e, i) => ({
    ...e,
    year: e.year ? String(e.year) : "",
    sort_order: e.sort_order ?? i,
  })),
  skills: (data.skills as Skill[]) ?? [],
});

// ── Main component ─────────────────────────────────────────

type SectionKey = "about" | "skills" | "experience" | "education" | "links";
const DEFAULT_SECTION_ORDER: SectionKey[] = ["links", "about", "skills", "experience", "education"];

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [edited, setEdited] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(DEFAULT_SECTION_ORDER);
  const [newLink, setNewLink] = useState({ type: "", url: "" });
  const [showAddLink, setShowAddLink] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (data) {
          const p = normalize(data);
          setProfile(p);
          setEdited(p);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // ── Save — diffs each section and makes individual API calls ──
  const handleSave = async () => {
    if (!edited || !profile) return;
    setSaving(true);
    try {
      // 1. Core profile fields
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: edited.bio, title: edited.title, location: edited.location }),
      });

      // 2. Links — add new, update existing, delete removed
      const deletedLinks = profile.links.filter((l) => l.id && !edited.links.find((el) => el.id === l.id));
      const addedLinks = edited.links.filter((l) => !l.id);
      const updatedLinks = edited.links.filter((l) => l.id);

      await Promise.all([
        ...deletedLinks.map((l) => fetch(`/api/profile/link/${l.id}`, { method: "DELETE" })),
        ...addedLinks.map((l) => fetch("/api/profile/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(l) })),
        ...updatedLinks.map((l) => fetch(`/api/profile/link/${l.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(l) })),
      ]);

      // 3. Experience
      const deletedExp = profile.experience.filter((e) => e.id && !edited.experience.find((ee) => ee.id === e.id));
      const addedExp = edited.experience.filter((e) => !e.id);
      const updatedExp = edited.experience.filter((e) => e.id);

      await Promise.all([
        ...deletedExp.map((e) => fetch(`/api/profile/experience/${e.id}`, { method: "DELETE" })),
        ...addedExp.map((e) => fetch("/api/profile/experience", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) })),
        ...updatedExp.map((e) => fetch(`/api/profile/experience/${e.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) })),
      ]);

      // 4. Education
      const deletedEdu = profile.education.filter((e) => e.id && !edited.education.find((ee) => ee.id === e.id));
      const addedEdu = edited.education.filter((e) => !e.id);
      const updatedEdu = edited.education.filter((e) => e.id);

      await Promise.all([
        ...deletedEdu.map((e) => fetch(`/api/profile/education/${e.id}`, { method: "DELETE" })),
        ...addedEdu.map((e) => fetch("/api/profile/education", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) })),
        ...updatedEdu.map((e) => fetch(`/api/profile/education/${e.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) })),
      ]);

      // Re-fetch to get server state with IDs
      const res = await fetch("/api/profile");
      const fresh = await res.json();
      const p = normalize(fresh);
      setProfile(p);
      setEdited(p);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEdited(profile);
    setIsEditing(false);
    setNewLink({ type: "", url: "" });
    setShowAddLink(false);
  };

  // ── Skills (immediate — no edit mode needed) ───────────────
  const addSkill = async (skill: Skill) => {
    if (!edited) return;
    if (edited.skills.find((s) => s.id === skill.id)) return;
    await fetch("/api/profile/skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill_id: skill.id }),
    });
    setEdited({ ...edited, skills: [...edited.skills, skill] });
    setProfile((p) => p ? { ...p, skills: [...p.skills, skill] } : p);
  };

  const removeSkill = async (skillId: number) => {
    if (!edited) return;
    await fetch(`/api/profile/skill/${skillId}`, { method: "DELETE" });
    setEdited({ ...edited, skills: edited.skills.filter((s) => s.id !== skillId) });
    setProfile((p) => p ? { ...p, skills: p.skills.filter((s) => s.id !== skillId) } : p);
  };

  // ── Field helpers ──────────────────────────────────────────
  const updateField = (field: keyof Profile, value: string) => {
    if (!edited) return;
    setEdited({ ...edited, [field]: value });
  };

  const addLink = () => {
    if (!edited || !newLink.type.trim() || !newLink.url.trim()) return;
    setEdited({ ...edited, links: [...edited.links, { type: newLink.type.trim(), url: newLink.url.trim(), sort_order: edited.links.length }] });
    setNewLink({ type: "", url: "" });
    setShowAddLink(false);
  };

  const removeLink = (index: number) => {
    if (!edited) return;
    setEdited({ ...edited, links: edited.links.filter((_, i) => i !== index) });
  };

  const updateLink = (index: number, field: "type" | "url", value: string) => {
    if (!edited) return;
    const updated = [...edited.links];
    updated[index] = { ...updated[index], [field]: value };
    setEdited({ ...edited, links: updated });
  };

  const addExperience = () => {
    if (!edited) return;
    setEdited({ ...edited, experience: [...edited.experience, { company: "", role: "", started_at: null, ended_at: null, currently_working: false, description: "", sort_order: edited.experience.length }] });
  };

  const removeExperience = (index: number) => {
    if (!edited) return;
    setEdited({ ...edited, experience: edited.experience.filter((_, i) => i !== index) });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | boolean | null) => {
    if (!edited) return;
    const updated = [...edited.experience];
    updated[index] = { ...updated[index], [field]: value };
    setEdited({ ...edited, experience: updated });
  };

  const addEducation = () => {
    if (!edited) return;
    setEdited({ ...edited, education: [...edited.education, { institution: "", degree: "", year: "", sort_order: edited.education.length }] });
  };

  const removeEducation = (index: number) => {
    if (!edited) return;
    setEdited({ ...edited, education: edited.education.filter((_, i) => i !== index) });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    if (!edited) return;
    const updated = [...edited.education];
    updated[index] = { ...updated[index], [field]: value };
    setEdited({ ...edited, education: updated });
  };

  // ── Drag and drop ──────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as SectionKey);
      const newIndex = sectionOrder.indexOf(over.id as SectionKey);
      setSectionOrder(arrayMove(sectionOrder, oldIndex, newIndex));
    }
  };

  // ── Loading / empty states ─────────────────────────────────
  if (loading) {
    return (
      <GridBackground>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <span className="font-mono text-neutral-400">loading...</span>
        </main>
        <Footer />
      </GridBackground>
    );
  }

  if (!edited) {
    return (
      <GridBackground>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <span className="font-mono text-neutral-400">failed to load profile</span>
        </main>
        <Footer />
      </GridBackground>
    );
  }

  // ── Section renderers ──────────────────────────────────────
  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "about":
        return (
          <section key={key} className="mb-8">
            <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">About</h2>
            {isEditing ? (
              <textarea
                value={edited.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                rows={4}
                placeholder="Write something about yourself..."
                className="font-mono text-neutral-600 leading-relaxed w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none p-3 resize-none rounded"
              />
            ) : edited.bio ? (
              <p className="font-mono text-neutral-600 leading-relaxed">{edited.bio}</p>
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
              {edited.skills.map((skill) => (
                <span key={skill.id} className="font-mono text-xs px-3 py-1.5 bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center gap-2 rounded">
                  {skill.name}
                  {isEditing && (
                    <button onClick={() => removeSkill(skill.id)} className="text-red-400 hover:text-red-600 ml-1">×</button>
                  )}
                </span>
              ))}
              {isEditing && <SkillSearch onAdd={addSkill} />}
            </div>
          </section>
        );

      case "experience":
        return (
          <section key={key} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">Experience</h2>
              {isEditing && (
                <button onClick={addExperience} className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded">+ add</button>
              )}
            </div>
            <div className="space-y-4">
              {edited.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-neutral-200 pl-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => updateExperience(index, "role", e.target.value)}
                          placeholder="Role"
                          className="font-mono font-semibold text-neutral-800 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 flex-1 rounded"
                        />
                        <button onClick={() => removeExperience(index)} className="text-red-400 hover:text-red-600 text-sm px-2">×</button>
                      </div>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                        placeholder="Company"
                        className="font-mono text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={exp.started_at ?? ""}
                          onChange={(e) => updateExperience(index, "started_at", e.target.value || null)}
                          className="font-mono text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 rounded"
                        />
                        {!exp.currently_working && (
                          <input
                            type="date"
                            value={exp.ended_at ?? ""}
                            onChange={(e) => updateExperience(index, "ended_at", e.target.value || null)}
                            className="font-mono text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 rounded"
                          />
                        )}
                        <label className="flex items-center gap-1 font-mono text-xs text-neutral-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exp.currently_working}
                            onChange={(e) => updateExperience(index, "currently_working", e.target.checked)}
                          />
                          currently working
                        </label>
                      </div>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, "description", e.target.value)}
                        placeholder="Description"
                        rows={2}
                        className="font-mono text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 resize-none rounded"
                      />
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
              {edited.experience.length === 0 && !isEditing && (
                <p className="font-mono text-neutral-300 italic">No experience added</p>
              )}
            </div>
          </section>
        );

      case "education":
        return (
          <section key={key} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">Education</h2>
              {isEditing && (
                <button onClick={addEducation} className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded">+ add</button>
              )}
            </div>
            <div className="space-y-4">
              {edited.education.map((edu, index) => (
                <div key={index}>
                  {isEditing ? (
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, "degree", e.target.value)}
                          placeholder="Degree"
                          className="font-mono font-semibold text-neutral-800 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded"
                        />
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, "institution", e.target.value)}
                          placeholder="Institution"
                          className="font-mono text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded"
                        />
                      </div>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => updateEducation(index, "year", e.target.value)}
                        placeholder="Year"
                        className="font-mono text-xs text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-20 px-2 py-1 text-right rounded"
                      />
                      <button onClick={() => removeEducation(index)} className="text-red-400 hover:text-red-600 text-sm px-2 mt-1">×</button>
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
              {edited.education.length === 0 && !isEditing && (
                <p className="font-mono text-neutral-300 italic">No education added</p>
              )}
            </div>
          </section>
        );

      case "links":
        return (
          <section key={key} className="mb-8">
            <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">Links</h2>
            {isEditing ? (
              <div className="space-y-2">
                {edited.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={link.type}
                      onChange={(e) => updateLink(index, "type", e.target.value)}
                      placeholder="Type"
                      className="font-mono text-sm bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 w-24 rounded"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => updateLink(index, "url", e.target.value)}
                      placeholder="URL"
                      className="font-mono text-sm bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 flex-1 rounded"
                    />
                    <button onClick={() => removeLink(index)} className="text-red-400 hover:text-red-600 text-sm px-2">×</button>
                  </div>
                ))}
                {showAddLink ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={newLink.type}
                      onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
                      placeholder="Type (e.g., github)"
                      className="font-mono text-sm bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 w-32 rounded"
                    />
                    <input
                      type="text"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && addLink()}
                      placeholder="URL"
                      className="font-mono text-sm bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 flex-1 rounded"
                    />
                    <button onClick={addLink} disabled={!newLink.type || !newLink.url} className="font-mono text-xs px-3 py-1.5 bg-neutral-800 text-white rounded hover:bg-neutral-700 disabled:opacity-50">Add</button>
                    <button onClick={() => { setShowAddLink(false); setNewLink({ type: "", url: "" }); }} className="text-neutral-400 hover:text-neutral-600 text-sm px-2">×</button>
                  </div>
                ) : (
                  <button onClick={() => setShowAddLink(true)} className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded">+ add link</button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {edited.links.map((link, index) => (
                  <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-neutral-600 hover:text-neutral-800 transition-colors">
                    [{link.type}]
                  </a>
                ))}
                {edited.links.length === 0 && <p className="font-mono text-neutral-300 italic">No links added</p>}
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
              <div className="absolute top-4 right-4 flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={handleCancel} className="font-mono text-xs px-3 py-1.5 border border-neutral-300 text-neutral-500 hover:bg-neutral-100 transition-colors rounded">cancel</button>
                    <button onClick={handleSave} disabled={saving} className="font-mono text-xs px-3 py-1.5 bg-neutral-800 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50 rounded">
                      {saving ? "saving..." : "save"}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="font-mono text-xs px-3 py-1.5 border border-neutral-300 text-neutral-500 hover:bg-neutral-100 transition-colors rounded">edit</button>
                )}
              </div>

              {/* Header */}
              <div className="flex items-start gap-6 mb-8 pb-6 border-b border-neutral-200">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-200 shrink-0">
                  {edited.icon ? (
                    <Image src={edited.icon} alt={edited.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                      <span className="font-mono text-2xl text-neutral-400">{edited.name?.charAt(0) ?? "?"}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input type="text" value={edited.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Your name" className="font-mono font-bold text-2xl text-neutral-800 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded" />
                      <input type="text" value={edited.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Your title" className="font-mono text-lg text-neutral-500 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded" />
                      <div className="flex gap-2">
                        <input type="text" value={edited.location} onChange={(e) => updateField("location", e.target.value)} placeholder="Location" className="font-mono text-sm text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none flex-1 px-2 py-1 rounded" />
                        <input type="email" value={edited.email} onChange={(e) => updateField("email", e.target.value)} placeholder="Email" className="font-mono text-sm text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none flex-1 px-2 py-1 rounded" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="font-mono font-bold text-3xl text-neutral-800">{edited.name}</h1>
                      <p className="font-mono text-lg text-neutral-500 mt-1">{edited.title}</p>
                      <p className="font-mono text-sm text-neutral-400 mt-2">{edited.location} · {edited.email}</p>
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
                  <p className="font-mono text-xs text-neutral-400 mb-4">Drag sections to reorder</p>
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
