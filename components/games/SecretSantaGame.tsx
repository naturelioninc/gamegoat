"use client";

import { useState } from "react";
import { draw } from "@/lib/matching/draw";
import type { Assignment } from "@/lib/matching/draw";
import { GeneratedIcon } from "@/components/GeneratedIcon";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

function SetupScreen({ onDraw }: { onDraw: (names: string[], assignments: Assignment[]) => void }) {
  const [names, setNames] = useState(["", "", "", ""]);
  const [exclusions, setExclusions] = useState<[string, string][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showExclusions, setShowExclusions] = useState(false);

  const validNames = names.map((n) => n.trim()).filter(Boolean);
  const duplicates = validNames.length !== new Set(validNames).size;
  const canDraw = validNames.length >= 2 && !duplicates;

  function addName() { setNames((prev) => [...prev, ""]); }
  function removeName(i: number) { setNames((prev) => prev.filter((_, j) => j !== i)); }
  function updateName(i: number, v: string) { setNames((prev) => prev.map((n, j) => (j === i ? v : n))); }

  function addExclusion() { setExclusions((prev) => [...prev, ["", ""]]); }
  function removeExclusion(i: number) { setExclusions((prev) => prev.filter((_, j) => j !== i)); }
  function updateExclusion(i: number, side: 0 | 1, v: string) {
    setExclusions((prev) => prev.map((ex, j) => j === i ? (side === 0 ? [v, ex[1]] : [ex[0], v]) : ex));
  }

  function doDraw() {
    setError(null);
    const result = draw(validNames, exclusions.filter(([a, b]) => a && b));
    if (!result.ok) { setError(result.reason); return; }
    onDraw(validNames, result.assignments);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-xl font-black">Participants</h2>
        <div className="space-y-2">
          {names.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Person ${i + 1}`}
                className="min-h-12 flex-1 rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
                onKeyDown={(e) => { if (e.key === "Enter" && i === names.length - 1) addName(); }}
              />
              {names.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeName(i)}
                  aria-label="Remove"
                  className="min-h-12 min-w-12 rounded-2xl border-2 border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {duplicates && <p className="text-sm font-semibold text-red-600">Each name must be unique.</p>}
        <button
          type="button"
          onClick={addName}
          className="min-h-11 w-full rounded-2xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-500 hover:border-kringle-spruce hover:text-kringle-spruce"
        >
          + Add person
        </button>
      </section>

      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setShowExclusions((v) => !v)}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-kringle-spruce"
        >
          <span className={`transition-transform ${showExclusions ? "rotate-90" : ""}`}>▶</span>
          Exclusions (optional) — pairs who shouldn&apos;t draw each other
        </button>
        {showExclusions && (
          <div className="space-y-2 pl-5">
            {exclusions.map(([a, b], i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={a}
                  onChange={(e) => updateExclusion(i, 0, e.target.value)}
                  className="min-h-11 flex-1 rounded-xl border-2 border-slate-200 px-3 text-sm font-semibold"
                >
                  <option value="">Person A</option>
                  {validNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-slate-400 text-sm font-bold">→</span>
                <select
                  value={b}
                  onChange={(e) => updateExclusion(i, 1, e.target.value)}
                  className="min-h-11 flex-1 rounded-xl border-2 border-slate-200 px-3 text-sm font-semibold"
                >
                  <option value="">Person B</option>
                  {validNames.filter((n) => n !== a).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => removeExclusion(i)}
                  className="min-h-11 min-w-11 rounded-xl border-2 border-slate-200 text-slate-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addExclusion}
              className="text-sm font-bold text-kringle-spruce hover:underline"
            >
              + Add exclusion
            </button>
          </div>
        )}
      </section>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={doDraw}
        disabled={!canDraw}
        className="min-h-14 w-full rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Do the draw ({validNames.length} people)
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reveal flow — pass-and-tap
// ---------------------------------------------------------------------------

function RevealScreen({
  names,
  assignments,
  onReset,
}: {
  names: string[];
  assignments: Assignment[];
  onReset: () => void;
}) {
  const [revealIndex, setRevealIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const done = revealIndex >= names.length;

  const current = names[revealIndex];
  const assignment = assignments.find((a) => a.giverId === current);
  const recipient = assignment?.recipientId ?? "—";

  return (
    <div className="space-y-6">
      {done ? (
        <div className="space-y-6 text-center">
          <p className="text-5xl">🎅</p>
          <p className="text-2xl font-black">Everyone has their assignment!</p>
          <p className="text-slate-600">
            {names.length} Secret Santas · keep your match private until gift day.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="min-h-12 w-full rounded-2xl bg-kringle-cranberry font-bold text-white"
          >
            Start a new draw
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-3xl bg-kringle-spruce p-8 text-center text-white">
            <GeneratedIcon name="pass-phone" size="md" className="mx-auto mb-3 h-16 w-16" />
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">
              Pass the phone to
            </p>
            <p className="mt-2 text-4xl font-black">{current}</p>
          </div>

          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-4 border-dashed border-kringle-cranberry text-lg font-black text-kringle-cranberry"
            >
              <GeneratedIcon name="reveal-match" className="h-8 w-8" />
              Tap to reveal your match
            </button>
          ) : (
            <div className="space-y-4">
              <div className="rounded-3xl border-4 border-kringle-gold bg-amber-50 p-8 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-700">
                  You are buying a gift for
                </p>
                <p className="mt-2 text-4xl font-black text-amber-900">{recipient}</p>
                <p className="mt-3 text-sm text-amber-700">Keep this secret until gift day! 🤫</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRevealed(false);
                  setRevealIndex((i) => i + 1);
                }}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-kringle-cranberry text-lg font-black text-white"
              >
                <GeneratedIcon name="pass-phone" className="h-8 w-8" />
                Done — pass to next person
              </button>
            </div>
          )}

          <div className="flex justify-center gap-1.5">
            {names.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${i < revealIndex ? "w-6 bg-kringle-spruce" : i === revealIndex ? "w-6 bg-kringle-cranberry" : "w-2 bg-slate-200"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function SecretSantaGame() {
  const [drawn, setDrawn] = useState<{ names: string[]; assignments: Assignment[] } | null>(null);

  return drawn ? (
    <RevealScreen
      names={drawn.names}
      assignments={drawn.assignments}
      onReset={() => setDrawn(null)}
    />
  ) : (
    <SetupScreen onDraw={(names, assignments) => setDrawn({ names, assignments })} />
  );
}
