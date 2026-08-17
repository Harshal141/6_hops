import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/utils/api";

// ── Types ──────────────────────────────────────────────────

export type SectionKey = "about" | "skills" | "experience" | "education" | "links";

export interface SectionConfig {
  key: SectionKey;
  visible: boolean;
}

export interface Link {
  id?: number;
  type: string;
  url: string;
  sort_order: number;
}

export interface Experience {
  id?: number;
  company: string;
  role: string;
  started_at: string | null;
  ended_at: string | null;
  currently_working: boolean;
  description: string;
  sort_order: number;
}

export interface Education {
  id?: number;
  institution: string;
  degree: string;
  year: string;
  sort_order: number;
}

export interface Skill {
  id: number;
  name: string;
  level: number;
  parent_id: number | null;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  icon: string;
  bio: string;
  title: string;
  location: string;
  section_config: SectionConfig[];
  links: Link[];
  experience: Experience[];
  education: Education[];
  skills: Skill[];
}

// ── Defaults ───────────────────────────────────────────────

export const DEFAULT_SECTION_CONFIG: SectionConfig[] = [
  { key: "links",      visible: true },
  { key: "about",      visible: true },
  { key: "skills",     visible: true },
  { key: "experience", visible: true },
  { key: "education",  visible: true },
];

// ── Normalise raw API response → Profile ───────────────────

export const normalizeProfile = (data: Record<string, unknown>): Profile => ({
  id:       (data.id as string)    ?? "",
  name:     (data.name as string)  ?? "",
  email:    (data.email as string) ?? "",
  icon:     (data.icon as string)  ?? "",
  bio:      (data.bio as string)   ?? "",
  title:    (data.title as string) ?? "",
  location: (data.location as string) ?? "",
  section_config: (data.section_config as SectionConfig[]) ?? DEFAULT_SECTION_CONFIG,
  links: ((data.links as Link[]) ?? []).map((l, i) => ({
    ...l, sort_order: l.sort_order ?? i,
  })),
  experience: ((data.experience as Experience[]) ?? []).map((e, i) => ({
    ...e,
    started_at:       e.started_at ?? null,
    ended_at:         e.ended_at ?? null,
    currently_working: e.currently_working ?? false,
    description:      e.description ?? "",
    sort_order:       e.sort_order ?? i,
  })),
  education: ((data.education as Education[]) ?? []).map((e, i) => ({
    ...e,
    year:       e.year ? String(e.year) : "",
    sort_order: e.sort_order ?? i,
  })),
  skills: (data.skills as Skill[]) ?? [],
});

// ── Helpers ────────────────────────────────────────────────

const PROFILE_KEY = ["profile"] as const;

// apiFetch, the JSON body helper, and the error envelope live in lib/utils/api —
// they were duplicated here and in connection.ts, which meant profile errors and
// connection errors behaved differently for the same backend response.
const json = jsonBody;

// ── User ───────────────────────────────────────────────────

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) =>
      apiFetch("/api/user", { method: "PUT", ...json(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

// ── Profile ────────────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const data = await apiFetch<Record<string, unknown>>("/api/profile");
      if (!data) throw new Error("Profile not found");
      return normalizeProfile(data);
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Pick<Profile, "bio" | "title" | "location" | "section_config">>) =>
      apiFetch("/api/profile", { method: "PUT", ...json(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

// ── Links ──────────────────────────────────────────────────

export function useAddLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Link, "id">) =>
      apiFetch("/api/profile/link", { method: "POST", ...json(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

export function useUpdateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Link & { id: number }) =>
      apiFetch(`/api/profile/link/${id}`, { method: "PUT", ...json(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

export function useDeleteLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/profile/link/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

// ── Experience ─────────────────────────────────────────────

export function useAddExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Experience, "id">) =>
      apiFetch("/api/profile/experience", { method: "POST", ...json(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

export function useUpdateExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Experience & { id: number }) =>
      apiFetch(`/api/profile/experience/${id}`, { method: "PUT", ...json(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

export function useDeleteExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/profile/experience/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

// ── Education ──────────────────────────────────────────────

export function useAddEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Education, "id">) =>
      apiFetch("/api/profile/education", { method: "POST", ...json(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

export function useUpdateEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Education & { id: number }) =>
      apiFetch(`/api/profile/education/${id}`, { method: "PUT", ...json(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

export function useDeleteEducation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/profile/education/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

// ── Skills ─────────────────────────────────────────────────

export function useAddSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (skill: Skill) =>
      apiFetch("/api/profile/skill", { method: "POST", ...json({ skill_id: skill.id }) }),
    onMutate: async (skill) => {
      await qc.cancelQueries({ queryKey: PROFILE_KEY });
      const prev = qc.getQueryData<Profile>(PROFILE_KEY);
      if (prev) qc.setQueryData<Profile>(PROFILE_KEY, { ...prev, skills: [...prev.skills, skill] });
      return { prev };
    },
    onError: (_e, _s, ctx) => { if (ctx?.prev) qc.setQueryData(PROFILE_KEY, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

export function useRemoveSkill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (skillId: number) =>
      apiFetch(`/api/profile/skill/${skillId}`, { method: "DELETE" }),
    onMutate: async (skillId) => {
      await qc.cancelQueries({ queryKey: PROFILE_KEY });
      const prev = qc.getQueryData<Profile>(PROFILE_KEY);
      if (prev) qc.setQueryData<Profile>(PROFILE_KEY, { ...prev, skills: prev.skills.filter((s) => s.id !== skillId) });
      return { prev };
    },
    onError: (_e, _s, ctx) => { if (ctx?.prev) qc.setQueryData(PROFILE_KEY, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
}

// ── Skill search ───────────────────────────────────────────

export function useSearchSkills(query: string) {
  const isDefault = query.trim().length === 0;
  return useQuery({
    queryKey: ["skill-search", query],
    queryFn: () => apiFetch<Skill[]>(`/api/skill/search?q=${encodeURIComponent(query)}`),
    enabled: true,
    staleTime: isDefault ? 5 * 60_000 : 60_000,
  });
}
