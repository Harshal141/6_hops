import type { Claims, ProviderId, ProviderIdentity } from "./types";

// Claim parsing shared by every OIDC adapter. Each adapter decides only what is genuinely
// provider-specific (how it reports email verification), and hands the rest to here.

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

/** Both AUTH_<ID>_ID and AUTH_<ID>_SECRET are set: the same env names Auth.js reads. */
export const hasCredentials = (id: ProviderId, env: Record<string, string | undefined>): boolean => {
  const key = id.toUpperCase();
  return Boolean(env[`AUTH_${key}_ID`] && env[`AUTH_${key}_SECRET`]);
};

export function identityFromClaims(
  provider: ProviderId,
  claims: Claims,
  emailVerified: boolean,
): ProviderIdentity | null {
  const subject = text(claims.sub);
  const email = text(claims.email)?.toLowerCase() ?? null;
  if (!subject || !email || !email.includes("@")) return null;

  return {
    provider,
    subject,
    email,
    emailVerified,
    name: text(claims.name),
    avatarUrl: text(claims.picture),
  };
}
