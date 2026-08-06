"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length !== 6) {
      setError("Room codes are 6 characters — check you typed it correctly.");
      return;
    }
    setError("");
    startTransition(() => {
      router.push(`/kris-kringle/room/${cleaned}`);
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-kringle-pine to-kringle-spruce px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-2 text-5xl">🎁</div>
          <h1 className="text-2xl font-black text-kringle-spruce">Join a room</h1>
          <p className="mt-1 text-sm text-gray-500">Enter the 6-character code shown on the host's screen</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="e.g. ABC123"
            maxLength={8}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 text-center font-mono text-3xl font-black tracking-[0.3em] text-kringle-spruce uppercase focus:border-kringle-pine focus:outline-none"
          />

          {error && (
            <p className="text-center text-sm font-medium text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={code.trim().length === 0 || pending}
            className="w-full rounded-2xl bg-kringle-red py-3 text-lg font-bold text-white shadow-md transition-opacity disabled:opacity-40"
          >
            {pending ? "Joining…" : "Join game"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have a code?{" "}
          <a href="/kris-kringle" className="font-semibold text-kringle-spruce underline">
            Create a room
          </a>
        </p>
      </div>
    </main>
  );
}
