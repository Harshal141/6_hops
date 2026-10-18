/**
 * The "onboarding is settled" marker: a plain cookie that lets the server-side onboarding gate
 * (lib/onboardingGate.ts) skip its backend round trip in the steady state.
 *
 * Its value is the user id it was written for, so it only ever speaks for that user: after an
 * account switch on the same browser the id no longer matches, and the gate asks the backend
 * again. It is set from the client (lib/hooks/onboarding.ts) once the server-confirmed flags
 * say this user is not a pending signup, which can never change back: a flow only leaves
 * `not_started`, and a user without a flow never gets one.
 *
 * Not a security boundary. Forging it can only skip your own setup screen, which "Skip setup"
 * does anyway, so it is neither signed nor httpOnly.
 */

export const ONBOARDING_MARKER = "hops_onb";

/** A year: the marker never goes stale, so it only needs to outlive casual cookie clearing. */
const MAX_AGE_SEC = 60 * 60 * 24 * 365;

/** True when the marker cookie's value was written for `userId`. */
export function hasOnboardingMarker(value: string | undefined | null, userId: string | undefined | null): boolean {
  return Boolean(value && userId && value === userId);
}

/** The `document.cookie` assignment that records the marker for `userId`. */
export function onboardingMarkerCookie(userId: string, secure: boolean): string {
  return [
    `${ONBOARDING_MARKER}=${encodeURIComponent(userId)}`,
    "Path=/",
    `Max-Age=${MAX_AGE_SEC}`,
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}
