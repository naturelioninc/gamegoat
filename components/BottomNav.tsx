"use client";

import { usePathname } from "next/navigation";
import { GeneratedIcon } from "@/components/GeneratedIcon";

interface Props { onPlayClick: () => void; }

export function BottomNav({ onPlayClick }: Props) {
  const pathname = usePathname();
  if (
    /\/(kris-kringle|secret-santa)\/room\//.test(pathname) ||
    ["/trivia", "/charades", "/bingo"].includes(pathname)
  ) return null;

  return (
    <nav
      aria-label="App navigation"
      className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-black bg-[#fffdf7]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <div className="grid h-16 grid-cols-5 items-center px-1">
        <a href="https://games.xmasgoat.com/app" className="flex flex-col items-center justify-center gap-0.5 py-1"><GeneratedIcon name="home" size="sm" className="h-8 w-8" /><span className="text-[9px] font-black uppercase">Home</span></a>
        <a href="https://party.xmasgoat.com/events" className="flex flex-col items-center justify-center gap-0.5 py-1 opacity-60"><span className="flex h-8 items-center text-2xl">🎄</span><span className="text-[9px] font-black uppercase">Parties</span></a>
        <a href="https://party.xmasgoat.com/dashboard/event/new" className="flex flex-col items-center justify-center gap-0.5 py-1 opacity-60"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-kringle-spruce text-xl font-black text-white">+</span><span className="text-[9px] font-black uppercase">New</span></a>
        <button type="button" onClick={onPlayClick} className="flex flex-col items-center justify-center gap-0.5 py-1" aria-label="Pick a game"><GeneratedIcon name="play" size="sm" className="h-8 w-8" /><span className="text-[9px] font-black uppercase">Games</span></button>
        <a href="https://account.xmasgoat.com" className="flex flex-col items-center justify-center gap-0.5 py-1 opacity-60"><GeneratedIcon name="players" size="sm" className="h-8 w-8" /><span className="text-[9px] font-black uppercase">Account</span></a>
      </div>
    </nav>
  );
}
