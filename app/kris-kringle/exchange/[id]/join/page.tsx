import { notFound } from "next/navigation";
import { getExchange } from "@/app/kris-kringle/plan/actions";
import { JoinForm } from "./JoinForm";

export default async function JoinExchangePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exchange = await getExchange(id);

  if (!exchange || exchange.status === "complete") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 px-5 py-10 sm:py-14">
      <header className="space-y-2 text-center">
        <div className="text-5xl">🎄</div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">
          You&apos;re invited
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight">{exchange.name}</h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600 mt-2">
          {exchange.party_date && (
            <span>
              📅{" "}
              {new Date(exchange.party_date).toLocaleDateString("en-CA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </span>
          )}
          {exchange.budget_cents && (
            <span>💰 Budget: ${(exchange.budget_cents / 100).toFixed(0)} per person</span>
          )}
        </div>
      </header>

      <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000]">
        <JoinForm exchangeId={exchange.id} />
      </div>

      <p className="text-center text-xs text-slate-400">
        Hosted by {exchange.host_name} · powered by{" "}
        <a href="https://games.xmasgoat.com" className="text-kringle-spruce underline">
          Game Goat
        </a>
      </p>
    </main>
  );
}
