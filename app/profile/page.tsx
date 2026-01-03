"use client";

import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
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

// Redirect to home page - coming soon mode
redirect("/");

// Sortable Item Component
function SortableSectionItem({
  id,
  label,
  index,
}: {
  id: string;
  label: string;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <span className="text-neutral-400 text-xs">⋮⋮</span>
      <span className="font-mono text-sm text-neutral-600 flex-1">{label}</span>
      <span className="font-mono text-xs text-neutral-300">{index + 1}</span>
    </div>
  );
}

interface User {
  id: number;
  name: string;
  title: string;
  email: string;
  avatarUrl: string;
  location: string;
  bio: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  links: {
    type: string;
    url: string;
  }[];
  sectionOrder?: string[];
}

type SectionKey = "about" | "skills" | "experience" | "education" | "links";

const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "links",
  "about",
  "skills",
  "experience",
  "education",
];

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(DEFAULT_SECTION_ORDER);
  const [newSkill, setNewSkill] = useState("");
  const [newLink, setNewLink] = useState({ type: "", url: "" });
  const [showAddLink, setShowAddLink] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        setUser(data);
        setEditedUser(data);
        if (data.sectionOrder) {
          setSectionOrder(data.sectionOrder);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!editedUser) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editedUser, sectionOrder }),
      });
      const data = await res.json();
      setUser(data);
      setEditedUser(data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
    setNewSkill("");
    setNewLink({ type: "", url: "" });
    setShowAddLink(false);
  };

  const updateField = (field: keyof User, value: string | string[]) => {
    if (!editedUser) return;
    setEditedUser({ ...editedUser, [field]: value });
  };

  // Skills
  const addSkill = () => {
    if (!editedUser || !newSkill.trim()) return;
    setEditedUser({ ...editedUser, skills: [...editedUser.skills, newSkill.trim()] });
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    if (!editedUser) return;
    setEditedUser({
      ...editedUser,
      skills: editedUser.skills.filter((_, i) => i !== index),
    });
  };

  const moveSkill = (index: number, direction: "up" | "down") => {
    if (!editedUser) return;
    const newSkills = [...editedUser.skills];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSkills.length) return;
    [newSkills[index], newSkills[newIndex]] = [newSkills[newIndex], newSkills[index]];
    setEditedUser({ ...editedUser, skills: newSkills });
  };

  // Links
  const addLink = () => {
    if (!editedUser || !newLink.type.trim() || !newLink.url.trim()) return;
    setEditedUser({
      ...editedUser,
      links: [...editedUser.links, { type: newLink.type.trim(), url: newLink.url.trim() }],
    });
    setNewLink({ type: "", url: "" });
    setShowAddLink(false);
  };

  const removeLink = (index: number) => {
    if (!editedUser) return;
    setEditedUser({
      ...editedUser,
      links: editedUser.links.filter((_, i) => i !== index),
    });
  };

  const updateLink = (index: number, field: "type" | "url", value: string) => {
    if (!editedUser) return;
    const newLinks = [...editedUser.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setEditedUser({ ...editedUser, links: newLinks });
  };

  const moveLink = (index: number, direction: "up" | "down") => {
    if (!editedUser) return;
    const newLinks = [...editedUser.links];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newLinks.length) return;
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
    setEditedUser({ ...editedUser, links: newLinks });
  };

  // Experience
  const addExperience = () => {
    if (!editedUser) return;
    setEditedUser({
      ...editedUser,
      experience: [
        ...editedUser.experience,
        { company: "", role: "", duration: "", description: "" },
      ],
    });
  };

  const removeExperience = (index: number) => {
    if (!editedUser) return;
    setEditedUser({
      ...editedUser,
      experience: editedUser.experience.filter((_, i) => i !== index),
    });
  };

  const updateExperience = (
    index: number,
    field: keyof User["experience"][0],
    value: string
  ) => {
    if (!editedUser) return;
    const newExp = [...editedUser.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setEditedUser({ ...editedUser, experience: newExp });
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
    if (!editedUser) return;
    const newExp = [...editedUser.experience];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newExp.length) return;
    [newExp[index], newExp[newIndex]] = [newExp[newIndex], newExp[index]];
    setEditedUser({ ...editedUser, experience: newExp });
  };

  // Education
  const addEducation = () => {
    if (!editedUser) return;
    setEditedUser({
      ...editedUser,
      education: [
        ...editedUser.education,
        { institution: "", degree: "", year: "" },
      ],
    });
  };

  const removeEducation = (index: number) => {
    if (!editedUser) return;
    setEditedUser({
      ...editedUser,
      education: editedUser.education.filter((_, i) => i !== index),
    });
  };

  const updateEducation = (
    index: number,
    field: keyof User["education"][0],
    value: string
  ) => {
    if (!editedUser) return;
    const newEdu = [...editedUser.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setEditedUser({ ...editedUser, education: newEdu });
  };

  const moveEducation = (index: number, direction: "up" | "down") => {
    if (!editedUser) return;
    const newEdu = [...editedUser.education];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newEdu.length) return;
    [newEdu[index], newEdu[newIndex]] = [newEdu[newIndex], newEdu[index]];
    setEditedUser({ ...editedUser, education: newEdu });
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for section reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as SectionKey);
      const newIndex = sectionOrder.indexOf(over.id as SectionKey);
      setSectionOrder(arrayMove(sectionOrder, oldIndex, newIndex));
    }
  };

  const getSectionLabel = (key: SectionKey) => {
    const labels: Record<SectionKey, string> = {
      about: "About",
      skills: "Skills",
      experience: "Experience",
      education: "Education",
      links: "Links",
    };
    return labels[key];
  };

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

  if (!user || !editedUser) {
    return (
      <GridBackground>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <span className="font-mono text-neutral-400">
            failed to load profile
          </span>
        </main>
        <Footer />
      </GridBackground>
    );
  }

  const renderSection = (sectionKey: SectionKey) => {
    switch (sectionKey) {
      case "about":
        return (
          <section key={sectionKey} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">
                About
              </h2>
              {isEditing && editedUser.bio && (
                <button
                  onClick={() => updateField("bio", "")}
                  className="font-mono text-xs text-red-400 hover:text-red-600"
                >
                  clear
                </button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={editedUser.bio}
                onChange={(e) => updateField("bio", e.target.value)}
                rows={4}
                placeholder="Write something about yourself..."
                className="font-mono text-neutral-600 leading-relaxed w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none p-3 resize-none rounded"
              />
            ) : editedUser.bio ? (
              <p className="font-mono text-neutral-600 leading-relaxed">
                {editedUser.bio}
              </p>
            ) : (
              <p className="font-mono text-neutral-300 italic">No bio added</p>
            )}
          </section>
        );

      case "skills":
        return (
          <section key={sectionKey} className="mb-8">
            <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {editedUser.skills.map((skill, index) => (
                <span
                  key={index}
                  className="font-mono text-xs px-3 py-1.5 bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center gap-2 rounded"
                >
                  {isEditing && (
                    <div className="flex flex-col -my-1 mr-1">
                      <button
                        onClick={() => moveSkill(index, "up")}
                        disabled={index === 0}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 text-[10px] leading-none"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveSkill(index, "down")}
                        disabled={index === editedUser.skills.length - 1}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 text-[10px] leading-none"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-red-400 hover:text-red-600 ml-1"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
              {isEditing && (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    placeholder="Add skill..."
                    className="font-mono text-xs px-3 py-1.5 border border-dashed border-neutral-300 text-neutral-600 bg-transparent focus:border-neutral-400 outline-none w-28 rounded"
                  />
                  {newSkill && (
                    <button
                      onClick={addSkill}
                      className="font-mono text-xs px-2 py-1.5 bg-neutral-800 text-white rounded hover:bg-neutral-700"
                    >
                      +
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        );

      case "experience":
        return (
          <section key={sectionKey} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">
                Experience
              </h2>
              {isEditing && (
                <button
                  onClick={addExperience}
                  className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded"
                >
                  + add
                </button>
              )}
            </div>
            <div className="space-y-4">
              {editedUser.experience.map((exp, index) => (
                <div
                  key={index}
                  className="border-l-2 border-neutral-200 pl-4 relative group"
                >
                  {isEditing && (
                    <div className="absolute -left-6 top-0 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveExperience(index, "up")}
                        disabled={index === 0}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 text-xs"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveExperience(index, "down")}
                        disabled={index === editedUser.experience.length - 1}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 text-xs"
                      >
                        ▼
                      </button>
                    </div>
                  )}
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
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => updateExperience(index, "duration", e.target.value)}
                          placeholder="Duration"
                          className="font-mono text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none px-2 py-1 w-32 rounded"
                        />
                        <button
                          onClick={() => removeExperience(index)}
                          className="text-red-400 hover:text-red-600 text-sm px-2"
                        >
                          ×
                        </button>
                      </div>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                        placeholder="Company"
                        className="font-mono text-sm text-neutral-500 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded"
                      />
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
                        <h3 className="font-mono font-semibold text-neutral-800">
                          {exp.role || <span className="text-neutral-300 italic">No role</span>}
                        </h3>
                        <span className="font-mono text-xs text-neutral-400">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="font-mono text-sm text-neutral-500">
                        {exp.company}
                      </p>
                      <p className="font-mono text-sm text-neutral-600 mt-1">
                        {exp.description}
                      </p>
                    </>
                  )}
                </div>
              ))}
              {editedUser.experience.length === 0 && !isEditing && (
                <p className="font-mono text-neutral-300 italic">No experience added</p>
              )}
            </div>
          </section>
        );

      case "education":
        return (
          <section key={sectionKey} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider">
                Education
              </h2>
              {isEditing && (
                <button
                  onClick={addEducation}
                  className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded"
                >
                  + add
                </button>
              )}
            </div>
            <div className="space-y-4">
              {editedUser.education.map((edu, index) => (
                <div key={index} className="relative group">
                  {isEditing && (
                    <div className="absolute -left-6 top-0 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveEducation(index, "up")}
                        disabled={index === 0}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 text-xs"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveEducation(index, "down")}
                        disabled={index === editedUser.education.length - 1}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 text-xs"
                      >
                        ▼
                      </button>
                    </div>
                  )}
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
                      <button
                        onClick={() => removeEducation(index)}
                        className="text-red-400 hover:text-red-600 text-sm px-2 mt-1"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <div>
                        <h3 className="font-mono font-semibold text-neutral-800">
                          {edu.degree || <span className="text-neutral-300 italic">No degree</span>}
                        </h3>
                        <p className="font-mono text-sm text-neutral-500">
                          {edu.institution}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-neutral-400">
                        {edu.year}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {editedUser.education.length === 0 && !isEditing && (
                <p className="font-mono text-neutral-300 italic">No education added</p>
              )}
            </div>
          </section>
        );

      case "links":
        return (
          <section key={sectionKey} className="mb-8">
            <h2 className="font-mono font-semibold text-sm text-neutral-400 uppercase tracking-wider mb-3">
              Links
            </h2>
            {isEditing ? (
              <div className="space-y-2">
                {editedUser.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveLink(index, "up")}
                        disabled={index === 0}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 text-xs"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveLink(index, "down")}
                        disabled={index === editedUser.links.length - 1}
                        className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30 text-xs"
                      >
                        ▼
                      </button>
                    </div>
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
                    <button
                      onClick={() => removeLink(index)}
                      className="text-red-400 hover:text-red-600 text-sm px-2"
                    >
                      ×
                    </button>
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
                    <button
                      onClick={addLink}
                      disabled={!newLink.type || !newLink.url}
                      className="font-mono text-xs px-3 py-1.5 bg-neutral-800 text-white rounded hover:bg-neutral-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddLink(false);
                        setNewLink({ type: "", url: "" });
                      }}
                      className="text-neutral-400 hover:text-neutral-600 text-sm px-2"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddLink(true)}
                    className="font-mono text-xs px-2 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded"
                  >
                    + add link
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {editedUser.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
                  >
                    [{link.type}]
                  </a>
                ))}
                {editedUser.links.length === 0 && (
                  <p className="font-mono text-neutral-300 italic">No links added</p>
                )}
              </div>
            )}
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <GridBackground>
      <Navbar />
      <main className="flex-1 px-8 py-6 overflow-auto">
        <div className={`mx-auto ${isEditing ? "max-w-5xl" : "max-w-3xl"}`}>
          <div className={`flex gap-6 ${isEditing ? "" : "justify-center"}`}>
            {/* Main Profile Card */}
            <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-8 relative flex-1 max-w-3xl">
              {/* Edit/Save Button */}
              <div className="absolute top-4 right-4 flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="font-mono text-xs px-3 py-1.5 border border-neutral-300 text-neutral-500 hover:bg-neutral-100 transition-colors rounded"
                    >
                      cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="font-mono text-xs px-3 py-1.5 bg-neutral-800 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50 rounded"
                    >
                      {saving ? "saving..." : "save"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="font-mono text-xs px-3 py-1.5 border border-neutral-300 text-neutral-500 hover:bg-neutral-100 transition-colors rounded"
                  >
                    edit
                  </button>
                )}
              </div>

              {/* Header */}
              <div className="flex items-start gap-6 mb-8 pb-6 border-b border-neutral-200">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-200 shrink-0">
                  <Image
                    src={editedUser.avatarUrl}
                    alt={editedUser.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editedUser.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Your name"
                        className="font-mono font-bold text-2xl text-neutral-800 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded"
                      />
                      <input
                        type="text"
                        value={editedUser.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder="Your title"
                        className="font-mono text-lg text-neutral-500 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none w-full px-2 py-1 rounded"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editedUser.location}
                          onChange={(e) => updateField("location", e.target.value)}
                          placeholder="Location"
                          className="font-mono text-sm text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none flex-1 px-2 py-1 rounded"
                        />
                        <input
                          type="email"
                          value={editedUser.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="Email"
                          className="font-mono text-sm text-neutral-400 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white outline-none flex-1 px-2 py-1 rounded"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="font-mono font-bold text-3xl text-neutral-800">
                        {editedUser.name}
                      </h1>
                      <p className="font-mono text-lg text-neutral-500 mt-1">
                        {editedUser.title}
                      </p>
                      <p className="font-mono text-sm text-neutral-400 mt-2">
                        {editedUser.location} · {editedUser.email}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Sections in order */}
              {sectionOrder.map((sectionKey) => renderSection(sectionKey))}
            </div>

            {/* Section Order Panel - Only visible when editing */}
            {isEditing && (
              <div className="w-56 shrink-0">
                <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 p-4 sticky top-6">
                  <h3 className="font-mono font-semibold text-sm text-neutral-800 mb-3">
                    Section Order
                  </h3>
                  <p className="font-mono text-xs text-neutral-400 mb-4">
                    Drag sections to reorder
                  </p>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sectionOrder}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {sectionOrder.map((sectionKey, index) => (
                          <SortableSectionItem
                            key={sectionKey}
                            id={sectionKey}
                            label={getSectionLabel(sectionKey)}
                            index={index}
                          />
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
