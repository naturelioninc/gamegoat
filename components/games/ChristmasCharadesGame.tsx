"use client";

import { useEffect, useState } from "react";
import { CHRISTMAS_CHARADES, nextCharadesIndex } from "@/lib/games/christmas-charades";

const ROUND_SECONDS = 60;

export function ChristmasCharadesGame() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [skips, setSkips] = useState(0);
  const [running, setRunning] = useState(false);
  const prompt = CHRISTMAS_CHARADES[promptIndex];

  useEffect(() => {
    if (!running) return;
    if (seconds === 0) {
      setRunning(false);
      return;
    }
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [running, seconds]);

  const advance = () =>
    setPromptIndex((current) => nextCharadesIndex(CHRISTMAS_CHARADES.length, current));
  const start = () => {
    setScore(0);
    setSkips(0);
    setSeconds(ROUND_SECONDS);
    advance();
    setRunning(true);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-sky-200 bg-white shadow-xl shadow-sky-900/10">
      <div className="bg-gradient-to-r from-sky-100 to-blue-50 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-kringle-spruce">
              60-second round
            </p>
            <h2 className="mt-1 text-2xl font-bold">Act it out — no words or sounds</h2>
          </div>
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-black ${seconds <= 10 && running ? "bg-kringle-cranberry text-white" : "bg-white text-slate-900"}`}
            aria-label={`${seconds} seconds remaining`}
          >
            {seconds}
          </div>
        </div>
      </div>
      <div className="p-5 sm:p-7">
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl bg-kringle-spruce p-6 text-center text-white">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">
            {running ? prompt?.category : "Ready?"}
          </p>
          <p className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
            {running ? prompt?.prompt : "Pass the phone to the actor"}
          </p>
          {!running && seconds === 0 && (
            <p className="mt-4 text-lg">
              Round over · {score} correct · {skips} skipped
            </p>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {running ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setSkips((value) => value + 1);
                  advance();
                }}
                className="min-h-14 rounded-2xl border-2 border-slate-300 bg-white text-lg font-bold text-slate-700"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => {
                  setScore((value) => value + 1);
                  advance();
                }}
                className="min-h-14 rounded-2xl bg-kringle-cranberry text-lg font-bold text-white"
              >
                ✓ Got it
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={start}
              className="col-span-2 min-h-14 rounded-2xl bg-kringle-cranberry text-lg font-bold text-white"
            >
              {seconds === 0 ? "Play another round" : "Start round"}
            </button>
          )}
        </div>
        <div className="mt-4 flex justify-center gap-6 text-sm font-bold text-slate-700">
          <span>Score: {score}</span>
          <span>Skipped: {skips}</span>
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {seconds === 0 ? `Time is up. ${score} correct and ${skips} skipped.` : ""}
        </p>
      </div>
    </section>
  );
}
