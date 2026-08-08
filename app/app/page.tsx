import type { Metadata } from "next";
import Link from "next/link";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import { ContinuePlaying } from "@/components/ContinuePlaying";

export const metadata: Metadata = {
  title: "XmasGoat — Parties and Games",
  description: "Plan the Christmas party, bring your people, and play together in one app.",
  robots: { index: false, follow: false },
};

export default function UnifiedAppHome() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-7 px-4 py-7 sm:px-6 sm:py-10">
      <header className="rounded-3xl border-2 border-black bg-kringle-spruce px-5 py-7 text-white shadow-[5px_5px_0_#000] sm:px-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-kringle-gold">
          Your Christmas, together
        </p>
        <h1 className="mt-2 text-3xl font-black leading-none sm:text-4xl">
          Plan the party. Play the games.
        </h1>
        <p className="mt-3 max-w-xl text-sm font-semibold text-white/80 sm:text-base">
          One account keeps the guest list, party plan, gift exchanges and live games connected.
        </p>
      </header>

      <ContinuePlaying />

      <section aria-labelledby="choose-path-heading">
        <h2 id="choose-path-heading" className="text-xl font-black">
          What are you doing today?
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <a
            href="https://party.xmasgoat.com/events"
            className="group rounded-3xl border-2 border-black bg-[#e8fbf5] p-5 shadow-[4px_4px_0_#000] transition hover:-translate-y-1"
          >
            <GeneratedIcon name="party" size="lg" className="h-20 w-20" />
            <p className="mt-3 text-xs font-black uppercase tracking-widest text-kringle-spruce">
              Party Goat
            </p>
            <h3 className="mt-1 text-2xl font-black">Open my parties</h3>
            <p className="mt-2 text-sm text-slate-600">
              Guests, RSVPs, food, venue, tasks, money, chat and photos.
            </p>
            <span className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-kringle-spruce px-4 text-sm font-black text-white">
              Continue planning →
            </span>
          </a>

          <Link
            href="/"
            className="group rounded-3xl border-2 border-black bg-[#fff2ef] p-5 shadow-[4px_4px_0_#000] transition hover:-translate-y-1"
          >
            <GeneratedIcon name="gift-games" size="lg" className="h-20 w-20" />
            <p className="mt-3 text-xs font-black uppercase tracking-widest text-kringle-cranberry">
              Games Goat
            </p>
            <h3 className="mt-1 text-2xl font-black">Choose a game</h3>
            <p className="mt-2 text-sm text-slate-600">
              Host or join White Elephant, Secret Santa, trivia, charades and bingo.
            </p>
            <span className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-kringle-cranberry px-4 text-sm font-black text-white">
              Start playing →
            </span>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2" aria-label="Quick actions">
        <a
          href="https://party.xmasgoat.com/dashboard/event/new"
          className="flex min-h-20 flex-col items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-2 text-center text-xs font-black"
        >
          New party
        </a>
        <Link
          href="/join"
          className="flex min-h-20 flex-col items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-2 text-center text-xs font-black"
        >
          Join a game
        </Link>
        <a
          href="https://account.xmasgoat.com"
          className="flex min-h-20 flex-col items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-2 text-center text-xs font-black"
        >
          My account
        </a>
      </section>
    </main>
  );
}
