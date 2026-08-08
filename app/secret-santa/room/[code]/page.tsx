import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SecretSantaRoomClient } from "./SecretSantaRoomClient";

export const metadata = { title: "Secret Santa Room" };

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("game_rooms").select("*").eq("code", code.toUpperCase()).eq("game_type", "secret_santa").gt("expires_at", new Date().toISOString()).single();
  if (!data) notFound();
  return <main className="mx-auto max-w-2xl px-4 py-6 sm:py-12"><SecretSantaRoomClient initialRoom={data} /></main>;
}
