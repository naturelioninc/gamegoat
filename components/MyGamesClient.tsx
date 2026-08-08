"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import { claimDeviceGames, getAccountGames, type AccountGame } from "@/app/my-games/actions";
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

function AccountGameCard({ game }: { game: AccountGame }) {
  const active = game.status === "lobby" || game.status === "active";
  const href = game.gameType === "secret_santa" ? `/secret-santa/room/${game.code}` : `/kris-kringle/room/${game.code}`;
  return <article className="rounded-2xl border-2 border-black bg-white p-4 shadow-[3px_3px_0_#000]"><div className="flex items-start gap-3"><GeneratedIcon name={game.gameType === "secret_santa" ? "secret-santa" : "white-elephant"} size="md" className="h-14 w-14 shrink-0" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{game.status === "lobby" ? "Waiting" : game.status}</span><span className="text-[10px] font-bold text-slate-400">{game.role === "host" ? "You host" : "You’re playing"}</span></div><h3 className="mt-1 font-black">{gameHistoryLabel(game.gameType)}</h3><p className="text-xs text-slate-500">Room {game.code} · {game.playerCount} players</p></div></div><Link href={href} className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-kringle-cranberry px-4 text-sm font-black text-white">{active ? "Continue game" : "View game"}</Link></article>;
}

export function MyGamesClient() {
  const [games, setGames] = useState<GameHistoryEntry[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [accountGames, setAccountGames] = useState<AccountGame[]>([]);
  const [syncMessage, setSyncMessage] = useState("");
  useEffect(() => {
    const refresh = () => setGames(readGameHistory());
    refresh();
    void getAccountGames().then((result) => { setSignedIn(result.signedIn); setAccountGames(result.games); });
    window.addEventListener("game-goat-history", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("game-goat-history", refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const visible = useMemo(() => games.filter((game) => !game.archived), [games]);
  const localCodes = useMemo(() => new Set(visible.map((game) => game.code)), [visible]);
  const accountOnly = accountGames.filter((game) => !localCodes.has(game.code));
  const active = visible.filter((game) => game.status === "lobby" || game.status === "active");
  const recent = visible.filter((game) => game.status !== "lobby" && game.status !== "active");
  const hosted = visible.filter((game) => game.role === "host").length;
  const peoplePlayed = visible.reduce((total, game) => total + game.playerCount, 0);
  const archive = (code: string) => { archiveGameHistory(code); setGames(readGameHistory()); };
  const syncGames = async () => {
    setSyncMessage("Syncing…");
    const result = await claimDeviceGames(games.map(({ code, playerId, playerToken }) => ({ code, playerId, playerToken })));
    setSyncMessage(result.ok ? `${result.claimed} ${result.claimed === 1 ? "game" : "games"} saved to your account${result.conflicts.length ? ` · ${result.conflicts.length} already belongs to another account` : ""}.` : result.error);
  };

  if (visible.length === 0 && accountGames.length === 0) return (
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
    <section aria-label="Your Game Goat summary" className="grid grid-cols-3 gap-2">
      {[['Games', visible.length], ['Hosted', hosted], ['Players', peoplePlayed]].map(([label, value]) => <div key={label} className="rounded-2xl border-2 border-slate-100 bg-white px-2 py-3 text-center"><p className="text-2xl font-black text-kringle-spruce">{value}</p><p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p></div>)}
    </section>
    {active.length > 0 && <section className="space-y-3"><h2 className="text-lg font-black">Continue playing</h2>{active.map((game) => <GameCard key={game.code} game={game} onArchive={() => archive(game.code)} />)}</section>}
    {accountOnly.length > 0 && <section className="space-y-3"><div><h2 className="text-lg font-black">From your Goat account</h2><p className="text-xs text-slate-500">Games you joined or hosted on another browser or device.</p></div>{accountOnly.map((game) => <AccountGameCard key={game.code} game={game} />)}</section>}
    {recent.length > 0 && <section className="space-y-3"><h2 className="text-lg font-black">Recent games</h2>{recent.map((game) => <GameCard key={game.code} game={game} onArchive={() => archive(game.code)} />)}</section>}
    {recent.length > 0 && <section className="rounded-2xl border-2 border-kringle-gold bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-widest text-amber-800">Keep the party moving</p><h2 className="mt-1 text-lg font-black text-amber-950">Another round—or find the perfect gift?</h2><div className="mt-3 grid grid-cols-2 gap-2"><Link href={recent[0]?.gameType === "secret_santa" ? "/secret-santa" : "/kris-kringle"} className="flex min-h-11 items-center justify-center rounded-xl bg-kringle-cranberry px-2 text-center text-xs font-black text-white">Start a fresh game</Link><a href="https://xmasgoat.com/gift-ideas" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center rounded-xl border-2 border-amber-800 px-2 text-center text-xs font-black text-amber-900">Browse gift ideas ↗</a></div><p className="mt-2 text-[10px] font-semibold text-amber-800">Gift browsing opens outside Game Goat.</p></section>}
    <section className="rounded-2xl bg-kringle-spruce/5 p-4"><p className="text-sm font-black text-kringle-spruce">{signedIn ? "Save across devices" : "Saved on this device"}</p><p className="mt-1 text-xs text-slate-600">{signedIn ? "Attach these secure device sessions to your XmasGoat account." : "Create a free account later to keep games across devices. Playing never requires sign-in."}</p>{signedIn ? <button type="button" onClick={syncGames} className="mt-3 min-h-10 rounded-xl bg-kringle-spruce px-4 text-sm font-black text-white">Sync my games</button> : <a href="https://account.xmasgoat.com" className="mt-3 inline-flex text-sm font-black text-kringle-cranberry underline">Open My Account →</a>}{syncMessage && <p role="status" className="mt-2 text-xs font-bold text-slate-600">{syncMessage}</p>}</section>
  </div>;
}
