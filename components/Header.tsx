"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const menuGroups = [
  {
    title: "Main event games",
    featured: true,
    links: [
      ["Kris Kringle (White Elephant)", "/kris-kringle"],
      ["Secret Santa", "/secret-santa"],
    ],
  },
  {
    title: "Warm-up games",
    links: [
      ["Christmas trivia", "/trivia"],
      ["Christmas charades", "/charades"],
      ["Christmas bingo", "/bingo"],
    ],
  },
  {
    title: "XmasGoat family",
    links: [
      ["Gift ideas & shopping", "https://xmasgoat.com/gift-ideas"],
      ["Party planning", "https://party.xmasgoat.com"],
    ],
  },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-[#fffdf7]/95 backdrop-blur">
      <div ref={menuRef} className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-6">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-extrabold uppercase tracking-wide text-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Menu
          <svg aria-hidden="true" viewBox="0 0 12 8" className={`h-2.5 w-3 transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="M1 1.25 6 6.25l5-5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        <Link
          href="/"
          aria-label="Game Goat home"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Image
            src="/brand/xmasgoat-wordmark.png"
            alt="XmasGoat"
            width={202}
            height={39}
            priority
            className="h-auto w-[126px] sm:w-[180px]"
          />
        </Link>

        <Link
          href="/kris-kringle"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-black bg-kringle-cranberry px-3 text-xs font-extrabold uppercase tracking-wide text-white shadow-[2px_2px_0_#000] hover:-translate-y-0.5 sm:px-5 sm:text-sm"
        >
          Play<span className="hidden sm:inline"> a game</span>
        </Link>

        {open && (
          <div
            id="site-menu"
            className="absolute left-3 right-3 top-[calc(100%+8px)] overflow-hidden rounded-3xl border-2 border-black bg-[#fffdf7] shadow-[6px_6px_0_#000] sm:left-6 sm:right-6"
          >
            <nav aria-label="Site menu" className="grid max-h-[calc(100vh-6rem)] gap-2 overflow-y-auto p-4 sm:grid-cols-3 sm:p-6">
              {menuGroups.map((group) => (
                <section
                  key={group.title}
                  className={`rounded-2xl border-2 border-black p-4 ${"featured" in group ? "bg-[#f8df92]" : "bg-white"}`}
                >
                  <h2 className="text-sm font-black uppercase tracking-[0.12em]">{group.title}</h2>
                  <div className="mt-2 grid gap-1">
                    {group.links.map(([label, href]) => (
                      <Link
                        key={href}
                        href={href}
                        className="rounded-lg px-2 py-2 text-sm font-bold hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2"
                      >
                        {label}<span aria-hidden="true"> →</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </nav>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-black bg-black px-5 py-3 text-xs font-semibold text-white">
              <p>Make Christmas legendary.</p>
              <div className="flex gap-4">
                <a href="https://xmasgoat.com/privacy" className="underline">Privacy</a>
                <a href="https://xmasgoat.com" className="underline">XmasGoat.com</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
