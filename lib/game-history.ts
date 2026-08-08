export type GameHistoryType = "kris_kringle" | "secret_santa";
export type GameHistoryRole = "host" | "participant";
export type GameHistoryStatus = "lobby" | "active" | "complete" | "expired";

export interface GameHistoryEntry {
  version: 1;
  code: string;
  gameType: GameHistoryType;
  playerId: string;
  playerToken: string;
  playerName: string;
  role: GameHistoryRole;
  status: GameHistoryStatus;
  playerCount: number;
  createdAt: string;
  lastVisitedAt: string;
  completedAt?: string;
  archived?: boolean;
}

const STORAGE_KEY = "game_goat_history_v1";
const MAX_ENTRIES = 30;

function validDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

export function isGameHistoryEntry(value: unknown): value is GameHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<GameHistoryEntry>;
  return item.version === 1 &&
    typeof item.code === "string" && /^[A-Z0-9]{6}$/.test(item.code) &&
    ["kris_kringle", "secret_santa"].includes(item.gameType ?? "") &&
    typeof item.playerId === "string" && item.playerId.length > 0 &&
    typeof item.playerToken === "string" && item.playerToken.length > 0 &&
    typeof item.playerName === "string" && item.playerName.length > 0 &&
    ["host", "participant"].includes(item.role ?? "") &&
    ["lobby", "active", "complete", "expired"].includes(item.status ?? "") &&
    typeof item.playerCount === "number" && item.playerCount >= 0 &&
    validDate(item.createdAt) && validDate(item.lastVisitedAt) &&
    (!item.completedAt || validDate(item.completedAt));
}

export function parseGameHistory(raw: string | null): GameHistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isGameHistoryEntry).slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function readGameHistory(): GameHistoryEntry[] {
  if (typeof window === "undefined") return [];
  return parseGameHistory(window.localStorage.getItem(STORAGE_KEY));
}

function write(entries: GameHistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  window.dispatchEvent(new CustomEvent("game-goat-history"));
}

export function upsertGameHistory(
  entry: Omit<GameHistoryEntry, "version" | "createdAt" | "lastVisitedAt"> &
    Partial<Pick<GameHistoryEntry, "createdAt" | "lastVisitedAt">>,
) {
  const now = new Date().toISOString();
  const current = readGameHistory();
  const existing = current.find((item) => item.code === entry.code);
  const next: GameHistoryEntry = {
    ...existing,
    ...entry,
    version: 1,
    createdAt: entry.createdAt ?? existing?.createdAt ?? now,
    lastVisitedAt: entry.lastVisitedAt ?? now,
  };
  write([next, ...current.filter((item) => item.code !== entry.code)]);
}

export function archiveGameHistory(code: string, archived = true) {
  write(readGameHistory().map((item) => item.code === code ? { ...item, archived } : item));
}

export function gameHistoryHref(entry: Pick<GameHistoryEntry, "gameType" | "code">) {
  return entry.gameType === "secret_santa"
    ? `/secret-santa/room/${entry.code}`
    : `/kris-kringle/room/${entry.code}`;
}

export function gameHistoryLabel(type: GameHistoryType) {
  return type === "secret_santa" ? "Secret Santa" : "White Elephant";
}
