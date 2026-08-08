"use client";

import { useEffect, useState } from "react";
import { getWishlistSummary } from "@/app/my-games/actions";

export function WishlistNudge({ roomPath }: { roomPath: string }) {
  const [summary, setSummary] = useState<{ signedIn: boolean; count: number } | null>(null);
  useEffect(() => { void getWishlistSummary().then(setSummary); }, []);
  if (!summary?.signedIn) return null;
  const wishlist = `https://account.xmasgoat.com/wishlist?next=${encodeURIComponent(`https://games.xmasgoat.com${roomPath}`)}`;
  return <aside className="rounded-2xl border-2 border-kringle-gold bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-widest text-amber-800">Your wishlist</p><h2 className="mt-1 font-black text-amber-950">{summary.count ? `${summary.count} gift idea${summary.count === 1 ? "" : "s"} saved` : "What would make you smile?"}</h2><p className="mt-1 text-xs font-semibold text-amber-800">Add your own ideas, or heart products while browsing XmasGoat.</p><div className="mt-3 grid grid-cols-2 gap-2"><a href={wishlist} className="flex min-h-11 items-center justify-center rounded-xl bg-kringle-cranberry px-2 text-center text-xs font-black text-white">{summary.count ? "Open my wishlist" : "Add a wish"}</a><a href="https://xmasgoat.com" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center rounded-xl border-2 border-amber-800 px-2 text-center text-xs font-black text-amber-900">Browse & heart gifts ↗</a></div></aside>;
}
