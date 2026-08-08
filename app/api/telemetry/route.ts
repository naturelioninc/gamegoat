import { NextResponse } from "next/server";
import { safeGameEvent } from "@/lib/telemetry";

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 512) return new NextResponse(null, { status: 413 });
  const input = await request.json().catch(() => null) as { event?: unknown; gameType?: unknown } | null;
  const event = safeGameEvent(typeof input?.event === "string" ? input.event : "", typeof input?.gameType === "string" ? input.gameType : undefined);
  if (!event) return new NextResponse(null, { status: 400 });
  console.info("gamegoat_event", { event: event.event, gameType: event.gameType });
  return new NextResponse(null, { status: 204 });
}
