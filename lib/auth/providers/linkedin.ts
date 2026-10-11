import LinkedIn from "next-auth/providers/linkedin";
import { hasCredentials, identityFromClaims } from "./claims";
import type { AuthProviderAdapter } from "./types";

export const linkedin: AuthProviderAdapter = {
  id: "linkedin",
  label: "LinkedIn",
  isConfigured: (env) => hasCredentials("linkedin", env),
  authjs: () => LinkedIn,
  // LinkedIn documents `email_verified` as optional ("may not be included in all responses"),
  // sent as a boolean or the string "true". A missing claim counts as verified: that is the
  // trust LinkedIn sign-in has always had here (the old flow never checked), and failing closed
  // would refuse every existing user, none of whom has a linked identity yet. Only an explicit
  // non-true value (false, "false", anything unexpected) is unverified. TRD Q3.
  toIdentity: (claims) => {
    const claim = claims.email_verified;
    const verified = claim === undefined || claim === null || claim === true || claim === "true";
    return identityFromClaims("linkedin", claims, verified);
  },
  // LinkedIn photo URLs are signed and expire (the `e=` param), so they are always mirrored.
  avatarHosts: /(^|\.)licdn\.com$/,
};
