import "server-only";

import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function upsertRoomMembership(input: {
  roomId: string;
  playerId: string;
  authUserId?: string | null;
  role: "host" | "cohost" | "participant";
  isManual?: boolean;
}) {
  const service = createSupabaseServiceClient();
  const { error } = await service.from("game_room_memberships").upsert({
    room_id: input.roomId,
    player_id: input.playerId,
    auth_user_id: input.authUserId ?? null,
    role: input.role,
    is_manual: input.isManual ?? false,
    last_active_at: new Date().toISOString(),
  }, { onConflict: "room_id,player_id" });
  if (error) throw new Error(`Could not save game membership: ${error.message}`);
}
