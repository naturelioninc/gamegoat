"use client";

import { useEffect } from "react";

export function MilestoneCelebration({ title, detail, onDone }: { title: string; detail: string; onDone: () => void }) {
  useEffect(() => { const timer = window.setTimeout(onDone, 2800); return () => window.clearTimeout(timer); }, [onDone]);
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-kringle-spruce/20 p-6" role="status" aria-live="polite">
      <div aria-hidden="true" className="absolute inset-0">{Array.from({ length: 18 }, (_, index) => <i key={index} className="kk-confetti" style={{ "--i": index } as React.CSSProperties} />)}</div>
      <div className="animate-kk-pop-in rounded-3xl border-4 border-kringle-gold bg-amber-50 px-7 py-6 text-center shadow-[7px_7px_0_#000]">
        <p className="text-5xl">🎉</p><p className="mt-2 text-3xl font-black text-amber-950">{title}</p><p className="mt-2 font-bold text-amber-800">{detail}</p>
      </div>
    </div>
  );
}
