"use server";

import { createDecipheriv, createHash } from "crypto";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import {
  aggregateAnonymousGroupSignals,
  signalWords,
} from "@/lib/gift-insights";

export type GiftSuggestion = {
  slug: string;
  title: string;
  hook: string;
  image: string;
  imageAlt: string;
  mainSiteUrl: string;
};
export type GiftInsights = {
  mode: "secret_santa" | "kris_kringle";
  recipientName?: string;
  wishes: string[];
  themes: Array<{ label: string; count: number }>;
  suggestions: GiftSuggestion[];
  contributingPlayers: number;
};

const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
function decryptRecipient(value: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Encryption unavailable");
  const [iv, tag, encrypted] = value.split(".");
  if (!iv || !tag || !encrypted) throw new Error("Invalid assignment");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    createHash("sha256").update(secret).digest(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

async function suggestions(keywords: string[], preferredSlugs: string[]) {
  try {
    const response = await fetch(
      "https://xmasgoat.com/api/game-gift-suggestions",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          keywords: keywords.slice(0, 24),
          preferredSlugs: preferredSlugs.slice(0, 24),
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) return [];
    const data = (await response.json()) as { suggestions?: GiftSuggestion[] };
    return (data.suggestions ?? [])
      .filter((item) =>
        item.mainSiteUrl?.startsWith("https://xmasgoat.com/gifts/"),
      )
      .slice(0, 6);
  } catch {
    return [];
  }
}

export async function getGameGiftInsights(
  code: string,
  actorPlayerId: string,
  playerToken: string,
): Promise<
  { ok: true; insights: GiftInsights } | { ok: false; error: string }
> {
  if (!actorPlayerId || !playerToken)
    return { ok: false, error: "Join this game to see gift insights" };
  const service = createSupabaseServiceClient();
  const { data: room } = await service
    .from("game_rooms")
    .select("id, game_type, status, players, state")
    .eq("code", code.toUpperCase())
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!room) return { ok: false, error: "Room not found" };
  const { data: session } = await service
    .from("game_room_player_sessions")
    .select("id")
    .eq("room_id", room.id)
    .eq("player_id", actorPlayerId)
    .eq("token_hash", hash(playerToken))
    .maybeSingle();
  if (!session) return { ok: false, error: "Player session expired" };
  const players = room.players as Array<{ id: string; name: string }>;
  if (!players.some((player) => player.id === actorPlayerId))
    return { ok: false, error: "Join this game first" };

  const { data: memberships } = await service
    .from("game_room_memberships")
    .select("player_id, auth_user_id")
    .eq("room_id", room.id)
    .is("archived_at", null);
  const authByPlayer = new Map(
    (memberships ?? []).map((item) => [
      item.player_id,
      item.auth_user_id as string | null,
    ]),
  );

  if (room.game_type === "secret_santa") {
    if (room.status !== "active")
      return { ok: false, error: "Gift insights appear after names are drawn" };
    const assignment = (
      (
        room.state as {
          assignments?: Array<{ giverId: string; match: string }>;
        } | null
      )?.assignments ?? []
    ).find((item) => item.giverId === actorPlayerId);
    if (!assignment)
      return { ok: false, error: "Your assignment is not ready" };
    const recipientId = decryptRecipient(assignment.match);
    const recipient = players.find((player) => player.id === recipientId);
    const recipientUserId = authByPlayer.get(recipientId);
    if (!recipientUserId)
      return {
        ok: true,
        insights: {
          mode: "secret_santa",
          recipientName: recipient?.name ?? "Your person",
          wishes: [],
          themes: [],
          suggestions: [],
          contributingPlayers: 0,
        },
      };
    const [{ data: profile }, { data: items }, { data: hearts }] =
      await Promise.all([
        service
          .from("profiles")
          .select("wishlist_game_visibility")
          .eq("auth_user_id", recipientUserId)
          .maybeSingle(),
        service
          .from("user_wishlist_items")
          .select("item_text, notes")
          .eq("auth_user_id", recipientUserId)
          .is("purchased_at", null)
          .order("created_at", { ascending: false })
          .limit(20),
        service
          .from("gift_preferences")
          .select("product_slug")
          .eq("auth_user_id", recipientUserId)
          .eq("preference", "love")
          .limit(30),
      ]);
    if (profile?.wishlist_game_visibility === "private")
      return {
        ok: true,
        insights: {
          mode: "secret_santa",
          recipientName: recipient?.name ?? "Your person",
          wishes: [],
          themes: [],
          suggestions: [],
          contributingPlayers: 0,
        },
      };
    const wishes = (items ?? []).map((item) => item.item_text);
    const keywords = signalWords(
      (items ?? [])
        .map((item) => `${item.item_text} ${item.notes ?? ""}`)
        .join(" "),
    );
    const slugs = (hearts ?? []).map((item) => item.product_slug);
    return {
      ok: true,
      insights: {
        mode: "secret_santa",
        recipientName: recipient?.name ?? "Your person",
        wishes,
        themes: [],
        suggestions: await suggestions(keywords, slugs),
        contributingPlayers: wishes.length || slugs.length ? 1 : 0,
      },
    };
  }

  const userIds = [
    ...new Set(
      [...authByPlayer.values()].filter((id): id is string => Boolean(id)),
    ),
  ];
  if (!userIds.length)
    return {
      ok: true,
      insights: {
        mode: "kris_kringle",
        wishes: [],
        themes: [],
        suggestions: [],
        contributingPlayers: 0,
      },
    };
  const { data: visibleProfiles } = await service
    .from("profiles")
    .select("auth_user_id")
    .in("auth_user_id", userIds)
    .eq("wishlist_game_visibility", "assigned_and_group");
  const visibleIds = new Set(
    (visibleProfiles ?? []).map((item) => item.auth_user_id),
  );
  if (!visibleIds.size)
    return {
      ok: true,
      insights: {
        mode: "kris_kringle",
        wishes: [],
        themes: [],
        suggestions: [],
        contributingPlayers: 0,
      },
    };
  const ids = [...visibleIds];
  const [{ data: items }, { data: hearts }] = await Promise.all([
    service
      .from("user_wishlist_items")
      .select("auth_user_id, item_text, notes")
      .in("auth_user_id", ids)
      .is("purchased_at", null),
    service
      .from("gift_preferences")
      .select("auth_user_id, product_slug")
      .in("auth_user_id", ids)
      .eq("preference", "love"),
  ]);
  const aggregate = aggregateAnonymousGroupSignals(items ?? [], hearts ?? []);
  return {
    ok: true,
    insights: {
      mode: "kris_kringle",
      wishes: [],
      themes: aggregate.themes,
      suggestions: await suggestions(
        aggregate.themes.map((theme) => theme.label),
        aggregate.preferredSlugs,
      ),
      contributingPlayers: aggregate.contributingPlayers,
    },
  };
}
