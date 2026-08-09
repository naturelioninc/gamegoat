"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { GeneratedIcon } from "@/components/GeneratedIcon";

interface Props {
  menuOpen: boolean;
  onMenuToggle: () => void;
  onPlayClick: () => void;
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
          href="/app"
          aria-label="XmasGoat home"
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
              <a
                href="https://account.xmasgoat.com"
                className="hidden sm:inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-black px-3 text-xs font-extrabold uppercase tracking-wide shadow-[2px_2px_0_#000] transition hover:-translate-y-0.5"
              >
                My account
              </a>
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
            <nav aria-label="XmasGoat menu" className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 pb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-kringle-cranberry">Your Christmas, together</p>
                  <h2 className="text-xl font-black tracking-tight">Where do you want to go?</h2>
                </div>
                <button type="button" onClick={close} aria-label="Close menu" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white text-xl font-black">×</button>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <a href="https://games.xmasgoat.com/app" onClick={close} className="rounded-2xl border-2 border-black bg-[#f8df92] p-3 shadow-[2px_2px_0_#000] transition active:scale-95">
                  <GeneratedIcon name="home" className="h-9 w-9" /><strong className="mt-2 block text-sm">Home</strong><span className="text-xs text-slate-700">Your Christmas hub</span>
                </a>
                <a href="https://party.xmasgoat.com/events" onClick={close} className="rounded-2xl border-2 border-black bg-emerald-50 p-3 shadow-[2px_2px_0_#000] transition active:scale-95">
                  <GeneratedIcon name="party" className="h-9 w-9" /><strong className="mt-2 block text-sm">My parties</strong><span className="text-xs text-slate-700">Plans, guests & chat</span>
                </a>
                <a href="https://party.xmasgoat.com/dashboard/event/new" onClick={close} className="rounded-2xl border-2 border-black bg-kringle-spruce p-3 text-white shadow-[2px_2px_0_#000] transition active:scale-95">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-2xl font-black text-kringle-spruce">+</span><strong className="mt-2 block text-sm">Plan a party</strong><span className="text-xs text-white/75">Start something fun</span>
                </a>
                <a href="https://account.xmasgoat.com" onClick={close} className="rounded-2xl border-2 border-black bg-sky-50 p-3 shadow-[2px_2px_0_#000] transition active:scale-95">
                  <GeneratedIcon name="players" className="h-9 w-9" /><strong className="mt-2 block text-sm">{authed ? "My account" : "Sign in"}</strong><span className="text-xs text-slate-700">Profile & settings</span>
                </a>
              </div>

              <section className="mt-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-kringle-spruce">Play together</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Link href="/join" onClick={close} className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-black bg-white px-3 font-black transition active:scale-95"><GeneratedIcon name="join-code" className="h-9 w-9" /><span>Join with a code</span><span className="ml-auto">→</span></Link>
                  <Link href="/" onClick={close} className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-black bg-white px-3 font-black transition active:scale-95"><GeneratedIcon name="play" className="h-9 w-9" /><span>Choose a game</span><span className="ml-auto">→</span></Link>
                  <Link href="/my-games" onClick={close} className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-black bg-white px-3 font-black transition active:scale-95"><GeneratedIcon name="score" className="h-9 w-9" /><span>My games</span><span className="ml-auto">→</span></Link>
                </div>
              </section>

              <section className="mt-4 border-t-2 border-slate-200 pt-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Discover</p>
                <div className="grid grid-cols-2 gap-2 text-sm font-bold sm:grid-cols-4">
                  <a href="https://xmasgoat.com/gift-ideas" className="rounded-xl bg-rose-50 px-3 py-3">🎁 Gift ideas</a>
                  <a href="https://xmasgoat.com/tools" className="rounded-xl bg-violet-50 px-3 py-3">🛠 Free tools</a>
                  <a href="https://xmasgoat.com/how-it-works" className="rounded-xl bg-amber-50 px-3 py-3">✨ How it works</a>
                  <a href="https://xmasgoat.com" className="rounded-xl bg-slate-100 px-3 py-3">🐐 XmasGoat.com</a>
                </div>
              </section>
            </nav>

            {/* Footer bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-black bg-black px-5 py-3 text-xs font-semibold text-white">
              <p>Make Christmas legendary.</p>
              <div className="flex gap-4">
                <a href="https://xmasgoat.com/privacy" className="underline">Privacy</a>
                <a href="https://account.xmasgoat.com/settings" className="underline">Settings</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
