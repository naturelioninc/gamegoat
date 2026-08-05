import type { Metadata } from "next";
import { ChristmasCharadesGame } from "@/components/games/ChristmasCharadesGame";

export const metadata: Metadata = {
  title: "Christmas Charades",
  description:
    "Play Christmas charades with a 60-second timer, score tracking, and 36 family-friendly prompts. Free on any phone.",
};

export default function CharadesPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-8 px-5 py-10 sm:py-14">
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-spruce">
          Party game
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight">Christmas Charades</h1>
        <p className="text-slate-600">60 seconds · act it out · no words or sounds</p>
      </header>
      <ChristmasCharadesGame />
    </main>
  );
}
