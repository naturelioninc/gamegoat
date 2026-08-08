"use server";

import { createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

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
