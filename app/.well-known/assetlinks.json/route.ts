import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const fingerprints = (process.env.GOOGLE_PLAY_APP_SIGNING_SHA256 || "").split(",").map((v) => v.trim()).filter(Boolean);
  return NextResponse.json(fingerprints.length ? [{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: "com.xmasgoat.games", sha256_cert_fingerprints: fingerprints } }] : [], { headers: { "Cache-Control": "public, max-age=300" } });
}
