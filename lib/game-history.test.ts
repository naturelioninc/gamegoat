import { describe, expect, it } from "vitest";
import { isGameHistoryEntry, parseGameHistory } from "./game-history";

const valid = {
  version: 1,
  code: "ABC123",
  gameType: "kris_kringle",
  playerId: "player-1",
  playerToken: "secure-token",
  playerName: "Holly",
  role: "host",
  status: "active",
  playerCount: 3,
  createdAt: "2026-08-08T00:00:00.000Z",
  lastVisitedAt: "2026-08-08T01:00:00.000Z",
} as const;

describe("game history", () => {
  it("accepts a valid resumable game", () => expect(isGameHistoryEntry(valid)).toBe(true));
  it("drops malformed and secret-bearing garbage without losing valid entries", () => {
    const result = parseGameHistory(JSON.stringify([{ nonsense: true, assignment: "private" }, valid]));
    expect(result).toEqual([valid]);
    expect(JSON.stringify(result)).not.toContain("private");
  });
  it("recovers safely from corrupt storage", () => expect(parseGameHistory("not-json")).toEqual([]));
  it("rejects invalid room codes and empty credentials", () => {
    expect(isGameHistoryEntry({ ...valid, code: "BAD" })).toBe(false);
    expect(isGameHistoryEntry({ ...valid, playerToken: "" })).toBe(false);
  });
});
