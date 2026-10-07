import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiFetch, jsonBody } from "@/lib/utils/api";

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
  /** "" when the BE sends null. */
  degree: string;
  year: string;
  sort_order: number;
}

/** Education as the BE sends it, before `normalizeProfile` fills the defaults. */
type RawEducation = Omit<Education, "degree" | "year"> & {
  degree: string | null;
  year: string | number | null;
};

export interface Skill {
  id: number;
  name: string;
  level: number;
  parent_id: number | null;
}

export interface Profile {
  id: string;
  /** Public slug (`users.user_id`) — use this, not `id`, in any URL. */
  user_id: string;
  name: string;
  email: string;
  icon: string;
  bio: string;
  title: string;
  location: string;
  /** The saved version, sent back with a save so a stale edit is refused. Null before the first save. */
  updated_at: string | null;
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
  user_id:  (data.user_id as string) ?? "",
  name:     (data.name as string)  ?? "",
  email:    (data.email as string) ?? "",
  icon:     (data.icon as string)  ?? "",
  bio:      (data.bio as string)   ?? "",
  title:    (data.title as string) ?? "",
  location: (data.location as string) ?? "",
  updated_at: (data.updated_at as string) ?? null,
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
  education: ((data.education as RawEducation[]) ?? []).map((e, i) => ({
    ...e,
    degree:     e.degree ?? "",
    year:       e.year ? String(e.year) : "",
    sort_order: e.sort_order ?? i,
  })),
  skills: (data.skills as Skill[]) ?? [],
});

// ── Helpers ────────────────────────────────────────────────

export const PROFILE_KEY = ["profile"] as const;

// apiFetch, the JSON body helper, and the error envelope live in lib/utils/api —
// they were duplicated here and in connection.ts, which meant profile errors and
// connection errors behaved differently for the same backend response.
const json = jsonBody;

// ── Profile ────────────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    // the signal lets a superseded refetch actually abort instead of still hitting the network
    queryFn: async ({ signal }) => {
      const data = await apiFetch<Record<string, unknown>>("/api/profile", { signal });
      if (!data) throw new Error("Profile not found");
      return normalizeProfile(data);
    },
  });
}

// ── Save ───────────────────────────────────────────────────

type RowPatch<T> = Omit<T, "id" | "sort_order"> & { id?: number };

/**
 * PATCH /profile. Every key is optional; an absent key is left alone. A list is that section's
 * final state, in display order: a row with `id` is kept (and updated if it changed), a row
 * without one is added, and a saved row missing from the list is removed.
 */
export interface ProfilePatch {
  name?: string;
  title?: string;
  location?: string;
  bio?: string;
  section_config?: SectionConfig[];
  links?: RowPatch<Link>[];
  experience?: RowPatch<Experience>[];
  education?: RowPatch<Education>[];
  updated_at?: string | null;
}

/** One request, all-or-nothing. The response is the saved profile, so there is no refetch. */
export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfilePatch) =>
      apiFetch<Record<string, unknown>>("/api/profile", { method: "PATCH", ...json(patch) }),
    onSuccess: (data) => qc.setQueryData(PROFILE_KEY, normalizeProfile(data)),
    // Refused as stale: the cached profile is the old version, and editing again would reseed
    // from it and be refused again. Refetch so the next edit starts from what was saved.
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) qc.invalidateQueries({ queryKey: PROFILE_KEY });
    },
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
