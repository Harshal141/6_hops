import type { Profile, ProfilePatch } from "@/lib/hooks/profile";
import { toLinkType, type ProfileFormOutput, type ProfileFormValues } from "@/lib/schemas/profile";

const SCALAR_KEYS = ["name", "title", "location", "bio"] as const;
const LIST_KEYS = ["links", "experience", "education"] as const;

/** A saved profile as editor values. Server-only columns (profile_id, created_at, sort_order) are dropped. */
export function toProfileForm(profile: Profile): ProfileFormValues {
  return {
    name: profile.name,
    title: profile.title,
    location: profile.location,
    bio: profile.bio,
    links: profile.links.map(({ id, type, url }) => ({ id, type: toLinkType(type), url })),
    experience: profile.experience.map(
      ({ id, company, role, started_at, ended_at, currently_working, description }) =>
        ({ id, company, role, started_at, ended_at, currently_working, description }),
    ),
    education: profile.education.map(({ id, institution, degree, year }) => ({ id, institution, degree, year })),
  };
}

// Rows are flat objects of primitives, and both sides list their keys in the same order, so a
// JSON compare is exact. Order matters on purpose: a reorder is a change.
const sameRows = (a: unknown[], b: unknown[]) => JSON.stringify(a) === JSON.stringify(b);

/**
 * What changed between the values editing started from and a valid submit, as the PATCH body,
 * or null when nothing did (then no request is made). A changed list is sent whole.
 */
export function buildProfilePatch(
  initial: ProfileFormValues,
  values: ProfileFormOutput,
  updatedAt: string | null,
): ProfilePatch | null {
  const patch: ProfilePatch = {};

  for (const key of SCALAR_KEYS) {
    if (values[key] !== initial[key].trim()) patch[key] = values[key];
  }
  for (const key of LIST_KEYS) {
    if (!sameRows(initial[key], values[key])) Object.assign(patch, { [key]: values[key] });
  }

  return Object.keys(patch).length ? { ...patch, updated_at: updatedAt } : null;
}
