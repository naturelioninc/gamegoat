"use client";

export function GameSessionBar({ game, cue }: { game: string; cue: string }) {
  const share = () => {
    const text = `Join us for ${game} on XmasGoat — no download or account needed.`;
    if (navigator.share) void navigator.share({ title: game, text, url: location.href });
    else void navigator.clipboard?.writeText(`${text} ${location.href}`);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0_#000]">
      <a href="/" className="inline-flex min-h-10 items-center rounded-xl px-2 text-sm font-black text-kringle-spruce">← Games</a>
      <p className="min-w-0 flex-1 truncate text-center text-xs font-bold text-slate-500">{cue}</p>
      <button type="button" onClick={share} className="inline-flex min-h-10 items-center rounded-xl bg-kringle-spruce px-3 text-sm font-black text-white">Invite ↗</button>
    </div>
  );
}
