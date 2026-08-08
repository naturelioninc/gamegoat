"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import QRCode from "react-qr-code";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  joinRoom,
  addManualPlayers,
  updateLobby,
  replayRoom,
  recoverAccountPlayerSession,
} from "@/app/kris-kringle/room/actions";
import { drawSecretSantaRoom, getSecretSantaMatch } from "../actions";
import { GeneratedIcon } from "@/components/GeneratedIcon";
import { upsertGameHistory } from "@/lib/game-history";
import { gameFeedback } from "@/lib/feedback";
import { MilestoneCelebration } from "@/components/MilestoneCelebration";
import { reportGameEvent } from "@/lib/telemetry";
import { JoinSuccessPrompt } from "@/components/JoinSuccessPrompt";
import { claimDeviceGames } from "@/app/my-games/actions";
import { WishlistNudge } from "@/components/WishlistNudge";
import { GameGiftInsights } from "@/components/GameGiftInsights";

interface Player {
  id: string;
  name: string;
  isHost?: boolean;
  isManual?: boolean;
}
interface Room {
  code: string;
  status: "lobby" | "active";
  players: Player[];
  lobby_locked?: boolean;
}

const storageKey = (code: string) => `ss_player_${code}`;

export function SecretSantaRoomClient({ initialRoom }: { initialRoom: Room }) {
  const [room, setRoom] = useState(initialRoom);
  const [identity, setIdentity] = useState<{
    playerId: string;
    playerToken: string;
  } | null>(null);
  const [joinName, setJoinName] = useState("");
  const [manualName, setManualName] = useState("");
  const [message, setMessage] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [match, setMatch] = useState<{
    giverName: string;
    recipientName: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const [celebrating, setCelebrating] = useState(false);
  const [joinedNow, setJoinedNow] = useState<{
    playerName: string;
    hostName: string;
  } | null>(null);
  const supabase = useRef(createSupabaseBrowserClient());
  const me = room.players.find((p) => p.id === identity?.playerId);
  const isHost = Boolean(me?.isHost);
  const inviteUrl = `https://games.xmasgoat.com/secret-santa/room/${room.code}`;

  useEffect(() => {
    try {
      const prompt = localStorage.getItem(
        `gamegoat_account_prompt:/secret-santa/room/${room.code}`,
      );
      if (prompt) setJoinedNow(JSON.parse(prompt));
      const saved = localStorage.getItem(storageKey(room.code));
      if (saved) setIdentity(JSON.parse(saved));
      else
        void recoverAccountPlayerSession(room.code).then((result) => {
          if (!result.ok) return;
          const next = {
            playerId: result.playerId,
            playerToken: result.playerToken,
          };
          localStorage.setItem(storageKey(room.code), JSON.stringify(next));
          setIdentity(next);
        });
    } catch {}
    const channel = supabase.current
      .channel(`secret-santa:${room.code}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_rooms",
          filter: `code=eq.${room.code}`,
        },
        (payload) => setRoom(payload.new as Room),
      )
      .subscribe();
    return () => {
      void supabase.current.removeChannel(channel);
    };
  }, [room.code]);

  useEffect(() => {
    if (identity)
      void claimDeviceGames([
        {
          code: room.code,
          playerId: identity.playerId,
          playerToken: identity.playerToken,
        },
      ]);
  }, [identity, room.code]);

  useEffect(() => {
    if (!identity || !me) return;
    upsertGameHistory({
      code: room.code,
      gameType: "secret_santa",
      playerId: identity.playerId,
      playerToken: identity.playerToken,
      playerName: me.name,
      role: me.isHost ? "host" : "participant",
      status: room.status === "active" ? "complete" : "lobby",
      playerCount: room.players.length,
      ...(room.status === "active"
        ? { completedAt: new Date().toISOString() }
        : {}),
    });
  }, [identity, me, room]);

  async function join() {
    const result = await joinRoom(room.code, joinName);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    const next = { playerId: result.playerId, playerToken: result.playerToken };
    localStorage.setItem(storageKey(room.code), JSON.stringify(next));
    upsertGameHistory({
      code: room.code,
      gameType: "secret_santa",
      playerId: result.playerId,
      playerToken: result.playerToken,
      playerName: joinName.trim(),
      role: "participant",
      status: "lobby",
      playerCount: room.players.length + 1,
    });
    setIdentity(next);
    setJoinName("");
    setMessage("You’re in! ✓");
    const prompt = {
      playerName: joinName.trim(),
      hostName:
        room.players.find((player) => player.isHost)?.name ?? "the host",
    };
    setJoinedNow(prompt);
    localStorage.setItem(
      `gamegoat_account_prompt:/secret-santa/room/${room.code}`,
      JSON.stringify(prompt),
    );
    reportGameEvent("join", "secret_santa");
  }

  async function addManual() {
    if (!identity || !manualName.trim()) return;
    const result = await addManualPlayers(
      room.code,
      [manualName],
      identity.playerId,
      identity.playerToken,
    );
    setMessage(
      result.ok
        ? `${manualName} added ✓`
        : result.error || "Could not add player",
    );
    if (result.ok) setManualName("");
  }

  async function changeLobby(
    change:
      { type: "lock"; locked: boolean } | { type: "remove"; playerId: string },
  ) {
    if (!identity) return;
    const result = await updateLobby(
      room.code,
      identity.playerId,
      identity.playerToken,
      change,
    );
    if (!result.ok) setMessage(result.error || "Could not update the lobby");
  }

  function drawNames() {
    if (!identity) return;
    startTransition(async () => {
      const result = await drawSecretSantaRoom(
        room.code,
        identity.playerId,
        identity.playerToken,
      );
      setMessage(
        result.ok
          ? "The draw is complete! 🎉"
          : result.error || "Could not draw names",
      );
      if (result.ok) {
        reportGameEvent("complete", "secret_santa");
        void gameFeedback("success");
        setCelebrating(true);
      }
    });
  }

  async function reveal(targetId?: string) {
    if (!identity) return;
    const result = await getSecretSantaMatch(
      room.code,
      identity.playerId,
      identity.playerToken,
      targetId,
    );
    if (result.ok) {
      void gameFeedback("success");
      setMatch({
        giverName: result.giverName,
        recipientName: result.recipientName,
      });
    } else setMessage(result.error);
  }

  async function replay() {
    if (!identity) return;
    const result = await replayRoom(
      room.code,
      identity.playerId,
      identity.playerToken,
    );
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    reportGameEvent("replay", "secret_santa");
    localStorage.setItem(
      storageKey(result.code),
      JSON.stringify({
        playerId: result.playerId,
        playerToken: result.playerToken,
      }),
    );
    window.location.assign(`/secret-santa/room/${result.code}`);
  }

  const shareText = `Join my Secret Santa! Room ${room.code} 🎅 ${inviteUrl}`;
  return (
    <div className="space-y-5 rounded-3xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000] sm:p-7">
      {celebrating && (
        <MilestoneCelebration
          title="Names are matched!"
          detail="Every assignment is private and ready."
          onDone={() => setCelebrating(false)}
        />
      )}
      {joinedNow && (
        <JoinSuccessPrompt
          playerName={joinedNow.playerName}
          hostName={joinedNow.hostName}
          gameName="Secret Santa game"
          roomPath={`/secret-santa/room/${room.code}`}
        />
      )}
      {me && <WishlistNudge roomPath={`/secret-santa/room/${room.code}`} />}
      {identity && (
        <GameGiftInsights
          code={room.code}
          playerId={identity.playerId}
          playerToken={identity.playerToken}
          active={room.status === "active"}
        />
      )}
      <header className="text-center">
        <GeneratedIcon
          name="secret-santa"
          size="lg"
          className="mx-auto h-20 w-20"
        />
        <p className="text-xs font-black uppercase tracking-widest text-kringle-cranberry">
          Private draw room
        </p>
        <h1 className="text-2xl font-black">Secret Santa</h1>
      </header>

      <section className="rounded-2xl bg-kringle-spruce/5 p-3 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-kringle-spruce">
          Room code
        </p>
        <p className="font-mono text-4xl font-black tracking-[.16em] text-kringle-spruce">
          {room.code}
        </p>
        {showQr && (
          <div className="mx-auto mt-3 w-fit rounded-xl bg-white p-2">
            <QRCode value={inviteUrl} size={116} fgColor="#0f5132" />
          </div>
        )}
        <p className="mt-1 text-xs font-semibold text-kringle-spruce/70">
          Invite people, then draw when everyone is ready.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={() =>
              navigator.share?.({ text: shareText, url: inviteUrl })
            }
            className="min-h-10 rounded-xl bg-kringle-spruce text-xs font-black text-white"
          >
            Share
          </button>
          <button
            onClick={() => setShowQr((value) => !value)}
            className="min-h-10 rounded-xl border-2 border-kringle-spruce text-xs font-black text-kringle-spruce"
          >
            {showQr ? "Hide QR" : "Show QR"}
          </button>
          <button
            onClick={() =>
              navigator.clipboard
                .writeText(shareText)
                .then(() => setMessage("Invite copied ✓"))
            }
            className="min-h-10 rounded-xl border-2 border-kringle-spruce text-xs font-black text-kringle-spruce"
          >
            Copy link
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-black">People</h2>
          <span className="text-xs font-bold text-slate-400">
            {room.players.length} joined
          </span>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_5.5rem] bg-slate-100 px-3 py-1.5 text-[9px] font-black uppercase text-slate-500">
            <span>Name</span>
            <span>Status</span>
            <span>Plays on</span>
          </div>
          {room.players.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[minmax(0,1fr)_4.5rem_5.5rem] items-center border-t border-slate-100 px-3 py-2 text-xs"
            >
              <span className="truncate font-black">
                {p.name}
                {p.id === identity?.playerId ? " (you)" : ""}
              </span>
              <span className="text-[10px] font-bold text-emerald-700">
                ✓ Ready
              </span>
              <span className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>
                  {p.isHost ? "Host" : p.isManual ? "Host phone" : "Own phone"}
                </span>
                {isHost && !p.isHost && (
                  <button
                    type="button"
                    aria-label={`Remove ${p.name}`}
                    onClick={() => {
                      if (window.confirm(`Remove ${p.name} from this lobby?`))
                        void changeLobby({ type: "remove", playerId: p.id });
                    }}
                    className="min-h-7 min-w-7 text-red-600"
                  >
                    ×
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      {!me && room.status === "lobby" && (
        <div className="flex gap-2">
          <input
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder={room.lobby_locked ? "Joining is closed" : "Your name"}
            disabled={room.lobby_locked}
            className="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 font-semibold disabled:bg-slate-100"
          />
          <button
            onClick={join}
            disabled={!joinName.trim() || room.lobby_locked}
            className="rounded-xl bg-kringle-cranberry px-4 text-sm font-black text-white disabled:opacity-40"
          >
            {room.lobby_locked ? "Locked" : "Join"}
          </button>
        </div>
      )}
      {isHost && room.status === "lobby" && (
        <div className="flex gap-2">
          <input
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="Add someone without a phone"
            className="min-h-10 min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 text-sm font-semibold"
          />
          <button
            onClick={addManual}
            disabled={!manualName.trim()}
            className="rounded-xl border-2 border-kringle-spruce px-3 text-xs font-black text-kringle-spruce disabled:opacity-40"
          >
            + Add
          </button>
        </div>
      )}
      {isHost && room.status === "lobby" && (
        <button
          type="button"
          onClick={() =>
            void changeLobby({ type: "lock", locked: !room.lobby_locked })
          }
          className="min-h-10 w-full rounded-xl border-2 border-slate-200 text-xs font-black text-slate-700"
        >
          {room.lobby_locked
            ? "Open joining · Locked"
            : "Close joining · Anyone with the code can join"}
        </button>
      )}
      {isHost && room.status === "lobby" && (
        <div className="sticky bottom-3 z-20 -mx-1 rounded-2xl bg-white/95 p-1 shadow-[0_-8px_24px_rgba(255,255,255,.95)] backdrop-blur">
          <button
            onClick={drawNames}
            disabled={room.players.length < 2 || pending}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-kringle-cranberry text-lg font-black text-white shadow-[3px_3px_0_#000] disabled:opacity-40"
          >
            <GeneratedIcon name="draw-names" className="h-8 w-8" />
            {pending
              ? "Mixing the magic…"
              : room.players.length < 2
                ? "Invite at least 1 player"
                : `Draw names (${room.players.length})`}
          </button>
        </div>
      )}
      {room.status === "active" && me && (
        <div className="space-y-2">
          <button
            onClick={() => reveal()}
            className="min-h-14 w-full rounded-2xl border-4 border-dashed border-kringle-cranberry text-lg font-black text-kringle-cranberry"
          >
            Reveal my match
          </button>
          {isHost &&
            room.players
              .filter((p) => p.isManual)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => reveal(p.id)}
                  className="min-h-10 w-full rounded-xl border-2 border-slate-200 text-sm font-bold"
                >
                  Reveal for {p.name}
                </button>
              ))}
        </div>
      )}
      {room.status === "active" && isHost && (
        <button
          type="button"
          onClick={() => void replay()}
          className="min-h-12 w-full rounded-2xl bg-kringle-spruce font-black text-white"
        >
          Run another draw with new invitations →
        </button>
      )}
      {message && (
        <p className="text-center text-sm font-bold text-kringle-spruce">
          {message}
        </p>
      )}

      {match && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5"
          onClick={() => setMatch(null)}
        >
          <div
            className="animate-kk-pop-in w-full max-w-sm rounded-3xl border-4 border-kringle-gold bg-amber-50 p-7 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm font-black text-amber-700">
              {match.giverName} is buying for
            </p>
            <p className="mt-2 text-4xl font-black text-amber-950">
              {match.recipientName}
            </p>
            <p className="mt-3 text-sm text-amber-700">Keep it secret! 🤫</p>
            <button
              onClick={() => setMatch(null)}
              className="mt-5 min-h-11 w-full rounded-xl bg-kringle-cranberry font-black text-white"
            >
              Hide assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
