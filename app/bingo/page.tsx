import type { Metadata } from "next";
import { ChristmasBingoGame } from "@/components/games/ChristmasBingoGame";
import { GameSessionBar } from "@/components/games/GameSessionBar";

export const metadata: Metadata = {
  title: "Christmas Bingo",
  description:
    "Generate randomized Christmas bingo cards, mark squares, and call items with a no-repeat caller. Free for any group size.",
};

export default function BingoPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-5 py-4 sm:space-y-8 sm:py-14">
      <GameSessionBar game="Christmas Bingo" cue="One caller · unlimited cards" />
      <header className="space-y-0.5 sm:space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-kringle-spruce sm:text-sm">
          Party game
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">Christmas Bingo</h1>
        <p className="text-sm leading-snug text-slate-600 sm:text-base">Random cards · auto bingo detection · printable</p>
      </header>
      <ChristmasBingoGame />
    </main>
  );
}
