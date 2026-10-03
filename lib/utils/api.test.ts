import { describe, it, expect, vi, afterEach } from "vitest";
import { apiFetch, ApiError } from "./api";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function caught(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (err) {
    if (err instanceof ApiError) return err;
    throw err;
  }
  throw new Error("expected a rejection");
}

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws an ApiError carrying the backend's error message on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(409, { error: "Already connected" })),
    );

    await expect(apiFetch("/api/connection/request")).rejects.toMatchObject(
      new ApiError(409, "Already connected"),
    );
  });

  it("returns the parsed body on success and undefined on 204", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, { id: "abc" })));
    await expect(apiFetch("/api/profile")).resolves.toEqual({ id: "abc" });

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(apiFetch("/api/connection/1/disconnect")).resolves.toBeUndefined();
  });

  it("carries the envelope's code when present", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(429, { error: "busy", code: "busy" })),
    );
    const err = await caught(apiFetch("/api/profile/import"));
    expect(err.status).toBe(429);
    expect(err.code).toBe("busy");
  });

  it("falls back to a status message for a JSON null body instead of the string \"null\"", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(500, null)));
    const err = await caught(apiFetch("/api/x"));
    expect(err.status).toBe(500);
    expect(err.message).not.toBe("null");
    expect(err.message).toMatch(/500|error/i);
    expect(err.code).toBeUndefined();
  });

  it("falls back to a status message for a non-JSON body like Vercel's text/plain 413", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("Request Entity Too Large\n\nFUNCTION_PAYLOAD_TOO_LARGE", {
          status: 413,
          headers: { "Content-Type": "text/plain" },
        }),
      ),
    );
    const err = await caught(apiFetch("/api/profile/import"));
    expect(err.status).toBe(413);
    expect(err.message).not.toContain("FUNCTION_PAYLOAD_TOO_LARGE");
    expect(err.code).toBeUndefined();
  });

  it("falls back to a status message for an empty error body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 502 })));
    const err = await caught(apiFetch("/api/x"));
    expect(err.message).toBe("Request failed (502)");
  });
});
