// Post-sign-in redirect guard (Auth.js `redirect` callback). Pure, so it is testable without
// importing NextAuth.

/**
 * Same-origin allowlist, Auth.js's recommended pattern. `/` and a bare `/login` go to the
 * dashboard instead, since sending a signed-in user back to the login page would loop.
 * `/login?error=…` is let through: that is how the `signIn` callback reports a refused
 * sign-in (prds/google-oauth-identity-linking.md §5.5).
 */
export function resolveSafeRedirect(url: string, baseUrl: string): string {
  let target: string;
  if (url.startsWith("/") && !url.startsWith("//")) {
    target = `${baseUrl}${url}`;
  } else {
    try {
      target = new URL(url).origin === new URL(baseUrl).origin ? url : baseUrl;
    } catch {
      target = baseUrl;
    }
  }

  const { pathname, searchParams } = new URL(target);
  if (pathname === "/" || (pathname === "/login" && !searchParams.has("error"))) {
    return `${baseUrl}/dashboard`;
  }
  return target;
}
