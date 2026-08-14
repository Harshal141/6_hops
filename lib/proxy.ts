import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { beClient } from "@/lib/service";

/**
 * Proxies an authenticated request from a Next route handler to the BE.
 *
 * Resolves the session, attaches the user id, and forwards the BE's status so a
 * BE error surfaces as an error on the client instead of a 200 carrying an
 * `{ error }` body. An unreachable BE becomes a structured 503 rather than an
 * unhandled 500, which lets the UI render one coherent "backend unavailable"
 * state instead of a failure beside stale data.
 */
export async function proxyAuthed(path: string, init: RequestInit = {}) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await beClient(path, init);
    const body = await res.json().catch(() => null);
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ error: "backend_unavailable" }, { status: 503 });
  }
}

export const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
