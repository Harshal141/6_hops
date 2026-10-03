import { describe, it, expect } from "vitest";
import type { ParseResumeResponse } from "@/lib/hooks/resumeImport";
import {
  invalidDates,
  isDraftEmpty,
  isPayloadEmpty,
  missingRequired,
  reviewIssues,
  setSelected,
  toApplyPayload,
  toIsoDate,
  toPartialDate,
  toReviewState,
  type ReviewState,
} from "./resumeImportDraft";

function response(): ParseResumeResponse {
  return {
    enrichment_id: 42,
    draft: {
      full_name: "Jane Doe",
      profile: { title: "Engineer", bio: null, location: "Pune" },
      links: [
        {
          key: "link-0", sort_order: 0, type: "github", url: "https://github.com/jane", low_confidence: false,
        },
      ],
      experience: [
        {
          key: "exp-1", sort_order: 1, company: "Initech", role: "Intern",
          started_at: "2019-06-01", started_at_precision: "month",
          ended_at: "2020-01-01", ended_at_precision: "year",
          currently_working: false, description: null,
          low_confidence: false,
        },
        {
          key: "exp-0", sort_order: 0, company: "Acme", role: null,
          started_at: "2022-01-01", started_at_precision: "year",
          ended_at: null, ended_at_precision: null,
          currently_working: true, description: "Built things",
          low_confidence: true,
        },
      ],
      education: [
        {
          key: "edu-0", sort_order: 0, institution: "IIT", degree: null, year: "2018-2022",
          low_confidence: false,
        },
      ],
      skills: [{ key: "skill-17", id: 17, name: "React" }],
      unmatched_skills: ["Kubernetes Operators"],
    },
  };
}

describe("toPartialDate / toIsoDate", () => {
  it("shows year-precision dates as the year only", () => {
    expect(toPartialDate("2022-01-01", "year")).toBe("2022");
    expect(toPartialDate("2022-03-01", "month")).toBe("2022-03");
    expect(toPartialDate(null, null)).toBeNull();
  });

  it("expands partial dates back to a full date", () => {
    expect(toIsoDate("2022")).toBe("2022-01-01");
    expect(toIsoDate("2022-03")).toBe("2022-03-01");
    expect(toIsoDate("")).toBeNull();
    expect(toIsoDate("March 2022")).toBeNull();
  });
});

describe("toReviewState", () => {
  it("turns nulls into empty strings and orders items by sort_order", () => {
    const state = toReviewState(response());
    expect(state.enrichmentId).toBe(42);
    expect(state.profile.bio).toBe("");
    expect(state.education[0].degree).toBe("");
    expect(state.experience.map((exp) => exp.key)).toEqual(["exp-0", "exp-1"]);
    expect(state.experience[0].role).toBe("");
    expect(state.experience[1].description).toBe("");
  });

  it("keeps date precision: year-only dates stay year-only", () => {
    const [current, intern] = toReviewState(response()).experience;
    expect(current.started_at).toBe("2022");
    expect(current.ended_at).toBeNull();
    expect(intern.started_at).toBe("2019-06");
    expect(intern.ended_at).toBe("2020");
  });

  it("ticks confident items, leaves low-confidence ones and the name unticked", () => {
    const { selected } = toReviewState(response());
    expect(selected.experience).toEqual({ "exp-0": false, "exp-1": true });
    expect(selected.name.full_name).toBe(false);
    expect(selected.profile).toEqual({ title: true, location: true });
    expect(selected.skills["skill-17"]).toBe(true);
  });
});

describe("missingRequired / invalidDates", () => {
  it("ignores unticked items", () => {
    expect(missingRequired(toReviewState(response()))).toEqual([]);
  });

  it("flags a ticked item with a blank required field", () => {
    const state = toReviewState(response());
    state.selected.experience["exp-0"] = true;
    state.education[0].institution = "  ";
    expect(missingRequired(state)).toEqual([
      { key: "exp-0", field: "role" },
      { key: "edu-0", field: "institution" },
    ]);
  });

  it("flags malformed dates but not blank ones, and skips the end date when current", () => {
    const state = toReviewState(response());
    state.experience[1].started_at = "June 2019";
    state.experience[1].ended_at = "";
    expect(invalidDates(state)).toEqual([{ key: "exp-1", field: "started_at" }]);
  });

  it("flags a ticked education year the BE would refuse, accepting YYYY, YYYY-YYYY and YYYY-", () => {
    const state = toReviewState(response());
    for (const ok of ["", "2018", "2018-2022", "2021-"]) {
      state.education[0].year = ok;
      expect(invalidDates(state)).toEqual([]);
    }
    state.education[0].year = "2018 to 2022";
    expect(reviewIssues(state)).toEqual([{ key: "edu-0", field: "year" }]);
    expect(reviewIssues(setSelected(state, "education", "edu-0", false))).toEqual([]);
  });
});

describe("toApplyPayload", () => {
  it("sends only ticked items, nulls for blanks, and full dates", () => {
    const state: ReviewState = toReviewState(response());
    state.selected.experience["exp-0"] = true;
    state.experience[0].role = "Founder";

    expect(toApplyPayload(state)).toEqual({
      full_name: null,
      profile: { title: "Engineer", bio: null, location: "Pune" },
      links: [{ type: "github", url: "https://github.com/jane", sort_order: 0 }],
      experience: [
        {
          company: "Acme", role: "Founder", started_at: "2022-01-01", ended_at: null,
          currently_working: true, description: "Built things", sort_order: 0,
        },
        {
          company: "Initech", role: "Intern", started_at: "2019-06-01", ended_at: "2020-01-01",
          currently_working: false, description: null, sort_order: 1,
        },
      ],
      education: [{ institution: "IIT", degree: null, year: "2018-2022", sort_order: 0 }],
      skill_ids: [17],
    });
  });

  it("sends the name only when ticked, and re-indexes sort_order after unticking", () => {
    const state = toReviewState(response());
    state.selected.name.full_name = true;
    state.selected.experience["exp-1"] = false;
    state.selected.experience["exp-0"] = true;
    state.experience[0].role = "Founder";
    const payload = toApplyPayload(state);
    expect(payload.full_name).toBe("Jane Doe");
    expect(payload.experience.map((exp) => [exp.company, exp.sort_order])).toEqual([["Acme", 0]]);
  });

  it("knows when nothing would be written", () => {
    const state = toReviewState(response());
    for (const section of Object.values(state.selected)) {
      for (const key of Object.keys(section)) section[key] = false;
    }
    expect(isPayloadEmpty(toApplyPayload(state))).toBe(true);
  });
});

describe("isDraftEmpty", () => {
  it("treats a draft with only a name as empty", () => {
    const draft = response().draft;
    expect(isDraftEmpty(draft)).toBe(false);
    expect(
      isDraftEmpty({
        ...draft,
        profile: { title: null, bio: " ", location: null },
        links: [], experience: [], education: [], skills: [],
      }),
    ).toBe(true);
  });
});
