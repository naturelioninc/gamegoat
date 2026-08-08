"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  currentPlayerId,
  eligibleSteals,
  unopenedGifts,
  isLocked,
  giftOwnedBy,
} from "@/lib/engine/engine";
import type { GameState, GameActionInput } from "@/lib/engine/types";
import { joinRoom, startGame, performRoomAction, recoverHostSession, addManualPlayers, updateLobby, replayRoom } from "../actions";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import { upsertGameHistory } from "@/lib/game-history";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WishListItem {
  label: string;
  url?: string;
  notes?: string;
}

interface RoomPlayer {
  id: string;
  name: string;
  isHost?: boolean;
  isManual?: boolean;
  wishList?: WishListItem[];
}

interface GameRoom {
  code: string;
  status: "lobby" | "active" | "complete" | "abandoned";
  players: RoomPlayer[];
  state: GameState | null;
  rules: Record<string, unknown>;
  lobby_locked?: boolean;
}

type ConnectionState = "connecting" | "connected" | "reconnecting" | "offline";

// ---------------------------------------------------------------------------
// Storage helpers (identify this device's player in the room)
// ---------------------------------------------------------------------------

function getStoredPlayer(
  code: string,
): { playerId: string; playerName: string; playerToken?: string } | null {
  try {
    const raw = localStorage.getItem(`kk_player_${code}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storePlayer(code: string, playerId: string, playerName: string, playerToken: string) {
  try {
    localStorage.setItem(
      `kk_player_${code}`,
      JSON.stringify({ playerId, playerName, playerToken }),
    );
  } catch {}
}

// ---------------------------------------------------------------------------
// Lobby view
// ---------------------------------------------------------------------------

function LobbyView({
  room,
  myPlayerId,
  onJoin,
  onStart,
  onAddManual,
  onLobbyChange,
}: {
  room: GameRoom;
  myPlayerId: string | null;
  onJoin: (name: string) => Promise<void>;
  onStart: () => Promise<void>;
  onAddManual: (name: string) => Promise<void>;
  onLobbyChange: (change: { type: "lock"; locked: boolean } | { type: "remove"; playerId: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [manualName, setManualName] = useState("");
  const [addingManual, setAddingManual] = useState(false);
  const [err, setErr] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const inviteUrl = `https://games.xmasgoat.com/kris-kringle/room/${room.code}`;

  const inviteText =
    `Join my Kris Kringle game right now! 🎁\n` +
    `Room code: ${room.code}\n` +
    `👉 ${inviteUrl}`;

  const mailtoHref =
    `mailto:?subject=${encodeURIComponent("Join my Kris Kringle game! 🎁")}` +
    `&body=${encodeURIComponent(inviteText)}`;

  function handleCopyLink() {
    navigator.clipboard
      ?.writeText(inviteUrl)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch(() => {});
  }

  function handleCopyMsg() {
    navigator.clipboard
      ?.writeText(inviteText)
      .then(() => {
        setCopiedMsg(true);
        setTimeout(() => setCopiedMsg(false), 2000);
      })
      .catch(() => {});
  }

  function handleShare() {
    if (navigator.share) {
      navigator
        .share({
          title: "Join my Kris Kringle game",
          text: inviteText,
          url: inviteUrl,
        })
        .catch(() => {});
    } else {
      handleCopyMsg();
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setJoining(true);
    setErr("");
    try {
      await onJoin(name.trim());
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not join");
    } finally {
      setJoining(false);
    }
  }

  async function handleStart() {
    setStarting(true);
    try {
      await onStart();
    } finally {
      setStarting(false);
    }
  }

  const isInRoom = myPlayerId && room.players.some((p) => p.id === myPlayerId);
  const isHost = Boolean(myPlayerId && room.players.some((p) => p.id === myPlayerId && p.isHost));
  const canStart = room.players.length >= 2;

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-3">
        <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">
          Online game
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">Kris Kringle</h1>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{room.players.length} here</span>
      </header>

      {/* Room code + QR + share */}
      <div className="rounded-2xl border-2 border-kringle-spruce bg-kringle-spruce/5 p-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-kringle-spruce">Invite code</p>
        <p className="font-mono text-4xl font-black tracking-[0.16em] text-kringle-spruce">
          {room.code}
        </p>

        {/* QR code */}
        {showQr && inviteUrl && (
          <div className="mt-3 flex justify-center">
            <div className="rounded-2xl bg-white p-3 shadow-sm">
              <QRCode
                value={inviteUrl}
                size={144}
                bgColor="#ffffff"
                fgColor="#1a5c3a"
              />
            </div>
          </div>
        )}
        <p className="mt-1 text-xs font-semibold text-kringle-spruce/70">Share once, then manage players below.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex min-h-10 items-center justify-center gap-1 rounded-xl bg-kringle-spruce px-2 text-xs font-black text-white"
          >
            Share
          </button>
          <button
            type="button"
            onClick={() => setShowQr((value) => !value)}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border-2 border-kringle-spruce px-2 text-xs font-black text-kringle-spruce"
          >
            {showQr ? "Hide QR" : "Show QR"}
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className={`inline-flex min-h-10 items-center justify-center rounded-xl border-2 px-2 text-xs font-black transition ${
              copiedLink
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-kringle-spruce text-kringle-spruce"
            }`}
          >
            {copiedLink ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      </div>

      {/* Player list */}
      <section className="space-y-3">
        <h2 className="text-lg font-black">
          Players <span className="text-sm text-slate-400">({room.players.length})</span>
        </h2>
        {room.players.length === 0 ? (
          <p className="text-sm text-slate-500">
            No one yet — share the room code!
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_4rem] gap-2 bg-slate-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-slate-500">
              <span>Player</span><span>Status</span><span>Role</span>
            </div>
            <ul className="divide-y divide-slate-100">
            {room.players.map((p) => (
              <li
                key={p.id}
                className={`grid min-w-0 grid-cols-[minmax(0,1fr)_4.5rem_4rem] items-center gap-2 px-3 py-2 text-xs font-semibold ${
                  p.id === myPlayerId
                    ? "bg-kringle-spruce/5"
                    : "bg-white"
                }`}
              >
                <span className="truncate font-black">{p.name}{p.id === myPlayerId ? " (you)" : ""}</span>
                <span className={`flex items-center gap-1 text-[10px] font-bold ${p.isManual ? "text-slate-400" : "text-emerald-700"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${p.isManual ? "bg-slate-300" : "bg-emerald-500"}`} />
                  {p.isManual ? "Added" : "Joined"}
                </span>
                <span className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-500"><span className="truncate">{p.isHost ? "Host" : p.isManual ? "Host phone" : "Own phone"}</span>{isHost && !p.isHost && <button type="button" aria-label={`Remove ${p.name}`} onClick={() => { if (window.confirm(`Remove ${p.name} from this lobby?`)) void onLobbyChange({ type: "remove", playerId: p.id }); }} className="min-h-7 min-w-7 rounded-lg text-red-600">×</button>}</span>
              </li>
            ))}
            </ul>
          </div>
        )}
        {isHost && (
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!manualName.trim()) return;
              setAddingManual(true);
              setErr("");
              try {
                await onAddManual(manualName.trim());
                setManualName("");
              } catch (e: unknown) {
                setErr(e instanceof Error ? e.message : "Could not add player");
              } finally {
                setAddingManual(false);
              }
            }}
          >
            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              maxLength={30}
              placeholder="Add someone without a phone"
              className="min-h-10 min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 text-sm font-semibold focus:border-kringle-spruce focus:outline-none"
            />
            <button disabled={!manualName.trim() || addingManual} className="min-h-10 shrink-0 rounded-xl border-2 border-kringle-spruce px-3 text-xs font-black text-kringle-spruce disabled:opacity-40">
              {addingManual ? "Adding…" : "+ Add"}
            </button>
          </form>
        )}
        {isHost && <button type="button" onClick={() => void onLobbyChange({ type: "lock", locked: !room.lobby_locked })} className="min-h-10 w-full rounded-xl border-2 border-slate-200 text-xs font-black text-slate-700">{room.lobby_locked ? "Open joining" : "Close joining"} · {room.lobby_locked ? "Locked" : "Anyone with the code can join"}</button>}
        {err && isHost && <p className="text-xs font-semibold text-red-600">{err}</p>}
      </section>

      {/* Join form (only shown if not yet in the room) */}
      {!isInRoom && (
        <form onSubmit={handleJoin} className="space-y-3">
          <h2 className="text-lg font-black">Join the game</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={30}
            className="min-h-12 w-full rounded-2xl border-2 border-slate-200 px-4 font-semibold focus:border-kringle-spruce focus:outline-none"
          />
          {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
          <button
            type="submit"
            disabled={!name.trim() || joining || room.lobby_locked}
            className="min-h-12 w-full rounded-2xl bg-kringle-cranberry font-bold text-white disabled:opacity-40"
          >
            {room.lobby_locked ? "Joining is closed" : joining ? "Joining…" : "Join game"}
          </button>
        </form>
      )}

      {/* Start game (shown when in room and enough players) */}
      {isHost && (
        <div className="sticky bottom-3 z-20 -mx-2 space-y-2 rounded-2xl bg-white/95 p-2 shadow-[0_-8px_24px_rgba(255,255,255,.95)] backdrop-blur">
          <button
            type="button"
            onClick={handleStart}
            disabled={!canStart || starting}
            className="min-h-14 w-full rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[4px_4px_0_rgba(0,0,0,0.15)] disabled:opacity-40"
          >
            {starting
              ? "Starting…"
              : canStart
                ? `Start game (${room.players.length} players)`
                : "Need at least 2 players"}
          </button>
          {!canStart && (
            <p className="text-center text-sm text-slate-500">
              Waiting for more players to join…
            </p>
          )}
        </div>
      )}
      {isInRoom && !isHost && (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600">
          You&apos;re connected. The host will start when everyone is ready.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Image compression helper
// ---------------------------------------------------------------------------

function compressImage(
  file: File,
  maxDim: number,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no ctx"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("compress failed"))),
        "image/jpeg",
        quality,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ---------------------------------------------------------------------------
// Photo capture + gallery — available to all devices in the room
// ---------------------------------------------------------------------------

function PhotoSection({
  roomCode,
  isComplete,
}: {
  roomCode: string;
  isComplete: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [myCount, setMyCount] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [copiedGallery, setCopiedGallery] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef(createSupabaseBrowserClient());

  function shareGallery() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/kris-kringle/gallery/${roomCode}`
        : "";
    if (navigator.share) {
      navigator
        .share({
          title: "Our Kris Kringle party photos 🎁",
          text: "Check out the photos from our party!",
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedGallery(true);
        setTimeout(() => setCopiedGallery(false), 2000);
      });
    }
  }

  async function loadPhotos() {
    setLoadingPhotos(true);
    try {
      const supabase = supabaseRef.current;
      const { data } = await supabase.storage
        .from("game-photos")
        .list(roomCode, {
          limit: 200,
          sortBy: { column: "created_at", order: "asc" },
        });
      if (!data) return;
      const urls = data
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map(
          (f) =>
            supabase.storage
              .from("game-photos")
              .getPublicUrl(`${roomCode}/${f.name}`).data.publicUrl,
        );
      setPhotos(urls);
    } finally {
      setLoadingPhotos(false);
    }
  }

  useEffect(() => {
    if (isComplete) loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await compressImage(file, 1600, 0.85);
      const path = `${roomCode}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const { error } = await supabaseRef.current.storage
        .from("game-photos")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (!error) {
        setMyCount((n) => n + 1);
        if (isComplete) await loadPhotos();
      }
    } catch {
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section className="space-y-3 border-t border-slate-100 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-500">
          {isComplete ? "📸 Party photos" : "📸 Capture the moment"}
        </h2>
        {myCount > 0 && (
          <span className="text-xs font-semibold text-slate-400">
            {myCount} from you
          </span>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-600 transition hover:border-kringle-spruce hover:text-kringle-spruce disabled:opacity-40"
      >
        {uploading ? "Uploading…" : "📸 Take a photo"}
      </button>

      {/* Gallery (shown when game is complete) */}
      {isComplete && (
        <>
          {photos.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5">
              {photos.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setFullscreen(url)}
                  className="aspect-square overflow-hidden rounded-xl border-2 border-slate-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Party photo"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-slate-400">
              No photos yet — tap the button to capture a moment!
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadPhotos}
              disabled={loadingPhotos}
              className="min-h-10 flex-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            >
              {loadingPhotos ? "Loading…" : "↺ Refresh"}
            </button>
            <button
              type="button"
              onClick={shareGallery}
              className={`min-h-10 flex-1 rounded-xl border-2 text-xs font-bold transition ${
                copiedGallery
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-kringle-spruce bg-kringle-spruce text-white"
              }`}
            >
              {copiedGallery ? "✓ Copied!" : "📤 Share gallery"}
            </button>
          </div>
        </>
      )}

      {/* Lightbox */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullscreen}
            alt="Party photo"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
          />
          <button
            type="button"
            onClick={() => setFullscreen(null)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-2xl leading-none text-white"
          >
            ×
          </button>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Spectator view — for non-host players who joined on their own phones
// ---------------------------------------------------------------------------

function SpectatorView({
  room,
  myPlayerId,
}: {
  room: GameRoom;
  myPlayerId: string | null;
}) {
  const state = room.state!;
  const players = room.players;
  const nameById = new Map(players.map((p) => [p.id, p.name]));

  const currentId = currentPlayerId(state);
  const isMyTurn = !!myPlayerId && currentId === myPlayerId;
  const steals = currentId ? eligibleSteals(state, currentId) : [];
  const unopened = unopenedGifts(state);
  const isComplete = state.status === "complete" || state.phase === "complete";
  const isFinalTurn = state.phase === "final_turn";
  const currentName = currentId ? nameById.get(currentId) : null;

  const myGift = myPlayerId ? giftOwnedBy(state, myPlayerId) : null;
  const hasAnyWishLists = players.some((p) => (p.wishList ?? []).length > 0);

  const [openWishList, setOpenWishList] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* YOUR TURN — big moment banner */}
      {isMyTurn && !isComplete && (
        <div className="rounded-2xl bg-kringle-cranberry p-5 text-white">
          <p className="text-center text-2xl font-black">
            🎙️ It&apos;s your turn!
          </p>
          <p className="mt-1 text-center text-sm font-semibold opacity-80">
            Tell the host what you want to do
          </p>

          <div className="mt-4 space-y-2">
            {!isFinalTurn && unopened.length > 0 && (
              <div className="rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold">
                🎁 Open Gift #{unopened[0]!.giftNumber}
              </div>
            )}
            {isFinalTurn && (
              <div className="rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold">
                ✋ Keep your gift (Gift #{myGift?.giftNumber})
              </div>
            )}
            {steals.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                  {isFinalTurn ? "Or swap:" : "Or steal:"}
                </p>
                {steals.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold"
                  >
                    🤜 Gift #{g.giftNumber} from {nameById.get(g.ownerId!)}
                  </div>
                ))}
              </div>
            )}
            {isFinalTurn &&
              state.gifts
                .filter(
                  (g) =>
                    g.ownerId !== null &&
                    g.ownerId !== myPlayerId &&
                    !isLocked(g, state.rules),
                )
                .map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold"
                  >
                    🔄 Swap with Gift #{g.giftNumber} from{" "}
                    {nameById.get(g.ownerId!)}
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* Status bar — when not my turn */}
      {!isMyTurn && !isComplete && (
        <div
          className={`rounded-2xl border-2 p-4 ${
            isFinalTurn
              ? "border-kringle-gold bg-amber-50"
              : "border-kringle-spruce bg-kringle-spruce/5"
          }`}
        >
          {isFinalTurn ? (
            <div className="text-amber-900">
              <p className="text-xs font-bold uppercase tracking-wide">
                Final turn
              </p>
              <p className="mt-0.5 text-xl font-black">
                {currentName} — keep or swap
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-kringle-spruce/60">
                Now playing
              </p>
              <p className="mt-0.5 text-xl font-black text-kringle-spruce">
                {currentName}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Game over */}
      {isComplete && (
        <div className="rounded-2xl border-2 border-kringle-gold bg-amber-50 p-4 text-center">
          <p className="text-xl font-black text-amber-900">🎉 Game over!</p>
        </div>
      )}

      {/* My gift chip */}
      {myGift && !isComplete && (
        <div className="flex items-center gap-2 rounded-xl bg-kringle-cranberry/10 px-3 py-2 text-sm font-bold text-kringle-cranberry">
          <span>🎁</span>
          <span>You have Gift #{myGift.giftNumber}</span>
        </div>
      )}

      {/* Gift board — read-only */}
      <section>
        <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
          Gifts
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {state.gifts.map((gift) => {
            const owner = gift.ownerId ? nameById.get(gift.ownerId) : null;
            const locked = isLocked(gift, state.rules);
            const isMyGift = gift.ownerId === myPlayerId;
            return (
              <div
                key={gift.id}
                className={`rounded-2xl border-2 p-3 text-sm ${
                  gift.ownerId === null
                    ? "border-slate-200 bg-slate-50 text-slate-400"
                    : isMyGift
                      ? "border-kringle-cranberry bg-red-50 text-slate-800"
                      : locked
                        ? "border-kringle-gold bg-amber-50 text-slate-800"
                        : "border-sky-200 bg-sky-50 text-slate-800"
                }`}
              >
                <p className="font-black">Gift #{gift.giftNumber}</p>
                {owner ? (
                  <>
                    <p className="mt-0.5 font-semibold">
                      {owner}
                      {isMyGift && " (you)"}
                    </p>
                    {gift.stealCount > 0 && (
                      <p className="text-xs text-slate-500">
                        {locked ? (
                          <span className="inline-flex items-center gap-1">
                            <GeneratedIcon
                              name="locked-gift"
                              className="h-4 w-4"
                            />{" "}
                            locked
                          </span>
                        ) : (
                          `Stolen ${gift.stealCount}×`
                        )}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-0.5 text-xs">Unopened</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Wish list browser */}
      {hasAnyWishLists && (
        <section>
          <h2 className="mb-1 text-sm font-black uppercase tracking-wide text-slate-500">
            Wish Lists
          </h2>
          <p className="mb-3 text-xs text-slate-400">
            Use these to decide who to steal from 😈
          </p>
          <div className="space-y-2">
            {players.map((p) => {
              const wl = p.wishList ?? [];
              if (wl.length === 0) return null;
              const isOpen = openWishList === p.id;
              const gift = giftOwnedBy(state, p.id);
              return (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-2xl border-2 border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenWishList(isOpen ? null : p.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black">{p.name}</span>
                      {p.id === myPlayerId && (
                        <span className="text-xs font-semibold text-slate-400">
                          (you)
                        </span>
                      )}
                      {gift && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                          Gift #{gift.giftNumber}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 py-3">
                      <ul className="space-y-2">
                        {wl.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="mt-0.5 text-slate-300">•</span>
                            <div className="flex-1">
                              <span className="font-semibold">
                                {item.label}
                              </span>
                              {item.notes && (
                                <p className="text-xs text-slate-500">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 text-xs font-bold text-kringle-spruce underline"
                              >
                                View →
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Final results */}
      {isComplete && (
        <section className="rounded-2xl border-2 border-kringle-gold bg-amber-50 p-5">
          <h2 className="text-lg font-black text-amber-900">Final results</h2>
          <ul className="mt-3 space-y-2">
            {players.map((p) => {
              const gift = giftOwnedBy(state, p.id);
              return (
                <li
                  key={p.id}
                  className={`flex items-center justify-between text-sm font-semibold ${
                    p.id === myPlayerId ? "text-kringle-cranberry" : ""
                  }`}
                >
                  <span>
                    {p.name}
                    {p.id === myPlayerId && " (you)"}
                  </span>
                  <span className="text-slate-600">
                    {gift ? `Gift #${gift.giftNumber}` : "No gift"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Photos */}
      <PhotoSection roomCode={room.code} isComplete={isComplete} />

      {/* Room code footer */}
      <p className="text-center text-xs font-semibold text-slate-400">
        Room {room.code}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live game board (host-only control panel)
// ---------------------------------------------------------------------------

function GameBoard({
  room,
  myPlayerId,
  onAction,
  onReplay,
}: {
  room: GameRoom;
  myPlayerId: string | null;
  onAction: (action: GameActionInput) => void;
  onReplay: () => Promise<void>;
}) {
  const state = room.state!;
  const players = room.players;
  const nameById = new Map(players.map((p) => [p.id, p.name]));

  const currentId = currentPlayerId(state);
  const currentName = currentId ? nameById.get(currentId) : null;
  const isMyTurn = !!myPlayerId && currentId === myPlayerId;
  // Host device can act for manually-added players (no phone of their own)
  const isHostDevice =
    !!myPlayerId && room.players.find((p) => p.id === myPlayerId)?.isHost;
  const currentPlayerIsManual =
    room.players.find((p) => p.id === currentId)?.isManual ?? false;
  const canAct = isMyTurn || (!!isHostDevice && currentPlayerIsManual);
  const steals = currentId ? eligibleSteals(state, currentId) : [];
  const unopened = unopenedGifts(state);
  const isComplete = state.status === "complete" || state.phase === "complete";
  const isPaused = state.status === "paused";
  const isFinalTurn = state.phase === "final_turn";

  const myGift = myPlayerId ? giftOwnedBy(state, myPlayerId) : null;

  function act(action: GameActionInput) {
    onAction(action);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-kringle-cranberry">
            Room {room.code}
          </p>
          {myGift && (
            <span className="rounded-full bg-kringle-gold/20 px-3 py-0.5 text-xs font-bold text-amber-800">
              You have Gift #{myGift.giftNumber}
            </span>
          )}
        </div>
      </header>

      {/* Status bar */}
      <div
        className={`rounded-2xl border-2 p-4 ${
          isComplete
            ? "border-kringle-gold bg-amber-50"
            : isPaused
              ? "border-slate-300 bg-slate-50"
              : isFinalTurn
                ? "border-kringle-gold bg-amber-50"
                : canAct
                  ? "border-kringle-cranberry bg-kringle-cranberry text-white"
                  : "border-kringle-spruce bg-kringle-spruce text-white"
        }`}
      >
        {isComplete ? (
          <p className="text-center text-xl font-black text-amber-900">
            Game over! See results below.
          </p>
        ) : isPaused ? (
          <div className="flex items-center justify-between">
            <p className="font-black text-slate-700">Game paused</p>
            <button
              type="button"
              onClick={() => act({ type: "resume" })}
              className="rounded-xl bg-kringle-spruce px-4 py-2 text-sm font-bold text-white"
            >
              Resume
            </button>
          </div>
        ) : isFinalTurn ? (
          <div className="text-amber-900">
            <p className="text-sm font-bold uppercase tracking-wide">
              Final turn
            </p>
            <p className="mt-1 text-xl font-black">
              {isMyTurn
                ? "Your final turn — keep or swap"
                : `${currentName} — final turn`}
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] opacity-70">
              Turn {state.turnsTaken + 1} of {players.length}
            </p>
            <p className="mt-1 text-xl font-black">
              {isMyTurn ? "Your turn!" : `${currentName}'s turn`}
            </p>
          </div>
        )}
      </div>

      {/* Actions — turn actions locked to current player; utility controls open to all */}
      {!isComplete && !isPaused && (
        <div className="space-y-3">
          {!canAct && !isFinalTurn && (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-500">
              Waiting for {currentName} to act…
            </p>
          )}
          {isFinalTurn ? (
            <>
              <button
                type="button"
                onClick={() => act({ type: "final_keep" })}
                disabled={!canAct}
                className={`min-h-12 w-full rounded-2xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${canAct ? "bg-kringle-spruce" : "bg-slate-400"}`}
              >
                {isMyTurn ? "Keep my gift" : `${currentName} — keep their gift`}
              </button>
              {state.gifts
                .filter(
                  (g) =>
                    g.ownerId !== null &&
                    g.ownerId !== currentId &&
                    !isLocked(g, state.rules),
                )
                .map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => act({ type: "final_swap", giftId: g.id })}
                    disabled={!canAct}
                    className={`min-h-12 w-full rounded-2xl border-2 font-bold disabled:cursor-not-allowed disabled:opacity-40 ${canAct ? "border-kringle-cranberry text-kringle-cranberry hover:bg-kringle-cranberry hover:text-white" : "border-slate-300 text-slate-500"}`}
                  >
                    Swap with {nameById.get(g.ownerId!)}&apos;s Gift #
                    {g.giftNumber}
                  </button>
                ))}
            </>
          ) : (
            <>
              {unopened.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    act({
                      type: "open",
                      playerId: currentId!,
                      giftId: unopened[0]!.id,
                    })
                  }
                  disabled={!canAct}
                  className={`min-h-14 w-full rounded-2xl text-lg font-black text-white shadow-[3px_3px_0_rgba(0,0,0,0.12)] disabled:cursor-not-allowed disabled:opacity-40 ${canAct ? "bg-kringle-cranberry" : "bg-slate-400"}`}
                >
                  {isMyTurn
                    ? `Open Gift #${unopened[0]!.giftNumber}`
                    : `${currentName} opens Gift #${unopened[0]!.giftNumber}`}
                </button>
              )}
              {steals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {canAct ? "Or steal" : "Or they steal"}
                  </p>
                  {steals.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() =>
                        act({
                          type: "steal",
                          playerId: currentId!,
                          giftId: g.id,
                        })
                      }
                      disabled={!canAct}
                      className={`min-h-12 w-full rounded-2xl border-2 font-bold disabled:cursor-not-allowed disabled:opacity-40 ${canAct ? "border-kringle-spruce text-kringle-spruce hover:bg-kringle-spruce hover:text-white" : "border-slate-300 text-slate-500"}`}
                    >
                      Steal Gift #{g.giftNumber} from {nameById.get(g.ownerId!)}
                    </button>
                  ))}
                </div>
              )}
              {isHostDevice && <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => act({ type: "pause" })}
                  className="min-h-10 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600"
                >
                  Pause
                </button>
                <button
                  type="button"
                  onClick={() => act({ type: "advance" })}
                  className="min-h-10 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600"
                >
                  Skip turn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("End the game now?")) act({ type: "end" });
                  }}
                  className="min-h-10 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600"
                >
                  End game
                </button>
              </div>}
            </>
          )}
        </div>
      )}

      {/* Gift grid */}
      <section>
        <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
          Gifts
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {state.gifts.map((gift) => {
            const owner = gift.ownerId ? nameById.get(gift.ownerId) : null;
            const locked = isLocked(gift, state.rules);
            const isMyGift = gift.ownerId === myPlayerId;
            return (
              <div
                key={gift.id}
                className={`rounded-2xl border-2 p-3 text-sm ${
                  gift.ownerId === null
                    ? "border-slate-200 bg-slate-50 text-slate-400"
                    : isMyGift
                      ? "border-kringle-cranberry bg-red-50 text-slate-800"
                      : locked
                        ? "border-kringle-gold bg-amber-50 text-slate-800"
                        : "border-sky-200 bg-sky-50 text-slate-800"
                }`}
              >
                <p className="font-black">Gift #{gift.giftNumber}</p>
                {owner ? (
                  <>
                    <p className="mt-0.5 font-semibold">{owner}</p>
                    {gift.stealCount > 0 && (
                      <p className="text-xs text-slate-500">
                        {locked ? (
                          <span className="inline-flex items-center gap-1">
                            <GeneratedIcon
                              name="locked-gift"
                              className="h-5 w-5"
                            />{" "}
                            locked
                          </span>
                        ) : (
                          `Stolen ${gift.stealCount}×`
                        )}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-0.5 text-xs">Unopened</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Results */}
      {isComplete && (
        <section className="rounded-2xl border-2 border-kringle-gold bg-amber-50 p-5">
          <h2 className="text-lg font-black text-amber-900">Final results</h2>
          <ul className="mt-3 space-y-2">
            {players.map((player) => {
              const gift = giftOwnedBy(state, player.id);
              return (
                <li
                  key={player.id}
                  className={`flex items-center justify-between text-sm font-semibold ${
                    player.id === myPlayerId ? "text-kringle-cranberry" : ""
                  }`}
                >
                  <span>
                    {player.name}
                    {player.id === myPlayerId && " (you)"}
                  </span>
                  <span className="text-slate-600">
                    {gift ? `Gift #${gift.giftNumber}` : "No gift"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {isComplete && isHostDevice && <button type="button" onClick={() => void onReplay()} className="min-h-12 w-full rounded-2xl bg-kringle-cranberry font-black text-white shadow-[3px_3px_0_#000]">Play again with these rules →</button>}

      {/* Photos */}
      <PhotoSection roomCode={room.code} isComplete={isComplete} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export function RoomClient({ initialRoom }: { initialRoom: GameRoom }) {
  const [room, setRoom] = useState<GameRoom>(initialRoom);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [myPlayerToken, setMyPlayerToken] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState("");
  const [recoveringHost, setRecoveringHost] = useState(false);
  // Keep the server and first browser render identical; the subscription effect
  // immediately resolves the real online/offline state after hydration.
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const supabaseRef = useRef(createSupabaseBrowserClient());

  // Load player identity from localStorage
  useEffect(() => {
    const stored = getStoredPlayer(room.code);
    if (stored) {
      setMyPlayerId(stored.playerId);
      setMyPlayerToken(stored.playerToken ?? null);
      if (!stored.playerToken) setSessionError("This room was created before secure reconnects were enabled. Rejoin with a new name if the game has not started.");
    }
  }, [room.code]);

  useEffect(() => {
    if (!myPlayerId || !myPlayerToken) return;
    const me = room.players.find((player) => player.id === myPlayerId);
    if (!me) return;
    const complete = room.status === "complete" || room.state?.status === "complete" || room.state?.phase === "complete";
    upsertGameHistory({
      code: room.code,
      gameType: "kris_kringle",
      playerId: myPlayerId,
      playerToken: myPlayerToken,
      playerName: me.name,
      role: me.isHost ? "host" : "participant",
      status: complete ? "complete" : room.status === "lobby" ? "lobby" : "active",
      playerCount: room.players.length,
      ...(complete ? { completedAt: new Date().toISOString() } : {}),
    });
  }, [room, myPlayerId, myPlayerToken]);

  // Subscribe to Realtime changes
  useEffect(() => {
    const supabase = supabaseRef.current;
    let active = true;

    async function refreshRoom() {
      if (!navigator.onLine) {
        if (active) setConnectionState("offline");
        return;
      }
      const { data } = await supabase
        .from("game_rooms")
        .select("*")
        .eq("code", room.code)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (active && data) setRoom(data as GameRoom);
    }

    function handleOnline() {
      setConnectionState("reconnecting");
      void refreshRoom();
    }

    function handleOffline() {
      setConnectionState("offline");
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        setConnectionState((current) => current === "offline" ? current : "reconnecting");
        void refreshRoom();
      }
    }

    const channel = supabase
      .channel(`room:${room.code}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `code=eq.${room.code}`,
        },
        (payload) => {
          setRoom(payload.new as GameRoom);
          setConnectionState("connected");
        },
      )
      .subscribe((status) => {
        if (!active) return;
        if (status === "SUBSCRIBED") {
          setConnectionState("connected");
          void refreshRoom();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionState(navigator.onLine ? "reconnecting" : "offline");
        } else if (status === "CLOSED") {
          setConnectionState(navigator.onLine ? "reconnecting" : "offline");
        }
      });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibility);
    const fallbackPoll = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshRoom();
    }, 15_000);

    return () => {
      active = false;
      window.clearInterval(fallbackPoll);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibility);
      supabase.removeChannel(channel);
    };
  }, [room.code]);

  async function handleJoin(playerName: string) {
    if (connectionState === "offline") throw new Error("You're offline — reconnect before joining");
    const result = await joinRoom(room.code, playerName);
    if (!result.ok) throw new Error(result.error);
    storePlayer(room.code, result.playerId, playerName, result.playerToken);
    upsertGameHistory({ code: room.code, gameType: "kris_kringle", playerId: result.playerId, playerToken: result.playerToken, playerName, role: "participant", status: "lobby", playerCount: room.players.length + 1 });
    setMyPlayerId(result.playerId);
    setMyPlayerToken(result.playerToken);
    setSessionError("");
  }

  async function handleStart() {
    if (connectionState === "offline") throw new Error("You're offline — reconnect before starting");
    if (!myPlayerId || !myPlayerToken) throw new Error("Join the room first");
    const result = await startGame(room.code, myPlayerId, myPlayerToken);
    if (!result.ok) throw new Error(result.error);
  }

  async function handleAddManual(playerName: string) {
    if (connectionState === "offline") throw new Error("You're offline — reconnect before adding players");
    if (!myPlayerId || !myPlayerToken) throw new Error("Host controls are required");
    const result = await addManualPlayers(room.code, [playerName], myPlayerId, myPlayerToken);
    if (!result.ok) throw new Error(result.error || "Could not add player");
  }

  async function handleLobbyChange(change: { type: "lock"; locked: boolean } | { type: "remove"; playerId: string }) {
    if (!myPlayerId || !myPlayerToken) throw new Error("Host controls are required");
    const result = await updateLobby(room.code, myPlayerId, myPlayerToken, change);
    if (!result.ok) setSessionError(result.error || "Could not update the lobby");
  }

  async function handleReplay() {
    if (!myPlayerId || !myPlayerToken) return;
    const result = await replayRoom(room.code, myPlayerId, myPlayerToken);
    if (!result.ok) { setSessionError(result.error); return; }
    storePlayer(result.code, result.playerId, room.players.find((player) => player.id === myPlayerId)?.name || "Host", result.playerToken);
    window.location.assign(`/kris-kringle/room/${result.code}`);
  }

  function handleAction(action: GameActionInput) {
    if (connectionState === "offline") {
      setSessionError("You're offline — reconnect before making a move");
      return;
    }
    if (!myPlayerId || !myPlayerToken) return;
    setSessionError("");
    performRoomAction(room.code, action, myPlayerId, myPlayerToken).then((result) => {
      if (!result.ok) setSessionError(result.error ?? "Could not update the game");
    }).catch(() => setSessionError("Connection interrupted — please try again"));
  }

  async function handleRecoverHost() {
    if (connectionState === "offline") {
      setSessionError("You're offline — reconnect before recovering controls");
      return;
    }
    setRecoveringHost(true);
    setSessionError("");
    try {
      const result = await recoverHostSession(room.code);
      if (!result.ok) {
        if (result.signInUrl) {
          window.location.assign(result.signInUrl);
          return;
        }
        setSessionError(result.error);
        return;
      }
      storePlayer(room.code, result.playerId, result.playerName, result.playerToken);
      setMyPlayerId(result.playerId);
      setMyPlayerToken(result.playerToken);
    } catch {
      setSessionError("Could not recover host controls — please try again");
    } finally {
      setRecoveringHost(false);
    }
  }

  const isHostDevice =
    !!myPlayerId && room.players.some((p) => p.id === myPlayerId && p.isHost);

  return (
    <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_#000] sm:p-8">
      <div className="mb-4 flex justify-end" aria-live="polite">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
            connectionState === "connected"
              ? "bg-emerald-50 text-emerald-700"
              : connectionState === "offline"
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-800"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              connectionState === "connected"
                ? "bg-emerald-500"
                : connectionState === "offline"
                  ? "bg-red-500"
                  : "animate-pulse bg-amber-500"
            }`}
          />
          {connectionState === "connected"
            ? "Live"
            : connectionState === "offline"
              ? "Offline — actions paused"
              : connectionState === "reconnecting"
                ? "Reconnecting…"
                : "Connecting…"}
        </span>
      </div>
      {sessionError && (
        <p role="alert" className="mb-5 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {sessionError}
        </p>
      )}
      {!myPlayerId && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-600">Hosting on another device?</p>
          <button
            type="button"
            onClick={handleRecoverHost}
            disabled={recoveringHost}
            className="min-h-10 shrink-0 rounded-xl border-2 border-kringle-spruce px-3 text-xs font-black text-kringle-spruce disabled:opacity-50"
          >
            {recoveringHost ? "Checking…" : "Recover host controls"}
          </button>
        </div>
      )}
      {room.status === "lobby" ? (
        <LobbyView
          room={room}
          myPlayerId={myPlayerId}
          onJoin={handleJoin}
          onStart={handleStart}
          onAddManual={handleAddManual}
          onLobbyChange={handleLobbyChange}
        />
      ) : myPlayerId ? (
        <GameBoard
          room={room}
          myPlayerId={myPlayerId}
          onAction={handleAction}
          onReplay={handleReplay}
        />
      ) : (
        <SpectatorView room={room} myPlayerId={myPlayerId} />
      )}
    </div>
  );
}
