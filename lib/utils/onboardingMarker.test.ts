import { describe, expect, it } from "vitest";
import { hasOnboardingMarker, ONBOARDING_MARKER, onboardingMarkerCookie } from "./onboardingMarker";

describe("onboarding marker", () => {
  it("matches only the user it was written for", () => {
    expect(hasOnboardingMarker("u1", "u1")).toBe(true);
    expect(hasOnboardingMarker("u1", "u2")).toBe(false);
    expect(hasOnboardingMarker(undefined, "u1")).toBe(false);
    expect(hasOnboardingMarker("", "")).toBe(false);
    expect(hasOnboardingMarker("u1", undefined)).toBe(false);
  });

  it("is a long-lived, site-wide cookie, Secure only over https", () => {
    const cookie = onboardingMarkerCookie("u1", false);
    expect(cookie.startsWith(`${ONBOARDING_MARKER}=u1;`)).toBe(true);
    expect(cookie).toContain("Path=/");
    expect(cookie).toMatch(/Max-Age=\d{8}/);
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).not.toContain("Secure");
    expect(onboardingMarkerCookie("u1", true)).toContain("; Secure");
  });
});
