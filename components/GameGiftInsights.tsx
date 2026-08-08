"use client";

import { useEffect, useState } from "react";
import {
  getGameGiftInsights,
  type GiftInsights,
} from "@/app/gift-insights/actions";

export function GameGiftInsights({
  code,
  playerId,
  playerToken,
  active = true,
}: {
  code: string;
  playerId: string;
  playerToken: string;
  active?: boolean;
}) {
  const [insights, setInsights] = useState<GiftInsights | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!active) return;
    void getGameGiftInsights(code, playerId, playerToken).then((result) =>
      result.ok ? setInsights(result.insights) : setMessage(result.error),
    );
  }, [active, code, playerId, playerToken]);
  if (!active) return null;
  if (!insights && !message)
    return (
      <div
        className="h-16 animate-pulse rounded-2xl bg-slate-100"
        aria-label="Loading gift insights"
      />
    );
  if (!insights)
    return (
      <p className="rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-500">
        {message}
      </p>
    );
  const secret = insights.mode === "secret_santa";
  return (
    <details
      className="rounded-2xl border-2 border-kringle-gold bg-amber-50 p-4"
      open={secret}
    >
      <summary className="min-h-10 cursor-pointer list-none">
        <p className="text-xs font-black uppercase tracking-widest text-amber-800">
          Gift radar
        </p>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-black text-amber-950">
            {secret
              ? `${insights.recipientName}'s wishlist`
              : "What this group is into"}
          </h2>
          <span className="text-sm font-black text-amber-800">⌄</span>
        </div>
      </summary>
      {secret ? (
        insights.wishes.length ? (
          <ul className="mt-3 space-y-2">
            {insights.wishes.map((wish) => (
              <li
                key={wish}
                className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-amber-950"
              >
                ✓ {wish}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-amber-800">
            {insights.recipientName} has not shared any wishes yet—or keeps
            their list private.
          </p>
        )
      ) : (
        <div className="mt-3">
          {insights.themes.length ? (
            <div className="flex flex-wrap gap-2">
              {insights.themes.map((theme) => (
                <span
                  key={theme.label}
                  className="rounded-full border border-amber-700 bg-white px-3 py-1 text-xs font-black text-amber-900"
                >
                  {theme.count} want {theme.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-amber-800">
              Not enough shared overlap yet. Group trends appear only when at
              least two people independently signal the same interest.
            </p>
          )}
          <p className="mt-2 text-[10px] font-semibold text-amber-700">
            Anonymous themes from {insights.contributingPlayers} participating
            wishlist{insights.contributingPlayers === 1 ? "" : "s"}; nobody is
            named.
          </p>
        </div>
      )}
      {insights.suggestions.length > 0 && (
        <section className="mt-4">
          <h3 className="text-sm font-black text-amber-950">
            Ideas matched to these signals
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {insights.suggestions.map((item) => (
              <a
                key={item.slug}
                href={item.mainSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-[2px_2px_0_#000]"
              >
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  width="320"
                  height="180"
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
                <span className="block p-2 text-xs font-black leading-tight">
                  {item.title}
                  <small className="mt-1 block font-bold text-kringle-cranberry">
                    View on XmasGoat ↗
                  </small>
                </span>
              </a>
            ))}
          </div>
          <p className="mt-2 text-[10px] font-semibold text-amber-700">
            Product pages open outside Game Goat. Amazon links are available
            only on XmasGoat.
          </p>
        </section>
      )}
    </details>
  );
}
