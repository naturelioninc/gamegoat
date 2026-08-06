"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  currentPlayerId,
  eligibleSteals,
  unopenedGifts,
  isLocked,
  giftOwnedBy,
} from "@/lib/engine/engine";
import type { GameState, GameActionInput } from "@/lib/engine/types";
import { joinRoom, startGame, performRoomAction } from "../actions";
import { GeneratedIcon } from "@/components/GeneratedIcon";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RoomPlayer {
  id: string;
  name: string;
  isHost?: boolean;
  isManual?: boolean;
}

interface GameRoom {
  code: string;
  status: "lobby" | "active" | "complete" | "abandoned";
  players: RoomPlayer[];
  state: GameState | null;
  rules: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Storage helpers (identify this device's player in the room)
// ---------------------------------------------------------------------------

function getStoredPlayer(code: string): { playerId: string; playerName: string } | null {
  try {
    const raw = localStorage.getItem(`kk_player_${code}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storePlayer(code: string, playerId: string, playerName: string) {
  try {
    localStorage.setItem(`kk_player_${code}`, JSON.stringify({ playerId, playerName }));
  } catch {}
}

// ---------------------------------------------------------------------------
// Lobby view
// ---------------------------------------------------------------------------

function LobbyView({
  room,
  myPlayerId,
  onJoin,
  onStart,
}: {
  room: GameRoom;
  myPlayerId: string | null;
  onJoin: (name: string) => Promise<void>;
  onStart: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/kris-kringle/room/${room.code}`
      : "";

  function handleCopy() {
    navigator.clipboard?.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "Join my Kris Kringle game",
        text: `Join my Kris Kringle game — room code: ${room.code}`,
        url: inviteUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setJoining(true);
    setErr("");
    try {
      await onJoin(name.trim());
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not join");
    } finally {
      setJoining(false);
    }
  }

  async function handleStart() {
    setStarting(true);
    try {
      await onStart();
    } finally {
      setStarting(false);
    }
  }

  const isInRoom = myPlayerId && room.players.some((p) => p.id === myPlayerId);
  const canStart = room.players.length >= 2;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">
          Online game
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight">Kris Kringle</h1>
      </header>

      {/* Room code + QR + share */}
      <div className="rounded-3xl border-2 border-kringle-spruce bg-kringle-spruce/5 p-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-kringle-spruce">
          Room code
        </p>
        <p className="mt-1 font-mono text-5xl font-black tracking-[0.2em] text-kringle-spruce">
          {room.code}
        </p>

        {/* QR code */}
        {inviteUrl && (
          <div className="mt-5 flex justify-center">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <QRCode
                value={inviteUrl}
                size={168}
                bgColor="#ffffff"
                fgColor="#1a5c3a"
              />
            </div>
          </div>
        )}
        <p className="mt-3 text-xs font-semibold text-kringle-spruce/70">
          Scan to join · or share the code above
        </p>

        {/* Share buttons */}
        <div className="mt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-xl bg-kringle-spruce px-4 py-2 text-sm font-bold text-white"
          >
            Share invite
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${
              copied
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-kringle-spruce text-kringle-spruce"
            }`}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      </div>

      {/* Player list */}
      <section className="space-y-3">
        <h2 className="text-lg font-black">
          Players waiting ({room.players.length})
        </h2>
        {room.players.length === 0 ? (
          <p className="text-sm text-slate-500">No one yet — share the room code!</p>
        ) : (
          <ul className="space-y-2">
            {room.players.map((p) => (
              <li
                key={p.id}
                className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-sm font-semibold ${
                  p.id === myPlayerId
                    ? "border-kringle-spruce bg-kringle-spruce/5"
                    : "border-slate-200"
                }`}
              >
                <span className={`h-2 w-2 flex-shrink-0 rounded-full ${p.isManual ? "bg-slate-300" : "bg-emerald-400"}`} />
                {p.name}
                {p.isHost && (
                  <span className="ml-auto rounded-full bg-kringle-gold/20 px-2 py-0.5 text-xs font-bold text-amber-800">
                    host
                  </span>
                )}
                {p.isManual && (
                  <span className="ml-auto text-xs text-slate-400">host controls</span>
                )}
                {p.id === myPlayerId && !p.isHost && !p.isManual && (
                  <span className="ml-auto text-xs text-slate-500">you</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Join form (only shown if not yet in the room) */}
      {!isInRoom && (
        <form onSubmit={handleJoin} className="space-y-3">
          <h2 className="text-lg font-black">Join the game</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={30}
            className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
          />
          {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
          <button
            type="submit"
            disabled={!name.trim() || joining}
            className="min-h-12 w-full rounded-2xl bg-kringle-cranberry font-bold text-white disabled:opacity-40"
          >
            {joining ? "Joining…" : "Join game"}
          </button>
        </form>
      )}

      {/* Start game (shown when in room and enough players) */}
      {isInRoom && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleStart}
            disabled={!canStart || starting}
            className="min-h-14 w-full rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] disabled:opacity-40"
          >
            {starting
              ? "Starting…"
              : canStart
              ? `Start game (${room.players.length} players)`
              : "Need at least 2 players"}
          </button>
          {!canStart && (
            <p className="text-center text-sm text-slate-500">
              Waiting for more players to join…
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live game board
// ---------------------------------------------------------------------------

function GameBoard({
  room,
  myPlayerId,
  onAction,
}: {
  room: GameRoom;
  myPlayerId: string | null;
  onAction: (action: GameActionInput) => void;
}) {
  const state = room.state!;
  const players = room.players;
  const nameById = new Map(players.map((p) => [p.id, p.name]));

  const currentId = currentPlayerId(state);
  const currentName = currentId ? nameById.get(currentId) : null;
  const isMyTurn = !!myPlayerId && currentId === myPlayerId;
  // Host device can act for manually-added players (no phone of their own)
  const isHostDevice = !!myPlayerId && room.players.find((p) => p.id === myPlayerId)?.isHost;
  const currentPlayerIsManual = room.players.find((p) => p.id === currentId)?.isManual ?? false;
  const canAct = isMyTurn || (!!isHostDevice && currentPlayerIsManual);
  const steals = currentId ? eligibleSteals(state, currentId) : [];
  const unopened = unopenedGifts(state);
  const isComplete = state.status === "complete" || state.phase === "complete";
  const isPaused = state.status === "paused";
  const isFinalTurn = state.phase === "final_turn";

  const myGift = myPlayerId ? giftOwnedBy(state, myPlayerId) : null;

  function act(action: GameActionInput) {
    onAction(action);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">
            Room {room.code}
          </p>
          {myGift && (
            <span className="rounded-full bg-kringle-gold/20 px-3 py-0.5 text-xs font-bold text-amber-800">
              You have Gift #{myGift.giftNumber}
            </span>
          )}
        </div>
      </header>

      {/* Status bar */}
      <div
        className={`rounded-2xl border-2 p-4 ${
          isComplete
            ? "border-kringle-gold bg-amber-50"
            : isPaused
            ? "border-slate-300 bg-slate-50"
            : isFinalTurn
            ? "border-kringle-gold bg-amber-50"
            : canAct
            ? "border-kringle-cranberry bg-kringle-cranberry text-white"
            : "border-kringle-spruce bg-kringle-spruce text-white"
        }`}
      >
        {isComplete ? (
          <p className="text-center text-xl font-black text-amber-900">
            Game over! See results below.
          </p>
        ) : isPaused ? (
          <div className="flex items-center justify-between">
            <p className="font-black text-slate-700">Game paused</p>
            <button
              type="button"
              onClick={() => act({ type: "resume" })}
              className="rounded-xl bg-kringle-spruce px-4 py-2 text-sm font-bold text-white"
            >
              Resume
            </button>
          </div>
        ) : isFinalTurn ? (
          <div className="text-amber-900">
            <p className="text-sm font-bold uppercase tracking-wide">Final turn</p>
            <p className="mt-1 text-xl font-black">
              {isMyTurn ? "Your final turn — keep or swap" : `${currentName} — final turn`}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] opacity-70">
              Turn {state.turnsTaken + 1} of {players.length}
            </p>
            <p className="mt-1 text-xl font-black">
              {isMyTurn ? "Your turn!" : `${currentName}'s turn`}
            </p>
          </div>
        )}
      </div>

      {/* Actions — turn actions locked to current player; utility controls open to all */}
      {!isComplete && !isPaused && (
        <div className="space-y-3">
          {!canAct && !isFinalTurn && (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-500">
              Waiting for {currentName} to act…
            </p>
          )}
          {isFinalTurn ? (
            <>
              <button
                type="button"
                onClick={() => act({ type: "final_keep" })}
                disabled={!canAct}
                className={`min-h-12 w-full rounded-2xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${canAct ? "bg-kringle-spruce" : "bg-slate-400"}`}
              >
                {isMyTurn ? "Keep my gift" : `${currentName} — keep their gift`}
              </button>
              {state.gifts
                .filter(
                  (g) =>
                    g.ownerId !== null &&
                    g.ownerId !== currentId &&
                    !isLocked(g, state.rules),
                )
                .map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => act({ type: "final_swap", giftId: g.id })}
                    disabled={!canAct}
                    className={`min-h-12 w-full rounded-2xl border-2 font-bold disabled:cursor-not-allowed disabled:opacity-40 ${canAct ? "border-kringle-cranberry text-kringle-cranberry hover:bg-kringle-cranberry hover:text-white" : "border-slate-300 text-slate-500"}`}
                  >
                    Swap with {nameById.get(g.ownerId!)}&apos;s Gift #{g.giftNumber}
                  </button>
                ))}
            </>
          ) : (
            <>
              {unopened.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    act({ type: "open", playerId: currentId!, giftId: unopened[0]!.id })
                  }
                  disabled={!canAct}
                  className={`min-h-14 w-full rounded-2xl text-lg font-black text-white shadow-[3px_3px_0_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-40 ${canAct ? "bg-kringle-cranberry" : "bg-slate-400"}`}
                >
                  {isMyTurn ? `Open Gift #${unopened[0]!.giftNumber}` : `${currentName} opens Gift #${unopened[0]!.giftNumber}`}
                </button>
              )}
              {steals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {canAct ? "Or steal" : "Or they steal"}
                  </p>
                  {steals.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() =>
                        act({ type: "steal", playerId: currentId!, giftId: g.id })
                      }
                      disabled={!canAct}
                      className={`min-h-12 w-full rounded-2xl border-2 font-bold disabled:cursor-not-allowed disabled:opacity-40 ${canAct ? "border-kringle-spruce text-kringle-spruce hover:bg-kringle-spruce hover:text-white" : "border-slate-300 text-slate-500"}`}
                    >
                      Steal Gift #{g.giftNumber} from {nameById.get(g.ownerId!)}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => act({ type: "pause" })}
                  className="min-h-10 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600"
                >
                  Pause
                </button>
                <button
                  type="button"
                  onClick={() => act({ type: "advance" })}
                  className="min-h-10 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600"
                >
                  Skip turn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("End the game now?")) act({ type: "end" });
                  }}
                  className="min-h-10 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600"
                >
                  End game
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Gift grid */}
      <section>
        <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
          Gifts
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {state.gifts.map((gift) => {
            const owner = gift.ownerId ? nameById.get(gift.ownerId) : null;
            const locked = isLocked(gift, state.rules);
            const isMyGift = gift.ownerId === myPlayerId;
            return (
              <div
                key={gift.id}
                className={`rounded-2xl border-2 p-3 text-sm ${
                  gift.ownerId === null
                    ? "border-slate-200 bg-slate-50 text-slate-400"
                    : isMyGift
                    ? "border-kringle-cranberry bg-red-50 text-slate-800"
                    : locked
                    ? "border-kringle-gold bg-amber-50 text-slate-800"
                    : "border-sky-200 bg-sky-50 text-slate-800"
                }`}
              >
                <p className="font-black">Gift #{gift.giftNumber}</p>
                {owner ? (
                  <>
                    <p className="mt-0.5 font-semibold">{owner}</p>
                    {gift.stealCount > 0 && (
                      <p className="text-xs text-slate-500">
                        {locked ? <span className="inline-flex items-center gap-1"><GeneratedIcon name="locked-gift" className="h-5 w-5" /> locked</span> : `Stolen ${gift.stealCount}×`}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-0.5 text-xs">Unopened</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Results */}
      {isComplete && (
        <section className="rounded-2xl border-2 border-kringle-gold bg-amber-50 p-5">
          <h2 className="text-lg font-black text-amber-900">Final results</h2>
          <ul className="mt-3 space-y-2">
            {players.map((player) => {
              const gift = giftOwnedBy(state, player.id);
              return (
                <li
                  key={player.id}
                  className={`flex items-center justify-between text-sm font-semibold ${
                    player.id === myPlayerId ? "text-kringle-cranberry" : ""
                  }`}
                >
                  <span>
                    {player.name}
                    {player.id === myPlayerId && " (you)"}
                  </span>
                  <span className="text-slate-600">
                    {gift ? `Gift #${gift.giftNumber}` : "No gift"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export function RoomClient({ initialRoom }: { initialRoom: GameRoom }) {
  const [room, setRoom] = useState<GameRoom>(initialRoom);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const supabaseRef = useRef(createSupabaseBrowserClient());

  // Load player identity from localStorage
  useEffect(() => {
    const stored = getStoredPlayer(room.code);
    if (stored) setMyPlayerId(stored.playerId);
  }, [room.code]);

  // Subscribe to Realtime changes
  useEffect(() => {
    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`room:${room.code}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `code=eq.${room.code}`,
        },
        (payload) => {
          setRoom(payload.new as GameRoom);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.code]);

  async function handleJoin(playerName: string) {
    const result = await joinRoom(room.code, playerName);
    if (!result.ok) throw new Error(result.error);
    storePlayer(room.code, result.playerId, playerName);
    setMyPlayerId(result.playerId);
  }

  async function handleStart() {
    const result = await startGame(room.code);
    if (!result.ok) throw new Error(result.error);
  }

  function handleAction(action: GameActionInput) {
    performRoomAction(room.code, action).catch(console.error);
  }

  return (
    <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] sm:p-8">
      {room.status === "lobby" ? (
        <LobbyView
          room={room}
          myPlayerId={myPlayerId}
          onJoin={handleJoin}
          onStart={handleStart}
        />
      ) : (
        <GameBoard room={room} myPlayerId={myPlayerId} onAction={handleAction} />
      )}
    </div>
  );
}
