import type { ProviderId } from "./providers/types";

// "Last used" on the login page: a per-browser cookie naming the provider of the last
// successful sign-in. Deliberately kept on sign-out, which is exactly when it is useful.

export const LAST_USED_COOKIE = "hops_last_provider";

export const lastUsedCookieOptions = (secure: boolean) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
});

/** The cookie's provider, if it is one that is enabled right now. It is user-editable input. */
export function parseLastUsed(raw: string | undefined, enabled: readonly ProviderId[]): ProviderId | null {
  return raw && (enabled as readonly string[]).includes(raw) ? (raw as ProviderId) : null;
}
