import { describe, expect, it, vi } from "vitest";

// cookies() is mocked: the parsers are pure, and readCallbackPath only needs a cookie store.
const store = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: (name: string) => (store.has(name) ? { name, value: store.get(name) } : undefined) })),
}));
const { callbackPathFromCookie, inviteReferrerFromPath, readCallbackPath } = await import("./callbackUrlCookie");

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

// The chain auth.ts's signIn callback runs: Auth.js's callback-url cookie, set before leaving
// for the provider, becomes the `referredBy` it sends to POST /auth/identity.
describe("invite callback to referredBy", () => {
  it("reads the referrer from the callback-url cookie of an invite sign-in, on http and https", async () => {
    store.clear();
    store.set("authjs.callback-url", "http://localhost:3001/invite/ada-1234");
    expect(inviteReferrerFromPath(await readCallbackPath())).toBe("ada-1234");

    store.clear();
    store.set("__Secure-authjs.callback-url", "https://6-hops.vercel.app/invite/ada-1234?utm=x");
    expect(inviteReferrerFromPath(await readCallbackPath())).toBe("ada-1234");
  });

  it("has no referrer for any other destination, or no cookie", async () => {
    store.clear();
    expect(inviteReferrerFromPath(await readCallbackPath())).toBeNull();
    store.set("authjs.callback-url", "http://localhost:3001/dashboard");
    expect(inviteReferrerFromPath(await readCallbackPath())).toBeNull();
  });
});
