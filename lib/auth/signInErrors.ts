// What the login page says when a sign-in is refused or fails. `?error=` and `?provider=` are
// user-editable, so both are looked up in allowlists here and never echoed back.
// prds/google-oauth-identity-linking.md §5.5.

/** Codes our own sign-in flow puts in `?error=`. The first two come from the BE. */
export type SignInErrorCode = "email_unverified" | "provider_already_linked" | "signin_failed";

const BACKEND_CODES = new Set<string>(["email_unverified", "provider_already_linked"]);

/** A BE error `code` as one of ours. Anything unexpected is a plain failure. */
export const toSignInErrorCode = (code: unknown): SignInErrorCode =>
  typeof code === "string" && BACKEND_CODES.has(code) ? (code as SignInErrorCode) : "signin_failed";

const GENERIC = "Sign-in didn't work. Please try again.";
const CANCELLED = "Sign-in was cancelled.";

// Keyed by our codes plus the Auth.js error types that can reach /login (pages.signIn and
// pages.error both point there). Everything else is GENERIC, notably:
// - Configuration: anything Auth.js won't name to the client.
// - AccessDenied: our signIn callback never returns false, so this only means it *threw*
//   (possibly after the BE already resolved the user). A failure, not a cancel.
// A real cancel at Google/LinkedIn comes back as OAuthCallbackError (error=access_denied).
const MESSAGES: Record<string, (provider: string) => string> = {
  email_unverified: (p) => `Your ${p} email isn't verified yet. Verify it with ${p} and try again.`,
  provider_already_linked: (p) =>
    `This account is already linked to a different ${p} account. Sign in with that one.`,
  signin_failed: () => GENERIC,
  OAuthCallbackError: () => CANCELLED,
};

/**
 * The message for `?error=`, or null when there is no error. `providerLabel` must already be
 * validated (the adapter's label), or null to use a neutral phrase.
 */
export function signInErrorMessage(error: string | undefined, providerLabel: string | null): string | null {
  if (!error) return null;
  const message = Object.hasOwn(MESSAGES, error) ? MESSAGES[error] : () => GENERIC;
  return message(providerLabel ?? "sign-in provider");
}
