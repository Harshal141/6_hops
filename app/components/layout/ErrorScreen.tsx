"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "../ui";

interface ErrorScreenProps {
  error: Error & { digest?: string };
  /** Next's boundary reset: re-renders the segment that crashed. */
  reset: () => void;
}

/**
 * The body of a crash page, shared by app/error.tsx (inside the layout) and
 * app/global-error.tsx (replacing it). Styled like the 404 page. Reports the error, since
 * React render errors otherwise never reach Sentry.
 */
export function ErrorScreen({ error, reset }: ErrorScreenProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-6">
      <span className="font-mono text-xs text-neutral-400 tracking-widest">Error</span>
      <h1 className="font-mono text-3xl sm:text-5xl font-bold text-neutral-800 tracking-tight">
        Something went wrong
      </h1>
      <p className="font-mono text-sm sm:text-base text-neutral-500 max-w-sm leading-relaxed">
        We&apos;ve been notified. Try again in a moment.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* A full page load, not a client-side Link: after a crash the router's state is the
            broken one, and a soft navigation would land back on this screen. */}
        <Button onClick={() => window.location.assign("/")}>[ Back to home ]</Button>
        <Button variant="ghost" size="lg" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
