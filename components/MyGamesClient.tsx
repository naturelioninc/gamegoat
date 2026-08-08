"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import {
  archiveGameHistory,
  gameHistoryHref,
  gameHistoryLabel,
  readGameHistory,
  type GameHistoryEntry,
} from "@/lib/game-history";

function GameCard({ game, onArchive }: { game: GameHistoryEntry; onArchive: () => void }) {
  const active = game.status === "lobby" || game.status === "active";
  const icon = game.gameType === "secret_santa" ? "secret-santa" : "white-elephant";
  return (
    <article className="rounded-2xl border-2 border-black bg-white p-4 shadow-[3px_3px_0_#000]">
      <div className="flex items-start gap-3">
        <GeneratedIcon name={icon} size="md" className="h-14 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
              {game.status === "lobby" ? "Waiting" : game.status}
            </span>
            <span className="text-[10px] font-bold text-slate-400">{game.role === "host" ? "You host" : "You’re playing"}</span>
          </div>
          <h3 className="mt-1 font-black">{gameHistoryLabel(game.gameType)}</h3>
          <p className="text-xs text-slate-500">Room {game.code} · {game.playerCount} {game.playerCount === 1 ? "player" : "players"}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
        <Link href={gameHistoryHref(game)} className="flex min-h-11 items-center justify-center rounded-xl bg-kringle-cranberry px-4 text-sm font-black text-white">
          {active ? "Continue game" : "View results"}
        </Link>
        <button type="button" onClick={onArchive} className="min-h-11 rounded-xl border-2 border-slate-200 px-3 text-xs font-bold text-slate-500">Archive</button>
      </div>
    </article>
  );
}

export function MyGamesClient() {
  const [games, setGames] = useState<GameHistoryEntry[]>([]);
  useEffect(() => {
    const refresh = () => setGames(readGameHistory());
    refresh();
    window.addEventListener("game-goat-history", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("game-goat-history", refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const visible = useMemo(() => games.filter((game) => !game.archived), [games]);
  const active = visible.filter((game) => game.status === "lobby" || game.status === "active");
  const recent = visible.filter((game) => game.status !== "lobby" && game.status !== "active");
  const archive = (code: string) => { archiveGameHistory(code); setGames(readGameHistory()); };

  if (visible.length === 0) return (
    <section className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-7 text-center">
      <GeneratedIcon name="gift-games" size="lg" className="mx-auto h-24 w-24" />
      <h2 className="mt-2 text-xl font-black">Your games will live here</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">Start or join a game and this device will remember how to get you back.</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link href="/" className="flex min-h-11 items-center justify-center rounded-xl bg-kringle-cranberry text-sm font-black text-white">Pick a game</Link>
        <Link href="/join" className="flex min-h-11 items-center justify-center rounded-xl border-2 border-kringle-spruce text-sm font-black text-kringle-spruce">Join with code</Link>
      </div>
    </section>
  );

  return <div className="space-y-7">
    {active.length > 0 && <section className="space-y-3"><h2 className="text-lg font-black">Continue playing</h2>{active.map((game) => <GameCard key={game.code} game={game} onArchive={() => archive(game.code)} />)}</section>}
    {recent.length > 0 && <section className="space-y-3"><h2 className="text-lg font-black">Recent games</h2>{recent.map((game) => <GameCard key={game.code} game={game} onArchive={() => archive(game.code)} />)}</section>}
    <section className="rounded-2xl bg-kringle-spruce/5 p-4"><p className="text-sm font-black text-kringle-spruce">Saved on this device</p><p className="mt-1 text-xs text-slate-600">Create a free account later to keep games across devices. Playing never requires sign-in.</p><a href="https://account.xmasgoat.com" className="mt-3 inline-flex text-sm font-black text-kringle-cranberry underline">Open My Account →</a></section>
  </div>;
}
