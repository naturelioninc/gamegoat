"use client";

import { useMemo, useState } from "react";
import {
  CHRISTMAS_BINGO_ITEMS,
  FREE_SPACE,
  generateBingoCard,
  hasBingo,
  shuffled,
} from "@/lib/games/christmas-bingo";
import { GeneratedIcon } from "@/components/GeneratedIcon";

export function ChristmasBingoGame() {
  const [mode, setMode] = useState<"card" | "caller">("card");
  const [card, setCard] = useState(() => generateBingoCard());
  const [marked, setMarked] = useState<Set<number>>(new Set([12]));
  const [callDeck, setCallDeck] = useState(() => shuffled(CHRISTMAS_BINGO_ITEMS));
  const [callIndex, setCallIndex] = useState(-1);
  const bingo = useMemo(() => hasBingo(marked), [marked]);

  const newCard = () => {
    setCard(generateBingoCard());
    setMarked(new Set([12]));
  };

  const toggle = (index: number) => {
    if (index === 12) return;
    setMarked((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const resetCaller = () => {
    setCallDeck(shuffled(CHRISTMAS_BINGO_ITEMS));
    setCallIndex(-1);
  };

  const currentCall = callIndex >= 0 ? callDeck[callIndex] : "Ready to call?";

  return (
    <section className="overflow-hidden rounded-[2rem] border border-sky-200 bg-white shadow-xl shadow-sky-900/10">
      <div className="grid grid-cols-2 bg-sky-50 p-2 print:hidden">
        <button
          type="button"
          onClick={() => setMode("card")}
          aria-pressed={mode === "card"}
          className={`min-h-12 rounded-2xl font-bold ${mode === "card" ? "bg-kringle-spruce text-white" : "text-slate-700"}`}
        >
          Play a card
        </button>
        <button
          type="button"
          onClick={() => setMode("caller")}
          aria-pressed={mode === "caller"}
          className={`min-h-12 rounded-2xl font-bold ${mode === "caller" ? "bg-kringle-spruce text-white" : "text-slate-700"}`}
        >
          Call the game
        </button>
      </div>
      {mode === "card" ? (
        <div className="p-3 sm:p-7">
          <div className="mb-3 grid grid-cols-5 text-center text-2xl font-black tracking-widest text-kringle-cranberry sm:text-3xl">
            {"BINGO".split("").map((letter) => (
              <span key={letter}>{letter}</span>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="Christmas bingo card">
            {card.map((item, index) => {
              const active = marked.has(index);
              return (
                <button
                  key={`${index}-${item}`}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${item}${active ? ", marked" : ""}`}
                  onClick={() => toggle(index)}
                  className={`aspect-square min-w-0 rounded-xl border p-1 text-[9px] font-bold leading-tight sm:text-sm ${active ? "border-kringle-spruce bg-kringle-spruce text-white" : "border-sky-200 bg-sky-50 text-slate-800"}`}
                >
                  {item === FREE_SPACE ? "★ FREE ★" : item}
                </button>
              );
            })}
          </div>
          <div role="status" aria-live="polite" className="mt-4 min-h-16 text-center">
            {bingo ? (
              <div className="animate-kk-slide-up rounded-2xl bg-amber-50 p-3 text-2xl font-black text-amber-900">
                🎉 BINGO!
              </div>
            ) : (
              <p className="text-sm text-slate-600">Tap a square when the caller says it.</p>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 print:hidden">
            <button
              type="button"
              onClick={newCard}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-kringle-cranberry font-bold text-white"
            >
              <GeneratedIcon name="randomize" className="h-8 w-8" />
              New card
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-kringle-spruce font-bold text-kringle-spruce"
            >
              <GeneratedIcon name="print" className="h-8 w-8" />
              Print
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-8">
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl bg-kringle-spruce p-6 text-center text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
              {callIndex + 1} of {callDeck.length}
            </p>
            <p className="mt-4 text-4xl font-black sm:text-5xl">{currentCall}</p>
          </div>
          <button
            type="button"
            disabled={callIndex >= callDeck.length - 1}
            onClick={() => setCallIndex((value) => value + 1)}
            className="mt-4 min-h-14 w-full rounded-2xl bg-kringle-cranberry text-lg font-bold text-white disabled:opacity-50"
          >
            {callIndex < 0 ? "Call first item" : "Call next item"}
          </button>
          <details className="mt-4 rounded-2xl bg-slate-50 p-4">
            <summary className="cursor-pointer font-bold">Called items ({callIndex + 1})</summary>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {callDeck.slice(0, callIndex + 1).map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </details>
          <button
            type="button"
            onClick={resetCaller}
            className="mt-3 min-h-11 w-full font-semibold text-slate-600 underline"
          >
            Reset caller
          </button>
        </div>
      )}
    </section>
  );
}
