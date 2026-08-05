import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Game Goat — Free Christmas Party Games",
  description:
    "Play Christmas trivia, charades, and bingo — free, no account needed. Works on any phone or tablet.",
};

const GAMES = [
  {
    href: "/trivia",
    emoji: "🧠",
    name: "Christmas Trivia",
    description: "15 questions across traditions, music, movies, and food. Test your group.",
    cta: "Play trivia →",
    players: "Any group size",
    time: "~10 min",
  },
  {
    href: "/charades",
    emoji: "🎭",
    name: "Christmas Charades",
    description: "60-second rounds. Act it out — no words, no sounds. Score and skip controls included.",
    cta: "Play charades →",
    players: "4+ players",
    time: "~15 min",
  },
  {
    href: "/bingo",
    emoji: "❄️",
    name: "Christmas Bingo",
    description: "Generate randomized cards, mark squares as they're called, detect bingo automatically.",
    cta: "Play bingo →",
    players: "Any group size",
    time: "~20 min",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 px-5 py-12 sm:py-16">
      <header className="space-y-4 text-center">
        <p className="text-6xl animate-kk-float" aria-hidden="true">🐐</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Christmas party games,<br className="hidden sm:block" /> ready to play
        </h1>
        <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-600">
          No account. No setup. Just open a game and pass the phone around.
        </p>
      </header>

      <section className="grid gap-5 sm:grid-cols-3" aria-label="Available games">
        {GAMES.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className="group flex flex-col rounded-3xl border-2 border-sky-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-kringle-spruce hover:shadow-md"
          >
            <p className="text-4xl" aria-hidden="true">{game.emoji}</p>
            <h2 className="mt-3 text-xl font-bold">{game.name}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{game.description}</p>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{game.players}</span>
              <span>{game.time}</span>
            </div>
            <span className="mt-4 font-bold text-kringle-cranberry group-hover:underline">
              {game.cta}
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-3xl bg-kringle-spruce p-7 text-white sm:p-9">
        <h2 className="text-2xl font-bold">Best order for your party</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <p className="font-black">1 · Arrival: Trivia</p>
            <p className="mt-1 text-sm text-white/75">
              Guests filter in at their own pace. Questions keep early arrivals busy.
            </p>
          </div>
          <div>
            <p className="font-black">2 · Everyone's here: Charades</p>
            <p className="mt-1 text-sm text-white/75">
              Gets everyone up and moving once the room is full.
            </p>
          </div>
          <div>
            <p className="font-black">3 · After dinner: Bingo</p>
            <p className="mt-1 text-sm text-white/75">
              Calmer energy while people are full. Easy for all ages.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-sm font-semibold text-amber-800">
          Planning a full Christmas party with food, guests, and a gift exchange?
        </p>
        <a
          href="https://party.xmasgoat.com"
          className="mt-3 inline-flex min-h-11 items-center rounded-2xl bg-kringle-spruce px-5 font-bold text-white transition hover:opacity-90"
        >
          Try Party Goat →
        </a>
      </section>
    </main>
  );
}
