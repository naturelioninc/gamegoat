"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MAIN_GAMES, WARMUP_GAMES } from "@/lib/games";
import {
  GeneratedIcon,
  type GeneratedIconName,
} from "@/components/GeneratedIcon";

interface Props {
  menuOpen: boolean;
  onMenuToggle: () => void;
  onPlayClick: () => void;
}

function GameIconCard({
  icon,
  name,
  subtitle,
  href,
  large,
  onClick,
}: {
  icon: GeneratedIconName;
  name: string;
  subtitle: string;
  href: string;
  large?: boolean;
  onClick: () => void;
}) {
  if (large) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="flex items-center gap-3 rounded-2xl border-2 border-black bg-white p-4 shadow-[3px_3px_0_#000] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:scale-95"
      >
        <GeneratedIcon name={icon} size="md" className="h-14 w-14 shrink-0" />
        <div>
          <p className="font-black leading-tight">{name}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3 text-center transition hover:border-black active:scale-95"
    >
      <GeneratedIcon name={icon} size="md" className="h-11 w-11" />
      <p className="text-[11px] font-black leading-tight">{name}</p>
    </Link>
  );
}

export function Header({ menuOpen, onMenuToggle, onPlayClick }: Props) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setAuthed(!!session));
    return () => subscription.unsubscribe();
  }, []);

  // Close menu on navigation
  useEffect(() => {
    if (menuOpen) onMenuToggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Keyboard + outside-click dismissal
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onMenuToggle();
        triggerRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) onMenuToggle();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen, onMenuToggle]);

  const close = () => {
    if (menuOpen) onMenuToggle();
  };

  return (
    <header className="app-header sticky top-0 z-40 border-b-2 border-black bg-[#fffdf7]/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div
        ref={menuRef}
        className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-6"
      >
        {/* Menu trigger */}
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={onMenuToggle}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-extrabold uppercase tracking-wide text-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2"
        >
          <span
            className="flex h-5 w-5 flex-col items-center justify-center gap-[4px] transition-transform"
            aria-hidden="true"
          >
            <span
              className={`block h-0.5 w-4 bg-current transition-all ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 bg-current transition-all ${menuOpen ? "w-0 opacity-0" : "w-4"}`}
            />
            <span
              className={`block h-0.5 w-4 bg-current transition-all ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
            />
          </span>
          <span className="hidden sm:inline">Menu</span>
        </button>

        {/* Wordmark */}
        <Link
          href="/"
          aria-label="Game Goat home"
          onClick={close}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <Image
            src="/brand/xmasgoat-wordmark.png"
            alt="XmasGoat"
            width={202}
            height={39}
            priority
            className="h-auto w-[116px] sm:w-[180px]"
          />
        </Link>

        {/* Right side: Account + Play */}
        <div className="flex items-center gap-2">
          {authed !== null && (
            authed ? (
              <Link
                href="/account"
                className="hidden sm:inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-black px-3 text-xs font-extrabold uppercase tracking-wide shadow-[2px_2px_0_#000] transition hover:-translate-y-0.5"
              >
                My account
              </Link>
            ) : (
              <a
                href="https://account.xmasgoat.com"
                className="hidden sm:inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-black px-3 text-xs font-extrabold uppercase tracking-wide shadow-[2px_2px_0_#000] transition hover:-translate-y-0.5"
              >
                Sign in
              </a>
            )
          )}
          <button
            type="button"
            onClick={onPlayClick}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-black bg-kringle-cranberry px-3 text-xs font-extrabold uppercase tracking-wide text-white shadow-[2px_2px_0_#000] transition hover:-translate-y-0.5 sm:px-5 sm:text-sm"
          >
            <GeneratedIcon name="play" size="sm" className="h-6 w-6" />
            <span>Play</span>
          </button>
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <div
            id="site-menu"
            className="absolute left-3 right-3 top-[calc(100%+8px)] z-50 overflow-hidden rounded-3xl border-2 border-black bg-[#fffdf7] shadow-[6px_6px_0_#000] sm:left-6 sm:right-6"
          >
            <div className="grid gap-4 p-4 sm:grid-cols-[1fr_1fr_auto] sm:p-5">
              {/* Main event */}
              <section>
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-kringle-cranberry">
                  <span className="inline-block h-2 w-2 rounded-full bg-kringle-cranberry" />
                  Main Event
                </p>
                <div className="grid gap-2">
                  {MAIN_GAMES.map((g) => (
                    <GameIconCard
                      key={g.href}
                      href={g.href}
                      icon={g.icon}
                      name={g.name}
                      subtitle={g.description}
                      large
                      onClick={close}
                    />
                  ))}
                </div>
              </section>

              {/* Warm-up */}
              <section>
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-kringle-spruce">
                  <span className="inline-block h-2 w-2 rounded-full bg-kringle-spruce" />
                  Warm-Up Games
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-2">
                  {WARMUP_GAMES.map((g) => (
                    <Link
                      key={g.href}
                      href={g.href}
                      onClick={close}
                      className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-3 transition hover:border-black active:scale-95 sm:p-3"
                    >
                      <GeneratedIcon
                        name={g.icon}
                        size="md"
                        className="h-10 w-10 shrink-0"
                      />
                      <div className="hidden sm:block">
                        <p className="text-sm font-black">{g.name}</p>
                        <p className="text-xs text-slate-500">{g.subtitle}</p>
                      </div>
                      <p className="text-[10px] font-black sm:hidden">
                        {g.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>

              {/* External links */}
              <section className="hidden border-l-2 border-slate-100 pl-4 sm:block">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  XmasGoat Family
                </p>
                <div className="grid gap-1 text-sm">
                  <a
                    href="https://xmasgoat.com/gift-ideas"
                    className="flex items-center gap-2 rounded-xl px-2 py-2 font-bold hover:bg-black hover:text-white"
                  >
                    <GeneratedIcon name="gift-games" className="h-7 w-7" /> Gift ideas
                  </a>
                  <a
                    href="https://party.xmasgoat.com"
                    className="flex items-center gap-2 rounded-xl px-2 py-2 font-bold hover:bg-black hover:text-white"
                  >
                    <GeneratedIcon name="party" className="h-7 w-7" /> Party planner
                  </a>
                  <a
                    href="https://xmasgoat.com"
                    className="flex items-center gap-2 rounded-xl px-2 py-2 font-bold hover:bg-black hover:text-white"
                  >
                    <GeneratedIcon name="home" className="h-7 w-7" /> XmasGoat.com
                  </a>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                  <a
                    href="https://xmasgoat.com/privacy"
                    className="hover:underline"
                  >
                    Privacy
                  </a>
                </div>
              </section>
            </div>

            {/* Footer bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-black bg-black px-5 py-3 text-xs font-semibold text-white">
              <p>Make Christmas legendary.</p>
              <div className="flex gap-4 sm:hidden">
                <Link href="/my-games" onClick={close} className="underline">My Games</Link>
                <a href="https://account.xmasgoat.com" className="underline">
                  My Account
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
