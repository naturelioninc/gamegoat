import type {
  ApplyResult,
  GameActionInput,
  GameGift,
  GamePlayer,
  GameRules,
  GameState,
} from "./types";

// -----------------------------------------------------------------------------
// Pure White Elephant state machine.
//
// The database stores an append-only event log (game_actions). The
// authoritative state at any moment is:
//
//   replay(createInitialState(...), nonUndoneActionsInSequenceOrder)
//
// Undo therefore never guesses: mark the most recent non-undone action
// as undone and replay. Host page refresh rebuilds the same way.
// -----------------------------------------------------------------------------

export function createInitialState(input: {
  rules: GameRules;
  players: { id: string; playOrder: number }[];
  gifts: { id: string; giftNumber: number }[];
}): GameState {
  const players: GamePlayer[] = [...input.players]
    .sort((a, b) => a.playOrder - b.playOrder)
    .map((p) => ({ id: p.id, playOrder: p.playOrder, status: "active" }));
  const gifts: GameGift[] = [...input.gifts]
    .sort((a, b) => a.giftNumber - b.giftNumber)
    .map((g) => ({
      id: g.id,
      giftNumber: g.giftNumber,
      ownerId: null,
      openedById: null,
      stealCount: 0,
    }));
  return {
    rules: input.rules,
    status: "active",
    phase: "normal",
    players,
    gifts,
    nextTurnIndex: 0,
    pendingPlayerId: null,
    lastSteal: null,
    turnsTaken: 0,
  };
}

// -----------------------------------------------------------------------------
// Derived helpers
// -----------------------------------------------------------------------------

export function isLocked(gift: GameGift, rules: GameRules): boolean {
  return gift.stealCount >= rules.maxSteals;
}

export function firstActivePlayer(state: GameState): GamePlayer | null {
  return state.players.find((p) => p.status === "active") ?? null;
}

export function currentPlayerId(state: GameState): string | null {
  if (state.status === "complete" || state.phase === "complete") return null;
  if (state.phase === "final_turn") return firstActivePlayer(state)?.id ?? null;
  if (state.pendingPlayerId) return state.pendingPlayerId;
  return state.players[state.nextTurnIndex]?.id ?? null;
}

export function giftOwnedBy(state: GameState, playerId: string): GameGift | null {
  return state.gifts.find((g) => g.ownerId === playerId) ?? null;
}

// Gifts the given player may steal right now.
export function eligibleSteals(state: GameState, playerId: string): GameGift[] {
  return state.gifts.filter((g) => {
    if (g.ownerId === null) return false;
    if (g.ownerId === playerId) return false;
    if (isLocked(g, state.rules)) return false;
    if (
      !state.rules.allowImmediateStealback &&
      state.lastSteal &&
      state.lastSteal.giftId === g.id &&
      state.lastSteal.victimId === playerId
    ) {
      return false;
    }
    return true;
  });
}

export function unopenedGifts(state: GameState): GameGift[] {
  return state.gifts.filter((g) => g.ownerId === null && g.openedById === null);
}

// -----------------------------------------------------------------------------
// applyAction
// -----------------------------------------------------------------------------

export function applyAction(state: GameState, action: GameActionInput): ApplyResult {
  if (state.status === "complete") {
    return { ok: false, error: "game is complete" };
  }

  switch (action.type) {
    case "pause":
      if (state.status !== "active") return { ok: false, error: "game is not active" };
      return { ok: true, state: { ...state, status: "paused" } };

    case "resume":
      if (state.status !== "paused") return { ok: false, error: "game is not paused" };
      return { ok: true, state: { ...state, status: "active" } };

    case "end":
      return {
        ok: true,
        state: { ...state, status: "complete", phase: "complete", pendingPlayerId: null },
      };

    case "correct":
      return applyCorrect(state, action.giftId, action.newOwnerId);
  }

  // Everything below requires a running (non-paused) game.
  if (state.status !== "active") {
    return { ok: false, error: "game is paused" };
  }

  switch (action.type) {
    case "open":
      return applyOpen(state, action.playerId, action.giftId);
    case "steal":
      return applySteal(state, action.playerId, action.giftId);
    case "skip":
      return applySkip(state);
    case "advance":
      return applyAdvance(state);
    case "final_keep":
      return applyFinalKeep(state);
    case "final_swap":
      return applyFinalSwap(state, action.giftId);
  }
}

// Replay a sequence of actions from an initial state. Throws if the log
// contains an action that no longer applies — the log is append-only and
// validated on write, so that indicates data corruption worth surfacing.
export function replay(initial: GameState, actions: GameActionInput[]): GameState {
  let state = initial;
  for (const [i, action] of actions.entries()) {
    const result = applyAction(state, action);
    if (!result.ok) {
      throw new Error(`replay failed at action ${i} (${action.type}): ${result.error}`);
    }
    state = result.state;
  }
  return state;
}

// -----------------------------------------------------------------------------
// Individual actions
// -----------------------------------------------------------------------------

function applyOpen(state: GameState, playerId: string, giftId: string): ApplyResult {
  if (state.phase !== "normal")
    return { ok: false, error: "open is only allowed during normal turns" };
  const current = currentPlayerId(state);
  if (playerId !== current) return { ok: false, error: "not this player's turn" };
  const gift = state.gifts.find((g) => g.id === giftId);
  if (!gift) return { ok: false, error: "unknown gift" };
  if (gift.ownerId !== null || gift.openedById !== null) {
    return { ok: false, error: "gift is already opened" };
  }
  if (giftOwnedBy(state, playerId)) {
    return { ok: false, error: "player already owns a gift" };
  }

  const gifts = state.gifts.map((g) =>
    g.id === giftId ? { ...g, ownerId: playerId, openedById: playerId } : g,
  );

  let next: GameState = { ...state, gifts, lastSteal: null };
  if (state.pendingPlayerId === playerId) {
    // A displaced player opening ends the steal chain; the numbered
    // order resumes where it left off.
    next.pendingPlayerId = null;
  } else {
    next = consumeNumberedTurn(next);
  }
  return { ok: true, state: maybeFinish(next) };
}

function applySteal(state: GameState, playerId: string, giftId: string): ApplyResult {
  if (state.phase !== "normal")
    return { ok: false, error: "steal is only allowed during normal turns" };
  const current = currentPlayerId(state);
  if (playerId !== current) return { ok: false, error: "not this player's turn" };
  const gift = state.gifts.find((g) => g.id === giftId);
  if (!gift) return { ok: false, error: "unknown gift" };
  if (gift.ownerId === null) return { ok: false, error: "gift is not opened" };
  if (gift.ownerId === playerId) return { ok: false, error: "cannot steal your own gift" };
  if (isLocked(gift, state.rules)) return { ok: false, error: "gift is locked" };
  if (
    !state.rules.allowImmediateStealback &&
    state.lastSteal &&
    state.lastSteal.giftId === giftId &&
    state.lastSteal.victimId === playerId
  ) {
    return { ok: false, error: "immediate steal-back is not allowed" };
  }
  if (giftOwnedBy(state, playerId)) {
    return { ok: false, error: "player already owns a gift" };
  }

  const victimId = gift.ownerId;
  const gifts = state.gifts.map((g) =>
    g.id === giftId ? { ...g, ownerId: playerId, stealCount: g.stealCount + 1 } : g,
  );

  let next: GameState = {
    ...state,
    gifts,
    lastSteal: { giftId, victimId },
    pendingPlayerId: victimId,
  };
  if (state.pendingPlayerId !== playerId) {
    // A numbered player stealing consumes their numbered turn; the
    // chain then runs before the next numbered turn starts.
    next = consumeNumberedTurn(next);
    next.pendingPlayerId = victimId;
  }
  return { ok: true, state: maybeFinish(next) };
}

function applySkip(state: GameState): ApplyResult {
  if (state.phase === "final_turn") {
    // Skipping the final-turn player forfeits the final choice.
    const finalPlayer = firstActivePlayer(state);
    if (!finalPlayer) return { ok: false, error: "no player to skip" };
    return { ok: true, state: complete(state) };
  }
  const current = currentPlayerId(state);
  if (!current) return { ok: false, error: "no player to skip" };

  const players = state.players.map((p) =>
    p.id === current ? { ...p, status: "skipped" as const } : p,
  );
  let next: GameState = { ...state, players, lastSteal: null };
  if (state.pendingPlayerId === current) {
    next.pendingPlayerId = null;
  } else {
    next = consumeNumberedTurn(next);
  }
  return { ok: true, state: maybeFinish(next) };
}

function applyAdvance(state: GameState): ApplyResult {
  if (state.phase === "final_turn") {
    // Advancing past the final turn ends the game with gifts as they stand.
    return { ok: true, state: complete(state) };
  }
  let next: GameState = { ...state, lastSteal: null };
  if (state.pendingPlayerId) {
    // Abandon the steal chain without marking the player absent.
    next.pendingPlayerId = null;
  } else {
    if (state.nextTurnIndex >= state.players.length) {
      return { ok: false, error: "no turn to advance" };
    }
    next = consumeNumberedTurn(next);
  }
  return { ok: true, state: maybeFinish(next) };
}

function applyCorrect(state: GameState, giftId: string, newOwnerId: string | null): ApplyResult {
  const gift = state.gifts.find((g) => g.id === giftId);
  if (!gift) return { ok: false, error: "unknown gift" };
  if (newOwnerId !== null && !state.players.some((p) => p.id === newOwnerId)) {
    return { ok: false, error: "unknown player" };
  }
  const gifts = state.gifts.map((g) => {
    if (g.id === giftId) {
      return {
        ...g,
        ownerId: newOwnerId,
        // Corrections can hand an "unopened" gift to someone; record the
        // opener so it no longer counts as a mystery gift.
        openedById: g.openedById ?? newOwnerId,
      };
    }
    return g;
  });
  // A correction invalidates the steal-back bookkeeping for safety.
  return { ok: true, state: { ...state, gifts, lastSteal: null } };
}

function applyFinalKeep(state: GameState): ApplyResult {
  if (state.phase !== "final_turn") return { ok: false, error: "not in the final turn" };
  return { ok: true, state: complete(state) };
}

function applyFinalSwap(state: GameState, giftId: string): ApplyResult {
  if (state.phase !== "final_turn") return { ok: false, error: "not in the final turn" };
  const finalPlayer = firstActivePlayer(state);
  if (!finalPlayer) return { ok: false, error: "no final player" };

  const target = state.gifts.find((g) => g.id === giftId);
  if (!target) return { ok: false, error: "unknown gift" };
  if (target.ownerId === null) return { ok: false, error: "cannot swap for an unopened gift" };
  if (target.ownerId === finalPlayer.id)
    return { ok: false, error: "cannot swap for your own gift" };
  if (isLocked(target, state.rules)) return { ok: false, error: "gift is locked" };
  if (
    !state.rules.allowImmediateStealback &&
    state.lastSteal &&
    state.lastSteal.giftId === giftId &&
    state.lastSteal.victimId === finalPlayer.id
  ) {
    return { ok: false, error: "immediate steal-back is not allowed" };
  }

  const own = giftOwnedBy(state, finalPlayer.id);
  const victimId = target.ownerId;
  const gifts = state.gifts.map((g) => {
    if (g.id === target.id) return { ...g, ownerId: finalPlayer.id, stealCount: g.stealCount + 1 };
    if (own && g.id === own.id) return { ...g, ownerId: victimId };
    return g;
  });
  return { ok: true, state: complete({ ...state, gifts }) };
}

// -----------------------------------------------------------------------------
// Turn bookkeeping
// -----------------------------------------------------------------------------

function consumeNumberedTurn(state: GameState): GameState {
  // Advance past the player whose numbered turn was just consumed, then
  // past any players the host already marked skipped.
  let idx = state.nextTurnIndex + 1;
  while (idx < state.players.length && state.players[idx]!.status === "skipped") {
    idx++;
  }
  return { ...state, nextTurnIndex: idx, turnsTaken: state.turnsTaken + 1 };
}

function maybeFinish(state: GameState): GameState {
  if (state.phase !== "normal") return state;
  if (state.pendingPlayerId !== null) return state;
  if (state.nextTurnIndex < state.players.length) {
    // Guard: nextTurnIndex may sit on a skipped player after a skip.
    if (state.players[state.nextTurnIndex]!.status === "skipped") {
      let idx = state.nextTurnIndex;
      while (idx < state.players.length && state.players[idx]!.status === "skipped") idx++;
      const advanced = { ...state, nextTurnIndex: idx };
      if (idx < state.players.length) return advanced;
      return finishNormalPhase(advanced);
    }
    return state;
  }
  return finishNormalPhase(state);
}

function finishNormalPhase(state: GameState): GameState {
  if (state.rules.firstPlayerFinalTurn) {
    const finalPlayer = firstActivePlayer(state);
    if (finalPlayer && giftOwnedBy(state, finalPlayer.id)) {
      return { ...state, phase: "final_turn" };
    }
  }
  return complete(state);
}

function complete(state: GameState): GameState {
  return { ...state, status: "complete", phase: "complete", pendingPlayerId: null };
}
