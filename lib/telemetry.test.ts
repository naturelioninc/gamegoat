import { describe, expect, it } from "vitest";
import { safeGameEvent } from "./telemetry";

describe("privacy-safe game telemetry", () => {
  it("accepts only known events and game types", () => {
    expect(safeGameEvent("start", "secret_santa")).toMatchObject({ event: "start", gameType: "secret_santa" });
    expect(safeGameEvent("player_robert", "kris_kringle")).toBeNull();
    expect(safeGameEvent("join", "private-room-name")).toMatchObject({ gameType: "other" });
  });
});
