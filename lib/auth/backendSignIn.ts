import type { ProviderIdentity } from "./providers/types";
import { toSignInErrorCode, type SignInErrorCode } from "./signInErrors";

// The FE side of the identity port: posts a normalised provider identity to the BE's
// POST /auth/identity and turns the answer into "signed in as X" or a sign-in error code.

export interface SignedInUser {
  id: string;
  handle: string;
  /** The avatar the BE stored for this user (may be another linked provider's). */
  icon: string | null;
}

export type BackendSignInResult = { ok: true; user: SignedInUser } | { ok: false; code: SignInErrorCode };

interface Options {
  beUrl: string;
  env: string;
  internalSecret: string;
  fetchImpl?: typeof fetch;
}

/** The BE body: the identity with the mirrored icon in place of the provider's photo URL. */
type IdentityBody = Omit<ProviderIdentity, "avatarUrl"> & { icon: string | null; referredBy?: string };

export async function backendSignIn(body: IdentityBody, { beUrl, env, internalSecret, fetchImpl = fetch }: Options): Promise<BackendSignInResult> {
  let res: Response;
  try {
    res = await fetchImpl(`${beUrl}/auth/identity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Env": env,
        // Runs before a session exists, so it is gated on a shared secret, not a token.
        "X-Internal-Secret": internalSecret,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Network-level failure (BE unreachable). Logged with the real cause, because Auth.js's
    // error page never shows it.
    console.error("[auth] /auth/identity unreachable during sign-in:", err);
    return { ok: false, code: "signin_failed" };
  }

  const payload: unknown = await res.json().catch(() => null);
  const record = (payload ?? {}) as Record<string, unknown>;

  if (!res.ok) {
    const code = toSignInErrorCode(record.code);
    // A refused sign-in (unverified email, already linked) is an expected outcome, not a bug.
    const log = code === "signin_failed" ? console.error : console.warn;
    log(`[auth] /auth/identity refused sign-in: ${res.status} ${String(record.code ?? "")}`.trim());
    return { ok: false, code };
  }

  if (typeof record.id !== "string" || typeof record.user_id !== "string") {
    console.error("[auth] /auth/identity returned no user id");
    return { ok: false, code: "signin_failed" };
  }
  return {
    ok: true,
    user: { id: record.id, handle: record.user_id, icon: typeof record.icon === "string" ? record.icon : null },
  };
}
