import { describe, it, expect } from "vitest";
import { parseYear, combineYear, displayYear, isValidEducationYear } from "./educationYear";

describe("educationYear", () => {
  it("round-trips the stored formats", () => {
    for (const stored of ["2021-2024", "2021-", "2021", ""]) {
      const { start, end, current } = parseYear(stored);
      expect(combineYear(start, end, current)).toBe(stored);
    }
  });

  it("marks an open range as current", () => {
    expect(parseYear("2021-")).toEqual({ start: "2021", end: "", current: true });
  });

  it("formats for display", () => {
    expect(displayYear("2021-2024")).toBe("2021 – 2024");
    expect(displayYear("2021-")).toBe("2021 – present");
    expect(displayYear("2021")).toBe("2021");
    expect(displayYear("")).toBe("");
  });

  it("accepts the shapes the BE stores and rejects the rest", () => {
    for (const ok of ["", "2018", "2018-2022", "2021-", " 2018 "]) expect(isValidEducationYear(ok)).toBe(true);
    for (const bad of ["18", "20a1", "2018-22", "2018 - 2022", "-2022", "twenty"]) {
      expect(isValidEducationYear(bad)).toBe(false);
    }
  });
});
