import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/utils/api";

// ── Types ──────────────────────────────────────────────────
//
// Each key in `UserFlags` is a "flow" — a self-contained fact bag for one
// small piece of cross-session UI state (has the user seen the tour, have
// they dismissed the resume nudge, …). New flows are added here and to the
// backend's KNOWN_FLOWS allowlist together; this file never invents a flow
// key that route doesn't recognise.

export type OnboardingStatus = "not_started" | "in_progress" | "skipped" | "completed";

export interface OnboardingFlow {
  status: OnboardingStatus;
  /** Step currently shown (0-based). */
  current_step: number;
  /** Highest step index ever reached — the drop-off marker when status is "skipped". */
  max_step_reached: number;
  started_at: string | null;
  skipped_at: string | null;
  completed_at: string | null;
}

export type ResumePromptStatus = "not_shown" | "shown" | "dismissed";

export interface ResumePromptFlow {
  status: ResumePromptStatus;
  shown_at: string | null;
  dismissed_at: string | null;
}

export interface UserFlags {
  onboarding?: OnboardingFlow;
  resume_prompt?: ResumePromptFlow;
}

export type FlowKey = keyof UserFlags;

const FLAGS_KEY = ["flags"] as const;

export function useFlags() {
  return useQuery({
    queryKey: FLAGS_KEY,
    queryFn: () => apiFetch<UserFlags>("/api/flag"),
    staleTime: 30_000,
  });
}

/**
 * Merges `patch` into one flow only — the backend deep-merges it into
 * `data.<flow>` server-side, so this never clobbers sibling flows or sibling
 * fields already sitting on the same flow.
 */
export function usePatchFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ flow, patch }: { flow: FlowKey; patch: Record<string, unknown> }) =>
      apiFetch<UserFlags>(`/api/flag/${flow}`, { method: "PATCH", ...jsonBody(patch) }),
    onMutate: async ({ flow, patch }) => {
      await qc.cancelQueries({ queryKey: FLAGS_KEY });
      const prev = qc.getQueryData<UserFlags>(FLAGS_KEY);
      qc.setQueryData<UserFlags>(FLAGS_KEY, {
        ...prev,
        [flow]: { ...(prev?.[flow] as object), ...patch },
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(FLAGS_KEY, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: FLAGS_KEY }),
  });
}
