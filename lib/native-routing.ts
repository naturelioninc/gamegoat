export const NATIVE_WEB_ORIGINS = new Set([
  "https://app.xmasgoat.com",
  "https://games.xmasgoat.com",
  "https://party.xmasgoat.com",
  "https://account.xmasgoat.com",
]);

const APP_ORIGIN = "https://app.xmasgoat.com";

function canonicalWebUrl(url: URL) {
  if (url.origin === APP_ORIGIN) return url.href;
  if (url.origin === "https://games.xmasgoat.com") {
    if (url.pathname === "/") url.pathname = "/games";
    else if (url.pathname === "/app") url.pathname = "/";
    else if (url.pathname === "/join") url.pathname = "/games/join";
    else if (url.pathname.startsWith("/kris-kringle")) {
      url.pathname = `/games/white-elephant${url.pathname.slice("/kris-kringle".length)}`;
    } else if (!url.pathname.startsWith("/games"))
      url.pathname = `/games${url.pathname}`;
  } else if (url.origin === "https://party.xmasgoat.com") {
    if (url.pathname === "/" || url.pathname === "/events")
      url.pathname = "/parties";
    else if (url.pathname === "/dashboard/event/new")
      url.pathname = "/parties/new";
    else if (url.pathname.startsWith("/events/"))
      url.pathname = `/parties/${url.pathname.slice(8)}`;
  } else if (url.origin === "https://account.xmasgoat.com") {
    if (url.pathname === "/" || url.pathname === "/dashboard")
      url.pathname = "/account";
    else if (
      ["/profile", "/settings", "/wishlist", "/signin"].includes(url.pathname)
    )
      url.pathname = `/account${url.pathname}`;
  }
  url.protocol = "https:";
  url.host = "app.xmasgoat.com";
  return url.href;
}

function safeWebUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return NATIVE_WEB_ORIGINS.has(url.origin) ? canonicalWebUrl(url) : null;
  } catch {
    return null;
  }
}

export function nativeDestination(value: string) {
  try {
    const incoming = new URL(value);
    if (NATIVE_WEB_ORIGINS.has(incoming.origin))
      return canonicalWebUrl(incoming);

    if (incoming.protocol === "xmasgoat:") {
      if (incoming.hostname !== "open") return null;
      return safeWebUrl(incoming.searchParams.get("url")) ?? `${APP_ORIGIN}/`;
    }

    // Preserve links already issued to the Game Goat testing application.
    if (incoming.protocol === "gamegoat:") {
      const target = incoming.searchParams.get("target");
      if (
        incoming.hostname !== "open" ||
        !target?.startsWith("/") ||
        target.startsWith("//")
      ) {
        return null;
      }
      return canonicalWebUrl(new URL(target, "https://games.xmasgoat.com"));
    }
  } catch {
    return null;
  }
  return null;
}
