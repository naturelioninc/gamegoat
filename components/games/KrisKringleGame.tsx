"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RULE_PRESETS } from "@/lib/engine/types";
import type { GameRules } from "@/lib/engine/types";
import { createRoom, addManualPlayers } from "@/app/kris-kringle/room/actions";
import { GeneratedIcon } from "@/components/GeneratedIcon";

export function KrisKringleGame() {
  const [hostName, setHostName] = useState("");
  const [extraNames, setExtraNames] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [preset, setPreset] = useState<keyof typeof RULE_PRESETS>("classic");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const allNames = [hostName.trim(), ...extraNames].filter(Boolean);
  const hasDuplicates =
    new Set(allNames.map((n) => n.toLowerCase())).size < allNames.length;

  function addExtra() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setExtraNames((prev) => [...prev, trimmed]);
    setNewName("");
  }

  function removeExtra(i: number) {
    setExtraNames((prev) => prev.filter((_, j) => j !== i));
  }

  function handleCreate() {
    if (!hostName.trim() || hasDuplicates || pending) return;
    setError("");
    startTransition(async () => {
      try {
        const { code, playerId } = await createRoom(hostName.trim(), preset);
        try {
          localStorage.setItem(
            `kk_player_${code}`,
            JSON.stringify({ playerId, playerName: hostName.trim() }),
          );
        } catch {}
        if (extraNames.length > 0) {
          await addManualPlayers(code, extraNames, playerId);
        }
        router.push(`/kris-kringle/room/${code}`);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not create room");
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="rounded-2xl border-2 border-kringle-spruce/30 bg-kringle-spruce/5 p-4">
        <p className="font-bold text-kringle-spruce">One room, every phone.</p>
        <p className="mt-1 text-sm text-kringle-spruce/80">
          Add names for people without phones, then share the QR code so
          everyone else can join on their own device. No mode to pick — it just
          works.
        </p>
      </div>

      {/* Host name */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-xl font-black">
          <GeneratedIcon name="players" className="h-8 w-8" /> Your name
        </h2>
        <input
          type="text"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          placeholder="Your name (e.g. Sarah)"
          maxLength={30}
          className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter")
              document.getElementById("add-player-input")?.focus();
          }}
        />
      </section>

      {/* Other players */}
      <section className="space-y-3">
        <h2 className="text-xl font-black">Other players</h2>
        <p className="text-sm text-slate-500">
          No phone? Add their name — you control their turns. Got a phone? They
          scan the QR in the lobby.
        </p>

        {extraNames.length > 0 && (
          <ul className="space-y-2">
            {extraNames.map((name, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold">
                  {name}
                </span>
                <button
                  type="button"
                  onClick={() => removeExtra(i)}
                  aria-label={`Remove ${name}`}
                  className="min-h-12 min-w-12 rounded-2xl border-2 border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <input
            id="add-player-input"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Player name"
            maxLength={30}
            className="min-h-12 flex-1 rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") addExtra();
            }}
          />
          <button
            type="button"
            onClick={addExtra}
            disabled={!newName.trim()}
            className="min-h-12 rounded-2xl border-2 border-kringle-spruce px-4 text-sm font-black text-kringle-spruce transition hover:bg-kringle-spruce hover:text-white disabled:opacity-40"
          >
            + Add
          </button>
        </div>

        {hasDuplicates && (
          <p className="text-sm font-semibold text-red-600">
            Each player needs a unique name.
          </p>
        )}
      </section>

      {/* Rules */}
      <section className="space-y-3">
        <h2 className="text-xl font-black">Rules</h2>
        <div className="grid gap-3">
          {(
            Object.entries(RULE_PRESETS) as [
              keyof typeof RULE_PRESETS,
              GameRules,
            ][]
          ).map(([key, rules]) => (
            <label
              key={key}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition ${
                preset === key
                  ? "border-kringle-spruce bg-kringle-spruce/5"
                  : "border-slate-200 hover:border-slate-300"
              }`}
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
                  Max {rules.maxSteals} steal{rules.maxSteals !== 1 ? "s" : ""}{" "}
                  ·{" "}
                  {rules.allowImmediateStealback
                    ? "Steal-back allowed"
                    : "No immediate steal-back"}{" "}
                  ·{" "}
                  {rules.firstPlayerFinalTurn
                    ? "Player #1 gets a final turn"
                    : "No final turn"}
                </p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleCreate}
        disabled={!hostName.trim() || hasDuplicates || pending}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <GeneratedIcon name="play" className="h-8 w-8" />
        {pending
          ? "Setting up…"
          : allNames.length >= 2
            ? `Create room (${allNames.length} players)`
            : "Create room"}
      </button>

      <div className="space-y-2 border-t border-slate-100 pt-4 text-center text-sm text-slate-500">
        <p>
          Got a room code?{" "}
          <a
            href="/kris-kringle/join"
            className="font-semibold text-kringle-spruce underline"
          >
            Join a room
          </a>
        </p>
        <p>
          Planning ahead?{" "}
          <a
            href="/kris-kringle/plan"
            className="font-semibold text-kringle-spruce underline"
          >
            Set up an exchange →
          </a>
        </p>
      </div>
    </div>
  );
}
