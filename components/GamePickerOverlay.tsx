"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MAIN_GAMES, WARMUP_GAMES } from "@/lib/games";
import {
  GeneratedIcon,
  type GeneratedIconName,
} from "@/components/GeneratedIcon";

interface Props {
  onClose: () => void;
}

function GameIcon({
  icon,
  size = "lg",
}: {
  icon: GeneratedIconName;
  size?: "lg" | "sm";
}) {
  const dim = size === "lg" ? "h-16 w-16 text-3xl" : "h-12 w-12 text-xl";
  return <GeneratedIcon name={icon} size="md" className={`shrink-0 ${dim}`} />;
}

export function GamePickerOverlay({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pick a game"
        className="fixed bottom-0 left-0 right-0 z-50 animate-kk-sheet-up overflow-hidden rounded-t-3xl border-t-2 border-black bg-[#fffdf7] pb-[env(safe-area-inset-bottom)]"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-slate-300" />
        </div>

        {/* Title */}
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="text-lg font-black">Pick a game</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black text-lg font-bold hover:bg-black hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 px-4 pb-6">
          {/* Main event */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-kringle-cranberry bg-kringle-cranberry px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                Main Event
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MAIN_GAMES.map((game) => (
                <Link
                  key={game.href}
                  href={game.href}
                  onClick={onClose}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-black bg-white p-4 text-center shadow-[3px_3px_0_#000] transition active:scale-95"
                >
                  <GameIcon icon={game.icon} size="lg" />
                  <div>
                    <p className="font-black leading-tight">{game.name}</p>
                    <p className="text-xs text-slate-500">{game.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Warm-up */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-kringle-spruce bg-kringle-spruce px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                Warm-Up Games
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {WARMUP_GAMES.map((game) => (
                <Link
                  key={game.href}
                  href={game.href}
                  onClick={onClose}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3 text-center transition hover:border-black active:scale-95"
                >
                  <GameIcon icon={game.icon} size="sm" />
                  <p className="text-xs font-black leading-tight">
                    {game.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
