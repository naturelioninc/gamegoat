export const NATIVE_WEB_ORIGINS = new Set([
  "https://games.xmasgoat.com",
  "https://party.xmasgoat.com",
  "https://account.xmasgoat.com",
]);

function safeWebUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return NATIVE_WEB_ORIGINS.has(url.origin) ? url.href : null;
  } catch {
    return null;
  }
}

export function nativeDestination(value: string) {
  try {
    const incoming = new URL(value);
    if (NATIVE_WEB_ORIGINS.has(incoming.origin)) return incoming.href;

    if (incoming.protocol === "xmasgoat:") {
      if (incoming.hostname !== "open") return null;
      return safeWebUrl(incoming.searchParams.get("url")) ?? "https://games.xmasgoat.com/app";
    }

    // Preserve links already issued to the Game Goat testing application.
    if (incoming.protocol === "gamegoat:") {
      const target = incoming.searchParams.get("target");
      if (incoming.hostname !== "open" || !target?.startsWith("/") || target.startsWith("//")) {
        return null;
      }
      return new URL(target, "https://games.xmasgoat.com").href;
    }
  } catch {
    return null;
  }
  return null;
}
