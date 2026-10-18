import { HERO } from "./components/landing/landingContent";

// The site's identity for metadata, the web manifest and the link-preview image. Shared so
// the tab, the home-screen icon and a WhatsApp/LinkedIn preview all say the same thing.

export const SITE = {
  name: "6 hops",
  url: "https://www.6-hops.com",
  description: HERO.lead,
  // Sampled from the logo: its black background and the purple arc between the H's bars.
  background: "#0b0b0b",
  // Must equal `--color-accent` in globals.css. The manifest and OG image can't read CSS
  // variables, so the hex lives here too; siteMeta.test.ts fails if the two drift apart.
  accent: "#6f5ae6",
  // The brand's own accounts. One place, read by the footer and the onboarding done step.
  social: {
    instagram: "https://www.instagram.com/6_hops/",
    linkedin: "https://www.linkedin.com/company/6-hops/",
  },
} as const;

export type SocialNetwork = keyof typeof SITE.social;
