"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RULE_PRESETS } from "@/lib/engine/types";
import type { GameRules } from "@/lib/engine/types";
import { createRoom } from "@/app/kris-kringle/room/actions";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import { upsertGameHistory } from "@/lib/game-history";

export function KrisKringleGame() {
  const [step, setStep] = useState(0);
  const [hostName, setHostName] = useState("");
  const [preset, setPreset] = useState<keyof typeof RULE_PRESETS>("classic");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  function handleCreate() {
    if (!hostName.trim() || pending) return;
    setError("");
    startTransition(async () => {
      try {
        const { code, playerId, playerToken } = await createRoom(hostName.trim(), preset);
        try {
          localStorage.setItem(`kk_player_${code}`, JSON.stringify({ playerId, playerName: hostName.trim(), playerToken }));
          upsertGameHistory({ code, gameType: "kris_kringle", playerId, playerToken, playerName: hostName.trim(), role: "host", status: "lobby", playerCount: 1 });
        } catch {}
        router.push(`/kris-kringle/room/${code}`);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not create room");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2" aria-label={`Setup step ${step + 1} of 3`}>
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Game setup</span><span>{step + 1} / 3</span></div>
        <div className="grid grid-cols-3 gap-1.5">{[0, 1, 2].map((n) => <span key={n} className={`h-2 rounded-full transition-all ${n <= step ? "bg-kringle-cranberry" : "bg-slate-200"}`} />)}</div>
      </div>

      {step === 0 && (
        <section className="animate-kk-slide-up space-y-4 text-center">
          <GeneratedIcon name="players" size="lg" className="mx-auto h-24 w-24 animate-kk-pop-in" />
          <div><p className="text-xs font-black uppercase tracking-widest text-kringle-cranberry">First things first</p><h2 className="mt-1 text-2xl font-black">Who&apos;s hosting?</h2><p className="mt-1 text-sm text-slate-500">You&apos;ll invite everyone from your new game room.</p></div>
          <input autoFocus type="text" value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="Your name (e.g. Sarah)" maxLength={30} className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none" onKeyDown={(e) => { if (e.key === "Enter" && hostName.trim()) setStep(1); }} />
          <button type="button" onClick={() => setStep(1)} disabled={!hostName.trim()} className="min-h-12 w-full rounded-2xl bg-kringle-cranberry font-black text-white shadow-[3px_3px_0_#000] disabled:opacity-40">That&apos;s me — next →</button>
        </section>
      )}

      {step === 1 && (
        <section className="animate-kk-slide-up space-y-3">
          <div className="text-center"><GeneratedIcon name="tools" className="mx-auto h-16 w-16 animate-kk-pop-in" /><p className="text-xs font-black uppercase tracking-widest text-emerald-700">Host locked in ✓</p><h2 className="mt-1 text-2xl font-black">Choose your chaos level</h2><p className="text-sm text-slate-500">Classic is perfect for most groups.</p></div>
          <div className="grid gap-2">
            {(Object.entries(RULE_PRESETS) as [keyof typeof RULE_PRESETS, GameRules][]).map(([key, rules]) => (
              <label key={key} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 transition ${preset === key ? "border-kringle-spruce bg-kringle-spruce/5" : "border-slate-200"}`}>
                <input type="radio" name="preset" value={key} checked={preset === key} onChange={() => setPreset(key)} className="mt-0.5" />
                <div><p className="font-black capitalize">{key}</p><p className="text-xs text-slate-600">{rules.maxSteals} steal{rules.maxSteals !== 1 ? "s" : ""} · {rules.allowImmediateStealback ? "Steal-back" : "No steal-back"} · {rules.firstPlayerFinalTurn ? "Final turn" : "No final turn"}</p></div>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2"><button type="button" onClick={() => setStep(0)} className="min-h-11 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-500">← Back</button><button type="button" onClick={() => setStep(2)} className="min-h-11 rounded-xl bg-kringle-cranberry text-sm font-black text-white">Lock it in →</button></div>
        </section>
      )}

      {step === 2 && (
        <section className="animate-kk-slide-up space-y-5 text-center">
          <GeneratedIcon name="white-elephant" size="lg" className="mx-auto h-28 w-28 animate-kk-pop-in" />
          <div><p className="text-xs font-black uppercase tracking-widest text-emerald-700">Room ready ✓</p><h2 className="mt-1 text-3xl font-black">Let the stealing begin!</h2><p className="mt-2 text-sm text-slate-500">{hostName.trim()} hosts · {preset.charAt(0).toUpperCase() + preset.slice(1)} rules · invite and add players next</p></div>
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button type="button" onClick={handleCreate} disabled={!hostName.trim() || pending} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] disabled:opacity-40"><GeneratedIcon name="play" className="h-8 w-8" />{pending ? "Opening your room…" : "Create room & invite players"}</button>
          <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-slate-500 underline">← Change rules</button>
        </section>
      )}

      {step === 0 && <div className="space-y-2 border-t border-slate-100 pt-4 text-center text-sm text-slate-500"><p>Got a room code? <a href="/kris-kringle/join" className="font-semibold text-kringle-spruce underline">Join a room</a></p><p>Planning ahead? <a href="/kris-kringle/plan" className="font-semibold text-kringle-spruce underline">Set up an exchange →</a></p></div>}
    </div>
  );
}
