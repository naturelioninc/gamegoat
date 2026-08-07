import { describe, expect, it } from "vitest";
import { applyAction, createInitialState, currentPlayerId, isLocked } from "../lib/engine/engine";
import { RULE_PRESETS, type GameActionInput, type GameRules, type GameState } from "../lib/engine/types";

function state(count: number, rules: GameRules = RULE_PRESETS.classic): GameState {
  return createInitialState({
    rules,
    players: Array.from({ length: count }, (_, index) => ({ id: `p${index + 1}`, playOrder: index + 1 })),
    gifts: Array.from({ length: count }, (_, index) => ({ id: `g${index + 1}`, giftNumber: index + 1 })),
  });
}

function apply(current: GameState, action: GameActionInput): GameState {
  const result = applyAction(current, action);
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

describe("White Elephant engine", () => {
  it("plays a complete open-only friendly game", () => {
    let game = state(3, RULE_PRESETS.friendly);
    game = apply(game, { type: "open", playerId: "p1", giftId: "g1" });
    game = apply(game, { type: "open", playerId: "p2", giftId: "g2" });
    game = apply(game, { type: "open", playerId: "p3", giftId: "g3" });
    expect(game.status).toBe("complete");
    expect(currentPlayerId(game)).toBeNull();
  });

  it("rejects a player acting out of turn", () => {
    const result = applyAction(state(3), { type: "open", playerId: "p2", giftId: "g1" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/turn/);
  });

  it("hands the next action to a player displaced by a steal", () => {
    let game = state(3);
    game = apply(game, { type: "open", playerId: "p1", giftId: "g1" });
    game = apply(game, { type: "steal", playerId: "p2", giftId: "g1" });
    expect(currentPlayerId(game)).toBe("p1");
    expect(game.gifts[0]?.ownerId).toBe("p2");
  });

  it("blocks immediate steal-backs in classic rules", () => {
    let game = state(3);
    game = apply(game, { type: "open", playerId: "p1", giftId: "g1" });
    game = apply(game, { type: "steal", playerId: "p2", giftId: "g1" });
    const result = applyAction(game, { type: "steal", playerId: "p1", giftId: "g1" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/steal-back/);
  });

  it("locks a gift at the configured steal limit", () => {
    const rules = { ...RULE_PRESETS.chaos, maxSteals: 1 };
    let game = state(3, rules);
    game = apply(game, { type: "open", playerId: "p1", giftId: "g1" });
    game = apply(game, { type: "steal", playerId: "p2", giftId: "g1" });
    expect(isLocked(game.gifts[0]!, rules)).toBe(true);
  });

  it("gives player one the optional final swap", () => {
    let game = state(3);
    game = apply(game, { type: "open", playerId: "p1", giftId: "g1" });
    game = apply(game, { type: "open", playerId: "p2", giftId: "g2" });
    game = apply(game, { type: "open", playerId: "p3", giftId: "g3" });
    expect(game.phase).toBe("final_turn");
    game = apply(game, { type: "final_swap", giftId: "g3" });
    expect(game.status).toBe("complete");
    expect(game.gifts.find((gift) => gift.id === "g3")?.ownerId).toBe("p1");
  });
});
