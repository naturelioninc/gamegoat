import type { Metadata } from "next";
import { SecretSantaGame } from "@/components/games/SecretSantaGame";

export const metadata: Metadata = {
  title: "Secret Santa",
  description:
    "Run a Secret Santa draw. Enter names, add exclusions, do the draw, then pass and reveal privately on one phone. Free, no account needed.",
};

export default function SecretSantaPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-8 px-5 py-10 sm:py-14">
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">
          Main event
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight">Secret Santa</h1>
        <p className="text-slate-600">
          Draw names, reveal privately, keep it secret until gift day
        </p>
      </header>

      <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] sm:p-8">
        <SecretSantaGame />
      </div>

      <section className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-600">
        <h2 className="font-black text-slate-900">How it works</h2>
        <ol className="mt-3 space-y-2 [counter-reset:steps] [&>li]:before:[counter-increment:steps] [&>li]:before:content-[counter(steps)'.'] [&>li]:flex [&>li]:gap-2">
          <li>Enter everyone&apos;s names above. Add exclusions for couples or families.</li>
          <li>Tap &ldquo;Do the draw&rdquo; — names are matched randomly.</li>
          <li>Pass the phone to each person. They tap to reveal their match privately.</li>
          <li>No one else sees each other&apos;s assignments.</li>
          <li>Set a budget, pick a gift, wrap it, and bring it to the party!</li>
        </ol>
      </section>
    </main>
  );
}
