"use server";

import { createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type AccountGame = {
  code: string;
  gameType: "kris_kringle" | "secret_santa";
  status: "lobby" | "active" | "complete" | "expired";
  role: "host" | "participant";
  playerCount: number;
  playerName: string;
  lastActiveAt: string;
};

export async function getAccountGames(): Promise<{ signedIn: boolean; games: AccountGame[] }> {
  const auth = await createSupabaseServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { signedIn: false, games: [] };
  const service = createSupabaseServiceClient();
  const { data: memberships } = await service.from("game_room_memberships")
    .select("room_id, player_id, role, last_active_at").eq("auth_user_id", user.id).is("archived_at", null);
  const roomIds = [...new Set((memberships ?? []).map((item) => item.room_id))];
  if (!roomIds.length) return { signedIn: true, games: [] };
  const { data: rooms } = await service.from("game_rooms")
    .select("id, code, game_type, status, players, expires_at, last_active_at").in("id", roomIds);
  const membershipByRoom = new Map((memberships ?? []).map((item) => [item.room_id, item]));
  const now = Date.now();
  return { signedIn: true, games: (rooms ?? []).map((room) => {
    const membership = membershipByRoom.get(room.id)!;
    const player = (room.players as Array<{ id: string; name: string }>).find((item) => item.id === membership.player_id);
    return {
      code: room.code,
      gameType: room.game_type as AccountGame["gameType"],
      status: new Date(room.expires_at).getTime() <= now ? "expired" : room.status as AccountGame["status"],
      role: (membership.role === "host" || membership.role === "cohost" ? "host" : "participant") as AccountGame["role"],
      playerCount: Array.isArray(room.players) ? room.players.length : 0,
      playerName: player?.name ?? "Player",
      lastActiveAt: room.last_active_at ?? membership.last_active_at,
    };
  }).sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt)) };
}

export async function getWishlistSummary() {
  const auth = await createSupabaseServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { signedIn: false, count: 0 };
  const service = createSupabaseServiceClient();
  const [{ count: textCount }, { count: heartCount }] = await Promise.all([
    service.from("user_wishlist_items").select("id", { count: "exact", head: true }).eq("auth_user_id", user.id),
    service.from("gift_preferences").select("product_slug", { count: "exact", head: true }).eq("auth_user_id", user.id).eq("preference", "love"),
  ]);
  return { signedIn: true, count: (textCount ?? 0) + (heartCount ?? 0) };
}

type Claim = { code: string; playerId: string; playerToken: string };

export async function claimDeviceGames(claims: Claim[]) {
  const auth = await createSupabaseServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { ok: false as const, error: "Sign in to sync games" };
  const service = createSupabaseServiceClient();
  let claimed = 0;
  const conflicts: string[] = [];
  for (const claim of claims.slice(0, 30)) {
    if (!/^[A-Z0-9]{6}$/.test(claim.code) || !claim.playerId || !claim.playerToken) continue;
    const tokenHash = createHash("sha256").update(claim.playerToken).digest("hex");
    const { data: room } = await service.from("game_rooms").select("id, players").eq("code", claim.code).maybeSingle();
    if (!room) continue;
    const { data: session } = await service.from("game_room_player_sessions").select("id").eq("room_id", room.id).eq("player_id", claim.playerId).eq("token_hash", tokenHash).maybeSingle();
    if (!session) continue;
    const { data: membership } = await service.from("game_room_memberships").select("auth_user_id").eq("room_id", room.id).eq("player_id", claim.playerId).maybeSingle();
    if (membership?.auth_user_id && membership.auth_user_id !== user.id) { conflicts.push(claim.code); continue; }
    const player = (room.players as Array<{ id: string; isHost?: boolean; isManual?: boolean }>).find((item) => item.id === claim.playerId);
    if (!player || player.isManual) continue;
    const { error } = await service.from("game_room_memberships").upsert({ room_id: room.id, player_id: claim.playerId, auth_user_id: user.id, role: player.isHost ? "host" : "participant", is_manual: false, last_active_at: new Date().toISOString() }, { onConflict: "room_id,player_id" });
    if (!error) claimed += 1;
  }
  return { ok: true as const, claimed, conflicts };
}
