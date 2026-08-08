import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const teamId = process.env.APPLE_TEAM_ID?.trim();
  return NextResponse.json(
    {
      applinks: {
        apps: [],
        details: teamId
          ? [{ appID: `${teamId}.com.xmasgoat.games`, paths: ["/*"] }]
          : [],
      },
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
