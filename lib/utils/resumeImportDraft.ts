import type {
  ApplyImportPayload,
  DatePrecision,
  DraftLinkType,
  DraftSkill,
  ParseResumeResponse,
  ResumeDraft,
} from "@/lib/hooks/resumeImport";
import { isValidEducationYear } from "./educationYear";

/**
 * The resume-import review, as pure data: the BE draft becomes editable state
 * (every null a "" so inputs are always controlled), and the edited state
 * becomes the `apply` payload. No React here, so all of it is unit tested.
 */

export type ReviewSection = "name" | "profile" | "links" | "experience" | "education" | "skills";
export type ProfileField = "title" | "bio" | "location";

/** What every tickable list item carries. */
export interface ReviewItemMeta {
  key: string;
  low_confidence: boolean;
}

export interface ReviewLink extends ReviewItemMeta {
  type: DraftLinkType;
  url: string;
}

export interface ReviewExperience extends ReviewItemMeta {
  company: string;
  role: string;
  /** `YYYY` or `YYYY-MM`, only as precise as the resume was; null when absent. */
  started_at: string | null;
  ended_at: string | null;
  currently_working: boolean;
  description: string;
}

export interface ReviewEducation extends ReviewItemMeta {
  institution: string;
  degree: string;
  year: string;
}

export interface ReviewState {
  enrichmentId: number;
  fullName: string;
  profile: Record<ProfileField, string>;
  links: ReviewLink[];
  experience: ReviewExperience[];
  education: ReviewEducation[];
  skills: DraftSkill[];
  unmatchedSkills: string[];
  /**
   * section → item key → ticked. Profile fields use their field name as key and
   * only appear when the draft had a value; the name row is "full_name".
   */
  selected: Record<ReviewSection, Record<string, boolean>>;
}

export type RequiredField = "company" | "role" | "institution";
export type DateField = "started_at" | "ended_at" | "year";

/** A field on a ticked item that blocks accept. `key` is the item's draft key. */
export interface ReviewIssue {
  key: string;
  field: RequiredField | DateField;
}

export const NAME_KEY = "full_name";
const PROFILE_FIELDS: ProfileField[] = ["title", "location", "bio"];

/** The shape the review's date fields accept: a year, or a year and month. */
const PARTIAL_DATE = /^\d{4}(-(0[1-9]|1[0-2]))?$/;

const text = (value: string | null | undefined) => value ?? "";
const bySortOrder = <T extends { sort_order: number }>(items: T[] | null | undefined) =>
  [...(items ?? [])].sort((a, b) => a.sort_order - b.sort_order);

/** `2022-01-01` at year precision shows as `2022`, so the review never claims a month nobody wrote. */
export function toPartialDate(date: string | null, precision: DatePrecision | null): string | null {
  const match = date ? /^(\d{4})(?:-(\d{2}))?/.exec(date) : null;
  if (!match) return null;
  if (precision === "year" || !match[2]) return match[1];
  return `${match[1]}-${match[2]}`;
}

/** `2022` → `2022-01-01`, `2022-03` → `2022-03-01`; blank or malformed → null. */
export function toIsoDate(partial: string | null): string | null {
  const value = partial?.trim() ?? "";
  if (!PARTIAL_DATE.test(value)) return null;
  return value.length === 4 ? `${value}-01-01` : `${value}-01`;
}

/** True when there is nothing worth reviewing. A name on its own doesn't count. */
export function isDraftEmpty(draft: ResumeDraft): boolean {
  const profile = draft.profile ?? { title: null, bio: null, location: null };
  return (
    (draft.experience?.length ?? 0) === 0 &&
    (draft.education?.length ?? 0) === 0 &&
    (draft.links?.length ?? 0) === 0 &&
    (draft.skills?.length ?? 0) === 0 &&
    PROFILE_FIELDS.every((field) => !profile[field]?.trim())
  );
}

export function toReviewState(response: ParseResumeResponse): ReviewState {
  const { draft } = response;
  const profile = draft.profile ?? { title: null, bio: null, location: null };
  const meta = (item: { key: string; low_confidence?: boolean }): ReviewItemMeta => ({
    key: item.key,
    low_confidence: item.low_confidence ?? false,
  });

  const links = bySortOrder(draft.links).map((link) => ({ ...meta(link), type: link.type, url: text(link.url) }));
  const experience = bySortOrder(draft.experience).map((exp) => ({
    ...meta(exp),
    company: text(exp.company),
    role: text(exp.role),
    started_at: toPartialDate(exp.started_at, exp.started_at_precision),
    ended_at: exp.currently_working ? null : toPartialDate(exp.ended_at, exp.ended_at_precision),
    currently_working: exp.currently_working ?? false,
    description: text(exp.description),
  }));
  const education = bySortOrder(draft.education).map((edu) => ({
    ...meta(edu),
    institution: text(edu.institution),
    degree: text(edu.degree),
    year: text(edu.year),
  }));
  const skills = draft.skills ?? [];

  // Low-confidence items start unticked so they're only saved if the user opts in.
  const tickUnlessUnsure = (items: ReviewItemMeta[]) =>
    Object.fromEntries(items.map((item) => [item.key, !item.low_confidence]));

  return {
    enrichmentId: response.enrichment_id,
    fullName: text(draft.full_name).trim(),
    profile: {
      title: text(profile.title),
      bio: text(profile.bio),
      location: text(profile.location),
    },
    links,
    experience,
    education,
    skills,
    unmatchedSkills: draft.unmatched_skills ?? [],
    selected: {
      // Replacing the sign-in name is opt-in.
      name: { [NAME_KEY]: false },
      // Only fields the resume actually had get a row (and a tick).
      profile: Object.fromEntries(
        PROFILE_FIELDS.filter((field) => text(profile[field]).trim()).map((field) => [field, true]),
      ),
      links: tickUnlessUnsure(links),
      experience: tickUnlessUnsure(experience),
      education: tickUnlessUnsure(education),
      skills: Object.fromEntries(skills.map((skill) => [skill.key, true])),
    },
  };
}

export const isSelected = (state: ReviewState, section: ReviewSection, key: string) =>
  state.selected[section]?.[key] === true;

/** Ticks or unticks one item. */
export const setSelected = (state: ReviewState, section: ReviewSection, key: string, checked: boolean): ReviewState => ({
  ...state,
  selected: { ...state.selected, [section]: { ...state.selected[section], [key]: checked } },
});

/** Ticked items with a NOT NULL column left blank. Accept is blocked until each is filled or unticked. */
export function missingRequired(state: ReviewState): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  for (const exp of state.experience) {
    if (!isSelected(state, "experience", exp.key)) continue;
    if (!exp.company.trim()) issues.push({ key: exp.key, field: "company" });
    if (!exp.role.trim()) issues.push({ key: exp.key, field: "role" });
  }
  for (const edu of state.education) {
    if (!isSelected(state, "education", edu.key)) continue;
    if (!edu.institution.trim()) issues.push({ key: edu.key, field: "institution" });
  }
  return issues;
}

/**
 * Ticked dates the BE would refuse with a 400: experience dates that aren't blank,
 * `YYYY` or `YYYY-MM`, and education years that aren't blank, `YYYY`, `YYYY-YYYY`
 * or `YYYY-`.
 */
export function invalidDates(state: ReviewState): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  for (const exp of state.experience) {
    if (!isSelected(state, "experience", exp.key)) continue;
    const fields: Exclude<DateField, "year">[] = exp.currently_working ? ["started_at"] : ["started_at", "ended_at"];
    for (const field of fields) {
      const value = exp[field]?.trim() ?? "";
      if (value && !PARTIAL_DATE.test(value)) issues.push({ key: exp.key, field });
    }
  }
  for (const edu of state.education) {
    if (!isSelected(state, "education", edu.key)) continue;
    if (!isValidEducationYear(edu.year)) issues.push({ key: edu.key, field: "year" });
  }
  return issues;
}

const orNull = (value: string) => value.trim() || null;

export function toApplyPayload(state: ReviewState): ApplyImportPayload {
  const pick = <T extends { key: string }>(section: ReviewSection, items: T[]) =>
    items.filter((item) => isSelected(state, section, item.key));

  return {
    full_name: isSelected(state, "name", NAME_KEY) ? orNull(state.fullName) : null,
    profile: {
      title: isSelected(state, "profile", "title") ? orNull(state.profile.title) : null,
      bio: isSelected(state, "profile", "bio") ? orNull(state.profile.bio) : null,
      location: isSelected(state, "profile", "location") ? orNull(state.profile.location) : null,
    },
    links: pick("links", state.links)
      .filter((link) => link.url.trim())
      .map((link, index) => ({ type: link.type, url: link.url.trim(), sort_order: index })),
    experience: pick("experience", state.experience).map((exp, index) => ({
      company: exp.company.trim(),
      role: exp.role.trim(),
      started_at: toIsoDate(exp.started_at),
      ended_at: exp.currently_working ? null : toIsoDate(exp.ended_at),
      currently_working: exp.currently_working,
      description: orNull(exp.description),
      sort_order: index,
    })),
    education: pick("education", state.education).map((edu, index) => ({
      institution: edu.institution.trim(),
      degree: orNull(edu.degree),
      year: orNull(edu.year),
      sort_order: index,
    })),
    skill_ids: pick("skills", state.skills).map((skill) => skill.id),
  };
}

/** Everything blocking accept, in display order. */
export const reviewIssues = (state: ReviewState): ReviewIssue[] => [...missingRequired(state), ...invalidDates(state)];

/** True when accepting would write nothing at all. */
export function isPayloadEmpty(payload: ApplyImportPayload): boolean {
  return (
    payload.full_name === null &&
    Object.values(payload.profile).every((value) => value === null) &&
    payload.links.length === 0 &&
    payload.experience.length === 0 &&
    payload.education.length === 0 &&
    payload.skill_ids.length === 0
  );
}
