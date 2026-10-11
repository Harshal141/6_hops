import { HERO } from "./components/landing/landingContent";

// The site's identity for metadata, the web manifest and the link-preview image. Shared so
// the tab, the home-screen icon and a WhatsApp/LinkedIn preview all say the same thing.

export const SITE = {
  name: "6 hops",
  url: "https://www.6-hops.com",
  description: HERO.lead,
  // Sampled from the logo: its black background and the purple arc between the H's bars.
  background: "#0b0b0b",
  accent: "#6f5ae6",
} as const;
