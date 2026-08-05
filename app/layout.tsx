import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://games.xmasgoat.com"),
  title: {
    default: "Game Goat — Free Christmas Party Games",
    template: "%s | Game Goat",
  },
  description:
    "Play free Christmas party games: trivia, charades, and bingo. No account needed — just open and play.",
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
        <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="text-2xl" aria-hidden="true">🐐</span>
              <span className="text-lg font-black tracking-tight text-kringle-spruce">
                Game<span className="text-kringle-cranberry">Goat</span>
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm font-semibold text-slate-600">
              <Link href="/trivia" className="hover:text-kringle-spruce">Trivia</Link>
              <Link href="/charades" className="hover:text-kringle-spruce">Charades</Link>
              <Link href="/bingo" className="hover:text-kringle-spruce">Bingo</Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200/60 bg-white/60 py-8 text-center text-sm text-slate-500">
          <p>
            <span className="text-xl" aria-hidden="true">🐐</span>{" "}
            <strong className="text-slate-700">Game Goat</strong> — free Christmas party games
          </p>
          <p className="mt-1">
            Part of the{" "}
            <a
              href="https://xmasgoat.com"
              className="font-semibold text-kringle-spruce hover:underline"
            >
              XmasGoat
            </a>{" "}
            family
          </p>
        </footer>
      </body>
    </html>
  );
}
