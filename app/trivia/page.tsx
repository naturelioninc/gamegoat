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
    <main className="mx-auto max-w-2xl space-y-8 px-5 py-10 sm:py-14">
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-spruce">
          Party game
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight">Christmas Trivia</h1>
        <p className="text-slate-600">
          {CHRISTMAS_TRIVIA.length} questions · traditions, music, movies &amp; food
        </p>
      </header>
      <ChristmasTriviaGame />
    </main>
  );
}
