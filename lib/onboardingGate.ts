import { cookies } from "next/headers";
import { beClient } from "@/lib/service";
import { shouldRouteToOnboarding } from "@/lib/utils/onboarding";
import { hasOnboardingMarker, ONBOARDING_MARKER } from "@/lib/utils/onboardingMarker";

/** Long enough for a warm BE, short enough that a slow one never holds the dashboard up. */
const GATE_TIMEOUT_MS = 2500;

/**
 * Server-side: should this signed-in request go to /onboarding instead? Only for a
 * brand-new signup whose flow is still `not_started`.
 *
 * Steady state costs nothing: once the browser carries the onboarding marker for this user
 * (lib/utils/onboardingMarker.ts), the answer is "no" without a backend call. Only a browser
 * without it (a new signup, a new device, another account) asks the BE.
 *
 * Fails open: any error, timeout or unexpected body means "no", so a flags outage can never
 * block the dashboard.
 */
export async function needsOnboarding(userId: string | undefined): Promise<boolean> {
  try {
    const store = await cookies();
    if (hasOnboardingMarker(store.get(ONBOARDING_MARKER)?.value, userId)) return false;

    const res = await beClient("/flag", {
      cache: "no-store",
      signal: AbortSignal.timeout(GATE_TIMEOUT_MS),
    });
    if (!res.ok) return false;
    const flags: unknown = await res.json();
    if (!flags || typeof flags !== "object") return false;
    return shouldRouteToOnboarding((flags as { onboarding?: unknown }).onboarding);
  } catch (err) {
    // warn, not error: a slow BE is not worth a Sentry event per dashboard load
    console.warn("[onboarding] gate check failed, letting the request through:", err);
    return false;
  }
}
