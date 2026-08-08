"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import { gameHistoryHref, gameHistoryLabel, readGameHistory, type GameHistoryEntry } from "@/lib/game-history";

export function ContinuePlaying() {
  const [game, setGame] = useState<GameHistoryEntry | null>(null);
  useEffect(() => { setGame(readGameHistory().find((item) => !item.archived && ["lobby", "active"].includes(item.status)) ?? null); }, []);
  if (!game) return null;
  return <Link href={gameHistoryHref(game)} className="flex items-center gap-3 rounded-2xl border-2 border-black bg-white p-3 shadow-[3px_3px_0_#000] transition active:scale-[.99]">
    <GeneratedIcon name={game.gameType === "secret_santa" ? "secret-santa" : "white-elephant"} size="md" className="h-12 w-12" />
    <div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Continue playing</p><p className="truncate font-black">{gameHistoryLabel(game.gameType)} · {game.code}</p><p className="text-xs text-slate-500">{game.role === "host" ? "You host" : "You’re playing"} · {game.playerCount} here</p></div><span className="text-xl font-black text-kringle-cranberry">→</span>
  </Link>;
}
