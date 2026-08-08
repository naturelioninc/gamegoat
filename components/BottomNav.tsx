"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GeneratedIcon,
  type GeneratedIconName,
} from "@/components/GeneratedIcon";

interface Props {
  onPlayClick: () => void;
}

interface Tab {
  href: string;
  icon: GeneratedIconName;
  label: string;
  iconBg?: string;
  exact?: boolean;
}

const LEFT_TABS: Tab[] = [
  { href: "/app", icon: "home", label: "Home", exact: true },
  { href: "/my-games", icon: "gift-games", label: "My Games" },
];

const RIGHT_TABS: Tab[] = [
  { href: "/join", icon: "join-code", label: "Join" },
];

export function BottomNav({ onPlayClick }: Props) {
  const pathname = usePathname();
  if (/\/(kris-kringle|secret-santa)\/room\//.test(pathname)) return null;

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="App navigation"
      className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-black bg-[#fffdf7]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <div className="grid h-16 grid-cols-5 items-center px-1">
        {LEFT_TABS.map(({ href, icon, label, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 transition ${active ? "opacity-100" : "opacity-50 hover:opacity-75"}`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center transition ${active ? "scale-110" : ""}`}
              >
                <GeneratedIcon name={icon} size="sm" className="h-8 w-8" />
              </span>
              <span
                className={`text-[9px] font-black uppercase tracking-wide ${active ? "text-black" : "text-slate-500"}`}
              >
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
          <GeneratedIcon name="play" size="sm" className="h-8 w-8" />
          <span className="text-[9px] font-black uppercase tracking-wide text-slate-500">
            All games
          </span>
        </button>

        {RIGHT_TABS.map(({ href, icon, label, exact }) => {
          const active = isActive(href, exact);
          return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex flex-col items-center justify-center gap-0.5 py-1 transition ${active ? "opacity-100" : "opacity-50 hover:opacity-75"}`}><span className={`flex h-8 w-8 items-center justify-center transition ${active ? "scale-110" : ""}`}><GeneratedIcon name={icon} size="sm" className="h-8 w-8" /></span><span className={`text-[9px] font-black uppercase tracking-wide ${active ? "text-black" : "text-slate-500"}`}>{label}</span></Link>;
        })}

        <a
          href="https://account.xmasgoat.com"
          className="flex flex-col items-center justify-center gap-0.5 py-1 opacity-60 transition active:scale-95"
        >
          <GeneratedIcon name="players" size="sm" className="h-8 w-8" />
          <span className="text-[9px] font-black uppercase tracking-wide text-slate-500">Account</span>
        </a>
      </div>
    </nav>
  );
}
