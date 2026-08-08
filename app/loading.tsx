export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl animate-pulse px-4 pb-24 pt-4" aria-label="Loading Game Goat">
      <div className="h-5 w-28 rounded-full bg-emerald-100" />
      <div className="mt-3 h-10 w-64 max-w-[80%] rounded-xl bg-slate-200" />
      <div className="mt-3 h-4 w-full max-w-md rounded bg-slate-100" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2, 3].map((item) => <div key={item} className="aspect-[4/3] rounded-3xl border-2 border-slate-100 bg-white shadow-[3px_3px_0_#e2e8f0]" />)}
      </div>
      <span className="sr-only" role="status">Loading…</span>
    </main>
  );
}
