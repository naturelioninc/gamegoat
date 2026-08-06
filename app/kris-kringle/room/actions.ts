"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createInitialState, applyAction } from "@/lib/engine/engine";
import { RULE_PRESETS } from "@/lib/engine/types";
import type { GameActionInput } from "@/lib/engine/types";
import { randomUUID } from "crypto";

export async function createRoom(
  hostName: string,
): Promise<{ code: string; playerId: string }> {
  const supabase = await createSupabaseServerClient();
  const playerId = randomUUID();

  const { data, error } = await supabase
    .from("game_rooms")
    .insert({
      game_type: "kris_kringle",
      players: [{ id: playerId, name: hostName.trim(), isHost: true }],
      status: "lobby",
    })
    .select("code")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Could not create room");
  return { code: data.code, playerId };
}

export async function joinRoom(
  code: string,
  playerName: string,
): Promise<{ ok: true; playerId: string } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();

  const { data: room, error } = await supabase
    .from("game_rooms")
    .select("players, status")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !room) return { ok: false, error: "Room not found" };
  if (room.status !== "lobby") return { ok: false, error: "Game already started" };

  const players = (room.players as { id: string; name: string }[]) ?? [];
  const trimmed = playerName.trim();
  if (!trimmed) return { ok: false, error: "Name required" };
  if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase()))
    return { ok: false, error: "Name already taken in this room" };

  const playerId = randomUUID();
  const newPlayers = [...players, { id: playerId, name: trimmed, isHost: false }];

  const { error: updateError } = await supabase
    .from("game_rooms")
    .update({ players: newPlayers })
    .eq("code", code.toUpperCase());

  if (updateError) return { ok: false, error: "Could not join room" };
  return { ok: true, playerId };
}

export async function startGame(code: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { data: room, error } = await supabase
    .from("game_rooms")
    .select("players, rules, status")
    .eq("code", code)
    .single();

  if (error || !room) return { ok: false, error: "Room not found" };
  if (room.status !== "lobby") return { ok: false, error: "Game already started" };

  const players = (room.players as { id: string; name: string }[]) ?? [];
  if (players.length < 2) return { ok: false, error: "Need at least 2 players" };

  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const gifts = shuffled.map((_, i) => ({ id: `gift-${i}`, giftNumber: i + 1 }));
  const rules = (room.rules as typeof RULE_PRESETS.classic) ?? RULE_PRESETS.classic;

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

export async function performRoomAction(
  code: string,
  action: GameActionInput,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { data: room, error } = await supabase
    .from("game_rooms")
    .select("state")
    .eq("code", code)
    .single();

  if (error || !room?.state) return { ok: false, error: "Room not found" };

  const result = applyAction(room.state, action);
  if (!result.ok) return { ok: false, error: result.error };

  const isComplete =
    result.state.status === "complete" || result.state.phase === "complete";

  const { error: updateError } = await supabase
    .from("game_rooms")
    .update({ state: result.state, ...(isComplete ? { status: "complete" } : {}) })
    .eq("code", code);

  if (updateError) return { ok: false, error: updateError.message };
  return { ok: true };
}
