import type { ProviderId } from "@/lib/auth/providers/types";

interface ProviderPresentation {
  /** `hero` is the app's own CTA; `social` is a provider's branded button (ui/Button). */
  variant: "hero" | "social";
  text: string;
  /** Official brand mark (public/brand/, sources in its README), shown 20px tall. */
  mark?: { src: string; width: number; height: number };
}

// How each provider's sign-in button looks. Kept apart from the adapters so no UI reaches the
// middleware bundle. LinkedIn keeps the app's original CTA; Google's is its branded dark button,
// the same size and weight, as Google's "equal prominence" rule requires (TRD §5.6.1).
export const PROVIDER_UI: Record<ProviderId, ProviderPresentation> = {
  linkedin: { variant: "hero", text: "[ Sign in with LinkedIn ]" },
  google: {
    variant: "social",
    text: "Sign in with Google",
    mark: { src: "/brand/google-g.png", width: 80, height: 80 },
  },
};
