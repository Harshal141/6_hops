import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Early Access",
  description:
    "Sign up for early access to 6 Hops - be among the first to visualize your connection graph and leverage the power of six degrees of separation.",
  openGraph: {
    title: "Get Early Access | 6 Hops",
    description:
      "Sign up for early access to 6 Hops - be among the first to visualize your connection graph.",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function EarlyAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
