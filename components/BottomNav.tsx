"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  onPlayClick: () => void;
}

const TABS = [
  { href: "/", emoji: "🏠", label: "Home", exact: true },
  { href: "/kris-kringle", emoji: "🎁", label: "Kris K.", iconBg: "#a4161a" },
  { href: "/secret-santa", emoji: "🎅", label: "Santa", iconBg: "#0f5132" },
  { href: "/trivia", emoji: "🧠", label: "Trivia", iconBg: "#0284c7" },
] as const;

export function BottomNav({ onPlayClick }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="App navigation"
      className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-black bg-[#fffdf7]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <div className="grid h-16 grid-cols-5 items-center px-1">
        {TABS.map(({ href, emoji, label, iconBg, ...rest }) => {
          const exact = "exact" in rest ? rest.exact : false;
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 transition ${active ? "opacity-100" : "opacity-50 hover:opacity-75"}`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-lg transition ${active ? "scale-110 shadow-sm" : ""}`}
                style={active && iconBg ? { backgroundColor: iconBg } : undefined}
                aria-hidden="true"
              >
                {emoji}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-wide ${active ? "text-black" : "text-slate-500"}`}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Play button — center focus */}
        <button
          type="button"
          onClick={onPlayClick}
          className="flex flex-col items-center justify-center gap-0.5 py-1"
          aria-label="Pick a game"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-kringle-cranberry text-lg shadow-[2px_2px_0_rgba(0,0,0,0.2)]" aria-hidden="true">
            🎮
          </span>
          <span className="text-[9px] font-black uppercase tracking-wide text-slate-500">
            All games
          </span>
        </button>
      </div>
    </nav>
  );
}
