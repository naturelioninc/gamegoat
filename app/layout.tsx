import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Snowfall } from "@/components/fx/Snowfall";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://games.xmasgoat.com"),
  title: {
    default: "Game Goat — Christmas Party Games",
    template: "%s | Game Goat",
  },
  description:
    "Run a Kris Kringle or Secret Santa, or warm up the room with trivia, charades, and bingo. Free Christmas party games for any group.",
  applicationName: "Game Goat",
  openGraph: {
    siteName: "Game Goat",
    type: "website",
    locale: "en_CA",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffdf7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA">
      <body className="kk-frost-bg flex min-h-screen flex-col bg-[#fffdf7] text-slate-950 antialiased">
        <Snowfall />
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
