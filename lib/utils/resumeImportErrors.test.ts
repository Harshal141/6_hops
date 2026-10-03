import { describe, it, expect } from "vitest";
import { ApiError } from "./api";
import { IMPORT_ERRORS, importErrorFrom, importErrorInfo } from "./resumeImportErrors";

describe("importErrorInfo", () => {
  it("picks the next step from the BE code", () => {
    expect(importErrorInfo({ status: 400, code: "encrypted" }, "parse").action).toBe("pick");
    expect(importErrorInfo({ status: 409, code: "already_processing" }, "parse").action).toBe("retry");
    expect(importErrorInfo({ status: 429, code: "daily_cap" }, "parse").action).toBe("close");
  });

  it("falls back to the status when there is no code", () => {
    expect(importErrorInfo({ status: 413 }, "parse")).toBe(IMPORT_ERRORS.file_too_big);
    expect(importErrorInfo({ status: 502 }, "parse")).toBe(IMPORT_ERRORS.ai_failed);
    expect(importErrorInfo({ status: 504 }, "parse")).toEqual(IMPORT_ERRORS.upstream_timeout);
    expect(importErrorInfo({ status: 401 }, "parse").action).toBe("close");
  });

  it("keeps the user on the review for apply failures that changed nothing", () => {
    expect(importErrorInfo({ status: 500 }, "apply").action).toBe("review");
    expect(importErrorInfo({ status: 503 }, "apply").action).toBe("review");
    expect(importErrorInfo({ status: 400, code: "validation" }, "apply").action).toBe("review");
  });

  it("shows the BE's reason for an apply 400, since resending the same payload would fail again", () => {
    expect(importErrorFrom(new ApiError(400, "Role is required", "validation"), "apply")).toEqual({
      message: "Role is required",
      action: "review",
    });
  });

  it("closes on an apply conflict, with or without a code", () => {
    for (const code of ["already_applied", "profile_not_empty", undefined]) {
      expect(importErrorInfo({ status: 409, code }, "apply").action).toBe("close");
    }
  });
});

describe("importErrorFrom", () => {
  it("treats a network failure as unreachable and worth retrying", () => {
    expect(importErrorFrom(new TypeError("Failed to fetch"), "parse").action).toBe("retry");
  });
});
