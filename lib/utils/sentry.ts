import type { Event } from "@sentry/nextjs";

/**
 * Shared Sentry options for the browser, Node, and Edge runtimes. With no
 * NEXT_PUBLIC_SENTRY_DSN set (local dev, tests) the SDK stays disabled.
 */

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "stage";

// Headers that carry credentials. Server events attach request headers, and
// X-Internal-Secret is the FE↔BE shared secret — none of these may leave the server.
const SECRET_HEADERS = new Set(["authorization", "cookie", "set-cookie", "x-internal-secret"]);

/** beforeSend / beforeSendTransaction: strips credentials from an event before it is sent. */
export function scrubEvent<T extends Event>(event: T): T {
  const request = event.request;
  if (!request) return event;

  if (request.headers) {
    for (const key of Object.keys(request.headers)) {
      if (SECRET_HEADERS.has(key.toLowerCase())) delete request.headers[key];
    }
  }
  delete request.cookies;
  return event;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Outgoing server requests that get the `sentry-trace` / `baggage` headers: only
 * our BE, so the BE continues the FE's trace. Never LinkedIn, Blob, or any other
 * third party. Anchored on the full origin so a lookalike host does not match.
 */
export function beTracePropagationTargets(beUrl: string | undefined): RegExp[] {
  if (!beUrl) return [];
  try {
    const { origin } = new URL(beUrl);
    return [new RegExp(`^${escapeRegExp(origin)}(/|$)`)];
  } catch {
    return [];
  }
}

export function baseSentryOptions() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: APP_ENV,
    sendDefaultPii: false,
    // Errors are always captured; this only samples performance spans.
    tracesSampleRate: APP_ENV === "prod" ? 0.1 : 1,
    beforeSend: scrubEvent,
    beforeSendTransaction: scrubEvent,
  };
}
