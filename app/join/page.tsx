"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import { resolveRoomCode } from "./actions";

export default function JoinAnyRoomPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await resolveRoomCode(code);
      if (!result.ok) setError(result.error);
      else router.push(result.href);
    });
  };
  return <main className="mx-auto max-w-md px-5 py-7 sm:py-16"><section className="rounded-3xl border-2 border-black bg-white p-5 text-center shadow-[4px_4px_0_#000] sm:p-8"><GeneratedIcon name="join-code" size="lg" className="mx-auto h-24 w-24" /><p className="text-[10px] font-black uppercase tracking-widest text-kringle-cranberry">Join any game</p><h1 className="mt-1 text-3xl font-black">Enter the room code</h1><p className="mt-2 text-sm text-slate-500">We’ll find the right White Elephant or Secret Santa room.</p><form onSubmit={submit} className="mt-6 space-y-3"><input autoFocus value={code} onChange={(event) => { setCode(event.target.value.toUpperCase()); setError(""); }} maxLength={8} placeholder="ABC123" autoCapitalize="characters" autoCorrect="off" spellCheck={false} className="min-h-14 w-full rounded-2xl border-2 border-slate-200 px-4 text-center font-mono text-3xl font-black tracking-[.2em] text-kringle-spruce focus:border-kringle-spruce focus:outline-none" />{error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}<button disabled={!code.trim() || pending} className="min-h-14 w-full rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[3px_3px_0_#000] disabled:opacity-40">{pending ? "Finding room…" : "Join game"}</button></form></section></main>;
}
