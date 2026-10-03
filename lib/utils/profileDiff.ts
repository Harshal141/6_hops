import type { Education, Experience, Link, Profile } from "@/lib/hooks/profile";

const LINK_FIELDS = ["type", "url", "sort_order"] as const;
const EXPERIENCE_FIELDS = [
  "company", "role", "started_at", "ended_at", "currently_working", "description", "sort_order",
] as const;
const EDUCATION_FIELDS = ["institution", "degree", "year", "sort_order"] as const;

export type LinkInput = Pick<Link, (typeof LINK_FIELDS)[number]>;
export type ExperienceInput = Pick<Experience, (typeof EXPERIENCE_FIELDS)[number]>;
export type EducationInput = Pick<Education, (typeof EDUCATION_FIELDS)[number]>;

export interface ListDiff<T> {
  added: T[];
  updated: (T & { id: number })[];
  deleted: number[];
}

function pick<T, K extends keyof T>(item: T, fields: readonly K[]): Pick<T, K> {
  return Object.fromEntries(fields.map((field) => [field, item[field]])) as Pick<T, K>;
}

/** Compares by id: no id is new, a missing id was removed, and only items whose fields changed are updates. */
export function diffList<T extends { id?: number }, K extends keyof T>(
  saved: T[],
  edited: T[],
  fields: readonly K[],
): ListDiff<Pick<T, K>> {
  const savedById = new Map(saved.map((item) => [item.id, item]));
  const editedIds = new Set(edited.map((item) => item.id));

  return {
    added: edited.filter((item) => item.id === undefined).map((item) => pick(item, fields)),
    updated: edited.flatMap((item) => {
      const before = savedById.get(item.id);
      if (item.id === undefined || !before || fields.every((field) => before[field] === item[field])) return [];
      return [{ ...pick(item, fields), id: item.id }];
    }),
    deleted: saved.flatMap((item) => (item.id !== undefined && !editedIds.has(item.id) ? [item.id] : [])),
  };
}

export function diffProfile(saved: Profile, edited: Profile) {
  const detailsChanged = (["bio", "title", "location"] as const).some((field) => saved[field] !== edited[field]);
  return {
    name: edited.name !== saved.name ? edited.name : null,
    details: detailsChanged ? { bio: edited.bio, title: edited.title, location: edited.location } : null,
    links: diffList(saved.links, edited.links, LINK_FIELDS),
    experience: diffList(saved.experience, edited.experience, EXPERIENCE_FIELDS),
    education: diffList(saved.education, edited.education, EDUCATION_FIELDS),
  };
}
