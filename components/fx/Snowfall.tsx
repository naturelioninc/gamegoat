"use client";

import { useEffect, useState } from "react";

interface Flake {
  left: number;
  size: number;
  dur: number;
  delay: number;
  swayDur: number;
  drift: number;
}

export function Snowfall({ density = 40 }: { density?: number }) {
  const [flakes, setFlakes] = useState<Flake[]>([]);

  useEffect(() => {
    const wake = () => document.documentElement.classList.add("kk-live");
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    for (const e of events) window.addEventListener(e, wake, { once: true, passive: true });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const count = Math.round((density * Math.min(window.innerWidth, 1600)) / 800);
    setFlakes(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 4.5,
        dur: 9 + Math.random() * 16,
        delay: -Math.random() * 25,
        swayDur: 2.5 + Math.random() * 3,
        drift: 8 + Math.random() * 26,
      })),
    );
  }, [density]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="kk-flake"
          style={
            {
              left: `${f.left}%`,
              "--kk-dur": `${f.dur}s`,
              "--kk-delay": `${f.delay}s`,
              "--kk-sway-dur": `${f.swayDur}s`,
              "--kk-drift": `${f.drift}px`,
            } as React.CSSProperties
          }
        >
          <span style={{ width: f.size, height: f.size }} />
        </span>
      ))}
    </div>
  );
}
