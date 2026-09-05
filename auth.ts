import NextAuth, { DefaultSession } from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import { cookies } from "next/headers";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL!;
const ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "stage";
// Which database this session may reach. Stamped into the token so the BE can
// reject a stage session that tries to select prod via the X-Env header.
const TOKEN_ENV = ENV === "prod" ? "prod" : "stage";

declare module "next-auth" {
  interface Session {
    user: { id: string; handle: string } & DefaultSession["user"];
  }
}

// https deployments get the __Secure- prefix; http (local dev) does not — same
// pattern lib/service.ts uses for the session-token cookie.
const CALLBACK_URL_COOKIE_NAMES = ["__Secure-authjs.callback-url", "authjs.callback-url"];

/**
 * Reads the callback-url cookie Auth.js stores before redirecting to the
 * provider, and extracts the referrer id if it points at `/invite/<id>`.
 *
 * POC per prds/referral-signin-redirect.md Part 2: unconfirmed whether this
 * NextAuth beta version makes the cookie readable from inside the `jwt`
 * callback. Logged below so a real sign-in through `/invite/<id>` can confirm
 * it in the deployment logs.
 */
async function readInviteReferrerId(): Promise<string | null> {
  const store = await cookies();
  let raw: string | undefined;
  for (const name of CALLBACK_URL_COOKIE_NAMES) {
    raw = store.get(name)?.value;
    if (raw) break;
  }

  console.log("[auth] callback-url cookie during sign-in:", raw ?? "(not set)");
  if (!raw) return null;

  try {
    // The cookie value may be absolute (Auth.js's own origin) or relative — the
    // base below is only ever used to make a relative value parseable, its
    // value is otherwise irrelevant since only the pathname is read.
    const pathname = new URL(raw, "http://internal.invalid").pathname;
    const match = pathname.match(/^\/invite\/([^/]+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/** Same-origin allowlist for the post-sign-in redirect — Auth.js's recommended pattern. */
function resolveSafeRedirect(url: string, baseUrl: string): string {
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

  const { pathname } = new URL(target);
  if (pathname === "/login" || pathname === "/") {
    return `${baseUrl}/dashboard`;
  }
  return target;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [LinkedIn],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user, account }) {
      // only runs on first sign-in — upsert user in BE and store DB id in token
      if (account && user) {
        try {
          const referredBy = await readInviteReferrerId();

          const res = await fetch(`${BE_URL}/auth/upsert`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Env": ENV,
              // This endpoint runs before a session exists, so it is gated on a
              // shared secret instead of a session token.
              "X-Internal-Secret": process.env.INTERNAL_API_SECRET ?? "",
            },
            body: JSON.stringify({
              name: user.name,
              email: user.email,
              icon: user.image,
              ...(referredBy ? { referredBy } : {}),
            }),
          });

          if (!res.ok) {
            throw new Error(`auth/upsert failed with ${res.status}`);
          }
          const dbUser = await res.json();
          if (!dbUser?.id) {
            throw new Error("auth/upsert returned no user id");
          }
          token.id = dbUser.id;
          token.handle = dbUser.user_id;
        } catch (err) {
          // Fail sign-in loudly. A token without `id` is rejected by the BE, so
          // swallowing this would leave the user "logged in" with every API call
          // returning 401 and no way to tell why. Logged here (with the real
          // cause — including network-level failures fetch() itself throws,
          // e.g. BE unreachable) because Auth.js's own error page only ever
          // shows a generic error code, not this message.
          console.error("[auth] upsert failed during sign-in:", err);
          throw new Error("auth/upsert failed");
        }
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
