"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { updateWishList } from "@/app/kris-kringle/plan/actions";
import type { WishListItem } from "@/lib/email/templates";
import type { Exchange, Participant } from "@/app/kris-kringle/plan/actions";
function newItem(): WishListItem {
  return { id: Math.random().toString(36).slice(2), name: "", url: "", priceCents: undefined };
}

export default function WishListPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const participantId = searchParams.get("p") ?? "";

  const [exchangeId, setExchangeId] = useState("");
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [items, setItems] = useState<WishListItem[]>([newItem()]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setExchangeId(id);
      fetch(`/api/exchange/${id}`)
        .then((r) => r.json())
        .then((data: Exchange) => {
          setExchange(data);
          const p = data.participants.find((p) => p.id === participantId);
          if (p) {
            setParticipant(p);
            if (p.wish_list && p.wish_list.length > 0) {
              setItems(p.wish_list.map((i) => ({ ...i, url: i.url ?? "" })));
            }
          }
        })
        .catch(() => setError("Could not load exchange"))
        .finally(() => setLoading(false));
    });
  }, [params, participantId]);

  function addItem() {
    setItems((prev) => [...prev, newItem()]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, patch: Partial<WishListItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!participantId || !exchangeId) return;
    const validItems = items
      .filter((i) => i.name.trim())
      .map((i) => ({
        id: i.id,
        name: i.name.trim(),
        url: i.url?.trim() || undefined,
        priceCents: i.priceCents,
      }));
    setError("");
    startTransition(async () => {
      const result = await updateWishList(participantId, exchangeId, validItems);
      if (!result.ok) {
        setError(result.error ?? "Could not save");
      } else {
        setSaved(true);
      }
    });
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-lg px-5 py-20 text-center text-slate-500">
        Loading…
      </main>
    );
  }

  if (!exchange || !participant) {
    return (
      <main className="mx-auto max-w-lg px-5 py-20 text-center">
        <p className="text-slate-600">Could not find your participant record. Check your invite link.</p>
      </main>
    );
  }

  if (saved) {
    return (
      <main className="mx-auto max-w-lg space-y-6 px-5 py-14 text-center">
        <div className="text-6xl">🎁</div>
        <h1 className="text-4xl font-extrabold tracking-tight">You&apos;re all set!</h1>
        <p className="text-slate-600 text-lg">
          See you at <strong>{exchange.name}</strong>
          {exchange.party_date
            ? ` on ${new Date(exchange.party_date).toLocaleDateString("en-CA", {
                weekday: "long",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}`
            : ""}
          !
        </p>
        <p className="text-sm text-slate-500">
          Your wish list has been saved. Your secret santa will be notified when names are drawn.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 px-5 py-10 sm:py-14">
      <header className="space-y-2">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">
          {exchange.name}
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight">Your wish list</h1>
        <p className="text-slate-600">
          Hi <strong>{participant.name}</strong>! Add some ideas so your secret santa knows what to get you.
        </p>
        {exchange.budget_cents && (
          <div className="rounded-2xl border-2 border-kringle-gold bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            💰 Budget reminder: ${(exchange.budget_cents / 100).toFixed(0)} per person
          </div>
        )}
      </header>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] space-y-3"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  placeholder="Gift idea (e.g. cozy socks)"
                  maxLength={100}
                  className="min-h-11 flex-1 rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="min-h-11 min-w-11 rounded-2xl border-2 border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="url"
                  value={item.url ?? ""}
                  onChange={(e) => updateItem(item.id, { url: e.target.value })}
                  placeholder="Link (optional)"
                  className="min-h-10 rounded-2xl border-2 border-slate-200 px-3 text-sm font-semibold focus:border-kringle-spruce focus:outline-none"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                  <input
                    type="number"
                    value={item.priceCents !== undefined ? (item.priceCents / 100).toFixed(0) : ""}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      updateItem(item.id, { priceCents: isNaN(v) ? undefined : Math.round(v * 100) });
                    }}
                    placeholder="Price (optional)"
                    min="0"
                    max="9999"
                    className="min-h-10 w-full rounded-2xl border-2 border-slate-200 pl-7 pr-3 text-sm font-semibold focus:border-kringle-spruce focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="min-h-11 w-full rounded-2xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-500 hover:border-kringle-spruce hover:text-kringle-spruce"
        >
          + Add another idea
        </button>

        {error && (
          <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || items.every((i) => !i.name.trim())}
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_#000] disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save wish list ✓"}
        </button>

        <p className="text-center text-xs text-slate-400">
          You can leave this blank if you want to be surprised.{" "}
          <button
            type="submit"
            className="underline text-kringle-spruce"
            onClick={() => { setItems([]); }}
          >
            Skip wish list
          </button>
        </p>
      </form>
    </main>
  );
}
