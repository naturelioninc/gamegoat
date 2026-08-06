"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { drawSecretSanta, launchGame } from "../actions";
import type { Exchange } from "../actions";

const BASE_URL = "https://games.xmasgoat.com";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatBudget(cents: number | null): string {
  if (!cents) return "";
  return `$${(cents / 100).toFixed(0)}`;
}

export function ExchangeDashboard({ exchange: initial }: { exchange: Exchange }) {
  const router = useRouter();
  const [exchange, setExchange] = useState(initial);
  const [copied, setCopied] = useState(false);
  const [drawPending, startDraw] = useTransition();
  const [launchPending, startLaunch] = useTransition();
  const [actionError, setActionError] = useState("");

  const joinUrl = `${BASE_URL}/kris-kringle/exchange/${exchange.id}/join`;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/exchange/${exchange.id}`);
        if (res.ok) {
          const data = await res.json();
          setExchange(data);
        }
      } catch {}
    }, 10_000);
    return () => clearInterval(interval);
  }, [exchange.id]);

  function copyLink() {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({
        title: exchange.name,
        text: `Join my Kris Kringle exchange: ${exchange.name}`,
        url: joinUrl,
      });
    } else {
      copyLink();
    }
  }

  function handleDraw() {
    setActionError("");
    startDraw(async () => {
      const result = await drawSecretSanta(exchange.id);
      if (!result.ok) {
        setActionError(result.error ?? "Could not draw names");
      } else {
        const res = await fetch(`/api/exchange/${exchange.id}`);
        if (res.ok) setExchange(await res.json());
      }
    });
  }

  function handleLaunch() {
    setActionError("");
    startLaunch(async () => {
      const result = await launchGame(exchange.id);
      if ("ok" in result && !result.ok) {
        setActionError(result.error ?? "Could not launch game");
      } else if ("code" in result) {
        router.push(`/kris-kringle/room/${result.code}`);
      }
    });
  }

  const hasEnoughParticipants = exchange.participants.length >= 2;
  const participantsWithWishList = exchange.participants.filter(
    (p) => p.wish_list && p.wish_list.length > 0,
  );

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-5 py-10 sm:py-14">
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">
          Exchange dashboard
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight">{exchange.name}</h1>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          {exchange.party_date && (
            <span>📅 {formatDate(exchange.party_date)}</span>
          )}
          {exchange.budget_cents && (
            <span>💰 Budget: {formatBudget(exchange.budget_cents)} per person</span>
          )}
        </div>
      </header>

      <section className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] space-y-5">
        <h2 className="text-xl font-black">Invite link</h2>
        <p className="text-sm text-slate-600">
          Share this link with your guests so they can join and add their wish list.
        </p>
        <div className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3">
          <span className="flex-1 truncate font-mono text-xs text-slate-700">{joinUrl}</span>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={copyLink}
            className="flex-1 min-h-11 rounded-2xl border-2 border-kringle-spruce font-black text-kringle-spruce text-sm"
          >
            {copied ? "✓ Copied!" : "📋 Copy link"}
          </button>
          <button
            type="button"
            onClick={shareLink}
            className="flex-1 min-h-11 rounded-2xl bg-kringle-cranberry font-black text-white text-sm"
          >
            📤 Share
          </button>
        </div>
        <div className="flex justify-center rounded-2xl border-2 border-slate-200 bg-white p-4">
          <QRCode value={joinUrl} size={160} />
        </div>
      </section>

      <section className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">
            Participants{" "}
            <span className="text-slate-400">({exchange.participants.length})</span>
          </h2>
          {exchange.participants.length > 0 && (
            <span className="text-xs font-semibold text-slate-500">
              {participantsWithWishList.length}/{exchange.participants.length} wish lists
            </span>
          )}
        </div>

        {exchange.participants.length === 0 ? (
          <p className="text-sm text-slate-500">No participants yet. Share the invite link above.</p>
        ) : (
          <ul className="space-y-2">
            {exchange.participants.map((p) => {
              const hasWishList = p.wish_list && p.wish_list.length > 0;
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-black text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.email}</p>
                  </div>
                  <span
                    className={`rounded-xl px-3 py-1 text-xs font-bold ${
                      hasWishList
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {hasWishList ? `✓ ${p.wish_list.length} item${p.wish_list.length !== 1 ? "s" : ""}` : "No wish list"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {actionError && (
        <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {actionError}
        </p>
      )}

      {!exchange.secret_santa_drawn && hasEnoughParticipants && (
        <section className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] space-y-4">
          <h2 className="text-xl font-black">Draw Secret Santa names</h2>
          <p className="text-sm text-slate-600">
            Each participant will be emailed their secret assignment privately.
            This can only be done once.
          </p>
          <button
            type="button"
            onClick={handleDraw}
            disabled={drawPending}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_#000] disabled:opacity-40"
          >
            {drawPending ? "Drawing names…" : "🎅 Draw Secret Santa names"}
          </button>
        </section>
      )}

      {exchange.secret_santa_drawn && (
        <div className="rounded-2xl border-2 border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          ✓ Secret Santa names have been drawn and emailed to all participants.
        </div>
      )}

      {hasEnoughParticipants && (
        <section className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] space-y-4">
          <h2 className="text-xl font-black">Launch the game</h2>
          <p className="text-sm text-slate-600">
            Ready for the party? Launch the live White Elephant game room for all participants.
          </p>
          <button
            type="button"
            onClick={handleLaunch}
            disabled={launchPending}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-kringle-spruce text-lg font-black text-white shadow-[4px_4px_0_#000] disabled:opacity-40"
          >
            {launchPending ? "Creating room…" : "🎁 Launch game →"}
          </button>
        </section>
      )}
    </main>
  );
}
