import type { Metadata } from "next";
import { KrisKringleGame } from "@/components/games/KrisKringleGame";

export const metadata: Metadata = {
  title: "Kris Kringle (White Elephant)",
  description:
    "Run a Kris Kringle / White Elephant gift exchange. Enter player names, choose your rules, and play — no account needed.",
};

export default function KrisKringlePage() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-5 py-4 sm:space-y-8 sm:py-14">
      <header className="space-y-0.5 sm:space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-kringle-cranberry sm:text-sm">
          Main event
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">Kris Kringle</h1>
        <p className="text-sm leading-snug text-slate-600 sm:text-base">
          White Elephant gift exchange · open, steal, and trade until everyone has a gift
        </p>
      </header>

      <div className="rounded-3xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000] sm:p-8">
        <KrisKringleGame />
      </div>

      <section className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-600">
        <h2 className="font-black text-slate-900">How it works</h2>
        <ol className="mt-3 space-y-2 [counter-reset:steps] [&>li]:before:[counter-increment:steps] [&>li]:before:content-[counter(steps)'.'] [&>li]:flex [&>li]:gap-2">
          <li>Everyone brings a wrapped gift. Enter names above and hit Start.</li>
          <li>Player #1 opens a gift. Each player can open or steal on their turn.</li>
          <li>A stolen player must open or steal — the chain continues until someone opens new.</li>
          <li>A gift is locked once it hits the max-steal limit and can no longer be stolen.</li>
          <li>Classic rules: Player #1 gets one final turn to swap at the end.</li>
        </ol>
      </section>
    </main>
  );
}
