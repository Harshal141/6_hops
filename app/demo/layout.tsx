import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "Watch how 6 Hops works - visualize your connection graph and discover how everyone is just 6 hops away through the power of six degrees of separation.",
  openGraph: {
    title: "Demo | 6 Hops",
    description:
      "Watch how 6 Hops works - visualize your connection graph and discover how everyone is just 6 hops away.",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
