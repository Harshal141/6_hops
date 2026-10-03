import { describe, it, expect } from "vitest";
import type { ParseResumeResponse } from "@/lib/hooks/resumeImport";
import { IMPORT_ERRORS, type ImportErrorInfo } from "./resumeImportErrors";
import {
  INITIAL_IMPORT_STATE,
  contentStep,
  resumeImportReducer,
  type ImportEvent,
  type ImportState,
} from "./resumeImportMachine";

const file = new File(["%PDF-"], "cv.pdf", { type: "application/pdf" });

function response(experience = true): ParseResumeResponse {
  return {
    enrichment_id: 7,
    draft: {
      full_name: "Jane",
      profile: { title: null, bio: null, location: null },
      links: [],
      experience: experience
        ? [
            {
              key: "exp-0", sort_order: 0, company: "Acme", role: "Dev",
              started_at: null, started_at_precision: null, ended_at: null, ended_at_precision: null,
              currently_working: true, description: null, low_confidence: false,
            },
          ]
        : [],
      education: [],
      skills: [],
      unmatched_skills: [],
    },
  };
}

const run = (events: ImportEvent[], from: ImportState = INITIAL_IMPORT_STATE) =>
  events.reduce(resumeImportReducer, from);

const retryable = IMPORT_ERRORS.busy;
const stayOnReview: ImportErrorInfo = { message: "Role is required", action: "review" };
const closing = IMPORT_ERRORS.already_applied;

describe("resumeImportReducer", () => {
  it("goes pick → processing → review on a good parse", () => {
    const processing = run([{ type: "upload", file }]);
    expect(processing.step).toBe("processing");
    expect(processing.lastFile).toBe(file);

    const review = resumeImportReducer(processing, { type: "parsed", response: response() });
    expect(review.step).toBe("review");
    expect(review.review?.enrichmentId).toBe(7);
  });

  it("shows the empty-draft error when the parse found nothing", () => {
    const state = run([{ type: "upload", file }, { type: "parsed", response: response(false) }]);
    expect(state.step).toBe("error");
    expect(state.error?.action).toBe("pick");
  });

  it("keeps the file for a retry after a failed parse, and can go back to pick", () => {
    const failed = run([{ type: "upload", file }, { type: "parseFailed", error: retryable }]);
    expect(failed).toMatchObject({ step: "error", error: retryable, lastFile: file });

    expect(resumeImportReducer(failed, { type: "upload", file }).step).toBe("processing");
    expect(resumeImportReducer(failed, { type: "pickAnother" })).toMatchObject({ step: "pick", error: null });
  });

  it("returns to the review with the reason when a save changed nothing", () => {
    const saving = run([{ type: "upload", file }, { type: "parsed", response: response() }, { type: "save" }]);
    expect(saving.step).toBe("saving");

    const back = resumeImportReducer(saving, { type: "saveFailed", error: stayOnReview });
    expect(back).toMatchObject({ step: "review", applyError: "Role is required" });
    expect(back.review).toBe(saving.review);

    // Saving again clears the old reason.
    expect(resumeImportReducer(back, { type: "save" }).applyError).toBeNull();
  });

  it("goes to the error step when a save failure isn't recoverable on the review", () => {
    const state = run([
      { type: "upload", file },
      { type: "parsed", response: response() },
      { type: "save" },
      { type: "saveFailed", error: closing },
    ]);
    expect(state).toMatchObject({ step: "error", error: closing });
  });

  it("ignores events that don't apply to the current step", () => {
    const pick = INITIAL_IMPORT_STATE;
    expect(resumeImportReducer(pick, { type: "save" })).toBe(pick);
    expect(resumeImportReducer(pick, { type: "parsed", response: response() })).toBe(pick);

    const saving = run([{ type: "upload", file }, { type: "parsed", response: response() }, { type: "save" }]);
    // No edits or second uploads while a save is in flight.
    expect(resumeImportReducer(saving, { type: "edit", review: saving.review! })).toBe(saving);
    expect(resumeImportReducer(saving, { type: "upload", file })).toBe(saving);
  });
});

describe("contentStep", () => {
  it("treats review and saving as one screen, so focus isn't moved between them", () => {
    expect(contentStep("saving")).toBe("review");
    expect(contentStep("review")).toBe("review");
    expect(contentStep("error")).toBe("error");
  });
});
