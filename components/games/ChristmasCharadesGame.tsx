"use client";

import { useEffect, useState } from "react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { CHRISTMAS_CHARADES, nextCharadesIndex } from "@/lib/games/christmas-charades";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import { gameFeedback } from "@/lib/feedback";
import { MilestoneCelebration } from "@/components/MilestoneCelebration";

const ROUND_SECONDS = 60;

export function ChristmasCharadesGame() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [seconds, setSeconds] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [skips, setSkips] = useState(0);
  const [running, setRunning] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [teamScores, setTeamScores] = useState([0, 0]);
  const [celebrating, setCelebrating] = useState(false);
  const teams = ["Mistletoe", "Reindeer"];
  const prompt = CHRISTMAS_CHARADES[promptIndex];

  useEffect(() => {
    if (!running) return;
    if (seconds === 0) {
      setRunning(false);
      setTeamScores((scores) => scores.map((value, team) => team === currentTeam ? value + score : value));
      if (score >= 3) setCelebrating(true);
      Haptics.vibrate({ duration: 400 }).catch(() => {});
      return;
    }
    if (seconds === 10 || seconds === 5) {
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
    }
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [running, seconds]);

  const advance = () =>
    setPromptIndex((current) => nextCharadesIndex(CHRISTMAS_CHARADES.length, current));
  const start = () => {
    if (seconds === 0) setCurrentTeam((team) => (team + 1) % teams.length);
    setScore(0);
    setSkips(0);
    setSeconds(ROUND_SECONDS);
    advance();
    setRunning(true);
    void gameFeedback("tap");
  };

  const shareRound = () => {
    const text = `${teams[currentTeam]} got ${score} in XmasGoat Christmas Charades! ${teams[0]} ${teamScores[0]}–${teamScores[1]} ${teams[1]}.`;
    if (navigator.share) void navigator.share({ title: "XmasGoat Charades", text, url: location.href });
    else void navigator.clipboard?.writeText(`${text} ${location.href}`);
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-sky-200 bg-white shadow-xl shadow-sky-900/10">
      <div className="bg-gradient-to-r from-sky-100 to-blue-50 p-5 sm:p-7">
        <div className="mb-4 grid grid-cols-2 gap-2" aria-label="Team scores">
          {teams.map((team, teamIndex) => <div key={team} className={`rounded-2xl border-2 px-3 py-2 text-center ${teamIndex === currentTeam ? "border-kringle-spruce bg-white shadow-[2px_2px_0_#0f172a]" : "border-transparent bg-white/50"}`}><p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{teamIndex === currentTeam ? "Up now" : "Next"}</p><p className="font-black">{team} · {teamScores[teamIndex]}</p></div>)}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-kringle-spruce">
              60-second round
            </p>
            <h2 className="mt-1 text-2xl font-bold">Act it out — no words or sounds</h2>
          </div>
          <div
            className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-black ${seconds <= 10 && running ? "bg-kringle-cranberry text-white" : "bg-white text-slate-900"}`}
            aria-label={`${seconds} seconds remaining`}
          >
            <GeneratedIcon name="timer" className="absolute -left-4 -top-4 h-8 w-8" />
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
            <><p className="mt-4 text-lg">Round over · {score} correct · {skips} skipped</p><button type="button" onClick={shareRound} className="mt-4 rounded-full border-2 border-white/50 px-4 py-2 text-sm font-black">Share this round ↗</button></>
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
                  void gameFeedback("warning");
                }}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white text-lg font-bold text-slate-700"
              >
                <GeneratedIcon name="skip-turn" className="h-8 w-8" />
                Skip
              </button>
              <button
                type="button"
                onClick={() => {
                  setScore((value) => value + 1);
                  advance();
                  void gameFeedback("success");
                }}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-kringle-cranberry text-lg font-bold text-white"
              >
                <GeneratedIcon name="correct" className="h-8 w-8" />
                Got it
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={start}
              className="col-span-2 min-h-14 rounded-2xl bg-kringle-cranberry text-lg font-bold text-white"
            >
              {seconds === 0 ? `Pass to ${teams[(currentTeam + 1) % teams.length]} →` : `Start ${teams[currentTeam]}'s round`}
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
      {celebrating && <MilestoneCelebration title={`${score} correct!`} detail={`${teams[currentTeam]} lit up the room.`} onDone={() => setCelebrating(false)} />}
    </section>
  );
}
