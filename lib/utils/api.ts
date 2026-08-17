/**
 * The single client-side fetch boundary. Owns the error envelope so no hook or
 * component has to know the wire format.
 *
 * The backend always answers `{ "error": "<message>" }` on failure, so the raw
 * body must never reach a component — rendering it produced messages like
 * `409 — {"error":"Already connected"}`.
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  /** No usable session — the caller should re-authenticate rather than retry. */
  get isUnauthenticated() {
    return this.status === 401;
  }

  /** The backend could not be reached at all, as opposed to refusing the request. */
  get isBackendUnavailable() {
    return this.status === 503;
  }
}

async function messageFrom(res: Response): Promise<string> {
  const text = await res.text();
  if (!text) return res.statusText || `Request failed (${res.status})`;
  try {
    const parsed = JSON.parse(text) as { error?: unknown };
    if (typeof parsed.error === "string") return parsed.error;
  } catch {
    // not JSON — fall through to the raw text
  }
  return text.slice(0, 200);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);

  if (!res.ok) throw new ApiError(res.status, await messageFrom(res));
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/** Request init for a JSON body. */
export const jsonBody = (body: unknown): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

/** Copy for the states a panel needs to distinguish. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isUnauthenticated) return "your session expired — sign in again";
    if (error.isBackendUnavailable) return "backend unavailable";
    return error.message;
  }
  return "something went wrong";
}
