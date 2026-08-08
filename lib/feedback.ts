import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

export async function gameFeedback(kind: "tap" | "success" | "warning") {
  if (Capacitor.isNativePlatform()) {
    if (kind === "success") return Haptics.notification({ type: NotificationType.Success }).catch(() => {});
    if (kind === "warning") return Haptics.notification({ type: NotificationType.Warning }).catch(() => {});
    return Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  }
  if (kind !== "tap" && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(kind === "success" ? [35, 35, 70] : 45);
}
