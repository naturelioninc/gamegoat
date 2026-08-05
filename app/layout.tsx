import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://games.xmasgoat.com"),
  title: {
    default: "Game Goat — Christmas Party Games",
    template: "%s | Game Goat",
  },
  description:
    "Run a Kris Kringle or Secret Santa, or warm up with trivia, charades, and bingo. Free Christmas games — no account needed.",
  applicationName: "Game Goat",
  openGraph: {
    siteName: "Game Goat",
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
        <AppShell>{children}</AppShell>
        <Footer />
      </body>
    </html>
  );
}
