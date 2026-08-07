"use server";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  createInitialState,
  applyAction,
  currentPlayerId as activePlayerId,
} from "@/lib/engine/engine";
import { RULE_PRESETS } from "@/lib/engine/types";
import type { GameActionInput } from "@/lib/engine/types";
import { randomUUID } from "crypto";

export async function createRoom(
  hostName: string,
  preset: string = "classic",
  hostEmail: string = "",
): Promise<{ code: string; playerId: string }> {
  const supabase = createSupabaseServiceClient();
  const playerId = randomUUID();
  const rules =
    RULE_PRESETS[preset as keyof typeof RULE_PRESETS] ?? RULE_PRESETS.classic;

  const { data, error } = await supabase
    .from("game_rooms")
    .insert({
      game_type: "kris_kringle",
      rules,
      players: [{ id: playerId, name: hostName.trim(), isHost: true }],
      host_email: hostEmail.trim() || null,
      status: "lobby",
    })
    .select("code")
    .single();

  if (error || !data)
    throw new Error(error?.message ?? "Could not create room");
  return { code: data.code, playerId };
}

export async function joinRoom(
  code: string,
  playerName: string,
): Promise<{ ok: true; playerId: string } | { ok: false; error: string }> {
  const trimmed = playerName.trim();
  if (!trimmed) return { ok: false, error: "Name required" };
  const playerId = randomUUID();
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.rpc("join_game_room", {
    _code: code,
    _player_id: playerId,
    _player_name: trimmed,
  });
  if (error) return { ok: false, error: error.message.replace(/^.*?: /, "") };
  return { ok: true, playerId };
}

export async function startGame(
  code: string,
  actorPlayerId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();

  const { data: room, error } = await supabase
    .from("game_rooms")
    .select("players, rules, status")
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !room) return { ok: false, error: "Room not found or expired" };
  if (room.status !== "lobby")
    return { ok: false, error: "Game already started" };

  const players = (room.players as { id: string; name: string }[]) ?? [];
  const actor = players.find((player) => player.id === actorPlayerId) as
    { id: string; isHost?: boolean } | undefined;
  if (!actor?.isHost)
    return { ok: false, error: "Only the host can start the game" };
  if (players.length < 2)
    return { ok: false, error: "Need at least 2 players" };

  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const gifts = shuffled.map((_, i) => ({
    id: `gift-${i}`,
    giftNumber: i + 1,
  }));
  const rules =
    (room.rules as typeof RULE_PRESETS.classic) ?? RULE_PRESETS.classic;

  const state = createInitialState({
    rules,
    players: shuffled.map((p, i) => ({ id: p.id, playOrder: i + 1 })),
    gifts,
  });

  const { error: updateError } = await supabase
    .from("game_rooms")
    .update({ state, players: shuffled, status: "active" })
    .eq("code", code);

  if (updateError) return { ok: false, error: updateError.message };
  return { ok: true };
}

export async function addManualPlayers(
  code: string,
  names: string[],
  actorPlayerId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();

  const { data: room, error } = await supabase
    .from("game_rooms")
    .select("players, status")
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !room) return { ok: false, error: "Room not found" };
  if (room.status !== "lobby")
    return { ok: false, error: "Game already started" };

  const existing = (room.players as { id: string; name: string }[]) ?? [];
  const actor = (room.players as Array<{ id: string; isHost?: boolean }>).find(
    (player) => player.id === actorPlayerId,
  );
  if (!actor?.isHost)
    return { ok: false, error: "Only the host can add manual players" };
  const existingLower = new Set(existing.map((p) => p.name.toLowerCase()));

  const newPlayers = names
    .map((n) => n.trim())
    .filter((n) => n && !existingLower.has(n.toLowerCase()))
    .map((name) => ({ id: randomUUID(), name, isHost: false, isManual: true }));

  if (newPlayers.length === 0) return { ok: true };

  const { error: updateError } = await supabase
    .from("game_rooms")
    .update({ players: [...existing, ...newPlayers] })
    .eq("code", code);

  if (updateError) return { ok: false, error: updateError.message };
  return { ok: true };
}

export async function performRoomAction(
  code: string,
  action: GameActionInput,
  actorPlayerId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();

  // Optimistic locking: read updated_at, write only if it hasn't changed.
  // Retries up to 3 times on concurrent-write conflicts.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: room, error } = await supabase
      .from("game_rooms")
      .select("state, updated_at, players")
      .eq("code", code)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !room?.state)
      return { ok: false, error: "Room not found or expired" };

    const players = room.players as Array<{
      id: string;
      isHost?: boolean;
      isManual?: boolean;
    }>;
    const actor = players.find((player) => player.id === actorPlayerId);
    if (!actor) return { ok: false, error: "Join this room before playing" };
    const currentPlayerId = activePlayerId(room.state);
    const hostOnly = [
      "pause",
      "resume",
      "end",
      "correct",
      "skip",
      "advance",
    ].includes(action.type);
    const actionPlayerId =
      "playerId" in action ? action.playerId : currentPlayerId;
    const controlsCurrentPlayer = actor.id === actionPlayerId;
    if (!actor.isHost && (hostOnly || !controlsCurrentPlayer)) {
      return { ok: false, error: "You cannot control this turn" };
    }

    const result = applyAction(room.state, action);
    if (!result.ok) return { ok: false, error: result.error };

    const isComplete =
      result.state.status === "complete" || result.state.phase === "complete";

    const { data: written, error: updateError } = await supabase
      .from("game_rooms")
      .update({
        state: result.state,
        ...(isComplete ? { status: "complete" } : {}),
      })
      .eq("code", code)
      .eq("updated_at", room.updated_at) // only write if nobody else has written since our read
      .select("code");

    if (updateError) return { ok: false, error: updateError.message };
    if (written && written.length > 0) return { ok: true };
    // 0 rows updated = concurrent write beat us; retry with fresh state
  }

  return { ok: false, error: "Could not apply action — please try again" };
}
