import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";
import { Footer } from "@/components/Footer";
import { NativeBridge } from "@/components/NativeBridge";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://games.xmasgoat.com"),
  title: {
    default: "Game Goat — Christmas Party Games",
    template: "%s | XmasGoat",
  },
  description:
    "Run a Kris Kringle or Secret Santa, or warm up with trivia, charades, and bingo. Free Christmas games — no account needed.",
  applicationName: "XmasGoat",
  openGraph: {
    siteName: "XmasGoat",
    type: "website",
    locale: "en_CA",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fffdf7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <body className="kk-frost-bg flex min-h-screen flex-col bg-[#fffdf7] text-slate-950 antialiased">
        <NativeBridge />
        <AppShell>{children}</AppShell>
        <Footer />
      </body>
    </html>
  );
}
