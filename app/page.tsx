import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Game Goat — Christmas Party Games",
  description:
    "Run a Kris Kringle, Secret Santa, or warm up with trivia, charades, and bingo. Free Christmas games for any group — no account needed.",
};

const MAIN_EVENTS = [
  {
    href: "/kris-kringle",
    emoji: "🎁",
    name: "Kris Kringle",
    subtitle: "White Elephant gift exchange",
    description:
      "Enter player names, choose Classic, Friendly, or Chaos rules, and run the full open-and-steal game live on one screen.",
    cta: "Start a game →",
    badge: "Most popular",
  },
  {
    href: "/secret-santa",
    emoji: "🎅",
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
    emoji: "🧠",
    name: "Christmas Trivia",
    description: "15 questions · traditions, music, movies & food",
    time: "~10 min",
  },
  {
    href: "/charades",
    emoji: "🎭",
    name: "Christmas Charades",
    description: "60-second rounds · no words or sounds",
    time: "~15 min",
  },
  {
    href: "/bingo",
    emoji: "❄️",
    name: "Christmas Bingo",
    description: "Random cards · auto bingo detection · printable",
    time: "~20 min",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl space-y-16 px-5 py-12 sm:py-16">
      {/* Hero */}
      <header className="space-y-5 text-center">
        <div className="flex justify-center">
          <Image
            src="/brand/xmasgoat-logo.png"
            alt="XmasGoat"
            width={120}
            height={110}
            className="animate-kk-float h-auto w-24 sm:w-28"
          />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Christmas party games
        </h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-600">
          Run a Kris Kringle or Secret Santa for the main event, then warm up the
          room with trivia, charades, or bingo.
        </p>
        <p className="text-sm font-semibold text-slate-500">
          Free · no account · works on any phone
        </p>
      </header>

      {/* Main Event */}
      <section>
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-full border-2 border-black bg-kringle-cranberry px-3 py-0.5 text-xs font-black uppercase tracking-wide text-white">
            Main Event
          </span>
          <div className="h-0.5 flex-1 bg-black" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {MAIN_EVENTS.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="group relative flex flex-col rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] transition hover:-translate-y-1 hover:shadow-[6px_6px_0_#000]"
            >
              {game.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-kringle-gold px-2.5 py-0.5 text-xs font-black text-black">
                  {game.badge}
                </span>
              )}
              <p className="text-4xl" aria-hidden="true">{game.emoji}</p>
              <h2 className="mt-3 text-2xl font-black">{game.name}</h2>
              <p className="text-sm font-semibold text-kringle-cranberry">{game.subtitle}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{game.description}</p>
              <span className="mt-5 inline-flex min-h-11 items-center rounded-full border-2 border-black bg-kringle-cranberry px-5 text-sm font-black text-white shadow-[2px_2px_0_#000] group-hover:-translate-y-0.5">
                {game.cta}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Warm-Up Games */}
      <section>
        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-full border-2 border-black bg-kringle-spruce px-3 py-0.5 text-xs font-black uppercase tracking-wide text-white">
            Warm-Up Games
          </span>
          <div className="h-0.5 flex-1 bg-slate-300" />
        </div>
        <p className="mb-4 text-sm text-slate-600">
          Play these before the main event — great while guests are still arriving.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {WARMUP_GAMES.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className="group flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-5 transition hover:border-kringle-spruce hover:shadow-sm"
            >
              <p className="text-3xl" aria-hidden="true">{game.emoji}</p>
              <h2 className="mt-2 font-black">{game.name}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-600">{game.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{game.time}</span>
                <span className="text-kringle-cranberry group-hover:underline">Play free →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best order tip */}
      <section className="rounded-3xl bg-kringle-spruce p-7 text-white sm:p-9">
        <h2 className="text-xl font-black">Best game order for your party</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <p className="font-black">1 · Arrivals: Trivia or Bingo</p>
            <p className="mt-1 text-sm text-white/75">
              Guests trickle in. Trivia or bingo keeps early arrivals entertained.
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
      <section className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-6 text-center">
        <p className="font-semibold text-amber-900">
          Also planning the party? Manage guests, food, venue, and budget in one place.
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
