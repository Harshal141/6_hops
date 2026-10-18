import { useMutation, useQuery, useQueryClient, type QueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { apiFetch, jsonBody } from "@/lib/utils/api";

// ── Types ──────────────────────────────────────────────────
//
// Each key in `UserFlags` is a "flow" — a self-contained fact bag for one
// small piece of cross-session UI state (where the user is in onboarding,
// have they dismissed the resume prompt, …). New flows are added here and to the
// backend's KNOWN_FLOWS allowlist together; this file never invents a flow
// key that route doesn't recognise.

export type OnboardingStatus = "not_started" | "in_progress" | "skipped" | "completed";

/** The three setup tasks, in the order the flow shows them. */
export type OnboardingStepKey = "profile" | "connect" | "invite";
export type OnboardingStepResult = "done" | "skipped";

/**
 * The onboarding flow, seeded at sign-up as `not_started`. Users who signed up before
 * the flow existed have no `onboarding` key (or a leftover from the retired tour without
 * `steps`), and must never be routed into it: see `isOnboardingFlow` in lib/utils/onboarding.
 */
export interface OnboardingFlow {
  status: OnboardingStatus;
  /** Step currently shown: 0 welcome, 1 profile, 2 connect, 3 invite, 4 done. */
  current_step: number;
  /** Highest step index ever reached — the drop-off marker when status is "skipped". */
  max_step_reached: number;
  /** Outcome per task. Absent means not reached yet. A PATCH carries only the task it changes: the backend merges `steps` one level deep. */
  steps: Partial<Record<OnboardingStepKey, OnboardingStepResult>>;
  /** The dashboard's "Finish setup" strip was closed. */
  reminder_dismissed: boolean;
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

export const FLAGS_KEY = ["flags"] as const;

/** One cache entry and one fetch for every reader, including writers that need the server state first. */
export const flagsQuery = {
  queryKey: FLAGS_KEY,
  queryFn: () => apiFetch<UserFlags>("/api/flag"),
  staleTime: 30_000,
};

export function useFlags() {
  return useQuery(flagsQuery);
}

/** A patch for one flow: any subset of that flow's top-level fields. */
export type FlowPatch = { [F in FlowKey]: { flow: F; patch: Partial<NonNullable<UserFlags[F]>> } }[FlowKey];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * The backend's merge (service_hops flagService.patchFlow), for the optimistic update: each
 * top-level field of `patch` replaces the stored one, except that an object over an object is
 * merged one level deeper. So `{ steps: { connect: "done" } }` keeps every other step.
 */
export function mergeFlowPatch(current: unknown, patch: Record<string, unknown>): Record<string, unknown> {
  const base = isObject(current) ? current : {};
  const merged: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    merged[key] = isObject(value) && isObject(base[key]) ? { ...base[key], ...value } : value;
  }
  return merged;
}

/** Every flag write shares this scope, so TanStack runs them one at a time, in call order. */
export const FLAGS_SCOPE = { id: "flags" } as const;

type PatchFlagOptions = UseMutationOptions<UserFlags, Error, FlowPatch, { prev: UserFlags | undefined }>;

/**
 * The flag write, as plain mutation options (the hook below, and its unit test, use these).
 *
 * Writes are serialised by `scope`, so the server applies them in the order they were made,
 * while each one's optimistic update lands at once. That shapes the error handling: a failed
 * write rolls the cache back to its snapshot only when no other flag write is queued or in
 * flight, because a later write's optimistic state was built on top of this one and a
 * rollback would erase it. Otherwise the refetch after the last write settles restores the
 * server's truth for everyone.
 */
export function patchFlagOptions(qc: QueryClient): PatchFlagOptions {
  const othersPending = () => qc.isMutating({ mutationKey: FLAGS_KEY }) > 1;
  return {
    mutationKey: FLAGS_KEY,
    scope: FLAGS_SCOPE,
    mutationFn: ({ flow, patch }) =>
      apiFetch<UserFlags>(`/api/flag/${flow}`, { method: "PATCH", ...jsonBody(patch) }),
    onMutate: async ({ flow, patch }) => {
      await qc.cancelQueries({ queryKey: FLAGS_KEY });
      const prev = qc.getQueryData<UserFlags>(FLAGS_KEY);
      qc.setQueryData<UserFlags>(FLAGS_KEY, {
        ...prev,
        [flow]: mergeFlowPatch(prev?.[flow], patch as Record<string, unknown>),
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev && !othersPending()) qc.setQueryData(FLAGS_KEY, ctx.prev);
    },
    // Refetch only once the last write settles: an earlier refetch could land between two
    // writes and briefly undo the later optimistic one.
    onSettled: () => {
      if (!othersPending()) qc.invalidateQueries({ queryKey: FLAGS_KEY });
    },
  };
}

/** Merges `patch` into one flow only (see `mergeFlowPatch`); sibling flows are never touched. */
export function usePatchFlag() {
  return useMutation(patchFlagOptions(useQueryClient()));
}
