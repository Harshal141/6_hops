import type { ParseResumeResponse } from "@/lib/hooks/resumeImport";
import { isDraftEmpty, toReviewState, type ReviewState } from "./resumeImportDraft";
import { EMPTY_DRAFT_CODE, importErrorInfo, type ImportErrorInfo } from "./resumeImportErrors";

/**
 * The resume-import modal's steps as a pure reducer:
 *
 *   pick ──upload──► processing ──parsed──► review ──save──► saving ──(success: caller closes)
 *    ▲                   │                    ▲                 │
 *    └── pickAnother ── error ◄──parseFailed──┘                 │
 *                         ▲                   └──saveFailed─────┤ (nothing changed: back to review)
 *                         └─────────────── saveFailed ──────────┘ (anything else)
 *
 * Side effects (the requests, aborting a stale one, closing) stay in the component.
 */

export type ImportStep = "pick" | "processing" | "review" | "saving" | "error";

export interface ImportState {
  step: ImportStep;
  /** The editable draft. Present from the first successful parse on. */
  review: ReviewState | null;
  /** Set on `error`. */
  error: ImportErrorInfo | null;
  /** A failed save that left nothing changed, shown on the review. */
  applyError: string | null;
  /** Kept so "try again" can resend the same file. */
  lastFile: File | null;
}

export type ImportEvent =
  | { type: "upload"; file: File }
  | { type: "parsed"; response: ParseResumeResponse }
  | { type: "parseFailed"; error: ImportErrorInfo }
  | { type: "edit"; review: ReviewState }
  | { type: "save" }
  | { type: "saveFailed"; error: ImportErrorInfo }
  | { type: "pickAnother" };

export const INITIAL_IMPORT_STATE: ImportState = {
  step: "pick",
  review: null,
  error: null,
  applyError: null,
  lastFile: null,
};

export function resumeImportReducer(state: ImportState, event: ImportEvent): ImportState {
  switch (event.type) {
    case "upload":
      if (state.step !== "pick" && state.step !== "error") return state;
      return { ...state, step: "processing", lastFile: event.file, error: null };

    case "parsed":
      if (state.step !== "processing") return state;
      if (isDraftEmpty(event.response.draft)) {
        return { ...state, step: "error", error: importErrorInfo({ code: EMPTY_DRAFT_CODE }, "parse") };
      }
      return { ...state, step: "review", review: toReviewState(event.response), applyError: null };

    case "parseFailed":
      if (state.step !== "processing") return state;
      return { ...state, step: "error", error: event.error };

    case "edit":
      if (state.step !== "review") return state;
      return { ...state, review: event.review };

    case "save":
      if (state.step !== "review" || !state.review) return state;
      return { ...state, step: "saving", applyError: null };

    case "saveFailed":
      if (state.step !== "saving") return state;
      if (event.error.action === "review") return { ...state, step: "review", applyError: event.error.message };
      return { ...state, step: "error", error: event.error };

    case "pickAnother":
      if (state.step !== "error") return state;
      return { ...state, step: "pick", error: null };
  }
}

/** Steps that show different content. Review and saving are one screen, so focus stays put between them. */
export const contentStep = (step: ImportStep): Exclude<ImportStep, "saving"> =>
  step === "saving" ? "review" : step;
