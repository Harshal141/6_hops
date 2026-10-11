import { describe, expect, it } from "vitest";
import { resolveSafeRedirect } from "./redirect";

const BASE = "https://6-hops.vercel.app";

describe("resolveSafeRedirect", () => {
  it("keeps same-origin targets", () => {
    expect(resolveSafeRedirect("/profile/ada-1234", BASE)).toBe(`${BASE}/profile/ada-1234`);
    expect(resolveSafeRedirect(`${BASE}/invite/ada-1234`, BASE)).toBe(`${BASE}/invite/ada-1234`);
  });

  it("lets a refused sign-in reach the login page with its error", () => {
    expect(resolveSafeRedirect("/login?error=email_unverified&provider=google", BASE))
      .toBe(`${BASE}/login?error=email_unverified&provider=google`);
  });

  it("sends a bare login page or the root to the dashboard", () => {
    expect(resolveSafeRedirect("/login", BASE)).toBe(`${BASE}/dashboard`);
    expect(resolveSafeRedirect("/login?callbackUrl=%2Fprofile", BASE)).toBe(`${BASE}/dashboard`);
    expect(resolveSafeRedirect("/", BASE)).toBe(`${BASE}/dashboard`);
  });

  it("never leaves the site", () => {
    for (const evil of ["https://evil.example/x", "//evil.example/x", "javascript:alert(1)", "not a url"]) {
      expect(resolveSafeRedirect(evil, BASE)).toBe(`${BASE}/dashboard`);
    }
  });
});
