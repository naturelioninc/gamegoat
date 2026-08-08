import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import { ContinuePlaying } from "@/components/ContinuePlaying";

export const metadata: Metadata = {
  title: "Game Goat — Christmas Party Games",
  description:
    "Run a Kris Kringle, Secret Santa, or warm up with trivia, charades, and bingo. Free Christmas games for any group — no account needed.",
};

const MAIN_EVENTS = [
  {
    href: "/kris-kringle",
    icon: "white-elephant",
    name: "Kris Kringle",
    subtitle: "White Elephant gift exchange",
    description:
      "Enter player names, choose Classic, Friendly, or Chaos rules, and run the full open-and-steal game live on one screen.",
    cta: "Start a game →",
    badge: "Most popular",
  },
  {
    href: "/secret-santa",
    icon: "secret-santa",
    name: "Secret Santa",
    subtitle: "Private name draw",
    description:
      "Add names, optional exclusions, do the draw, and pass the phone around so each person reveals their match privately.",
    cta: "Draw names →",
    badge: null,
  },
] as const;

const WARMUP_GAMES = [
  {
    href: "/trivia",
    icon: "trivia",
    name: "Christmas Trivia",
    description: "15 questions · traditions, music, movies & food",
    time: "~10 min",
  },
  {
    href: "/charades",
    icon: "charades",
    name: "Christmas Charades",
    description: "60-second rounds · no words or sounds",
    time: "~15 min",
  },
  {
    href: "/bingo",
    icon: "bingo",
    name: "Christmas Bingo",
    description: "Random cards · auto bingo detection · printable",
    time: "~20 min",
  },
] as const;

export default function HomePage() {
  return (
    <main className="app-home mx-auto max-w-5xl space-y-7 px-4 py-6 sm:space-y-14 sm:px-5 sm:py-16">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border-2 border-black bg-[#f8df92] shadow-[4px_4px_0_#000]">
        <Image
          src="/brand/game-night-hero.webp"
          alt="The XmasGoat hosting a festive game night"
          width={1100}
          height={513}
          priority
          className="h-36 w-full object-cover object-center sm:h-64"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-3 pt-10 text-left text-white sm:px-7 sm:pb-6">
          <h1 className="text-2xl font-black tracking-tight sm:text-4xl">Choose your Christmas game</h1>
          <p className="mt-0.5 text-xs font-semibold text-white/85 sm:text-base">Host the room, share the laughs, make it legendary.</p>
        </div>
        <div className="absolute right-3 top-3 rounded-full border border-white/70 bg-black/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
          Free to play
        </div>
        <div className="hidden">
          <Image
            src="/brand/xmasgoat-logo.png"
            alt="XmasGoat"
            width={120}
            height={110}
            className="animate-kk-float h-auto w-24 sm:w-28"
          />
        </div>
      </header>

      <ContinuePlaying />

      {/* Main Event */}
      <section>
        <div className="mb-3 flex items-center gap-3 sm:mb-5">
          <span className="rounded-full border-2 border-black bg-kringle-cranberry px-3 py-0.5 text-xs font-black uppercase tracking-wide text-white">
            Main Event
          </span>
          <div className="h-0.5 flex-1 bg-black" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          {MAIN_EVENTS.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="group relative flex min-w-0 flex-col rounded-2xl border-2 border-black bg-white p-3 shadow-[3px_3px_0_#000] transition active:scale-[.98] sm:rounded-3xl sm:p-6 sm:shadow-[4px_4px_0_#000] sm:hover:-translate-y-1 sm:hover:shadow-[6px_6px_0_#000]"
            >
              {game.badge && (
                <span className="absolute right-2 top-2 rounded-full bg-kringle-gold px-2 py-0.5 text-[9px] font-black text-black sm:right-4 sm:top-4 sm:text-xs">
                  {game.badge}
                </span>
              )}
              <GeneratedIcon name={game.icon} size="md" className="h-12 w-12 sm:h-14 sm:w-14" />
              <h2 className="mt-2 text-base font-black leading-tight sm:mt-3 sm:text-2xl">{game.name}</h2>
              <p className="mt-0.5 text-[11px] font-semibold leading-tight text-kringle-cranberry sm:text-sm">
                {game.subtitle}
              </p>
              <p className="app-web-extra mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {game.description}
              </p>
              <span className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border-2 border-black bg-kringle-cranberry px-2 text-center text-xs font-black text-white shadow-[2px_2px_0_#000] sm:mt-5 sm:min-h-11 sm:rounded-full sm:px-5 sm:text-sm group-hover:-translate-y-0.5">
                {game.cta}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Warm-Up Games */}
      <section>
        <div className="mb-3 flex items-center gap-3 sm:mb-5">
          <span className="rounded-full border-2 border-black bg-kringle-spruce px-3 py-0.5 text-xs font-black uppercase tracking-wide text-white">
            Warm-Up Games
          </span>
          <div className="h-0.5 flex-1 bg-slate-300" />
        </div>
        <p className="app-web-extra mb-4 text-sm text-slate-600">
          Play these before the main event — great while guests are still
          arriving.
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {WARMUP_GAMES.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="group flex min-w-0 flex-col items-center rounded-2xl border-2 border-slate-200 bg-white p-2.5 text-center transition active:scale-[.98] sm:items-start sm:p-5 sm:text-left sm:hover:border-kringle-spruce sm:hover:shadow-sm"
            >
              <GeneratedIcon name={game.icon} size="md" className="h-11 w-11 sm:h-12 sm:w-12" />
              <h2 className="mt-1 text-[11px] font-black leading-tight sm:mt-2 sm:text-base">{game.name.replace("Christmas ", "")}</h2>
              <p className="app-web-extra mt-1 flex-1 text-sm text-slate-600">
                {game.description}
              </p>
              <div className="mt-2 flex w-full items-center justify-center text-[10px] font-semibold text-slate-500 sm:mt-3 sm:justify-between sm:text-xs">
                <span className="app-web-extra">{game.time}</span>
                <span className="text-kringle-cranberry group-hover:underline">
                  Play free →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best order tip */}
      <section className="app-web-extra rounded-3xl bg-kringle-spruce p-7 text-white sm:p-9">
        <h2 className="text-xl font-black">Best game order for your party</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <p className="font-black">1 · Arrivals: Trivia or Bingo</p>
            <p className="mt-1 text-sm text-white/75">
              Guests trickle in. Trivia or bingo keeps early arrivals
              entertained.
            </p>
          </div>
          <div>
            <p className="font-black">2 · Full room: Charades</p>
            <p className="mt-1 text-sm text-white/75">
              Gets everyone up and laughing once the room is full.
            </p>
          </div>
          <div>
            <p className="font-black">3 · Main event: Kris Kringle</p>
            <p className="mt-1 text-sm text-white/75">
              Run the gift exchange after dinner — the highlight of the night.
            </p>
          </div>
        </div>
      </section>

      {/* Cross-link to Party Goat */}
      <section className="app-web-extra rounded-3xl border-2 border-amber-200 bg-amber-50 p-6 text-center">
        <p className="font-semibold text-amber-900">
          Also planning the party? Manage guests, food, venue, and budget in one
          place.
        </p>
        <a
          href="https://party.xmasgoat.com"
          className="mt-4 inline-flex min-h-11 items-center rounded-full border-2 border-black bg-kringle-spruce px-5 text-sm font-black text-white shadow-[2px_2px_0_#000] transition hover:-translate-y-0.5"
        >
          Try Party Goat →
        </a>
      </section>
    </main>
  );
}
