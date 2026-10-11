import NextAuth, { DefaultSession } from "next-auth";
import { cookies } from "next/headers";
import { enabledAdapters, adapterFor, isProviderId } from "@/lib/auth/providers/registry";
import { backendSignIn } from "@/lib/auth/backendSignIn";
import { inviteReferrerFromPath, readCallbackPath } from "@/lib/auth/callbackUrlCookie";
import { LAST_USED_COOKIE, lastUsedCookieOptions } from "@/lib/auth/lastUsedProvider";
import { resolveSafeRedirect } from "@/lib/auth/redirect";
import type { SignInErrorCode } from "@/lib/auth/signInErrors";
import { avatarBlobKey, mirrorAvatarToBlob } from "@/lib/utils/avatar";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL!;
const ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "stage";
// Which database this session may reach. Stamped into the token so the BE can
// reject a stage session that tries to select prod via the X-Env header.
const TOKEN_ENV = ENV === "prod" ? "prod" : "stage";

declare module "next-auth" {
  interface Session {
    user: { id: string; handle: string } & DefaultSession["user"];
  }
  // Set by the signIn callback once the BE has resolved the sign-in, read once by `jwt`.
  // Without a DB adapter Auth.js passes the same user object to both callbacks.
  interface User {
    dbId?: string;
    handle?: string;
  }
}

/**
 * Where a refused sign-in lands. The `redirect` callback lets `/login?error=` through. The
 * original destination isn't put in the URL: the login page restores it from Auth.js's
 * callback-url cookie, which covers Auth.js's own error redirects too.
 */
const signInErrorPath = (code: SignInErrorCode, provider: string) =>
  `/login?${new URLSearchParams({ error: code, provider })}`;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: enabledAdapters().map((adapter) => adapter.authjs()),
  session: { strategy: "jwt" },
  // Auth.js's own failures (cancelled consent, lost state cookie) land on the login page too,
  // which maps their type to a message (lib/auth/signInErrors.ts).
  pages: { signIn: "/login", error: "/login" },
  // Auth.js catches its own errors (e.g. InvalidCheck on a callback that lost its
  // state cookie) and only logs them as plain strings. Logging the Error object
  // instead lets Sentry's console capture report it with its type and stack.
  logger: {
    error(error) {
      console.error("[auth][error]", error);
    },
  },
  callbacks: {
    // Resolves the sign-in with the BE (prds/google-oauth-identity-linking.md §5.5). This is
    // the callback whose string return Auth.js turns into a redirect, so a refused sign-in can
    // reach /login with a specific error code; an error thrown from `jwt` would be flattened
    // to a generic "Configuration" page.
    async signIn({ user, account, profile }) {
      const provider = account?.provider;
      if (!isProviderId(provider) || !profile) return signInErrorPath("signin_failed", "");

      const adapter = adapterFor(provider);
      const identity = adapter.toIdentity(profile);
      if (!identity) {
        console.error(`[auth] ${provider} sign-in returned no subject or email`);
        return signInErrorPath("signin_failed", provider);
      }

      const { avatarUrl, ...rest } = identity;
      // Mirrors on every sign-in, so a returning user's avatar is refreshed too. Falls back to
      // the provider URL if the copy fails rather than leaving the user without one.
      const icon = avatarUrl
        ? (await mirrorAvatarToBlob(avatarUrl, await avatarBlobKey(provider, identity.subject), adapter.avatarHosts)) ?? avatarUrl
        : null;
      // Confirmed in prod (prds/referral-signin-redirect.md Part 2): this NextAuth beta
      // exposes the callback-url cookie inside its callbacks.
      const referredBy = inviteReferrerFromPath(await readCallbackPath());

      const result = await backendSignIn(
        { ...rest, icon, ...(referredBy ? { referredBy } : {}) },
        { beUrl: BE_URL, env: ENV, internalSecret: process.env.INTERNAL_API_SECRET ?? "" },
      );
      if (!result.ok) return signInErrorPath(result.code, provider);

      user.dbId = result.user.id;
      user.handle = result.user.handle;
      // The session's `image` (Auth.js copies user.image into the token right after this) is
      // the avatar we stored, not the provider's raw photo URL: a mirrored Blob URL that
      // doesn't expire, and for a linked user the same avatar whichever provider they used.
      user.image = result.user.icon ?? user.image;
      // This runs inside Auth.js's callback route handler, so the cookie rides on its response.
      // Secure everywhere except `next dev` on http://localhost.
      (await cookies()).set(LAST_USED_COOKIE, provider, lastUsedCookieOptions(process.env.NODE_ENV === "production"));
      return true;
    },
    async jwt({ token, user }) {
      // `user` is only present on the sign-in request, right after signIn accepted it.
      if (user?.dbId) {
        token.id = user.dbId;
        token.handle = user.handle;
      }
      token.env = TOKEN_ENV;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.handle = token.handle as string;
      return session;
    },
    async redirect({ url, baseUrl }) {
      return resolveSafeRedirect(url, baseUrl);
    },
  },
});
