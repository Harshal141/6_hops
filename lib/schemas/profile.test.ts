import { describe, it, expect } from "vitest";
import { profileFormSchema, toLinkType, type ProfileFormValues } from "./profile";

const valid: ProfileFormValues = {
  name: " Jane ",
  title: "",
  location: "Pune",
  bio: "",
  links: [{ id: 9, type: "github", url: "https://github.com/jane" }],
  experience: [{ company: "Acme", role: "Dev", started_at: "2021-03-01", ended_at: null, currently_working: true, description: "" }],
  education: [{ institution: "MIT", degree: "", year: "2018-2022" }],
};

const issuesFor = (values: ProfileFormValues) => {
  const result = profileFormSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."));
};

describe("profileFormSchema (mirrors the BE's profileFields rules)", () => {
  it("accepts a valid form and trims it", () => {
    const result = profileFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Jane");
  });

  it.each([
    ["more than 10 links", { links: Array.from({ length: 11 }, () => ({ type: "other" as const, url: "https://a.com" })) }, "links"],
    ["a non-http link", { links: [{ type: "other" as const, url: "javascript:alert(1)" }] }, "links.0.url"],
    ["an empty name", { name: "  " }, "name"],
    ["an end date before the start", { experience: [{ ...valid.experience[0], currently_working: false, ended_at: "2020-01-01" }] }, "experience.0.ended_at"],
    ["a malformed education year", { education: [{ ...valid.education[0], year: "twenty" }] }, "education.0.year"],
  ])("rejects %s", (_name, change, path) => {
    expect(issuesFor({ ...valid, ...change })).toContain(path);
  });

  it("maps a legacy stored link type onto the allowlist", () => {
    expect(toLinkType("Portfolio")).toBe("portfolio");
    expect(toLinkType("website")).toBe("other");
  });
});
