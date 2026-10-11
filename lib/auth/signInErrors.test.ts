import { describe, expect, it } from "vitest";
import { signInErrorMessage, toSignInErrorCode } from "./signInErrors";

const GENERIC = "Sign-in didn't work. Please try again.";

describe("signInErrorMessage", () => {
  it("is null when there is no error", () => {
    expect(signInErrorMessage(undefined, "Google")).toBeNull();
    expect(signInErrorMessage("", "Google")).toBeNull();
  });

  it("names the provider for our own codes", () => {
    expect(signInErrorMessage("email_unverified", "Google")).toBe(
      "Your Google email isn't verified yet. Verify it with Google and try again.");
    expect(signInErrorMessage("provider_already_linked", "LinkedIn")).toBe(
      "This account is already linked to a different LinkedIn account. Sign in with that one.");
  });

  it("uses a neutral phrase when the provider is unknown", () => {
    expect(signInErrorMessage("email_unverified", null)).toContain("sign-in provider");
  });

  it("maps Auth.js cancellations and failures", () => {
    expect(signInErrorMessage("OAuthCallbackError", null)).toBe("Sign-in was cancelled.");
    // Our signIn callback never denies, so AccessDenied means it threw: a failure, not a cancel.
    expect(signInErrorMessage("AccessDenied", "Google")).toBe(GENERIC);
    expect(signInErrorMessage("Configuration", null)).toBe(GENERIC);
    expect(signInErrorMessage("signin_failed", "Google")).toBe(GENERIC);
  });

  it("never echoes an unknown or injected value", () => {
    for (const evil of ["<script>alert(1)</script>", "toString", "__proto__", "constructor"]) {
      expect(signInErrorMessage(evil, null)).toBe(GENERIC);
    }
  });
});

describe("toSignInErrorCode", () => {
  it("keeps the BE codes the login page knows, and folds everything else into signin_failed", () => {
    expect(toSignInErrorCode("email_unverified")).toBe("email_unverified");
    expect(toSignInErrorCode("provider_already_linked")).toBe("provider_already_linked");
    for (const other of ["unknown_provider", "", undefined, 42, "toString"]) {
      expect(toSignInErrorCode(other)).toBe("signin_failed");
    }
  });
});
