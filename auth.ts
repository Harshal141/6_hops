import NextAuth, { DefaultSession } from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";

const BE_URL = process.env.NEXT_PUBLIC_BE_URL!;
const ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "stage";

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
        const res = await fetch(`${BE_URL}/auth/upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Env": ENV },
          body: JSON.stringify({ name: user.name, email: user.email, icon: user.image }),
        });

        // Fail sign-in loudly. A token without `id` is rejected by the BE, so
        // swallowing this would leave the user "logged in" with every API call
        // returning 401 and no way to tell why.
        if (!res.ok) {
          throw new Error(`auth/upsert failed with ${res.status}`);
        }
        const dbUser = await res.json();
        if (!dbUser?.id) {
          throw new Error("auth/upsert returned no user id");
        }
        token.id = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
