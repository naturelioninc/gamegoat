"use server";

import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function resolveRoomCode(code: string): Promise<{ ok: true; href: string } | { ok: false; error: string }> {
  const cleaned = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length !== 6) return { ok: false, error: "Room codes are 6 characters." };
  const { data } = await createSupabaseServiceClient().from("game_rooms").select("game_type, expires_at").eq("code", cleaned).maybeSingle();
  if (!data || new Date(data.expires_at).getTime() <= Date.now()) return { ok: false, error: "That room was not found or has expired." };
  return { ok: true, href: data.game_type === "secret_santa" ? `/secret-santa/room/${cleaned}` : `/kris-kringle/room/${cleaned}` };
}
