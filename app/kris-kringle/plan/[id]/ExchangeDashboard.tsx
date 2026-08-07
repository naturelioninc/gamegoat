"use client";

import { useRef, useState, useEffect, useTransition } from "react";
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

// ---------------------------------------------------------------------------
// Invite panel
// ---------------------------------------------------------------------------

function InvitePanel({ exchange }: { exchange: Exchange }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const joinUrl = `${BASE_URL}/kris-kringle/exchange/${exchange.id}/join`;

  const partyLine = exchange.party_date ? `📅 ${formatDate(exchange.party_date)}\n` : "";
  const budgetLine = exchange.budget_cents
    ? `💰 Budget: ${formatBudget(exchange.budget_cents)} per person\n`
    : "";

  const inviteText =
    `Hey! ${exchange.host_name} has invited you to a Kris Kringle gift exchange 🎄\n\n` +
    `${exchange.name}\n` +
    partyLine +
    budgetLine +
    `\nJoin and add your wish list:\n${joinUrl}`;

  const mailtoHref =
    `mailto:?subject=${encodeURIComponent(`You're invited to ${exchange.name} 🎁`)}` +
    `&body=${encodeURIComponent(inviteText)}`;

  function copyLink() {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }

  function copyMessage() {
    navigator.clipboard.writeText(inviteText).then(() => {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    });
  }

  function shareNative() {
    if (navigator.share) {
      navigator.share({ title: exchange.name, text: inviteText, url: joinUrl }).catch(() => {});
    } else {
      copyMessage();
    }
  }

  function downloadQR() {
    const svgEl = qrRef.current?.querySelector("svg");
    if (!svgEl) return;

    const size = 480;
    const pad = 24;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `invite-${exchange.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = url;
  }

  return (
    <section className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] space-y-5">
      <div>
        <h2 className="text-xl font-black">Invite your guests</h2>
        <p className="mt-1 text-sm text-slate-500">
          Share via your own email, text, or any app — guests join and add their wish list before the party.
        </p>
      </div>

      {/* QR code + download */}
      <div className="flex flex-col items-center gap-3">
        <div
          ref={qrRef}
          className="rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm"
        >
          <QRCode value={joinUrl} size={176} bgColor="#ffffff" fgColor="#1a5c3a" />
        </div>
        <button
          type="button"
          onClick={downloadQR}
          className="text-xs font-bold text-slate-500 underline underline-offset-2 hover:text-slate-800"
        >
          ⬇ Download QR image
        </button>
        <p className="text-xs text-slate-400 text-center">
          Save it, print it, or drop it into a group chat
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href={mailtoHref}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-kringle-cranberry font-black text-white text-sm"
        >
          📧 Open email
        </a>
        <button
          type="button"
          onClick={shareNative}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-kringle-spruce font-black text-white text-sm"
        >
          📤 Share invite
        </button>
        <button
          type="button"
          onClick={copyMessage}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 font-black text-sm transition ${
            copiedMsg
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-slate-300 text-slate-700 hover:border-slate-500"
          }`}
        >
          {copiedMsg ? "✓ Copied!" : "💬 Copy message"}
        </button>
        <button
          type="button"
          onClick={copyLink}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 font-black text-sm transition ${
            copiedLink
              ? "border-emerald-500 bg-emerald-50 text-emerald-700"
              : "border-slate-300 text-slate-700 hover:border-slate-500"
          }`}
        >
          {copiedLink ? "✓ Copied!" : "🔗 Copy link"}
        </button>
      </div>

      {/* Raw URL */}
      <div
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
        onClick={copyLink}
        title="Click to copy"
      >
        <span className="flex-1 truncate font-mono text-[11px] text-slate-500">{joinUrl}</span>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Copy
        </span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------

export function ExchangeDashboard({ exchange: initial }: { exchange: Exchange }) {
  const router = useRouter();
  const [exchange, setExchange] = useState(initial);
  const [drawPending, startDraw] = useTransition();
  const [launchPending, startLaunch] = useTransition();
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/exchange/${exchange.id}`);
        if (res.ok) setExchange(await res.json());
      } catch {}
    }, 10_000);
    return () => clearInterval(interval);
  }, [exchange.id]);

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
        localStorage.setItem(
          `kk_player_${result.code}`,
          JSON.stringify({ playerId: result.playerId, playerName: result.playerName }),
        );
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
      {/* Header */}
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">
          Exchange dashboard
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight">{exchange.name}</h1>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          {exchange.party_date && <span>📅 {formatDate(exchange.party_date)}</span>}
          {exchange.budget_cents && (
            <span>💰 Budget: {formatBudget(exchange.budget_cents)} per person</span>
          )}
        </div>
      </header>

      {/* Invite panel */}
      <InvitePanel exchange={exchange} />

      {/* Participants */}
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
          <p className="text-sm text-slate-500">
            No one yet — share the invite above and they&apos;ll appear here.
          </p>
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
                    {hasWishList
                      ? `✓ ${p.wish_list.length} item${p.wish_list.length !== 1 ? "s" : ""}`
                      : "No wish list"}
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

      {/* Draw Secret Santa */}
      {!exchange.secret_santa_drawn && hasEnoughParticipants && (
        <section className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] space-y-4">
          <h2 className="text-xl font-black">Draw Secret Santa names</h2>
          <p className="text-sm text-slate-600">
            Each participant will be emailed their secret assignment privately. This can only be
            done once.
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

      {/* Launch game */}
      {hasEnoughParticipants && (
        <section className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] space-y-4">
          <h2 className="text-xl font-black">Launch the game</h2>
          <p className="text-sm text-slate-600">
            Ready for the party? Start the live White Elephant game and share the QR so guests
            can follow along on their own phones.
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
