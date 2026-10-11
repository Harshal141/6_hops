import { describe, expect, it } from "vitest";
import { lastUsedCookieOptions, parseLastUsed } from "./lastUsedProvider";

describe("parseLastUsed", () => {
  it("returns an enabled provider", () => {
    expect(parseLastUsed("google", ["linkedin", "google"])).toBe("google");
  });

  it("ignores a provider that is not enabled right now", () => {
    expect(parseLastUsed("google", ["linkedin"])).toBeNull();
  });

  it("ignores missing or garbage values", () => {
    for (const raw of [undefined, "", "github", "GOOGLE", "constructor", "google;evil"]) {
      expect(parseLastUsed(raw, ["linkedin", "google"])).toBeNull();
    }
  });
});

describe("lastUsedCookieOptions", () => {
  it("is long-lived, http-only and lax, secure only when asked", () => {
    expect(lastUsedCookieOptions(true)).toMatchObject({ httpOnly: true, sameSite: "lax", secure: true, path: "/" });
    expect(lastUsedCookieOptions(false).secure).toBe(false);
    expect(lastUsedCookieOptions(true).maxAge).toBeGreaterThanOrEqual(60 * 60 * 24 * 365);
  });
});
