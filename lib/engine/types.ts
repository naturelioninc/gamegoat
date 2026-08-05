// -----------------------------------------------------------------------------
// Rules
// -----------------------------------------------------------------------------

export interface GameRules {
  maxSteals: number;
  allowImmediateStealback: boolean;
  firstPlayerFinalTurn: boolean;
}

export const RULE_PRESETS = {
  classic: { maxSteals: 3, allowImmediateStealback: false, firstPlayerFinalTurn: true },
  friendly: { maxSteals: 2, allowImmediateStealback: false, firstPlayerFinalTurn: false },
  chaos: { maxSteals: 5, allowImmediateStealback: true, firstPlayerFinalTurn: true },
} as const satisfies Record<string, GameRules>;
export type RulePresetName = keyof typeof RULE_PRESETS;

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

export type PlayerStatus = "active" | "skipped";

export interface GamePlayer {
  id: string;
  playOrder: number; // 1-based
  status: PlayerStatus;
}

export interface GameGift {
  id: string;
  giftNumber: number; // 1-based
  ownerId: string | null; // null = unopened
  openedById: string | null; // first opener, never changes after open
  stealCount: number;
}

export type GameStatus = "active" | "paused" | "complete";
export type GamePhase = "normal" | "final_turn" | "complete";

export interface GameState {
  rules: GameRules;
  status: GameStatus;
  phase: GamePhase;
  // Sorted ascending by playOrder. Order never changes after start.
  players: GamePlayer[];
  // Sorted ascending by giftNumber.
  gifts: GameGift[];
  // Index into players[] of the next numbered turn to be taken.
  nextTurnIndex: number;
  // Player displaced by a steal who must act before the numbered order resumes.
  pendingPlayerId: string | null;
  // Set by the most recent action iff it was a steal; used to enforce the
  // immediate-steal-back rule. Cleared by the following action.
  lastSteal: { giftId: string; victimId: string } | null;
  // Count of completed numbered turns.
  turnsTaken: number;
}

// -----------------------------------------------------------------------------
// Actions
// -----------------------------------------------------------------------------

export type GameActionInput =
  | { type: "open"; playerId: string; giftId: string }
  | { type: "steal"; playerId: string; giftId: string }
  | { type: "skip" }
  | { type: "advance" }
  | { type: "correct"; giftId: string; newOwnerId: string | null }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "end" }
  | { type: "final_keep" }
  | { type: "final_swap"; giftId: string };

export type GameActionType = GameActionInput["type"];

export type ApplyResult = { ok: true; state: GameState } | { ok: false; error: string };
