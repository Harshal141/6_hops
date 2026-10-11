import { afterEach, describe, expect, it, vi } from "vitest";
import { backendSignIn } from "./backendSignIn";

// The FE half of the identity port: request shape and how BE answers map to a sign-in result.
// The resolution rules themselves are BE behaviour (service_hops identityService.db.test.js).

const BODY = {
  provider: "google" as const,
  subject: "110169484474386276334",
  email: "grace.hopper@gmail.com",
  emailVerified: true,
  name: "Grace Hopper",
  icon: "https://blob.example/avatars/x.jpg",
};
const OPTIONS = { beUrl: "https://be.example", env: "prod", internalSecret: "s3cret" };

const respond = (status: number, body: unknown) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));

afterEach(() => vi.restoreAllMocks());

describe("backendSignIn", () => {
  it("posts the identity with env and internal secret, and returns the user", async () => {
    const fetchImpl = respond(200, {
      id: "u-1", user_id: "grace-1a2b3c4d", name: "Grace", icon: "https://blob.example/avatars/x.jpg", inserted: true, linked: false,
    });
    const result = await backendSignIn(BODY, { ...OPTIONS, fetchImpl });

    expect(result).toEqual({ ok: true, user: { id: "u-1", handle: "grace-1a2b3c4d", icon: "https://blob.example/avatars/x.jpg" } });
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://be.example/auth/identity");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ "X-Env": "prod", "X-Internal-Secret": "s3cret" });
    expect(JSON.parse(String(init.body))).toEqual(BODY);
  });

  it.each([
    [403, "email_unverified", "email_unverified"],
    [409, "provider_already_linked", "provider_already_linked"],
    [400, "unknown_provider", "signin_failed"],
    [500, undefined, "signin_failed"],
  ])("maps a %i %s refusal to %s", async (status, code, expected) => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await backendSignIn(BODY, { ...OPTIONS, fetchImpl: respond(status, { error: "x", code }) });
    expect(result).toEqual({ ok: false, code: expected });
  });

  it("fails cleanly, logging the cause, when the BE is unreachable", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchImpl = vi.fn(async () => { throw new TypeError("fetch failed"); });
    expect(await backendSignIn(BODY, { ...OPTIONS, fetchImpl })).toEqual({ ok: false, code: "signin_failed" });
    expect(error).toHaveBeenCalled();
  });

  it("fails when a 200 carries no user id", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await backendSignIn(BODY, { ...OPTIONS, fetchImpl: respond(200, { ok: true }) }))
      .toEqual({ ok: false, code: "signin_failed" });
  });
});
