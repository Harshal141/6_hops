import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The gate's two inputs, mocked: the request's cookies and the BE call. No server, no network.
const cookieJar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name) } : undefined) }),
}));
const beClient = vi.fn();
vi.mock("@/lib/service", () => ({ beClient: (...args: unknown[]) => beClient(...args) }));

import { needsOnboarding } from "./onboardingGate";
import { ONBOARDING_MARKER } from "./utils/onboardingMarker";

const USER = "550e8400-e29b-41d4-a716-446655440000";
const SEEDED = { status: "not_started", current_step: 0, max_step_reached: 0, steps: {}, reminder_dismissed: false };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

beforeEach(() => {
  cookieJar.clear();
  beClient.mockReset();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("needsOnboarding", () => {
  it("routes a freshly seeded signup, asking the BE without caching", async () => {
    beClient.mockResolvedValue(json({ onboarding: SEEDED }));
    expect(await needsOnboarding(USER)).toBe(true);
    expect(beClient).toHaveBeenCalledWith("/flag", expect.objectContaining({ cache: "no-store" }));
  });

  it("does not route an opened flow or a user without one", async () => {
    beClient.mockResolvedValue(json({ onboarding: { ...SEEDED, status: "skipped" } }));
    expect(await needsOnboarding(USER)).toBe(false);
    beClient.mockResolvedValue(json({}));
    expect(await needsOnboarding(USER)).toBe(false);
  });

  describe("the marker cookie", () => {
    it("short-circuits: no BE call at all when it names this user", async () => {
      cookieJar.set(ONBOARDING_MARKER, USER);
      expect(await needsOnboarding(USER)).toBe(false);
      expect(beClient).not.toHaveBeenCalled();
    });

    it("is ignored when it was written for another account on this browser", async () => {
      cookieJar.set(ONBOARDING_MARKER, "someone-else");
      beClient.mockResolvedValue(json({ onboarding: SEEDED }));
      expect(await needsOnboarding(USER)).toBe(true);
      expect(beClient).toHaveBeenCalledTimes(1);
    });

    it("is ignored without a user id to match it against", async () => {
      cookieJar.set(ONBOARDING_MARKER, USER);
      beClient.mockResolvedValue(json({ onboarding: SEEDED }));
      expect(await needsOnboarding(undefined)).toBe(true);
    });
  });

  describe("fails open", () => {
    it.each([401, 404, 500, 503])("on a %i from the BE", async (status) => {
      beClient.mockResolvedValue(json({ error: "nope" }, status));
      expect(await needsOnboarding(USER)).toBe(false);
    });

    it("on a timeout or network error", async () => {
      beClient.mockRejectedValue(new DOMException("The operation was aborted due to timeout", "TimeoutError"));
      expect(await needsOnboarding(USER)).toBe(false);
      beClient.mockRejectedValue(new TypeError("fetch failed"));
      expect(await needsOnboarding(USER)).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });

    it("passes an abort signal so a slow BE can't hold the page", async () => {
      beClient.mockResolvedValue(json({}));
      await needsOnboarding(USER);
      const init = beClient.mock.calls[0][1] as RequestInit;
      expect(init.signal).toBeInstanceOf(AbortSignal);
    });

    it.each([
      ["a non-JSON body", new Response("<html>oops</html>", { status: 200 })],
      ["null", json(null)],
      ["an array", json([1, 2])],
      ["a string", json("not_started")],
      ["a malformed flow", json({ onboarding: { status: "not_started" } })],
    ])("on %s", async (_label, response) => {
      beClient.mockResolvedValue(response);
      expect(await needsOnboarding(USER)).toBe(false);
    });
  });
});
