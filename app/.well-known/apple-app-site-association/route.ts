import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID || "";
  return NextResponse.json({ applinks: { details: teamId ? [{ appIDs: [`${teamId}.com.xmasgoat.games`], components: [{ "/": "/open*", comment: "Account Goat launcher links" }] }] : [] } }, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" } });
}
