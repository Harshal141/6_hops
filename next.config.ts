import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.licdn.com" },
      { protocol: "https", hostname: "*.licdn.com" },
      // Google profile photos (lh3…lh6). Normally mirrored to Blob at sign-in; this covers the
      // fallback when the mirror fails (e.g. no BLOB_READ_WRITE_TOKEN locally).
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

// Uploads source maps at build time so Sentry stack traces point at real files and
// lines. Without SENTRY_AUTH_TOKEN (local builds) the upload is skipped.
export default withSentryConfig(nextConfig, {
  org: "hops-xv",
  project: "hops-fe",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Browser events go to Sentry through this same-origin route, so ad blockers
  // don't drop them. Must stay outside the middleware matcher (middleware.ts).
  tunnelRoute: "/monitoring",
  webpack: {
    treeshake: { removeDebugLogging: true },
  },
});
