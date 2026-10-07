import { describe, it, expect } from "vitest";
import { buildProfilePatch, toProfileForm } from "./profilePatch";
import { profileFormSchema, type ProfileFormValues } from "@/lib/schemas/profile";
import { normalizeProfile } from "@/lib/hooks/profile";

const saved = normalizeProfile({
  id: "u1", user_id: "jane", name: "Jane", email: "j@x.com", bio: "Hi", title: "Dev", location: "Pune",
  updated_at: "2026-10-02T15:17:10.500Z",
  links: [
    { id: 9, profile_id: "u1", type: "github", url: "https://github.com/jane", sort_order: 0, created_at: "x" },
    { id: 10, profile_id: "u1", type: "Portfolio", url: "https://jane.dev", sort_order: 1, created_at: "x" },
  ],
  experience: [{ id: 3, company: "Acme", role: "Dev", started_at: "2021-03-01", ended_at: null, currently_working: true, description: null, sort_order: 0 }],
  education: [],
});

const initial = toProfileForm(saved);
/** Submits edited values the way the form does: through the schema. */
const patchFor = (edit: (v: ProfileFormValues) => ProfileFormValues) =>
  buildProfilePatch(initial, profileFormSchema.parse(edit(structuredClone(initial))), saved.updated_at);

describe("buildProfilePatch", () => {
  it("returns null when nothing changed, so no request is made", () => {
    expect(patchFor((v) => v)).toBeNull();
    // whitespace the schema trims away is not a change either
    expect(patchFor((v) => ({ ...v, bio: " Hi " }))).toBeNull();
  });

  it("sends only changed keys, a changed list whole and in order, plus the version", () => {
    const patch = patchFor((v) => ({
      ...v,
      title: "Engineer",
      links: [v.links[1], v.links[0], { type: "linkedin", url: "https://linkedin.com/in/jane" }],
    }));
    expect(patch).toEqual({
      title: "Engineer",
      links: [
        { id: 10, type: "portfolio", url: "https://jane.dev" },
        { id: 9, type: "github", url: "https://github.com/jane" },
        { type: "linkedin", url: "https://linkedin.com/in/jane" },
      ],
      updated_at: "2026-10-02T15:17:10.500Z",
    });
  });

  it("treats a removed row as a change to that list only", () => {
    expect(patchFor((v) => ({ ...v, experience: [] }))).toEqual({ experience: [], updated_at: saved.updated_at });
  });
});
