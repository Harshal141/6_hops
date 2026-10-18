import type { Education, Experience, Profile } from "@/lib/hooks/profile";

/**
 * A profile as a short read-out: the "what we filled in" panel in setup. Pure, so the
 * ordering and caps are tested without rendering.
 */

/** Experience or education saved. Imports only go into a profile without either (the BE answers 409 otherwise). */
export function hasProfileDetails(profile: Pick<Profile, "experience" | "education"> | undefined): boolean {
  return Boolean(profile && (profile.experience.length > 0 || profile.education.length > 0));
}

/**
 * Anything a person would recognise as their details: a headline, an about, a role, a school
 * or a skill. Wider than hasProfileDetails, which only decides whether an import may run.
 */
export function hasProfileContent(
  profile: Pick<Profile, "title" | "bio" | "experience" | "education" | "skills"> | undefined,
): boolean {
  if (!profile) return false;
  return hasProfileDetails(profile) || profile.skills.length > 0 || Boolean(profile.title.trim() || profile.bio.trim());
}

export interface SummaryLine {
  key: string;
  label: string;
}

export interface ProfileSummary {
  headline: string;
  roles: SummaryLine[];
  schools: SummaryLine[];
  skills: string[];
  /** Skills past the cap, for a "+N more". */
  moreSkills: number;
}

export interface SummaryLimits {
  roles: number;
  schools: number;
  skills: number;
}

export const DEFAULT_SUMMARY_LIMITS: SummaryLimits = { roles: 2, schools: 2, skills: 6 };

const joinParts = (...parts: string[]) => parts.map((part) => part.trim()).filter(Boolean).join(" · ");

/** Latest first: current roles, then by start date (undated last), then display order. */
export function latestExperience(experience: readonly Experience[]): Experience[] {
  return experience
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      if (a.row.currently_working !== b.row.currently_working) return a.row.currently_working ? -1 : 1;
      const aStart = a.row.started_at ?? "";
      const bStart = b.row.started_at ?? "";
      if (aStart !== bStart) {
        if (!aStart) return 1;
        if (!bStart) return -1;
        return aStart < bStart ? 1 : -1;
      }
      return a.index - b.index;
    })
    .map(({ row }) => row);
}

const roleLine = (row: Experience, index: number): SummaryLine => ({
  key: String(row.id ?? `new-${index}`),
  label: joinParts(row.role, row.company),
});

const schoolLine = (row: Education, index: number): SummaryLine => ({
  key: String(row.id ?? `new-${index}`),
  label: joinParts(row.institution, row.degree),
});

export function summarizeProfile(
  profile: Pick<Profile, "title" | "experience" | "education" | "skills">,
  limits: SummaryLimits = DEFAULT_SUMMARY_LIMITS,
): ProfileSummary {
  const skills = profile.skills.map((skill) => skill.name);
  return {
    headline: profile.title.trim(),
    roles: latestExperience(profile.experience).slice(0, limits.roles).map(roleLine),
    schools: profile.education.slice(0, limits.schools).map(schoolLine),
    skills: skills.slice(0, limits.skills),
    moreSkills: Math.max(0, skills.length - limits.skills),
  };
}
