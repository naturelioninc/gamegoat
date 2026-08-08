"use client";

import { useEffect } from "react";
import Image from "next/image";

const PLAY_URL = "https://play.google.com/store/apps/details?id=com.xmasgoat.games";
const APP_STORE_URL = process.env.NEXT_PUBLIC_GAMEGOAT_APP_STORE_URL || "";

export function OpenLauncher({ target }: { target: string }) {
  const scheme = `gamegoat://open?target=${encodeURIComponent(target)}`;

  useEffect(() => {
    const ua = navigator.userAgent;
    const android = /Android/i.test(ua);
    const ios = /iPhone|iPad|iPod/i.test(ua);
    if (!android && !ios) return;
    window.location.assign(scheme);
    const timer = window.setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      if (android) window.location.assign(PLAY_URL);
      else if (APP_STORE_URL) window.location.assign(APP_STORE_URL);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [scheme]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <Image src="/brand/xmasgoat-logo.png" alt="XmasGoat" width={120} height={110} className="h-auto w-24" priority />
      <h1 className="mt-4 text-3xl font-black">Open xmasGOAT Games</h1>
      <p className="mt-2 text-sm text-slate-600">Jump back into your Christmas games and party rooms.</p>
      <div className="mt-6 grid w-full gap-3">
        <a href={scheme} className="min-h-12 rounded-2xl bg-kringle-cranberry px-5 py-3 font-black text-white shadow-[3px_3px_0_#000]">Open the app</a>
        <a href={PLAY_URL} className="min-h-12 rounded-2xl border-2 border-black bg-white px-5 py-3 font-black">Get it on Google Play</a>
        {APP_STORE_URL && <a href={APP_STORE_URL} className="min-h-12 rounded-2xl border-2 border-black bg-white px-5 py-3 font-black">Download on the App Store</a>}
        <a href={target} className="min-h-11 px-5 py-3 text-sm font-bold text-slate-500 underline">Continue on the website</a>
      </div>
    </main>
  );
}
