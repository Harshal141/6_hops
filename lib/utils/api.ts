/**
 * The single client-side fetch boundary. Owns the error envelope so no hook or
 * component has to know the wire format.
 *
 * The backend answers `{ "error": "<message>", "code"?: "<machine_code>" }` on
 * failure, so the raw body must never reach a component. Rendering it produced
 * messages like `409 {"error":"Already connected"}`, and a platform error page
 * (Vercel's text/plain 413 or 504) would otherwise surface verbatim.
 */
export class ApiError extends Error {
  status: number;
  /** Machine-readable reason from the envelope, when the server sent one. */
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (code !== undefined) this.code = code;
  }

  /** No usable session. The caller should re-authenticate rather than retry. */
  get isUnauthenticated() {
    return this.status === 401;
  }

  /** The backend could not be reached at all, as opposed to refusing the request. */
  get isBackendUnavailable() {
    return this.status === 503;
  }
}

function statusMessage(res: Response): string {
  return res.statusText || `Request failed (${res.status})`;
}

/** Reads the error envelope. Anything that isn't one (empty, `null`, HTML, plain text) falls back to the status. */
async function errorFrom(res: Response): Promise<ApiError> {
  const text = await res.text().catch(() => "");
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  if (parsed && typeof parsed === "object") {
    const { error, code } = parsed as { error?: unknown; code?: unknown };
    return new ApiError(
      res.status,
      typeof error === "string" && error ? error : statusMessage(res),
      typeof code === "string" && code ? code : undefined,
    );
  }
  return new ApiError(res.status, statusMessage(res));
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);

  if (!res.ok) throw await errorFrom(res);
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/** Request init for a JSON body. */
export const jsonBody = (body: unknown): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

/** Shown wherever a 401 surfaces. One string so every screen says the same thing. */
export const SESSION_EXPIRED_COPY = "Your session expired. Sign in again.";

/** Copy for the states a panel needs to distinguish. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isUnauthenticated) return SESSION_EXPIRED_COPY;
    if (error.isBackendUnavailable) return "Backend unavailable";
    return error.message;
  }
  return "Something went wrong";
}
