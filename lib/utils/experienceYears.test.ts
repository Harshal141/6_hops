import { describe, it, expect } from "vitest";
import { displayExperienceYears } from "./experienceYears";

describe("displayExperienceYears", () => {
  it("reads the year from the stored date, so a Jan 1 start isn't shown as the year before", () => {
    // Run with TZ west of UTC this would print 2019 via new Date(...).getFullYear()
    expect(displayExperienceYears({ started_at: "2020-01-01", ended_at: "2021-01-01", currently_working: false }))
      .toBe("2020 – 2021");
  });

  it("covers current, open-ended and undated roles", () => {
    expect(displayExperienceYears({ started_at: "2020-06-01", ended_at: null, currently_working: true })).toBe("2020 – present");
    expect(displayExperienceYears({ started_at: "2020-06-01", ended_at: null, currently_working: false })).toBe("2020");
    expect(displayExperienceYears({ started_at: null, ended_at: null, currently_working: false })).toBe("");
  });
});
