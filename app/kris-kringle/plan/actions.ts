"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/sender";
import { secretSantaEmail } from "@/lib/email/templates";
import { createRoom } from "@/app/kris-kringle/room/actions";
import { draw } from "@/lib/matching/draw";
import { createHash, randomBytes, randomUUID } from "crypto";
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

export type PublicExchange = Pick<
  Exchange,
  "id" | "host_name" | "name" | "party_date" | "budget_cents" | "status"
>;

function hashAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function getAuthenticatedUser() {
  const authClient = await createSupabaseServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  return user;
}

async function hostOwnsExchange(exchangeId: string) {
  const user = await getAuthenticatedUser();
  if (!user) return false;
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("gift_exchanges")
    .select("id, user_id, host_email")
    .eq("id", exchangeId)
    .maybeSingle();
  if (!data) return false;
  if (data.user_id === user.id) return true;
  if (!data.user_id && user.email && data.host_email === user.email.toLowerCase()) {
    const { data: claimed } = await supabase
      .from("gift_exchanges")
      .update({ user_id: user.id })
      .eq("id", exchangeId)
      .is("user_id", null)
      .select("id")
      .maybeSingle();
    return Boolean(claimed);
  }
  return false;
}

export async function createExchange(
  hostName: string,
  hostEmail: string,
  name: string,
  partyDate?: string,
  budgetCents?: number,
  rules?: Partial<ExchangeRules>,
): Promise<{ id: string }> {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Sign in to create a planned exchange");
  const supabase = createSupabaseServiceClient();

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
      user_id: user.id,
    })
    .select("id")
    .single();

  if (error || !exchange)
    throw new Error(error?.message ?? "Could not create exchange");

  await supabase.from("exchange_participants").insert({
    exchange_id: exchange.id,
    name: hostName.trim(),
    email: hostEmail.trim().toLowerCase(),
    wish_list: [],
  });

  return { id: exchange.id };
}

export async function getExchange(id: string): Promise<Exchange | null> {
  if (!(await hostOwnsExchange(id))) return null;
  const supabase = createSupabaseServiceClient();

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

export async function getPublicExchange(id: string): Promise<PublicExchange | null> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from("gift_exchanges")
    .select("id, host_name, name, party_date, budget_cents, status")
    .eq("id", id)
    .maybeSingle();
  return data as PublicExchange | null;
}

export async function getParticipantExchange(
  exchangeId: string,
  accessToken: string,
): Promise<{ exchange: PublicExchange; participant: Omit<Participant, "email" | "secret_santa_for"> } | null> {
  if (!accessToken) return null;
  const supabase = createSupabaseServiceClient();
  const { data: participant } = await supabase
    .from("exchange_participants")
    .select("id, exchange_id, name, wish_list, joined_at")
    .eq("exchange_id", exchangeId)
    .eq("access_token_hash", hashAccessToken(accessToken))
    .maybeSingle();
  if (!participant) return null;
  const exchange = await getPublicExchange(exchangeId);
  if (!exchange) return null;
  return { exchange, participant: participant as Omit<Participant, "email" | "secret_santa_for"> };
}

export async function joinExchange(
  exchangeId: string,
  name: string,
  email: string,
): Promise<{ ok: true; accessToken: string } | { ok: false; error: string }> {
  const supabase = createSupabaseServiceClient();
  const accessToken = randomBytes(32).toString("base64url");

  const { data: exchange } = await supabase
    .from("gift_exchanges")
    .select("id, name, status")
    .eq("id", exchangeId)
    .single();

  if (!exchange) return { ok: false, error: "Exchange not found" };
  if (exchange.status === "complete")
    return { ok: false, error: "This exchange is complete" };

  const { data: existing } = await supabase
    .from("exchange_participants")
    .select("id")
    .eq("exchange_id", exchangeId)
    .eq("email", email.trim().toLowerCase())
    .single();

  if (existing) {
    const { error } = await supabase
      .from("exchange_participants")
      .update({ access_token_hash: hashAccessToken(accessToken) })
      .eq("id", existing.id)
      .eq("exchange_id", exchangeId);
    if (error) return { ok: false, error: "Could not open your wish list" };
    return { ok: true, accessToken };
  }

  const participantId = randomUUID();
  const { error } = await supabase.from("exchange_participants").insert({
    id: participantId,
    exchange_id: exchangeId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    wish_list: [],
    access_token_hash: hashAccessToken(accessToken),
  });

  if (error) {
    if (error.code === "23505") {
      if (error.message.includes("_name")) {
        const firstName = name.trim().split(" ")[0];
        const suggestion =
          `${firstName} ${name.trim().split(" ").slice(1)[0]?.[0] ?? ""}`.trim();
        return {
          ok: false,
          error: `There's already a "${name.trim()}" in this exchange. Try adding an initial or nickname — e.g. "${suggestion}." or "${firstName} (nickname)".`,
        };
      }
      return {
        ok: false,
        error:
          "That email is already registered. Check your inbox for the original invite link.",
      };
    }
    return { ok: false, error: "Could not join — please try again" };
  }

  return { ok: true, accessToken };
}

export async function updateWishList(
  exchangeId: string,
  accessToken: string,
  items: WishListItem[],
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("exchange_participants")
    .update({ wish_list: items })
    .eq("exchange_id", exchangeId)
    .eq("access_token_hash", hashAccessToken(accessToken))
    .select("id")
    .maybeSingle();

  if (error || !data) return { ok: false, error: "Your private wish-list link is invalid or expired" };
  return { ok: true };
}

export async function drawSecretSanta(
  exchangeId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createSupabaseServiceClient();
  if (!(await hostOwnsExchange(exchangeId))) return { ok: false, error: "Host access required" };

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

  const drawResult = draw(participants.map((participant) => participant.id));
  if (!drawResult.ok) return { ok: false, error: drawResult.reason };
  const updates = drawResult.assignments.map((assignment) => ({
    id: assignment.giverId,
    secret_santa_for: assignment.recipientId,
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

  const participantMap = new Map(participants.map((p) => [p.id, p]));

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
): Promise<{ code: string; playerId: string; playerToken: string; playerName: string } | { ok: false; error: string }> {
  const supabase = createSupabaseServiceClient();
  if (!(await hostOwnsExchange(exchangeId))) return { ok: false, error: "Host access required" };

  const { data: exchange } = await supabase
    .from("gift_exchanges")
    .select("host_name, host_email, rules")
    .eq("id", exchangeId)
    .single();

  if (!exchange) return { ok: false, error: "Exchange not found" };

  const rules = exchange.rules as ExchangeRules;
  const presetName =
    rules.maxSteals === 3 &&
    !rules.allowImmediateStealback &&
    rules.firstPlayerFinalTurn
      ? "classic"
      : rules.maxSteals === 2 &&
          !rules.allowImmediateStealback &&
          !rules.firstPlayerFinalTurn
        ? "friendly"
        : rules.maxSteals === 5 &&
            rules.allowImmediateStealback &&
            rules.firstPlayerFinalTurn
          ? "chaos"
          : "classic";

  const { data: participants } = await supabase
    .from("exchange_participants")
    .select("id, name, email, wish_list")
    .eq("exchange_id", exchangeId)
    .order("joined_at", { ascending: true });

  if (!participants || participants.length < 2) {
    return { ok: false, error: "Need at least 2 participants" };
  }

  const { code, playerId, playerToken } = await createRoom(
    exchange.host_name,
    presetName,
    exchange.host_email,
  );

  const sb2 = createSupabaseServiceClient();

  const { data: room } = await sb2
    .from("game_rooms")
    .select("players")
    .eq("code", code)
    .single();

  const hostPlayer = (
    room?.players as Array<{ id: string; name: string; isHost: boolean }>
  )?.[0];
  if (!hostPlayer) return { ok: false, error: "Room creation failed" };

  const hostParticipant = participants.find(
    (p) => p.name.toLowerCase() === exchange.host_name.toLowerCase(),
  );
  const hostPlayerFull = {
    ...hostPlayer,
    wishList: hostParticipant?.wish_list ?? [],
  };

  const extraPlayers = participants
    .filter((p) => p.name.toLowerCase() !== exchange.host_name.toLowerCase())
    .map((p) => ({
      id: p.id,
      name: p.name,
      isHost: false,
      wishList: p.wish_list ?? [],
    }));

  await sb2
    .from("game_rooms")
    .update({ players: [hostPlayerFull, ...extraPlayers] })
    .eq("code", code);

  await supabase
    .from("gift_exchanges")
    .update({ status: "active" })
    .eq("id", exchangeId);

  return { code, playerId, playerToken, playerName: exchange.host_name };
}
