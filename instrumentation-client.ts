import * as Sentry from "@sentry/nextjs";
import { baseSentryOptions } from "@/lib/utils/sentry";

// Browser runtime. Trace headers go on same-origin requests (our /api routes) by
// default, which is what continues the trace into the Next server and then the BE.
Sentry.init({
  ...baseSentryOptions(),
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.captureConsoleIntegration({ levels: ["error"] }),
  ],
});

// Gives client-side navigations their own trace.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
