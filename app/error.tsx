"use client";

import { ErrorScreen, Footer, GridBackground, Navbar } from "./components/layout";

// A crash inside any page. Unlike global-error, the root layout and its providers survive, so
// the screen keeps the navbar.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <GridBackground>
      <Navbar />
      <ErrorScreen error={error} reset={reset} />
      <Footer />
    </GridBackground>
  );
}
