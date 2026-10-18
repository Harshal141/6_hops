import { describe, expect, it } from "vitest";
import type { Education, Experience, Skill } from "@/lib/hooks/profile";
import { hasProfileContent, hasProfileDetails, latestExperience, summarizeProfile } from "./profileSummary";

const job = (over: Partial<Experience>): Experience => ({
  company: "Acme",
  role: "Engineer",
  started_at: null,
  ended_at: null,
  currently_working: false,
  description: "",
  sort_order: 0,
  ...over,
});

const school = (over: Partial<Education>): Education => ({
  institution: "State University",
  degree: "",
  year: "",
  sort_order: 0,
  ...over,
});

const skill = (id: number, name: string): Skill => ({ id, name, level: 3, parent_id: null });

const empty = { title: "", experience: [], education: [], skills: [] };

describe("hasProfileDetails", () => {
  it("is false while loading and for an empty profile", () => {
    expect(hasProfileDetails(undefined)).toBe(false);
    expect(hasProfileDetails({ experience: [], education: [] })).toBe(false);
  });

  it("is true with any experience or education", () => {
    expect(hasProfileDetails({ experience: [job({})], education: [] })).toBe(true);
    expect(hasProfileDetails({ experience: [], education: [school({})] })).toBe(true);
  });
});

describe("hasProfileContent", () => {
  const blank = { ...empty, bio: "" };

  it("is false while loading and for an empty or whitespace-only profile", () => {
    expect(hasProfileContent(undefined)).toBe(false);
    expect(hasProfileContent(blank)).toBe(false);
    expect(hasProfileContent({ ...blank, title: "  ", bio: "\n" })).toBe(false);
  });

  it("counts a headline, an about, a skill, a role or a school", () => {
    expect(hasProfileContent({ ...blank, title: "Engineer" })).toBe(true);
    expect(hasProfileContent({ ...blank, bio: "Hi" })).toBe(true);
    expect(hasProfileContent({ ...blank, skills: [skill(1, "Go")] })).toBe(true);
    expect(hasProfileContent({ ...blank, experience: [job({})] })).toBe(true);
    expect(hasProfileContent({ ...blank, education: [school({})] })).toBe(true);
  });
});

describe("latestExperience", () => {
  it("puts current roles first, then the latest start, undated last, ties in display order", () => {
    const rows = [
      job({ id: 1, started_at: "2018-01-01" }),
      job({ id: 2 }),
      job({ id: 3, started_at: "2021-06-01" }),
      job({ id: 4, started_at: "2015-01-01", currently_working: true }),
      job({ id: 5 }),
    ];
    expect(latestExperience(rows).map((row) => row.id)).toEqual([4, 3, 1, 2, 5]);
  });

  it("doesn't reorder the input", () => {
    const rows = [job({ id: 1 }), job({ id: 2, currently_working: true })];
    latestExperience(rows);
    expect(rows.map((row) => row.id)).toEqual([1, 2]);
  });
});

describe("summarizeProfile", () => {
  it("reads an empty profile as empty sections", () => {
    expect(summarizeProfile(empty)).toEqual({ headline: "", roles: [], schools: [], skills: [], moreSkills: 0 });
  });

  it("joins role and company, school and degree, dropping blanks", () => {
    const summary = summarizeProfile({
      ...empty,
      title: "  Backend engineer ",
      experience: [job({ id: 7, role: "Staff engineer", company: "Keychain" }), job({ role: "", company: "Solo" })],
      education: [school({ id: 9, institution: "IIT Bombay", degree: "B.Tech" }), school({ institution: "DPS" })],
    });
    expect(summary.headline).toBe("Backend engineer");
    expect(summary.roles).toEqual([
      { key: "7", label: "Staff engineer · Keychain" },
      { key: "new-1", label: "Solo" },
    ]);
    expect(summary.schools).toEqual([
      { key: "9", label: "IIT Bombay · B.Tech" },
      { key: "new-1", label: "DPS" },
    ]);
  });

  it("caps roles, schools and skills, counting the hidden skills", () => {
    const summary = summarizeProfile(
      {
        ...empty,
        experience: [job({ id: 1 }), job({ id: 2 }), job({ id: 3 })],
        education: [school({ id: 1 }), school({ id: 2 }), school({ id: 3 })],
        skills: ["Go", "SQL", "React", "Rust", "Kafka"].map((name, i) => skill(i + 1, name)),
      },
      { roles: 2, schools: 1, skills: 3 },
    );
    expect(summary.roles).toHaveLength(2);
    expect(summary.schools).toHaveLength(1);
    expect(summary.skills).toEqual(["Go", "SQL", "React"]);
    expect(summary.moreSkills).toBe(2);
  });
});
