"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { nativeDestination } from "@/lib/native-routing";

export function NativeBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    document.documentElement.classList.add("native-app");
    void StatusBar.setOverlaysWebView({ overlay: false });
    void StatusBar.setStyle({ style: Style.Dark });
    void StatusBar.setBackgroundColor({ color: "#fffdf7" });

    const listeners = [
      App.addListener("appUrlOpen", ({ url }) => {
        const destination = nativeDestination(url);
        if (destination) window.location.assign(destination);
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
