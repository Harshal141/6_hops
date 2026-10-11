import type { Provider } from "next-auth/providers";

// The sign-in provider port (prds/google-oauth-identity-linking.md §5.1). Everything
// provider-specific lives behind AuthProviderAdapter; the sign-in flow, the login page and the
// BE only ever see a ProviderIdentity.
//
// No React in this module or the adapters: auth.ts imports them, and auth.ts is bundled into
// the middleware (Edge). Brand marks and other UI live in app/components/auth/.

export type ProviderId = "linkedin" | "google";

/** ID-token claims as Auth.js hands them over for an OIDC provider. Untrusted shape. */
export type Claims = Record<string, unknown>;

/** A provider sign-in, normalised. Mirrors the BE's POST /auth/identity body. */
export interface ProviderIdentity {
  provider: ProviderId;
  /** The provider's stable user id (OIDC `sub`). Never the email. */
  subject: string;
  /** Trimmed and lowercased. */
  email: string;
  /** The provider says it verified this address, per its adapter's reading of the claim. */
  emailVerified: boolean;
  name: string | null;
  /** The provider's photo URL, before it is mirrored to Blob. */
  avatarUrl: string | null;
}

export interface AuthProviderAdapter {
  id: ProviderId;
  /** Display name, e.g. in "Continue with Google". */
  label: string;
  /** Its AUTH_<ID>_ID and AUTH_<ID>_SECRET are both set. */
  isConfigured(env: Record<string, string | undefined>): boolean;
  /** The next-auth provider, with any provider-specific params. */
  authjs(): Provider;
  /** null when the claims lack a subject or email: sign-in can't proceed. */
  toIdentity(claims: Claims): ProviderIdentity | null;
  /** Hosts the avatar mirror may fetch this provider's photo from. */
  avatarHosts: RegExp;
}
