"use server";

import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createInitialState,
  applyAction,
  currentPlayerId as activePlayerId,
} from "@/lib/engine/engine";
import { RULE_PRESETS } from "@/lib/engine/types";
import type { GameActionInput } from "@/lib/engine/types";
import { createHash, randomBytes, randomUUID } from "crypto";

function newPlayerToken() {
  return randomBytes(32).toString("base64url");
}

function hashPlayerToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function hasPlayerSession(roomId: string, playerId: string, playerToken: string) {
  if (!playerToken) return false;
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("game_room_player_sessions")
    .select("player_id")
    .eq("room_id", roomId)
    .eq("player_id", playerId)
    .eq("token_hash", hashPlayerToken(playerToken))
    .maybeSingle();
  return Boolean(data);
}

export async function createRoom(
  hostName: string,
  preset: string = "classic",
  hostEmail: string = "",
): Promise<{ code: string; playerId: string; playerToken: string }> {
  const supabase = createSupabaseServiceClient();
  const authClient = await createSupabaseServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  const playerId = randomUUID();
  const playerToken = newPlayerToken();
  const rules =
    RULE_PRESETS[preset as keyof typeof RULE_PRESETS] ?? RULE_PRESETS.classic;

  const { data, error } = await supabase
    .from("game_rooms")
    .insert({
      game_type: "kris_kringle",
      rules,
      players: [{ id: playerId, name: hostName.trim(), isHost: true }],
      host_email: hostEmail.trim().toLowerCase() || user?.email?.toLowerCase() || null,
      host_user_id: user?.id ?? null,
      status: "lobby",
    })
    .select("id, code")
    .single();

  if (error || !data)
    throw new Error(error?.message ?? "Could not create room");
  const { error: sessionError } = await supabase
    .from("game_room_player_sessions")
    .insert({ room_id: data.id, player_id: playerId, token_hash: hashPlayerToken(playerToken) });
  if (sessionError) throw new Error("Could not secure host session");
  return { code: data.code, playerId, playerToken };
}

export async function recoverHostSession(
  code: string,
): Promise<
  | { ok: true; playerId: string; playerName: string; playerToken: string }
  | { ok: false; error: string; signInUrl?: string }
> {
  const authClient = await createSupabaseServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  const returnUrl = `https://games.xmasgoat.com/kris-kringle/room/${code.toUpperCase()}`;
  if (!user) {
    return {
      ok: false,
      error: "Sign in with the host account to recover controls",
      signInUrl: `https://account.xmasgoat.com?next=${encodeURIComponent(returnUrl)}`,
    };
  }

  const supabase = createSupabaseServiceClient();
  const { data: room } = await supabase
    .from("game_rooms")
    .select("id, players, host_user_id, host_email")
    .eq("code", code.toUpperCase())
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!room) return { ok: false, error: "Room not found or expired" };

  const matchesAccount =
    room.host_user_id === user.id ||
    (!room.host_user_id && user.email && room.host_email === user.email.toLowerCase());
  if (!matchesAccount) {
    return { ok: false, error: "This account is not the host of this room" };
  }

  if (!room.host_user_id) {
    await supabase.from("game_rooms").update({ host_user_id: user.id }).eq("id", room.id);
  }
  const host = (room.players as Array<{ id: string; name: string; isHost?: boolean }>).find(
    (player) => player.isHost,
  );
  if (!host) return { ok: false, error: "This room has no host record" };

  const playerToken = newPlayerToken();
  const { error } = await supabase.from("game_room_player_sessions").insert({
    room_id: room.id,
    player_id: host.id,
    token_hash: hashPlayerToken(playerToken),
  });
  if (error) return { ok: false, error: "Could not restore host controls" };
  return { ok: true, playerId: host.id, playerName: host.name, playerToken };
}

export async function joinRoom(
  code: string,
  playerName: string,
): Promise<{ ok: true; playerId: string; playerToken: string } | { ok: false; error: string }> {
  const trimmed = playerName.trim();
  if (!trimmed) return { ok: false, error: "Name required" };
  const playerId = randomUUID();
  const playerToken = newPlayerToken();
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.rpc("join_game_room", {
    _code: code,
    _player_id: playerId,
    _player_name: trimmed,
    _token_hash: hashPlayerToken(playerToken),
  });
  if (error) return { ok: false, error: error.message.replace(/^.*?: /, "") };
  return { ok: true, playerId, playerToken };
}

export async function startGame(
  code: string,
  actorPlayerId: string,
  playerToken: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();

  const { data: room, error } = await supabase
    .from("game_rooms")
    .select("id, players, rules, status")
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !room) return { ok: false, error: "Room not found or expired" };
  if (room.status !== "lobby")
    return { ok: false, error: "Game already started" };
  if (!(await hasPlayerSession(room.id, actorPlayerId, playerToken)))
    return { ok: false, error: "Your player session is no longer valid" };

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
  playerToken: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();

  const { data: room, error } = await supabase
    .from("game_rooms")
    .select("id, players, status")
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !room) return { ok: false, error: "Room not found" };
  if (room.status !== "lobby")
    return { ok: false, error: "Game already started" };
  if (!(await hasPlayerSession(room.id, actorPlayerId, playerToken)))
    return { ok: false, error: "Your player session is no longer valid" };

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
  playerToken: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();

  // Optimistic locking: read updated_at, write only if it hasn't changed.
  // Retries up to 3 times on concurrent-write conflicts.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: room, error } = await supabase
      .from("game_rooms")
      .select("id, state, updated_at, players")
      .eq("code", code)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error || !room?.state)
      return { ok: false, error: "Room not found or expired" };
    if (!(await hasPlayerSession(room.id, actorPlayerId, playerToken)))
      return { ok: false, error: "Your player session is no longer valid" };

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
