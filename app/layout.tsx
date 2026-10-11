import type { Metadata } from "next";
import { checkBE } from "@/lib/service";
import { SessionProvider } from "./components/layout/SessionProvider";
import { QueryProvider } from "./components/layout/QueryProvider";
import { NavigationHistoryProvider } from "@/lib/hooks/navigation";
import { ToastProvider } from "./components/ui";
import { fontVariables } from "./appFonts";
import "./globals.css";

checkBE();

export const metadata: Metadata = {
  title: "6 Hops",
  description: "6 Hops",
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
      </body>
    </html>
  );
}
