"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { joinExchange } from "@/app/kris-kringle/plan/actions";

export function JoinForm({ exchangeId }: { exchangeId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setError("");
    startTransition(async () => {
      const result = await joinExchange(exchangeId, name, email);
      if (!result.ok) {
        setError(result.error);
      } else {
        router.push(
          `/kris-kringle/exchange/${exchangeId}/wishlist?p=${result.participantId}`,
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-black">Join the exchange</h2>
      <p className="text-sm text-slate-600">
        Enter your name and email to join. You&apos;ll be able to add your wish list next.
      </p>
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={50}
          required
          className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
        />
      </div>
      {error && (
        <p className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !name.trim() || !email.trim()}
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_#000] disabled:opacity-40"
      >
        {pending ? "Joining…" : "Join & add wish list →"}
      </button>
    </form>
  );
}
