import { cookies } from "next/headers";

// Auth.js stores the post-sign-in destination (`redirectTo`) in its callback-url cookie before
// leaving for the provider. Two readers need it:
// - auth.ts, to credit the referrer when that destination is an /invite/<handle> link;
// - the login page after a refused or failed sign-in, whose redirect back to /login loses
//   `?callbackUrl=`, so a retry still lands where the user was going (and keeps the referral).

// https deployments get the __Secure- prefix; http (local dev) does not — same
// pattern lib/service.ts uses for the session-token cookie.
const CALLBACK_URL_COOKIE_NAMES = ["__Secure-authjs.callback-url", "authjs.callback-url"];

/**
 * The cookie's destination as a same-site path (+ query), or null. The value may be absolute
 * (Auth.js's own origin) or relative; only the path is kept, so it can never point off-site.
 * `/` and `/login` are not destinations worth restoring.
 */
export function callbackPathFromCookie(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    // The base only makes a relative value parseable; it is never part of the result.
    const { pathname, search } = new URL(raw, "http://internal.invalid");
    if (pathname === "/" || pathname === "/login" || pathname.startsWith("//")) return null;
    return `${pathname}${search}`;
  } catch {
    return null;
  }
}

export async function readCallbackPath(): Promise<string | null> {
  const store = await cookies();
  for (const name of CALLBACK_URL_COOKIE_NAMES) {
    const path = callbackPathFromCookie(store.get(name)?.value);
    if (path) return path;
  }
  return null;
}

/** The referrer handle when the destination is `/invite/<handle>`. */
export function inviteReferrerFromPath(path: string | null): string | null {
  const match = path?.split("?")[0].match(/^\/invite\/([^/]+)$/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}
