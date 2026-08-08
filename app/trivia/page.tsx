import type { Metadata } from "next";
import { ChristmasTriviaGame } from "@/components/games/ChristmasTriviaGame";
import { CHRISTMAS_TRIVIA } from "@/lib/games/christmas-trivia";

export const metadata: Metadata = {
  title: "Christmas Trivia",
  description:
    `${CHRISTMAS_TRIVIA.length} Christmas trivia questions covering traditions, music, movies, and food. Play free on any device.`,
};

export default function TriviaPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-5 py-4 sm:space-y-8 sm:py-14">
      <header className="space-y-0.5 sm:space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-kringle-spruce sm:text-sm">
          Party game
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">Christmas Trivia</h1>
        <p className="text-sm leading-snug text-slate-600 sm:text-base">
          {CHRISTMAS_TRIVIA.length} questions · traditions, music, movies &amp; food
        </p>
      </header>
      <ChristmasTriviaGame />
    </main>
  );
}
