"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  if (/\/(kris-kringle|secret-santa)\/room\//.test(pathname)) return null;
  return (
    <footer className="site-footer mt-16 border-t-2 border-black bg-black text-white">
      <div className="mx-auto max-w-6xl space-y-5 px-5 py-10 text-sm text-white/75 sm:px-8">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/kris-kringle" className="hover:text-kringle-gold">Kris Kringle</Link>
          <Link href="/secret-santa" className="hover:text-kringle-gold">Secret Santa</Link>
          <Link href="/trivia" className="hover:text-kringle-gold">Christmas trivia</Link>
          <Link href="/charades" className="hover:text-kringle-gold">Christmas charades</Link>
          <Link href="/bingo" className="hover:text-kringle-gold">Christmas bingo</Link>
          <a href="https://xmasgoat.com/gift-ideas" className="hover:text-kringle-gold">Gift ideas</a>
          <a href="https://party.xmasgoat.com" className="hover:text-kringle-gold">Party planner</a>
        </nav>
        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} XmasGoat · Made in Canada
        </p>
      </div>
    </footer>
  );
}
