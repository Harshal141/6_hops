import { describe, it, expect, vi, afterEach } from "vitest";
import { apiFetch, ApiError } from "./api";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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
});
