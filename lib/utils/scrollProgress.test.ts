import { describe, expect, it } from "vitest";
import { reachedStep, scrollProgress } from "./scrollProgress";

describe("scrollProgress", () => {
  // viewport 1000px tall, anchor line at 600px
  it("is 0 before the element reaches the anchor line", () => {
    expect(scrollProgress(800, 500, 1000)).toBe(0);
    expect(scrollProgress(600, 500, 1000)).toBe(0);
  });

  it("grows as the element scrolls past the line", () => {
    expect(scrollProgress(350, 500, 1000)).toBeCloseTo(0.5);
  });

  it("is 1 once the element's bottom has passed the line", () => {
    expect(scrollProgress(100, 500, 1000)).toBe(1);
    expect(scrollProgress(-2000, 500, 1000)).toBe(1);
  });

  it("respects a custom anchor", () => {
    expect(scrollProgress(250, 500, 1000, 0.5)).toBeCloseTo(0.5);
  });

  it("is 0 for an element with no height", () => {
    expect(scrollProgress(0, 0, 1000)).toBe(0);
  });
});

describe("reachedStep", () => {
  it("is -1 before any progress", () => {
    expect(reachedStep(0, 3)).toBe(-1);
  });

  it("reaches the first step as soon as progress starts", () => {
    expect(reachedStep(0.01, 3)).toBe(0);
  });

  it("splits progress evenly across steps", () => {
    expect(reachedStep(0.34, 3)).toBe(1);
    expect(reachedStep(0.7, 3)).toBe(2);
  });

  it("never goes past the last step", () => {
    expect(reachedStep(1, 3)).toBe(2);
  });

  it("is -1 when there are no steps", () => {
    expect(reachedStep(0.5, 0)).toBe(-1);
  });
});
