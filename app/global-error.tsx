"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "./components/ui";
import "./globals.css";

// Replaces the root layout when rendering itself crashes, so it renders its own
// <html> and cannot use the layout's providers. Without it, React render errors
// never reach Sentry.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <main className="min-h-dvh flex flex-col items-center justify-center px-4 text-center gap-6 font-mono">
          <h1 className="text-2xl sm:text-3xl font-bold text-fg">Something went wrong</h1>
          <p className="text-sm text-fg-muted max-w-sm leading-relaxed">
            We&apos;ve been notified. Try again in a moment.
          </p>
          <Button href="/">[ Back to home ]</Button>
        </main>
      </body>
    </html>
  );
}
