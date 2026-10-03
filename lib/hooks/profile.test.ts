import { describe, it, expect } from "vitest";
import { normalizeProfile } from "./profile";

describe("normalizeProfile", () => {
  it("turns a null degree into an empty string", () => {
    const profile = normalizeProfile({
      education: [
        { id: 1, institution: "IIT", degree: null, year: "2018-2022", sort_order: 0 },
        { id: 2, institution: "MIT", degree: "MS", year: null },
      ],
    });
    expect(profile.education[0].degree).toBe("");
    expect(profile.education[1]).toMatchObject({ degree: "MS", year: "", sort_order: 1 });
  });

  it("stringifies a numeric year", () => {
    const profile = normalizeProfile({ education: [{ id: 1, institution: "IIT", degree: "BTech", year: 2022 }] });
    expect(profile.education[0].year).toBe("2022");
  });
});
