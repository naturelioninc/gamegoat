"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { gameFeedback } from "@/lib/feedback";

export function JoinSuccessPrompt({ playerName, hostName, gameName, roomPath }: { playerName: string; hostName: string; gameName: string; roomPath: string }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(true);
  useEffect(() => { void createSupabaseBrowserClient().auth.getUser().then(({ data }) => { const authenticated = Boolean(data.user); setSignedIn(authenticated); if (authenticated) localStorage.removeItem(`gamegoat_account_prompt:${roomPath}`); }); void gameFeedback("success"); }, [roomPath]);
  const returnUrl = `https://games.xmasgoat.com${roomPath}`;
  const accountUrl = `https://account.xmasgoat.com/?next=${encodeURIComponent(returnUrl)}&name=${encodeURIComponent(playerName)}&joined=${encodeURIComponent(`${hostName}'s ${gameName}`)}`;
  if (signedIn === null) return null;
  if (expanded) return <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/65 p-5" role="dialog" aria-modal="true" aria-labelledby="joined-title"><div className="animate-kk-pop-in w-full max-w-sm rounded-3xl border-4 border-kringle-gold bg-amber-50 p-6 text-center shadow-[7px_7px_0_#000]"><p className="text-6xl" aria-hidden="true">🎉</p><p className="mt-2 text-xs font-black uppercase tracking-widest text-amber-700">You’re on the list!</p><h2 id="joined-title" className="mt-1 text-3xl font-black text-amber-950">Congratulations, {playerName}!</h2><p className="mt-3 font-bold text-amber-900">You just joined {hostName}&apos;s {gameName}.</p>{signedIn ? <button type="button" onClick={() => setExpanded(false)} className="mt-5 min-h-12 w-full rounded-xl bg-kringle-spruce font-black text-white">Continue to the game →</button> : <div className="mt-5 space-y-3"><a href={accountUrl} className="flex min-h-14 w-full items-center justify-center rounded-xl bg-kringle-cranberry px-4 text-lg font-black text-white shadow-[3px_3px_0_#000]">Save my place with a free account</a><p className="text-xs font-semibold text-amber-800">Use your email and a password. You’ll return directly to this room.</p><button type="button" onClick={() => setExpanded(false)} className="min-h-10 text-sm font-black text-amber-900 underline">Continue as a guest for now</button></div>}</div></div>;
  if (signedIn) return null;
  return <aside className="rounded-2xl border-2 border-kringle-gold bg-amber-50 p-4"><p className="text-sm font-black text-amber-950">Keep {gameName} in My Games</p><p className="mt-1 text-xs font-semibold text-amber-800">Create your free account so this room and your wishlist follow you across devices.</p><a href={accountUrl} className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-kringle-cranberry px-3 text-sm font-black text-white">Create account · email + password →</a></aside>;
}
