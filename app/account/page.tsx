import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AccountPanel } from "./AccountPanel";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("https://account.xmasgoat.com?next=https://games.xmasgoat.com/account");

  const supabase = await createSupabaseServerClient();

  // Fetch exchanges owned by this user_id, plus backfill any created by email before account existed
  const [{ data: byId }, { data: byEmail }] = await Promise.all([
    supabase
      .from("gift_exchanges")
      .select("id, name, party_date, status, secret_santa_drawn, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("gift_exchanges")
      .select("id, name, party_date, status, secret_santa_drawn, created_at")
      .eq("host_email", user.email!)
      .is("user_id", null)
      .order("created_at", { ascending: false }),
  ]);

  // Backfill user_id on unlinked exchanges that match by email
  if (byEmail && byEmail.length > 0) {
    const ids = byEmail.map((e) => e.id);
    await supabase.from("gift_exchanges").update({ user_id: user.id }).in("id", ids);
  }

  const exchanges = [...(byId ?? []), ...(byEmail ?? [])];

  return (
    <AccountPanel
      email={user.email ?? ""}
      exchanges={exchanges}
    />
  );
}
