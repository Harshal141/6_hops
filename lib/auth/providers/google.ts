import Google from "next-auth/providers/google";
import { hasCredentials, identityFromClaims } from "./claims";
import type { AuthProviderAdapter } from "./types";

export const google: AuthProviderAdapter = {
  id: "google",
  label: "Google",
  isConfigured: (env) => hasCredentials("google", env),
  // select_account: someone signed into several Google accounts picks one, rather than being
  // signed in silently with whichever is current (and then hitting provider_already_linked).
  authjs: () => Google({ authorization: { params: { prompt: "select_account" } } }),
  toIdentity: (claims) => identityFromClaims("google", claims, claims.email_verified === true),
  avatarHosts: /(^|\.)googleusercontent\.com$/,
};
