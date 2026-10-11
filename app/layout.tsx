import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { checkBE } from "@/lib/service";
import { SessionProvider } from "./components/layout/SessionProvider";
import { QueryProvider } from "./components/layout/QueryProvider";
import { NavigationHistoryProvider } from "@/lib/hooks/navigation";
import { ToastProvider } from "./components/ui";
import { fontVariables } from "./appFonts";
import { SITE } from "./siteMeta";
import "./globals.css";

checkBE();

// Icons come from the file conventions in this folder (favicon.ico, icon.png, apple-icon.png,
// manifest.ts, opengraph-image.tsx); Next adds their tags itself.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontVariables} antialiased`}>
        <SessionProvider>
          <QueryProvider>
            <NavigationHistoryProvider>
              <ToastProvider>{children}</ToastProvider>
            </NavigationHistoryProvider>
          </QueryProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
