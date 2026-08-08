export const GAME_EVENTS = ["create", "join", "resume", "start", "action_failure", "complete", "replay", "claim", "reconnect"] as const;
export type GameEvent = typeof GAME_EVENTS[number];

export function safeGameEvent(event: string, gameType?: string) {
  if (!(GAME_EVENTS as readonly string[]).includes(event)) return null;
  return { event: event as GameEvent, gameType: gameType === "secret_santa" || gameType === "kris_kringle" ? gameType : "other", path: typeof window === "undefined" ? undefined : window.location.pathname.replace(/[A-Z2-9]{6}/g, ":room") };
}

export function reportGameEvent(event: GameEvent, gameType?: string) {
  if (typeof window === "undefined" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
  const payload = safeGameEvent(event, gameType);
  if (!payload) return;
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) navigator.sendBeacon("/api/telemetry", new Blob([body], { type: "application/json" }));
  else void fetch("/api/telemetry", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
}
