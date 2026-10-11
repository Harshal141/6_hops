import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PROVIDER_UI } from "@/app/components/auth/providerUi";
import { google } from "./google";
import { linkedin } from "./linkedin";
import { adapterFor, enabledAdapters, isProviderId } from "./registry";
import type { Claims, ProviderId } from "./types";

const ALL_ENV = {
  AUTH_LINKEDIN_ID: "x", AUTH_LINKEDIN_SECRET: "x", AUTH_GOOGLE_ID: "x", AUTH_GOOGLE_SECRET: "x",
};

/** The recorded ID-token claims for a provider: real shape, fake values. */
const fixture = (id: ProviderId): Claims =>
  JSON.parse(readFileSync(path.join(__dirname, "fixtures", `${id}.claims.json`), "utf8"));

// Contract: every registered provider, so a new one is covered (and must ship a fixture and a
// brand mark) without touching this file.
describe.each(enabledAdapters(ALL_ENV).map((adapter) => [adapter.id, adapter] as const))(
  "%s adapter contract",
  (id, adapter) => {
    it("turns its recorded claims into a valid identity", () => {
      const identity = adapter.toIdentity(fixture(id));
      expect(identity).not.toBeNull();
      expect(identity!.provider).toBe(id);
      expect(identity!.subject).toBe(fixture(id).sub);
      expect(identity!.subject).not.toBe(identity!.email);
      expect(identity!.email).toBe(String(fixture(id).email).trim().toLowerCase());
      expect(identity!.emailVerified).toBe(true);
      expect(identity!.avatarUrl).toBe(fixture(id).picture);
    });

    it("allows its own avatar host", () => {
      expect(adapter.avatarHosts.test(new URL(String(fixture(id).picture)).hostname)).toBe(true);
    });

    it("rejects claims without a subject or email", () => {
      expect(adapter.toIdentity({ ...fixture(id), sub: undefined })).toBeNull();
      expect(adapter.toIdentity({ ...fixture(id), email: "  " })).toBeNull();
      expect(adapter.toIdentity({ ...fixture(id), email: "not-an-email" })).toBeNull();
    });

    it("has a sign-in button, and a branded one uses an official mark", () => {
      const ui = PROVIDER_UI[id];
      expect(ui?.text).toContain(adapter.label);
      if (ui.variant === "social") expect(ui.mark?.src).toMatch(/^\/brand\//);
    });
  },
);

describe("email verification is read from the provider's claim", () => {
  // LinkedIn's claim is optional: missing means "as trusted as LinkedIn always was" (verified);
  // only an explicit non-true value is unverified.
  it.each([
    [true, true], ["true", true], [undefined, true], [null, true],
    [false, false], ["false", false], ["yes", false], [0, false],
  ])("LinkedIn email_verified %j -> %j", (claim, expected) => {
    expect(linkedin.toIdentity({ ...fixture("linkedin"), email_verified: claim })!.emailVerified).toBe(expected);
  });

  it.each([
    [true, true], [false, false], [undefined, false], ["true", false],
  ])("Google email_verified %j -> %j", (claim, expected) => {
    expect(google.toIdentity({ ...fixture("google"), email_verified: claim })!.emailVerified).toBe(expected);
  });
});

describe("avatar host allowlists don't cross providers", () => {
  it("refuses the other provider's host and lookalikes", () => {
    expect(linkedin.avatarHosts.test("lh3.googleusercontent.com")).toBe(false);
    expect(google.avatarHosts.test("media.licdn.com")).toBe(false);
    expect(google.avatarHosts.test("googleusercontent.com.evil.example")).toBe(false);
    expect(linkedin.avatarHosts.test("evillicdn.com")).toBe(false);
  });
});

describe("registry", () => {
  it("includes only providers with both credentials, in a fixed order", () => {
    expect(enabledAdapters(ALL_ENV).map((a) => a.id)).toEqual(["linkedin", "google"]);
    expect(enabledAdapters({ AUTH_GOOGLE_ID: "x", AUTH_GOOGLE_SECRET: "x" }).map((a) => a.id)).toEqual(["google"]);
    expect(enabledAdapters({ AUTH_GOOGLE_ID: "x", AUTH_LINKEDIN_ID: "x", AUTH_LINKEDIN_SECRET: "" })).toEqual([]);
  });

  it("recognises only real provider ids", () => {
    expect(isProviderId("google")).toBe(true);
    expect(adapterFor("linkedin")).toBe(linkedin);
    for (const bogus of ["github", "", "constructor", "__proto__", null, 1]) {
      expect(isProviderId(bogus)).toBe(false);
    }
  });
});
