import type { Metadata } from "next";
import { ChristmasCharadesGame } from "@/components/games/ChristmasCharadesGame";

export const metadata: Metadata = {
  title: "Christmas Charades",
  description:
    "Play Christmas charades with a 60-second timer, score tracking, and 36 family-friendly prompts. Free on any phone.",
};

export default function CharadesPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-5 py-4 sm:space-y-8 sm:py-14">
      <header className="space-y-0.5 sm:space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-kringle-spruce sm:text-sm">
          Party game
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">Christmas Charades</h1>
        <p className="text-sm leading-snug text-slate-600 sm:text-base">60 seconds · act it out · no words or sounds</p>
      </header>
      <ChristmasCharadesGame />
    </main>
  );
}
