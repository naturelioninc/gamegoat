"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { GamePickerOverlay } from "./GamePickerOverlay";
import { Snowfall } from "./fx/Snowfall";
import { FirstRunExperience } from "./FirstRunExperience";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLiveRoom = /\/(kris-kringle|secret-santa)\/room\//.test(pathname);
  const scene = pathname.includes("secret-santa") ? "scene-secret-santa" : pathname.includes("kris-kringle") ? "scene-white-elephant" : "scene-game-goat";
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Close everything on navigation
  useEffect(() => {
    setMenuOpen(false);
    setPickerOpen(false);
  }, [pathname]);

  // Lock body scroll when any overlay is open
  useEffect(() => {
    const locked = menuOpen || pickerOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    document.body.style.position = locked ? "fixed" : "";
    document.body.style.width = locked ? "100%" : "";
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [menuOpen, pickerOpen]);

  const openPicker = () => {
    setMenuOpen(false);
    setPickerOpen(true);
  };

  return (
    <>
      <a href="#game-content" className="fixed left-3 top-3 z-[120] -translate-y-24 rounded-xl bg-white px-4 py-3 font-black text-black shadow-lg focus:translate-y-0">Skip to game</a>
      <FirstRunExperience />
      <Snowfall />
      <Header
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        onPlayClick={openPicker}
      />

      {/* Backdrop for menu (scroll is locked, but we still want a visual overlay) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div id="game-content" tabIndex={-1} className={`route-scene flex-1 ${scene} ${isLiveRoom ? "pb-4" : "pb-20 sm:pb-0"}`}>{children}</div>

      <BottomNav onPlayClick={openPicker} />

      {pickerOpen && <GamePickerOverlay onClose={() => setPickerOpen(false)} />}
    </>
  );
}
