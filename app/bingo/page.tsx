import type { Metadata } from "next";
import { ChristmasBingoGame } from "@/components/games/ChristmasBingoGame";

export const metadata: Metadata = {
  title: "Christmas Bingo",
  description:
    "Generate randomized Christmas bingo cards, mark squares, and call items with a no-repeat caller. Free for any group size.",
};

export default function BingoPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-8 px-5 py-10 sm:py-14">
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-spruce">
          Party game
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight">Christmas Bingo</h1>
        <p className="text-slate-600">Random cards · auto bingo detection · printable</p>
      </header>
      <ChristmasBingoGame />
    </main>
  );
}
