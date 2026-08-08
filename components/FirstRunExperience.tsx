"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

const KEY = "gamegoat_welcome_seen_v1";

export function FirstRunExperience() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get("welcome") === "1";
    if ((Capacitor.isNativePlatform() || preview) && localStorage.getItem(KEY) !== "yes") setVisible(true);
  }, []);

  function close() {
    localStorage.setItem(KEY, "yes");
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end bg-[#071f17] sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="gamegoat-welcome-title">
      <div className="relative flex min-h-dvh w-full max-w-lg flex-col overflow-hidden bg-[#fffdf7] sm:min-h-0 sm:rounded-[2rem] sm:border-2 sm:border-black sm:shadow-[8px_8px_0_#000]">
        <button type="button" onClick={close} className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] z-10 min-h-11 rounded-full bg-white/90 px-4 text-sm font-black text-slate-700 shadow-sm">Skip</button>
        <div className="relative min-h-[42vh] overflow-hidden bg-gradient-to-b from-[#0f5132] to-[#071f17]">
          <div className="absolute inset-0 opacity-30 kk-welcome-glow" />
          <img src="/brand/game-night-hero.webp" width="1100" height="513" alt="The Game Goat hosting a lively Christmas game night" className="absolute bottom-0 left-1/2 h-auto w-[150%] max-w-none -translate-x-1/2 object-cover sm:w-full" />
        </div>
        <div className="flex flex-1 flex-col justify-between px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 text-center">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-kringle-cranberry">Welcome to Game Goat</p><h1 id="gamegoat-welcome-title" className="mt-2 text-4xl font-black leading-none">Your party just found its game.</h1><p className="mx-auto mt-4 max-w-sm text-base font-semibold text-slate-600">Host White Elephant, draw Secret Santa, or warm up the room with quick Christmas games.</p></div>
          <div className="mt-7"><button type="button" onClick={close} className="min-h-14 w-full rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#000]">Let’s play →</button><p className="mt-3 text-xs font-bold text-slate-400">No account needed to start</p></div>
        </div>
      </div>
    </div>
  );
}
