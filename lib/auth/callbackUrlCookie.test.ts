import { describe, expect, it, vi } from "vitest";

// The module also exports a cookies() reader; only the pure parsers are tested here.
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
const { callbackPathFromCookie, inviteReferrerFromPath } = await import("./callbackUrlCookie");

describe("callbackPathFromCookie", () => {
  it("keeps the path and query of an absolute or relative value", () => {
    expect(callbackPathFromCookie("https://6-hops.vercel.app/invite/ada-1234")).toBe("/invite/ada-1234");
    expect(callbackPathFromCookie("/profile/ada-1234?tab=links")).toBe("/profile/ada-1234?tab=links");
  });

  it("drops the origin, so an off-site value can only ever become a same-site path", () => {
    expect(callbackPathFromCookie("https://evil.example/dashboard")).toBe("/dashboard");
  });

  it("ignores missing values and destinations not worth restoring", () => {
    for (const raw of [undefined, "", "/", "/login", "https://6-hops.vercel.app/login?x=1", "//evil.example"]) {
      expect(callbackPathFromCookie(raw)).toBeNull();
    }
  });
});

describe("inviteReferrerFromPath", () => {
  it("extracts the handle from an invite link, with or without a query", () => {
    expect(inviteReferrerFromPath("/invite/ada-1234")).toBe("ada-1234");
    expect(inviteReferrerFromPath("/invite/ada-1234?utm=x")).toBe("ada-1234");
    expect(inviteReferrerFromPath("/invite/ada%2D1234")).toBe("ada-1234");
  });

  it("is null for anything else", () => {
    for (const path of [null, "/dashboard", "/invite/", "/invite/a/b", "/profile/ada-1234", "/invite/%E0%A4%A"]) {
      expect(inviteReferrerFromPath(path)).toBeNull();
    }
  });
});
