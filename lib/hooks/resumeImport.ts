import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError, jsonBody } from "@/lib/utils/api";
import { CLIENT_TIMEOUT_CODE } from "@/lib/utils/resumeImportErrors";
import { normalizeProfile, PROFILE_KEY } from "@/lib/hooks/profile";

// ── Types: the BE contract ─────────────────────────────────

export type DatePrecision = "year" | "month";
export type DraftLinkType = "linkedin" | "github" | "twitter" | "portfolio" | "other";

interface DraftItemMeta {
  /** Stable per draft. */
  key: string;
  /** Source order, newest first. */
  sort_order: number;
  low_confidence: boolean;
}

export interface DraftLink extends DraftItemMeta {
  type: DraftLinkType;
  url: string;
}

export interface DraftExperience extends DraftItemMeta {
  company: string | null;
  role: string | null;
  /** `YYYY-MM-DD`; `*_precision` says how much of it was actually written. */
  started_at: string | null;
  started_at_precision: DatePrecision | null;
  ended_at: string | null;
  ended_at_precision: DatePrecision | null;
  currently_working: boolean;
  description: string | null;
}

export interface DraftEducation extends DraftItemMeta {
  institution: string | null;
  degree: string | null;
  /** "2018-2022" or a single year. */
  year: string | null;
}

export interface DraftSkill {
  key: string;
  id: number;
  name: string;
}

export interface ResumeDraft {
  full_name: string | null;
  profile: { title: string | null; bio: string | null; location: string | null };
  links: DraftLink[];
  experience: DraftExperience[];
  education: DraftEducation[];
  skills: DraftSkill[];
  unmatched_skills: string[];
}

export interface ParseResumeResponse {
  enrichment_id: number;
  draft: ResumeDraft;
}

/**
 * Body of `POST /profile/import/:id/apply`: the reviewed, ticked subset of the
 * draft, in the same shape as the draft with the review-only fields dropped.
 * `null` means "leave it alone" (unticked or blank).
 */
export interface ApplyImportPayload {
  full_name: string | null;
  profile: { title: string | null; bio: string | null; location: string | null };
  links: { type: DraftLinkType; url: string; sort_order: number }[];
  experience: {
    company: string;
    role: string;
    started_at: string | null;
    ended_at: string | null;
    currently_working: boolean;
    description: string | null;
    sort_order: number;
  }[];
  education: { institution: string; degree: string | null; year: string | null; sort_order: number }[];
  skill_ids: number[];
}

// ── Timeouts ───────────────────────────────────────────────

/** Outlives the FE route handler (75s), so the server's own timeout wins when there is one. */
const PARSE_CLIENT_TIMEOUT_MS = 80_000;

// ── Mutations ──────────────────────────────────────────────

/**
 * Uploads one PDF and returns the draft. `signal` lets the caller abandon the
 * request (the modal closed); the run still finishes server side, and the same
 * file uploaded again returns the stored draft.
 */
export function useParseResume() {
  return useMutation({
    mutationFn: async ({ file, signal }: { file: File; signal: AbortSignal }) => {
      const body = new FormData();
      body.append("file", file);

      try {
        return await apiFetch<ParseResumeResponse>("/api/profile/import", {
          method: "POST",
          body,
          signal: AbortSignal.any([signal, AbortSignal.timeout(PARSE_CLIENT_TIMEOUT_MS)]),
        });
      } catch (err) {
        // Only our own timeout gets the timeout copy; a user abort passes through untouched.
        if (err instanceof DOMException && err.name === "TimeoutError") {
          throw new ApiError(408, "Request timed out", CLIENT_TIMEOUT_CODE);
        }
        throw err;
      }
    },
  });
}

/** Writes the reviewed draft. The response is the refreshed profile, so the cache is set, not refetched. */
export function useApplyImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ enrichmentId, payload }: { enrichmentId: number; payload: ApplyImportPayload }) =>
      apiFetch<Record<string, unknown>>(`/api/profile/import/${enrichmentId}/apply`, {
        method: "POST",
        ...jsonBody(payload),
      }),
    onSuccess: (res) => qc.setQueryData(PROFILE_KEY, normalizeProfile(res)),
    // 409 means the profile changed under us (already applied, or filled elsewhere): show what's there now.
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        qc.invalidateQueries({ queryKey: PROFILE_KEY });
      }
    },
  });
}
