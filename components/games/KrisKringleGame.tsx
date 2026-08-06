"use client";

import { useReducer, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createInitialState,
  applyAction,
  currentPlayerId,
  eligibleSteals,
  unopenedGifts,
  isLocked,
  giftOwnedBy,
} from "@/lib/engine/engine";
import type { GameState, GameRules, GameActionInput } from "@/lib/engine/types";
import { RULE_PRESETS } from "@/lib/engine/types";
import { createRoom } from "@/app/kris-kringle/room/actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Player {
  id: string;
  name: string;
}

interface GameSession {
  players: Player[];
  state: GameState;
}

// ---------------------------------------------------------------------------
// Setup screen
// ---------------------------------------------------------------------------

function SetupScreen({ onStart }: { onStart: (session: GameSession) => void }) {
  const [names, setNames] = useState(["", "", "", ""]);
  const [preset, setPreset] = useState<keyof typeof RULE_PRESETS>("classic");
  const [mode, setMode] = useState<"local" | "online">("local");
  const [hostName, setHostName] = useState("");
  const [pending, startTransition] = useTransition();
  const [onlineErr, setOnlineErr] = useState("");
  const router = useRouter();

  const validNames = names.map((n) => n.trim()).filter(Boolean);
  const canStart = validNames.length >= 2 && new Set(validNames).size === validNames.length;

  function addPlayer() {
    setNames((prev) => [...prev, ""]);
  }

  function removePlayer(index: number) {
    setNames((prev) => prev.filter((_, i) => i !== index));
  }

  function updateName(index: number, value: string) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function startGame() {
    if (!canStart) return;
    const shuffled = [...validNames].sort(() => Math.random() - 0.5);
    const players: Player[] = shuffled.map((name, i) => ({ id: String(i), name }));
    const rules: GameRules = { ...RULE_PRESETS[preset] };
    const gifts = players.map((_, i) => ({ id: `gift-${i}`, giftNumber: i + 1 }));
    const state = createInitialState({
      rules,
      players: players.map((p, i) => ({ id: p.id, playOrder: i + 1 })),
      gifts,
    });
    onStart({ players, state });
  }

  function handleCreateOnlineRoom() {
    if (!hostName.trim()) return;
    setOnlineErr("");
    startTransition(async () => {
      try {
        const { code, playerId } = await createRoom(hostName.trim());
        try {
          localStorage.setItem(
            `kk_player_${code}`,
            JSON.stringify({ playerId, playerName: hostName.trim() }),
          );
        } catch {}
        router.push(`/kris-kringle/room/${code}`);
      } catch (e: unknown) {
        setOnlineErr(e instanceof Error ? e.message : "Could not create room");
      }
    });
  }

  const duplicates = validNames.length !== new Set(validNames).size;

  return (
    <div className="space-y-8">
      {/* Mode tabs */}
      <div className="flex rounded-2xl border-2 border-slate-200 p-1">
        {(["local", "online"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 rounded-xl py-2 text-sm font-black transition ${
              mode === m
                ? "bg-kringle-spruce text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {m === "local" ? "Play locally" : "Play online"}
          </button>
        ))}
      </div>

      {/* Online room creation */}
      {mode === "online" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Create a room — share the code with friends so they can join on their phones.
          </p>
          <input
            type="text"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="Your name"
            maxLength={30}
            className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateOnlineRoom();
            }}
          />
          {onlineErr && <p className="text-sm font-semibold text-red-600">{onlineErr}</p>}
          <button
            type="button"
            onClick={handleCreateOnlineRoom}
            disabled={!hostName.trim() || pending}
            className="min-h-14 w-full rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] disabled:opacity-40"
          >
            {pending ? "Creating room…" : "Create room"}
          </button>
        </div>
      )}

      {/* Local setup */}
      {mode === "local" && (
        <>
      <section className="space-y-4">
        <h2 className="text-xl font-black">Players</h2>
        <p className="text-sm text-slate-600">
          Add one name per gift-bringer. Player order is randomized when you start.
        </p>
        <div className="space-y-2">
          {names.map((name, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Player ${i + 1}`}
                className="min-h-12 flex-1 rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && i === names.length - 1) addPlayer();
                }}
              />
              {names.length > 2 && (
                <button
                  type="button"
                  onClick={() => removePlayer(i)}
                  aria-label={`Remove player ${i + 1}`}
                  className="min-h-12 min-w-12 rounded-2xl border-2 border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {duplicates && (
          <p className="text-sm font-semibold text-red-600">Each player needs a unique name.</p>
        )}
        <button
          type="button"
          onClick={addPlayer}
          className="min-h-11 w-full rounded-2xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-500 hover:border-kringle-spruce hover:text-kringle-spruce"
        >
          + Add player
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-black">Rules</h2>
        <div className="grid gap-3">
          {(Object.entries(RULE_PRESETS) as [keyof typeof RULE_PRESETS, GameRules][]).map(
            ([key, rules]) => (
              <label
                key={key}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${preset === key ? "border-kringle-spruce bg-kringle-spruce/5" : "border-slate-200 hover:border-slate-300"}`}
              >
                <input
                  type="radio"
                  name="preset"
                  value={key}
                  checked={preset === key}
                  onChange={() => setPreset(key)}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-black capitalize">{key}</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    Max {rules.maxSteals} steal{rules.maxSteals !== 1 ? "s" : ""} ·{" "}
                    {rules.allowImmediateStealback ? "Steal-back allowed" : "No immediate steal-back"} ·{" "}
                    {rules.firstPlayerFinalTurn ? "Player #1 gets a final turn" : "No final turn"}
                  </p>
                </div>
              </label>
            ),
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={startGame}
        disabled={!canStart}
        className="min-h-14 w-full rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Start game ({validNames.length} players · {validNames.length} gifts)
      </button>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live game board
// ---------------------------------------------------------------------------

type Action = { action: GameActionInput };

function reducer(session: GameSession, { action }: Action): GameSession {
  const result = applyAction(session.state, action);
  if (!result.ok) return session;
  return { ...session, state: result.state };
}

function LiveGame({
  session: initial,
  onReset,
}: {
  session: GameSession;
  onReset: () => void;
}) {
  const [session, dispatch] = useReducer(reducer, initial);
  const { state, players } = session;
  const nameById = new Map(players.map((p) => [p.id, p.name]));
  const currentId = currentPlayerId(state);
  const currentName = currentId ? nameById.get(currentId) : null;
  const steals = currentId ? eligibleSteals(state, currentId) : [];
  const unopened = unopenedGifts(state);
  const isComplete = state.status === "complete" || state.phase === "complete";
  const isPaused = state.status === "paused";
  const isFinalTurn = state.phase === "final_turn";

  function act(action: GameActionInput) {
    dispatch({ action });
  }

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className={`rounded-2xl border-2 p-4 ${isComplete ? "border-kringle-gold bg-amber-50" : isPaused ? "border-slate-300 bg-slate-50" : isFinalTurn ? "border-kringle-gold bg-amber-50" : "border-kringle-spruce bg-kringle-spruce text-white"}`}>
        {isComplete ? (
          <p className="text-center text-xl font-black text-amber-900">🎁 Game over! See results below.</p>
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
              {currentName} — keep your gift or swap with anyone
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/70">
              Turn {state.turnsTaken + 1} of {players.length}
            </p>
            <p className="mt-1 text-xl font-black">{currentName}&apos;s turn</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isComplete && !isPaused && (
        <div className="space-y-3">
          {isFinalTurn ? (
            <>
              <button
                type="button"
                onClick={() => act({ type: "final_keep" })}
                className="min-h-12 w-full rounded-2xl bg-kringle-spruce font-bold text-white"
              >
                Keep my gift
              </button>
              {state.gifts
                .filter((g) => g.ownerId !== null && g.ownerId !== currentId && !isLocked(g, state.rules))
                .map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => act({ type: "final_swap", giftId: g.id })}
                    className="min-h-12 w-full rounded-2xl border-2 border-kringle-cranberry font-bold text-kringle-cranberry hover:bg-kringle-cranberry hover:text-white"
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
                  onClick={() => act({ type: "open", playerId: currentId!, giftId: unopened[0]!.id })}
                  className="min-h-14 w-full rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[3px_3px_0_rgba(0,0,0,0.12)]"
                >
                  Open Gift #{unopened[0]!.giftNumber}
                </button>
              )}
              {steals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Or steal</p>
                  {steals.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => act({ type: "steal", playerId: currentId!, giftId: g.id })}
                      className="min-h-12 w-full rounded-2xl border-2 border-kringle-spruce font-bold text-kringle-spruce hover:bg-kringle-spruce hover:text-white"
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
                  onClick={() => { if (confirm("End the game now?")) act({ type: "end" }); }}
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
        <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">Gifts</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {state.gifts.map((gift) => {
            const owner = gift.ownerId ? nameById.get(gift.ownerId) : null;
            const locked = isLocked(gift, state.rules);
            return (
              <div
                key={gift.id}
                className={`rounded-2xl border-2 p-3 text-sm ${
                  gift.ownerId === null
                    ? "border-slate-200 bg-slate-50 text-slate-400"
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
                        {locked ? "🔒 locked" : `Stolen ${gift.stealCount}×`}
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
          <h2 className="text-lg font-black text-amber-900">Final results 🎁</h2>
          <ul className="mt-3 space-y-2">
            {players.map((player) => {
              const gift = giftOwnedBy(state, player.id);
              return (
                <li key={player.id} className="flex items-center justify-between text-sm font-semibold">
                  <span>{player.name}</span>
                  <span className="text-slate-600">{gift ? `Gift #${gift.giftNumber}` : "No gift"}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <button
        type="button"
        onClick={onReset}
        className="min-h-11 w-full rounded-2xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:border-slate-400"
      >
        {isComplete ? "Play again" : "Start over"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function KrisKringleGame() {
  const [session, setSession] = useState<GameSession | null>(null);

  return session ? (
    <LiveGame session={session} onReset={() => setSession(null)} />
  ) : (
    <SetupScreen onStart={setSession} />
  );
}
