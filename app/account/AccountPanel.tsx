"use client";

import Link from "next/link";
import { signOut } from "./actions";

interface Exchange {
  id: string;
  name: string;
  party_date: string | null;
  status: string;
  secret_santa_drawn: boolean;
  created_at: string;
}

function statusBadge(status: string) {
  if (status === "active") return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Active</span>;
  if (status === "complete") return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">Complete</span>;
  return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">Planning</span>;
}

function formatDate(d: string | null) {
  if (!d) return "Date TBD";
  return new Date(d).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });
}

export function AccountPanel({ email, exchanges }: { email: string; exchanges: Exchange[] }) {
  const firstName = email.split("@")[0].split(".")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-5 py-10 sm:py-14">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">Your account</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Hi, {displayName} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">{email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-xl border-2 border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:border-slate-400 hover:text-slate-700"
          >
            Sign out
          </button>
        </form>
      </header>

      {/* Exchanges */}
      <section className="space-y-4">
        <h2 className="text-xl font-black">My exchanges</h2>

        {exchanges.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 p-8 text-center">
            <p className="text-2xl">🎁</p>
            <p className="mt-2 font-semibold text-slate-600">No exchanges yet</p>
            <p className="mt-1 text-sm text-slate-400">Create one to get started</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {exchanges.map((ex) => (
              <li key={ex.id} className="rounded-3xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black">{ex.name}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{formatDate(ex.party_date)}</p>
                  </div>
                  {statusBadge(ex.status)}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/kris-kringle/plan/${ex.id}`}
                    className="flex-1 rounded-xl border-2 border-kringle-spruce py-2 text-center text-sm font-bold text-kringle-spruce hover:bg-kringle-spruce hover:text-white"
                  >
                    Dashboard →
                  </Link>
                  {ex.status === "planning" && (
                    <Link
                      href={`/kris-kringle/plan/${ex.id}`}
                      className="flex-1 rounded-xl bg-kringle-cranberry py-2 text-center text-sm font-bold text-white"
                    >
                      Launch game 🚀
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/kris-kringle/plan"
          className="flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-dashed border-kringle-spruce text-sm font-bold text-kringle-spruce hover:bg-kringle-spruce/5"
        >
          + Plan a new exchange
        </Link>
      </section>

      {/* Discover */}
      <section className="rounded-3xl bg-kringle-spruce/5 p-6 space-y-3">
        <h2 className="font-black text-kringle-spruce">🎄 Discover</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href="https://xmasgoat.com/gift-ideas"
            className="flex items-center gap-3 rounded-2xl border-2 border-white bg-white p-4 text-sm font-semibold hover:border-kringle-spruce"
          >
            🎁 <span>Gift ideas & wish lists</span>
          </a>
          <a
            href="https://party.xmasgoat.com"
            className="flex items-center gap-3 rounded-2xl border-2 border-white bg-white p-4 text-sm font-semibold hover:border-kringle-spruce"
          >
            🥳 <span>Party planner</span>
          </a>
          <a
            href="https://xmasgoat.com"
            className="flex items-center gap-3 rounded-2xl border-2 border-white bg-white p-4 text-sm font-semibold hover:border-kringle-spruce"
          >
            ⭐ <span>XmasGoat.com</span>
          </a>
          <a
            href="https://account.xmasgoat.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border-2 border-white bg-white p-4 text-sm font-semibold hover:border-kringle-spruce"
          >
            👤 <span>Full account settings ↗</span>
          </a>
        </div>
      </section>
    </main>
  );
}
