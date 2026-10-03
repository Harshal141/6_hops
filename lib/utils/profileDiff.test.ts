import { describe, it, expect } from "vitest";
import { diffList, diffProfile } from "./profileDiff";
import { normalizeProfile, type Link } from "@/lib/hooks/profile";

const savedLink = { id: 1, type: "github", url: "https://github.com/a", sort_order: 0, profile_id: "u1", created_at: "2026-01-01" };

describe("diffList", () => {
  it("sends nothing when nothing changed", () => {
    expect(diffList([savedLink], [{ ...savedLink }], ["type", "url", "sort_order"])).toEqual({
      added: [],
      updated: [],
      deleted: [],
    });
  });

  it("splits adds, real updates and deletes, with only the editable fields in each body", () => {
    const untouched = { ...savedLink, id: 2 };
    const removed = { ...savedLink, id: 3 };
    const saved: Link[] = [savedLink, untouched, removed];
    const edited: Link[] = [{ ...savedLink, url: "https://github.com/b" }, untouched, { type: "other", url: "https://x.dev", sort_order: 3 }];
    const diff = diffList(saved, edited, ["type", "url", "sort_order"]);
    expect(diff.added).toEqual([{ type: "other", url: "https://x.dev", sort_order: 3 }]);
    expect(diff.updated).toEqual([{ id: 1, type: "github", url: "https://github.com/b", sort_order: 0 }]);
    expect(diff.deleted).toEqual([3]);
  });
});

describe("diffProfile", () => {
  const saved = normalizeProfile({ name: "Ada", bio: "Hi", title: "Eng", location: "Pune" });

  it("skips the name and details requests when they didn't change", () => {
    const diff = diffProfile(saved, structuredClone(saved));
    expect(diff.name).toBeNull();
    expect(diff.details).toBeNull();
  });

  it("sends the details together when any one changed", () => {
    const diff = diffProfile(saved, { ...saved, name: "Ada L", location: "Mumbai" });
    expect(diff.name).toBe("Ada L");
    expect(diff.details).toEqual({ bio: "Hi", title: "Eng", location: "Mumbai" });
  });
});
