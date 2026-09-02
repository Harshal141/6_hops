import NextAuth, { DefaultSession } from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL!;
const ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "stage";
// Which database this session may reach. Stamped into the token so the BE can
// reject a stage session that tries to select prod via the X-Env header.
const TOKEN_ENV = ENV === "prod" ? "prod" : "stage";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
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
          const res = await fetch(`${BE_URL}/auth/upsert`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Env": ENV,
              // This endpoint runs before a session exists, so it is gated on a
              // shared secret instead of a session token.
              "X-Internal-Secret": process.env.INTERNAL_API_SECRET ?? "",
            },
            body: JSON.stringify({ name: user.name, email: user.email, icon: user.image }),
          });

          if (!res.ok) {
            throw new Error(`auth/upsert failed with ${res.status}`);
          }
          const dbUser = await res.json();
          if (!dbUser?.id) {
            throw new Error("auth/upsert returned no user id");
          }
          token.id = dbUser.id;
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
      return session;
    },
  },
});
