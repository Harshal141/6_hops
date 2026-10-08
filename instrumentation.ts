import * as Sentry from "@sentry/nextjs";
import { baseSentryOptions, beTracePropagationTargets } from "@/lib/utils/sentry";

// Server and Edge (middleware) runtimes. The browser is set up in instrumentation-client.ts.
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" && process.env.NEXT_RUNTIME !== "edge") return;

  Sentry.init({
    ...baseSentryOptions(),
    // BE calls carry the trace, so a BE error and the FE error it caused share one trace id.
    tracePropagationTargets: beTracePropagationTargets(process.env.NEXT_PUBLIC_BE_URL),
    // Every console.error becomes a Sentry event. Auth.js, for one, handles its own
    // errors and only logs them, so nothing would be captured otherwise.
    integrations: [Sentry.captureConsoleIntegration({ levels: ["error"] })],
  });
}

// Errors thrown from server components, route handlers, and server actions.
export const onRequestError = Sentry.captureRequestError;
