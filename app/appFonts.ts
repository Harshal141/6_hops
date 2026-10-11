import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

// The app's fonts, as CSS variables on <body>. Shared because two components render <body>:
// the root layout, and global-error, which replaces the layout when it crashes.

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Only for the "Sign in with Google" button (Button variant "social"): Google's branding spec
// requires Google Sans Medium. Self-hosted because next/font/google doesn't list it. OFL 1.1,
// licence next to the file. Not preloaded: the browser fetches it only on pages that render a
// social button.
const googleSans = localFont({
  src: "./fonts/GoogleSans-Medium-latin.woff2",
  weight: "500",
  variable: "--font-google-sans",
  display: "swap",
  preload: false,
  fallback: ["Roboto", "arial", "sans-serif"],
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${googleSans.variable}`;
