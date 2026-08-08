"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export function NativeBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    document.documentElement.classList.add("native-app");
    void StatusBar.setOverlaysWebView({ overlay: false });
    void StatusBar.setStyle({ style: Style.Dark });
    void StatusBar.setBackgroundColor({ color: "#fffdf7" });

    const listeners = [
      App.addListener("appUrlOpen", ({ url }) => {
        try {
          const incoming = new URL(url);
          const isGameGoatWebLink = incoming.hostname === "games.xmasgoat.com";
          const isGameGoatScheme = incoming.protocol === "gamegoat:";
          if (!isGameGoatWebLink && !isGameGoatScheme) return;
          const requestedTarget = incoming.searchParams.get("target");
          const safeTarget = requestedTarget?.startsWith("/") && !requestedTarget.startsWith("//")
            ? requestedTarget
            : null;
          const isLauncher = incoming.pathname === "/open" || incoming.hostname === "open";
          const path = isLauncher
            ? safeTarget || "/"
            : `${incoming.pathname}${incoming.search}${incoming.hash}` || "/";
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
      document.documentElement.classList.remove("native-app");
      void Promise.all(listeners).then((handles) => handles.forEach((handle) => handle.remove()));
    };
  }, []);

  return null;
}
