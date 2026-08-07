"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export function NativeBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listeners = [
      App.addListener("appUrlOpen", ({ url }) => {
        try {
          const incoming = new URL(url);
          const isGameGoatWebLink = incoming.hostname === "games.xmasgoat.com";
          const isGameGoatScheme = incoming.protocol === "gamegoat:";
          if (!isGameGoatWebLink && !isGameGoatScheme) return;
          const path = `${incoming.pathname}${incoming.search}${incoming.hash}` || "/";
          window.location.assign(path);
        } catch {
          // Ignore malformed external URLs rather than navigating the WebView.
        }
      }),
      App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else void App.exitApp();
      }),
    ];

    return () => {
      void Promise.all(listeners).then((handles) => handles.forEach((handle) => handle.remove()));
    };
  }, []);

  return null;
}
