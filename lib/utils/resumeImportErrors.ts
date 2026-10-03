import { ApiError, SESSION_EXPIRED_COPY } from "./api";

export type ImportPhase = "parse" | "apply";

/**
 * - `retry`: worth sending the same file again (also offers another file)
 * - `pick`: this file won't work, choose another
 * - `close`: nothing to do here right now
 * - `review`: an apply failure that left nothing changed; stay on the review and fix or retry
 */
export type ImportErrorAction = "retry" | "pick" | "close" | "review";

export interface ImportErrorInfo {
  message: string;
  action: ImportErrorAction;
}

/** FE-only code for a draft that came back with nothing in it. */
export const EMPTY_DRAFT_CODE = "empty_draft";

/** FE-only code for the client giving up on a parse before the server answered. */
export const CLIENT_TIMEOUT_CODE = "client_timeout";

const NOT_PDF = "That doesn't look like a PDF. Try exporting your resume as PDF.";
const TIMEOUT = "This is taking longer than usual. Try again.";
const PROFILE_NOT_EMPTY = "Your profile already has details, so we didn't change anything.";
const UNAVAILABLE = "We can't reach the server right now. Try again in a minute.";

/** Keyed by the envelope's `code`, which wins over the HTTP status when present. */
export const IMPORT_ERRORS: Record<string, ImportErrorInfo> = {
  file_too_big: { message: "That file is too big. Max size is 2 MB.", action: "pick" },
  not_pdf: { message: NOT_PDF, action: "pick" },
  no_file: { message: NOT_PDF, action: "pick" },
  encrypted: { message: "That PDF is password protected. Export an unlocked copy and try again.", action: "pick" },
  too_many_pages: { message: "That's over 5 pages. Try a shorter resume.", action: "pick" },
  scanned: { message: "We couldn't read any text. It might be a scanned image.", action: "pick" },
  not_a_resume: { message: "This doesn't look like a resume.", action: "pick" },
  [EMPTY_DRAFT_CODE]: {
    message: "We couldn't find anything to import in that file. Try another, or fill it out yourself.",
    action: "pick",
  },
  already_processing: { message: "We're still reading your last upload. Give it a few seconds.", action: "retry" },
  busy: { message: "Lots of people are importing right now. Try again in a minute.", action: "retry" },
  daily_cap: { message: "You've hit today's import limit. Try again tomorrow, or fill it out yourself.", action: "close" },
  quota_exhausted: { message: "Imports are paused for today. Try again tomorrow, or fill it out yourself.", action: "close" },
  ai_failed: { message: "We couldn't read your resume this time. Try again, or fill it out yourself.", action: "retry" },
  upstream_timeout: { message: TIMEOUT, action: "retry" },
  [CLIENT_TIMEOUT_CODE]: { message: TIMEOUT, action: "retry" },
  already_applied: { message: PROFILE_NOT_EMPTY, action: "close" },
  profile_not_empty: { message: PROFILE_NOT_EMPTY, action: "close" },
};

interface FailureFacts {
  status?: number;
  code?: string;
  /** The envelope's `error`, used for an apply 400 so the user learns what to fix. */
  message?: string;
}

function byStatus({ status, message }: FailureFacts, phase: ImportPhase): ImportErrorInfo {
  const stay = phase === "apply" ? "review" : "retry";
  if (status === 401) return { message: SESSION_EXPIRED_COPY, action: "close" };
  if (status === 503 || status === undefined) return { message: UNAVAILABLE, action: stay };
  if (status === 504 || status === 408) return { message: TIMEOUT, action: stay };

  if (phase === "apply") {
    if (status === 409) return { message: PROFILE_NOT_EMPTY, action: "close" };
    // Resending a refused payload unchanged would fail the same way, so show the BE's reason.
    if (status === 400 && message) return { message, action: "review" };
    return { message: "We couldn't save that. Nothing was changed, so you can try again.", action: "review" };
  }

  if (status === 413) return IMPORT_ERRORS.file_too_big;
  if (status === 429) return IMPORT_ERRORS.busy;
  if (status === 409) return IMPORT_ERRORS.already_processing;
  if (status === 400 || status === 422) return IMPORT_ERRORS.not_pdf;
  return IMPORT_ERRORS.ai_failed;
}

/** Copy and next step for a failure, from its HTTP status, optional envelope `code` and message. */
export function importErrorInfo(facts: FailureFacts, phase: ImportPhase): ImportErrorInfo {
  const known = facts.code ? IMPORT_ERRORS[facts.code] : undefined;
  // Apply-phase codes the table doesn't know (e.g. a 400 validation code) fall to the status.
  if (known && (phase === "parse" || known.action === "close")) return known;
  return byStatus(facts, phase);
}

/** Same as `importErrorInfo`, from whatever a mutation threw. A non-ApiError (network down) reads as unreachable. */
export function importErrorFrom(error: unknown, phase: ImportPhase): ImportErrorInfo {
  if (error instanceof ApiError) {
    return importErrorInfo({ status: error.status, code: error.code, message: error.message }, phase);
  }
  return importErrorInfo({}, phase);
}
