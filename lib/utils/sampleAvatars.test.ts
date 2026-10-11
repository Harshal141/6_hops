import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SAMPLE_FACE_COUNT, sampleFaceUrl } from "./sampleAvatars";

describe("sampleFaceUrl", () => {
  it("points into public/sample-faces", () => {
    expect(sampleFaceUrl(3)).toBe("/sample-faces/3.svg");
  });

  it("wraps indexes past the face count, including negative ones", () => {
    expect(sampleFaceUrl(SAMPLE_FACE_COUNT + 3)).toBe(sampleFaceUrl(3));
    expect(sampleFaceUrl(-1)).toBe(sampleFaceUrl(SAMPLE_FACE_COUNT - 1));
  });

  it("has a generated file for every face", () => {
    for (let i = 0; i < SAMPLE_FACE_COUNT; i++) {
      expect(existsSync(path.join(__dirname, "../../public", sampleFaceUrl(i)))).toBe(true);
    }
  });
});
