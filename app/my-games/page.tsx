import type { Metadata } from "next";
import { MyGamesClient } from "@/components/MyGamesClient";

export const metadata: Metadata = { title: "My Games", description: "Continue your active Game Goat rooms and revisit recent Christmas games." };

export default function MyGamesPage() {
  return <main className="mx-auto max-w-2xl space-y-5 px-5 py-5 sm:py-14"><header><p className="text-[10px] font-black uppercase tracking-widest text-kringle-cranberry sm:text-sm">Your game shelf</p><h1 className="text-3xl font-black tracking-tight sm:text-4xl">My Games</h1><p className="mt-1 text-sm text-slate-600">Jump back into rooms you started or joined.</p></header><MyGamesClient /></main>;
}
