"use client";

import { useCallback, useEffect } from "react";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { FLAGS_KEY, flagsQuery, useFlags, usePatchFlag, type OnboardingFlow, type UserFlags } from "./flags";
import { isOnboardingFlow, shouldRouteToOnboarding, type OnboardingPatch } from "@/lib/utils/onboarding";
import { hasOnboardingMarker, ONBOARDING_MARKER, onboardingMarkerCookie } from "@/lib/utils/onboardingMarker";

/** Builds a patch from the flow as it stands right now, or null for nothing to write. */
export type OnboardingUpdate = (flow: OnboardingFlow | undefined) => OnboardingPatch | null;

function readCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  const hit = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return hit ? decodeURIComponent(hit.slice(prefix.length)) : undefined;
}

/**
 * Writes the onboarding marker (lib/utils/onboardingMarker.ts) once the flags are known to be
 * the server's, so the dashboard gate can skip its backend call from then on. "The server's"
 * means fetched, not refetching, and no flag write pending: an optimistic update that might
 * still fail never counts.
 */
function useOnboardingMarker(flags: ReturnType<typeof useFlags>) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const writing = useIsMutating({ mutationKey: FLAGS_KEY }) > 0;
  const settled = flags.isSuccess && !flags.isFetching && !writing && !shouldRouteToOnboarding(flags.data?.onboarding);

  useEffect(() => {
    if (!userId || !settled) return;
    if (hasOnboardingMarker(readCookie(ONBOARDING_MARKER), userId)) return;
    document.cookie = onboardingMarkerCookie(userId, window.location.protocol === "https:");
  }, [userId, settled]);
}

/**
 * The `onboarding` flag flow plus a writer. `update` reads the cache at call time, not a
 * render-time snapshot, so a patch starts from the latest optimistic state (a step already
 * marked done is never downgraded by a later skip).
 *
 * `update` never writes from an unknown flow: when the flags haven't loaded (or failed to),
 * it fetches them first, and if that fails it writes nothing. A patch built from "no flow"
 * would otherwise overwrite real progress.
 *
 * `update` resolves false when nothing could be saved (already logged), so a caller that is
 * about to navigate can decide what to do; the flow itself never blocks on it.
 */
export function useOnboarding() {
  const qc = useQueryClient();
  const flags = useFlags();
  const { mutateAsync } = usePatchFlag();
  useOnboardingMarker(flags);

  const update = useCallback(
    async (build: OnboardingUpdate): Promise<boolean> => {
      try {
        const current = (await qc.ensureQueryData<UserFlags>(flagsQuery)).onboarding;
        const patch = build(isOnboardingFlow(current) ? current : undefined);
        if (!patch) return true;
        await mutateAsync({ flow: "onboarding", patch });
        return true;
      } catch (err) {
        console.error("[onboarding] failed to save progress:", err);
        return false;
      }
    },
    [qc, mutateAsync],
  );

  const raw = flags.data?.onboarding;
  return {
    flow: isOnboardingFlow(raw) ? raw : undefined,
    isLoading: flags.isLoading,
    /** The flags couldn't be read at all; `flow` is then unknown, not absent. */
    isError: flags.isError && flags.data === undefined,
    /** Try reading the flags again, after `isError`. */
    retry: flags.refetch,
    update,
  };
}
