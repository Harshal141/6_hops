"use client";

import { ErrorScreen, Footer, GridBackground } from "./components/layout";
import { fontVariables } from "./appFonts";
import "./globals.css";

// Replaces the root layout when the layout itself crashes, so it renders its own <html> with
// the app's fonts, and can't use the layout's providers: no Navbar here, it needs the session.
// Crashes inside a page are handled by app/error.tsx, which keeps the layout.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className={`${fontVariables} antialiased`}>
        <GridBackground>
          <ErrorScreen error={error} reset={reset} />
          <Footer />
        </GridBackground>
      </body>
    </html>
  );
}
