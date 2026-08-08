"use server";

import { createCipheriv, createDecipheriv, createHash, randomBytes, randomInt, randomUUID } from "crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const token = () => randomBytes(32).toString("base64url");
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const roomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(6), (byte) => chars[byte % chars.length]).join("");
};

function encryptionKey() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Server encryption is not configured");
  return createHash("sha256").update(secret).digest();
}

function encryptRecipient(recipientId: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(recipientId, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptRecipient(value: string) {
  const [iv, tag, encrypted] = value.split(".");
  if (!iv || !tag || !encrypted) throw new Error("Invalid assignment");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

async function validSession(roomId: string, playerId: string, playerToken: string) {
  if (!playerToken) return false;
  const { data } = await createSupabaseServiceClient().from("game_room_player_sessions")
    .select("player_id").eq("room_id", roomId).eq("player_id", playerId).eq("token_hash", hash(playerToken)).maybeSingle();
  return Boolean(data);
}

export async function createSecretSantaRoom(hostName: string) {
  const name = hostName.trim();
  if (!name) throw new Error("Host name required");
  const supabase = createSupabaseServiceClient();
  const playerId = randomUUID();
  const playerToken = token();
  const { data, error } = await supabase.from("game_rooms").insert({
    code: roomCode(),
    game_type: "secret_santa",
    rules: {},
    players: [{ id: playerId, name, isHost: true }],
    status: "lobby",
  }).select("id, code").single();
  if (error || !data) throw new Error(error?.message || "Could not create room");
  const { error: sessionError } = await supabase.from("game_room_player_sessions").insert({ room_id: data.id, player_id: playerId, token_hash: hash(playerToken) });
  if (sessionError) throw new Error("Could not secure host session");
  return { code: data.code, playerId, playerToken };
}

function shuffled<T>(items: T[]) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export async function drawSecretSantaRoom(code: string, actorId: string, playerToken: string) {
  const supabase = createSupabaseServiceClient();
  const { data: room } = await supabase.from("game_rooms").select("id, game_type, players, status").eq("code", code).single();
  if (!room || room.game_type !== "secret_santa") return { ok: false, error: "Room not found" };
  if (room.status !== "lobby") return { ok: false, error: "Names have already been drawn" };
  if (!(await validSession(room.id, actorId, playerToken))) return { ok: false, error: "Host session expired" };
  const players = room.players as Array<{ id: string; name: string; isHost?: boolean }>;
  if (!players.find((p) => p.id === actorId)?.isHost) return { ok: false, error: "Only the host can draw names" };
  if (players.length < 2) return { ok: false, error: "At least two people are required" };
  let recipients = shuffled(players.map((p) => p.id));
  while (recipients.some((id, i) => id === players[i]!.id)) {
    recipients = shuffled(players.map((p) => p.id));
  }
  const assignments = players.map((p, i) => ({ giverId: p.id, match: encryptRecipient(recipients[i]!) }));
  const { error } = await supabase.from("game_rooms").update({ status: "active", state: { drawn: true, assignments } }).eq("id", room.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getSecretSantaMatch(code: string, actorId: string, playerToken: string, targetId?: string) {
  const supabase = createSupabaseServiceClient();
  const { data: room } = await supabase.from("game_rooms").select("id, players, status, state").eq("code", code).single();
  if (!room || room.status !== "active") return { ok: false, error: "The draw is not ready" } as const;
  if (!(await validSession(room.id, actorId, playerToken))) return { ok: false, error: "Player session expired" } as const;
  const players = room.players as Array<{ id: string; name: string; isHost?: boolean; isManual?: boolean }>;
  const actor = players.find((p) => p.id === actorId);
  const giverId = targetId || actorId;
  const target = players.find((p) => p.id === giverId);
  if (giverId !== actorId && (!actor?.isHost || !target?.isManual)) return { ok: false, error: "That assignment is private" } as const;
  const assignment = (room.state as { assignments?: Array<{ giverId: string; match: string }> } | null)?.assignments?.find((a) => a.giverId === giverId);
  const recipientId = assignment ? decryptRecipient(assignment.match) : null;
  const recipient = players.find((p) => p.id === recipientId);
  return recipient ? { ok: true, recipientName: recipient.name, giverName: target?.name || "Player" } as const : { ok: false, error: "Assignment not found" } as const;
}
