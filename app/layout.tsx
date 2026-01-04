import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "6 Hops - Discover Your Connection Graph",
    template: "%s | 6 Hops",
  },
  description:
    "Visualize how everyone is just 6 hops away. Leverage the power of six degrees of separation to discover and connect with people through your network.",
  keywords: [
    "six degrees of separation",
    "networking",
    "connection graph",
    "social network",
    "professional networking",
    "find connections",
    "network visualization",
  ],
  authors: [{ name: "6 Hops" }],
  creator: "6 Hops",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "6 Hops",
    title: "6 Hops - Discover Your Connection Graph",
    description:
      "Visualize how everyone is just 6 hops away. Leverage the power of six degrees of separation to discover and connect with people through your network.",
  },
  twitter: {
    card: "summary_large_image",
    title: "6 Hops - Discover Your Connection Graph",
    description:
      "Visualize how everyone is just 6 hops away. Leverage the power of six degrees of separation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
