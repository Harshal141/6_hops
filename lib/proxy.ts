import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { beClient } from "@/lib/service";

/**
 * What Vercel puts on a function's own timeout response (504, text/plain). The
 * BE never sees it, so the proxy is the only layer that can name the cause.
 */
const VERCEL_TIMEOUT = "FUNCTION_INVOCATION_TIMEOUT";

/**
 * Proxies an authenticated request from a Next route handler to the BE.
 *
 * Resolves the session, attaches the user id, and forwards the BE's status so a
 * BE error surfaces as an error on the client instead of a 200 carrying an
 * `{ error }` body. An unreachable BE becomes a structured 503 rather than an
 * unhandled 500, which lets the UI render one coherent "backend unavailable"
 * state instead of a failure beside stale data.
 *
 * A BE response that isn't JSON (a platform error page, a timeout) keeps its
 * status but gets the standard envelope, `{ error: "upstream_error" }`, plus
 * `code: "upstream_timeout"` when Vercel cut the BE function off.
 */
export async function proxyAuthed(path: string, init: RequestInit = {}) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let res: Response;
  try {
    res = await beClient(path, init);
  } catch {
    return NextResponse.json({ error: "backend_unavailable" }, { status: 503 });
  }
  return forwardResponse(res);
}

/** Relays a BE response with its status, for handlers that call `beClient` themselves. */
export async function forwardResponse(res: Response) {
  if (res.status === 204) return new NextResponse(null, { status: 204 });

  if (res.headers.get("x-vercel-error") === VERCEL_TIMEOUT) {
    return NextResponse.json(
      { error: "upstream_error", code: "upstream_timeout" },
      { status: res.status },
    );
  }

  const text = await res.text().catch(() => "");
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // not JSON: a success relays null, an error gets the envelope below
  }

  if (body === null && !res.ok) {
    return NextResponse.json({ error: "upstream_error" }, { status: res.status });
  }
  return NextResponse.json(body, { status: res.status });
}

export const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
