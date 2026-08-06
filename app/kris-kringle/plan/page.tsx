"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExchange } from "./actions";

export default function PlanPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [hostName, setHostName] = useState("");
  const [hostEmail, setHostEmail] = useState("");
  const [exchangeName, setExchangeName] = useState("");
  const [partyDate, setPartyDate] = useState("");
  const [budgetDollars, setBudgetDollars] = useState("");
  const [maxSteals, setMaxSteals] = useState(3);
  const [allowImmediateStealback, setAllowImmediateStealback] = useState(false);
  const [firstPlayerFinalTurn, setFirstPlayerFinalTurn] = useState(true);

  const [returningId, setReturningId] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!hostName.trim() || !hostEmail.trim() || !exchangeName.trim()) return;
    setError("");
    startTransition(async () => {
      try {
        const budgetCents = budgetDollars ? Math.round(parseFloat(budgetDollars) * 100) : undefined;
        const { id } = await createExchange(
          hostName,
          hostEmail,
          exchangeName,
          partyDate || undefined,
          budgetCents,
          { maxSteals, allowImmediateStealback, firstPlayerFinalTurn },
        );
        router.push(`/kris-kringle/plan/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleReturnNav(e: React.FormEvent) {
    e.preventDefault();
    const id = returningId.trim();
    if (!id) return;
    router.push(`/kris-kringle/plan/${id}`);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-5 py-10 sm:py-14">
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">
          Pre-party planner
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight">Set up your exchange</h1>
        <p className="text-slate-600">
          Invite friends, collect wish lists, and draw names before the party.
        </p>
      </header>

      <form onSubmit={handleCreate} className="space-y-6">
        <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] space-y-5">
          <h2 className="text-xl font-black">Your details</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              required
              className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
            />
            <input
              type="email"
              value={hostEmail}
              onChange={(e) => setHostEmail(e.target.value)}
              placeholder="Your email"
              required
              className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] space-y-5">
          <h2 className="text-xl font-black">Exchange details</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={exchangeName}
              onChange={(e) => setExchangeName(e.target.value)}
              placeholder="Exchange name (e.g. Smith Family Kris Kringle)"
              maxLength={80}
              required
              className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Party date
                </label>
                <input
                  type="date"
                  value={partyDate}
                  onChange={(e) => setPartyDate(e.target.value)}
                  className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Budget per person ($)
                </label>
                <input
                  type="number"
                  value={budgetDollars}
                  onChange={(e) => setBudgetDollars(e.target.value)}
                  placeholder="e.g. 30"
                  min="1"
                  max="9999"
                  className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] space-y-5">
          <h2 className="text-xl font-black">Game rules</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Max steals per gift
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMaxSteals(n)}
                    className={`min-h-11 flex-1 rounded-2xl border-2 font-black text-lg transition ${
                      maxSteals === n
                        ? "border-kringle-spruce bg-kringle-spruce text-white"
                        : "border-slate-200 text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowImmediateStealback}
                onChange={(e) => setAllowImmediateStealback(e.target.checked)}
                className="rounded"
              />
              <span className="font-semibold text-slate-700">Allow immediate steal-back</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={firstPlayerFinalTurn}
                onChange={(e) => setFirstPlayerFinalTurn(e.target.checked)}
                className="rounded"
              />
              <span className="font-semibold text-slate-700">Player #1 gets a final turn</span>
            </label>
          </div>
        </div>

        {error && (
          <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || !hostName.trim() || !hostEmail.trim() || !exchangeName.trim()}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_#000] disabled:opacity-40"
        >
          {pending ? "Creating…" : "Create exchange →"}
        </button>
      </form>

      <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-6 space-y-4">
        <h2 className="text-xl font-black text-slate-700">Returning host?</h2>
        <p className="text-sm text-slate-600">Enter your exchange ID to get back to your dashboard.</p>
        <form onSubmit={handleReturnNav} className="flex gap-2">
          <input
            type="text"
            value={returningId}
            onChange={(e) => setReturningId(e.target.value)}
            placeholder="Exchange ID (paste from your link)"
            className="min-h-11 flex-1 rounded-2xl border-2 border-slate-200 px-4 text-sm font-semibold focus:border-kringle-spruce focus:outline-none"
          />
          <button
            type="submit"
            disabled={!returningId.trim()}
            className="min-h-11 rounded-2xl border-2 border-kringle-spruce px-4 text-sm font-black text-kringle-spruce disabled:opacity-40"
          >
            Go →
          </button>
        </form>
      </div>
    </main>
  );
}
