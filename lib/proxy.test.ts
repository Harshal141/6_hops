import { describe, it, expect, vi, beforeEach } from "vitest";

const { auth, beClient } = vi.hoisted(() => ({
  auth: vi.fn(),
  beClient: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/service", () => ({ beClient }));

import { proxyAuthed } from "./proxy";

describe("proxyAuthed", () => {
  beforeEach(() => {
    auth.mockReset().mockResolvedValue({ user: { id: "u1" } });
    beClient.mockReset();
  });

  it("rejects without a session", async () => {
    auth.mockResolvedValue(null);
    const res = await proxyAuthed("/x");
    expect(res.status).toBe(401);
  });

  it("forwards a JSON body and the BE status, including the code", async () => {
    beClient.mockResolvedValue(
      Response.json({ error: "busy", code: "busy" }, { status: 429 }),
    );
    const res = await proxyAuthed("/profile/import");
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "busy", code: "busy" });
  });

  it("wraps a non-JSON BE body in the envelope and keeps the status", async () => {
    beClient.mockResolvedValue(
      new Response("<html>bad gateway</html>", { status: 502, headers: { "Content-Type": "text/html" } }),
    );
    const res = await proxyAuthed("/profile/import");
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "upstream_error" });
  });

  it("names a Vercel function timeout", async () => {
    beClient.mockResolvedValue(
      new Response("An error occurred with your deployment\n\nFUNCTION_INVOCATION_TIMEOUT", {
        status: 504,
        headers: { "Content-Type": "text/plain", "x-vercel-error": "FUNCTION_INVOCATION_TIMEOUT" },
      }),
    );
    const res = await proxyAuthed("/profile/import");
    expect(res.status).toBe(504);
    expect(await res.json()).toEqual({ error: "upstream_error", code: "upstream_timeout" });
  });

  it("turns an unreachable BE into a 503", async () => {
    beClient.mockRejectedValue(new TypeError("fetch failed"));
    const res = await proxyAuthed("/x");
    expect(res.status).toBe(503);
  });

  it("passes a 204 through with no body", async () => {
    beClient.mockResolvedValue(new Response(null, { status: 204 }));
    const res = await proxyAuthed("/x");
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
  });
});
