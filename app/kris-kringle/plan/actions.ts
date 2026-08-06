"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/sender";
import { secretSantaEmail } from "@/lib/email/templates";
import { createRoom } from "@/app/kris-kringle/room/actions";
import { randomUUID } from "crypto";
import type { WishListItem } from "@/lib/email/templates";

export interface ExchangeRules {
  maxSteals: number;
  allowImmediateStealback: boolean;
  firstPlayerFinalTurn: boolean;
}

export interface Exchange {
  id: string;
  host_email: string;
  host_name: string;
  name: string;
  party_date: string | null;
  budget_cents: number | null;
  rules: ExchangeRules;
  status: "planning" | "active" | "complete";
  secret_santa_drawn: boolean;
  created_at: string;
  updated_at: string;
  participants: Participant[];
}

export interface Participant {
  id: string;
  exchange_id: string;
  name: string;
  email: string;
  wish_list: WishListItem[];
  secret_santa_for: string | null;
  joined_at: string;
}

export async function createExchange(
  hostName: string,
  hostEmail: string,
  name: string,
  partyDate?: string,
  budgetCents?: number,
  rules?: Partial<ExchangeRules>,
): Promise<{ id: string }> {
  const supabase = await createSupabaseServerClient();

  const finalRules: ExchangeRules = {
    maxSteals: rules?.maxSteals ?? 3,
    allowImmediateStealback: rules?.allowImmediateStealback ?? false,
    firstPlayerFinalTurn: rules?.firstPlayerFinalTurn ?? true,
  };

  const { data: exchange, error } = await supabase
    .from("gift_exchanges")
    .insert({
      host_name: hostName.trim(),
      host_email: hostEmail.trim().toLowerCase(),
      name: name.trim(),
      party_date: partyDate || null,
      budget_cents: budgetCents ?? null,
      rules: finalRules,
    })
    .select("id")
    .single();

  if (error || !exchange) throw new Error(error?.message ?? "Could not create exchange");

  await supabase.from("exchange_participants").insert({
    exchange_id: exchange.id,
    name: hostName.trim(),
    email: hostEmail.trim().toLowerCase(),
    wish_list: [],
  });

  return { id: exchange.id };
}

export async function getExchange(id: string): Promise<Exchange | null> {
  const supabase = await createSupabaseServerClient();

  const { data: exchange, error } = await supabase
    .from("gift_exchanges")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !exchange) return null;

  const { data: participants } = await supabase
    .from("exchange_participants")
    .select("*")
    .eq("exchange_id", id)
    .order("joined_at", { ascending: true });

  return {
    ...exchange,
    rules: exchange.rules as ExchangeRules,
    participants: (participants ?? []) as Participant[],
  };
}

export async function joinExchange(
  exchangeId: string,
  name: string,
  email: string,
): Promise<{ ok: true; participantId: string } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();

  const { data: exchange } = await supabase
    .from("gift_exchanges")
    .select("id, name, status")
    .eq("id", exchangeId)
    .single();

  if (!exchange) return { ok: false, error: "Exchange not found" };
  if (exchange.status === "complete") return { ok: false, error: "This exchange is complete" };

  const { data: existing } = await supabase
    .from("exchange_participants")
    .select("id")
    .eq("exchange_id", exchangeId)
    .eq("email", email.trim().toLowerCase())
    .single();

  if (existing) return { ok: true, participantId: existing.id };

  const participantId = randomUUID();
  const { error } = await supabase.from("exchange_participants").insert({
    id: participantId,
    exchange_id: exchangeId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    wish_list: [],
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Name or email already taken in this exchange" };
    return { ok: false, error: "Could not join — please try again" };
  }

  return { ok: true, participantId };
}

export async function updateWishList(
  participantId: string,
  exchangeId: string,
  items: WishListItem[],
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("exchange_participants")
    .update({ wish_list: items })
    .eq("id", participantId)
    .eq("exchange_id", exchangeId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function drawSecretSanta(
  exchangeId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { data: exchange } = await supabase
    .from("gift_exchanges")
    .select("*, participants:exchange_participants(*)")
    .eq("id", exchangeId)
    .single();

  if (!exchange) return { ok: false, error: "Exchange not found" };
  if (exchange.secret_santa_drawn) return { ok: false, error: "Already drawn" };

  const { data: participants } = await supabase
    .from("exchange_participants")
    .select("*")
    .eq("exchange_id", exchangeId)
    .order("joined_at", { ascending: true });

  if (!participants || participants.length < 2) {
    return { ok: false, error: "Need at least 2 participants" };
  }

  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  const updates = shuffled.map((p, i) => ({
    id: p.id,
    secret_santa_for: shuffled[(i + 1) % shuffled.length]!.id,
  }));

  for (const update of updates) {
    await supabase
      .from("exchange_participants")
      .update({ secret_santa_for: update.secret_santa_for })
      .eq("id", update.id);
  }

  await supabase
    .from("gift_exchanges")
    .update({ secret_santa_drawn: true })
    .eq("id", exchangeId);

  const rules = exchange.rules as ExchangeRules;
  const budgetStr = exchange.budget_cents
    ? `$${(exchange.budget_cents / 100).toFixed(0)}`
    : undefined;
  const partyDateStr = exchange.party_date
    ? new Date(exchange.party_date).toLocaleDateString("en-CA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : undefined;

  const participantMap = new Map(shuffled.map((p) => [p.id, p]));

  for (const update of updates) {
    const giver = participantMap.get(update.id);
    const giftee = participantMap.get(update.secret_santa_for);
    if (!giver || !giftee) continue;

    await sendEmail({
      to: { email: giver.email, name: giver.name },
      subject: `🎅 Your Secret Santa assignment for ${exchange.name}`,
      html: secretSantaEmail({
        recipientName: giver.name,
        gifteeName: giftee.name,
        wishList: (giftee.wish_list ?? []) as WishListItem[],
        budget: budgetStr,
        partyDate: partyDateStr,
      }),
    });
  }

  return { ok: true };
}

export async function launchGame(
  exchangeId: string,
): Promise<{ code: string } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();

  const { data: exchange } = await supabase
    .from("gift_exchanges")
    .select("host_name, host_email, rules")
    .eq("id", exchangeId)
    .single();

  if (!exchange) return { ok: false, error: "Exchange not found" };

  const rules = exchange.rules as ExchangeRules;
  const presetName =
    rules.maxSteals === 3 && !rules.allowImmediateStealback && rules.firstPlayerFinalTurn
      ? "classic"
      : rules.maxSteals === 2 && !rules.allowImmediateStealback && !rules.firstPlayerFinalTurn
        ? "friendly"
        : rules.maxSteals === 5 && rules.allowImmediateStealback && rules.firstPlayerFinalTurn
          ? "chaos"
          : "classic";

  const { data: participants } = await supabase
    .from("exchange_participants")
    .select("id, name, email")
    .eq("exchange_id", exchangeId)
    .order("joined_at", { ascending: true });

  if (!participants || participants.length < 2) {
    return { ok: false, error: "Need at least 2 participants" };
  }

  const { code } = await createRoom(
    exchange.host_name,
    presetName,
    exchange.host_email,
  );

  const { createSupabaseServerClient: mkClient } = await import("@/lib/supabase/server");
  const sb2 = await mkClient();

  const { data: room } = await sb2
    .from("game_rooms")
    .select("players")
    .eq("code", code)
    .single();

  const hostPlayer = (room?.players as Array<{ id: string; name: string; isHost: boolean }>)?.[0];
  if (!hostPlayer) return { ok: false, error: "Room creation failed" };

  const extraPlayers = participants
    .filter((p) => p.name.toLowerCase() !== exchange.host_name.toLowerCase())
    .map((p) => ({ id: p.id, name: p.name, isHost: false }));

  if (extraPlayers.length > 0) {
    await sb2
      .from("game_rooms")
      .update({ players: [hostPlayer, ...extraPlayers] })
      .eq("code", code);
  }

  await supabase.from("gift_exchanges").update({ status: "active" }).eq("id", exchangeId);

  return { code };
}
