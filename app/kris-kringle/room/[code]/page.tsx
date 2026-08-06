import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { RoomClient } from "./RoomClient";

export const metadata: Metadata = {
  title: "Kris Kringle Room",
};

export default async function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: room } = await supabase
    .from("game_rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (!room) notFound();

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <RoomClient initialRoom={room} />
    </main>
  );
}
