"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { draw } from "@/lib/matching/draw";
import type { Assignment } from "@/lib/matching/draw";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import { createSecretSantaRoom } from "@/app/secret-santa/room/actions";
import { upsertGameHistory } from "@/lib/game-history";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

function SetupScreen({ onDraw }: { onDraw: (names: string[], assignments: Assignment[]) => void }) {
  const [step, setStep] = useState(0);
  const [names, setNames] = useState(["", "", "", ""]);
  const [exclusions, setExclusions] = useState<[string, string][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showExclusions, setShowExclusions] = useState(false);

  const validNames = names.map((n) => n.trim()).filter(Boolean);
  const duplicates = validNames.length !== new Set(validNames).size;
  const canDraw = validNames.length >= 2 && !duplicates;

  function addName() { setNames((prev) => [...prev, ""]); }
  function removeName(i: number) { setNames((prev) => prev.filter((_, j) => j !== i)); }
  function updateName(i: number, v: string) { setNames((prev) => prev.map((n, j) => (j === i ? v : n))); }

  function addExclusion() { setExclusions((prev) => [...prev, ["", ""]]); }
  function removeExclusion(i: number) { setExclusions((prev) => prev.filter((_, j) => j !== i)); }
  function updateExclusion(i: number, side: 0 | 1, v: string) {
    setExclusions((prev) => prev.map((ex, j) => j === i ? (side === 0 ? [v, ex[1]] : [ex[0], v]) : ex));
  }

  function doDraw() {
    setError(null);
    const result = draw(validNames, exclusions.filter(([a, b]) => a && b));
    if (!result.ok) { setError(result.reason); return; }
    onDraw(validNames, result.assignments);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2" aria-label={`Setup step ${step + 1} of 3`}>
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>Secret setup</span><span>{step + 1} / 3</span></div>
        <div className="grid grid-cols-3 gap-1.5">{[0, 1, 2].map((n) => <span key={n} className={`h-2 rounded-full ${n <= step ? "bg-kringle-cranberry" : "bg-slate-200"}`} />)}</div>
      </div>
      {step === 0 && <section className="animate-kk-slide-up space-y-3">
        <div className="text-center">
          <GeneratedIcon name="secret-santa" size="lg" className="mx-auto h-24 w-24 animate-kk-pop-in" />
          <h2 className="text-2xl font-black">Who&apos;s in?</h2>
          <p className="text-sm text-slate-500">Add at least two people. Keep it quick—you can add more anytime.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {names.map((name, i) => (
            <div key={i} className="relative min-w-0">
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                placeholder={`Person ${i + 1}`}
                className="min-h-10 w-full rounded-xl border-2 border-slate-200 py-2 pl-3 pr-9 text-sm font-semibold focus:border-kringle-spruce focus:outline-none"
                onKeyDown={(e) => { if (e.key === "Enter" && i === names.length - 1) addName(); }}
              />
              {names.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeName(i)}
                  aria-label="Remove"
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {duplicates && <p className="text-sm font-semibold text-red-600">Each name must be unique.</p>}
        <button
          type="button"
          onClick={addName}
          className="min-h-11 w-full rounded-2xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-500 hover:border-kringle-spruce hover:text-kringle-spruce"
        >
          + Add person
        </button>
        <button type="button" onClick={() => setStep(1)} disabled={!canDraw} className="min-h-12 w-full rounded-2xl bg-kringle-cranberry font-black text-white shadow-[3px_3px_0_#000] disabled:opacity-40">{validNames.length} ready — next →</button>
      </section>}

      {step === 1 && <section className="animate-kk-slide-up space-y-4">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Guest list complete ✓</p>
          <h2 className="mt-1 text-2xl font-black">Any forbidden matches?</h2>
          <p className="text-sm text-slate-500">Couples, siblings, or anyone who shouldn&apos;t draw each other.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowExclusions((v) => !v)}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-kringle-spruce"
        >
          <span className={`transition-transform ${showExclusions ? "rotate-90" : ""}`}>▶</span>
          Add exclusions (optional)
        </button>
        {showExclusions && (
          <div className="space-y-2 pl-5">
            {exclusions.map(([a, b], i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={a}
                  onChange={(e) => updateExclusion(i, 0, e.target.value)}
                  className="min-h-11 flex-1 rounded-xl border-2 border-slate-200 px-3 text-sm font-semibold"
                >
                  <option value="">Person A</option>
                  {validNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-slate-400 text-sm font-bold">→</span>
                <select
                  value={b}
                  onChange={(e) => updateExclusion(i, 1, e.target.value)}
                  className="min-h-11 flex-1 rounded-xl border-2 border-slate-200 px-3 text-sm font-semibold"
                >
                  <option value="">Person B</option>
                  {validNames.filter((n) => n !== a).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => removeExclusion(i)}
                  className="min-h-11 min-w-11 rounded-xl border-2 border-slate-200 text-slate-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addExclusion}
              className="text-sm font-bold text-kringle-spruce hover:underline"
            >
              + Add exclusion
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setStep(0)} className="min-h-11 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-500">← Back</button>
          <button type="button" onClick={() => setStep(2)} className="min-h-11 rounded-xl bg-kringle-cranberry text-sm font-black text-white">{exclusions.length ? "Save & review" : "No exclusions"} →</button>
        </div>
      </section>}

      {step === 2 && <section className="animate-kk-slide-up space-y-5 text-center">
        <GeneratedIcon name="draw-names" size="lg" className="mx-auto h-28 w-28 animate-kk-pop-in" />
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Everything looks merry ✓</p>
          <h2 className="mt-1 text-3xl font-black">Ready for the big draw?</h2>
          <p className="mt-2 text-sm text-slate-500">{validNames.length} people · {exclusions.filter(([a,b]) => a && b).length || "No"} exclusions</p>
        </div>
      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={doDraw}
        disabled={!canDraw}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <GeneratedIcon name="draw-names" className="h-8 w-8" />
        Do the draw ({validNames.length} people)
      </button>
        <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-slate-500 underline">← Review exclusions</button>
      </section>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reveal flow — pass-and-tap
// ---------------------------------------------------------------------------

function RevealScreen({
  names,
  assignments,
  onReset,
}: {
  names: string[];
  assignments: Assignment[];
  onReset: () => void;
}) {
  const [revealIndex, setRevealIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const done = revealIndex >= names.length;

  const current = names[revealIndex];
  const assignment = assignments.find((a) => a.giverId === current);
  const recipient = assignment?.recipientId ?? "—";

  return (
    <div className="space-y-6">
      {done ? (
        <div className="space-y-6 text-center">
          <GeneratedIcon name="secret-santa-complete" size="lg" className="mx-auto h-32 w-32 animate-kk-slide-up" />
          <p className="text-2xl font-black">Everyone has their assignment!</p>
          <p className="text-slate-600">
            {names.length} Secret Santas · keep your match private until gift day.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="min-h-12 w-full rounded-2xl bg-kringle-cranberry font-bold text-white"
          >
            Start a new draw
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-3xl bg-kringle-spruce p-8 text-center text-white">
            <GeneratedIcon name="pass-phone" size="md" className="mx-auto mb-3 h-16 w-16" />
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">
              Pass the phone to
            </p>
            <p className="mt-2 text-4xl font-black">{current}</p>
          </div>

          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-4 border-dashed border-kringle-cranberry text-lg font-black text-kringle-cranberry"
            >
              <GeneratedIcon name="reveal-match" className="h-8 w-8" />
              Tap to reveal your match
            </button>
          ) : (
            <div className="space-y-4">
              <div className="rounded-3xl border-4 border-kringle-gold bg-amber-50 p-8 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-700">
                  You are buying a gift for
                </p>
                <p className="mt-2 text-4xl font-black text-amber-900">{recipient}</p>
                <p className="mt-3 text-sm text-amber-700">Keep this secret until gift day.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRevealed(false);
                  setRevealIndex((i) => i + 1);
                }}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-kringle-cranberry text-lg font-black text-white"
              >
                <GeneratedIcon name="pass-phone" className="h-8 w-8" />
                Done — pass to next person
              </button>
            </div>
          )}

          <div className="flex justify-center gap-1.5">
            {names.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${i < revealIndex ? "w-6 bg-kringle-spruce" : i === revealIndex ? "w-6 bg-kringle-cranberry" : "w-2 bg-slate-200"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function SecretSantaGame() {
  const [mode, setMode] = useState<"invite" | "quick" | null>(null);
  const [drawn, setDrawn] = useState<{ names: string[]; assignments: Assignment[] } | null>(null);
  const [hostName, setHostName] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (mode === null) return (
    <div className="space-y-4">
      <div className="text-center"><GeneratedIcon name="secret-santa" size="lg" className="mx-auto h-24 w-24 animate-kk-pop-in" /><h2 className="text-2xl font-black">How are you drawing?</h2><p className="mt-1 text-sm text-slate-500">Invite everyone to a private room, or do a quick draw on this phone.</p></div>
      <button onClick={() => setMode("invite")} className="w-full rounded-2xl border-2 border-black bg-kringle-cranberry p-4 text-left text-white shadow-[3px_3px_0_#000]"><span className="font-black">Create an invite room</span><span className="mt-1 block text-xs text-white/80">QR, text or email · everyone reveals privately</span></button>
      <button onClick={() => setMode("quick")} className="w-full rounded-2xl border-2 border-slate-200 p-4 text-left"><span className="font-black">Quick draw on one phone</span><span className="mt-1 block text-xs text-slate-500">Enter names now and pass the phone around</span></button>
    </div>
  );

  if (mode === "invite") return (
    <div className="space-y-5 text-center">
      <p className="text-[10px] font-black uppercase tracking-widest text-kringle-cranberry">Create a private room</p>
      <GeneratedIcon name="players" size="lg" className="mx-auto h-24 w-24 animate-kk-pop-in" />
      <div><h2 className="text-2xl font-black">Who&apos;s organizing?</h2><p className="mt-1 text-sm text-slate-500">Players and wish-list details come after the room opens.</p></div>
      <input autoFocus value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="Your name" maxLength={30} className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 text-left font-semibold focus:border-kringle-spruce focus:outline-none" />
      {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      <button disabled={!hostName.trim() || pending} onClick={() => startTransition(async () => { try { const result = await createSecretSantaRoom(hostName); localStorage.setItem(`ss_player_${result.code}`, JSON.stringify({ playerId: result.playerId, playerToken: result.playerToken })); upsertGameHistory({ code: result.code, gameType: "secret_santa", playerId: result.playerId, playerToken: result.playerToken, playerName: hostName.trim(), role: "host", status: "lobby", playerCount: 1 }); router.push(`/secret-santa/room/${result.code}`); } catch (e: unknown) { setError(e instanceof Error ? e.message : "Could not create room"); } })} className="min-h-14 w-full rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[3px_3px_0_#000] disabled:opacity-40">{pending ? "Opening your room…" : "Create room & invite people"}</button>
      <button onClick={() => setMode(null)} className="text-sm font-bold text-slate-500 underline">← Back</button>
    </div>
  );

  return drawn ? (
    <RevealScreen
      names={drawn.names}
      assignments={drawn.assignments}
      onReset={() => setDrawn(null)}
    />
  ) : (
    <SetupScreen onDraw={(names, assignments) => setDrawn({ names, assignments })} />
  );
}
