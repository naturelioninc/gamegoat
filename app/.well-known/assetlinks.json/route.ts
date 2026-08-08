import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const UPLOAD_CERTIFICATE =
  "6F:52:42:2F:F2:50:73:1C:3B:79:50:73:6F:DB:3E:1A:55:72:E5:0E:A8:AF:00:8D:EC:2E:3F:51:8F:4F:05:84";

export function GET() {
  const playCertificates = (
    process.env.GOOGLE_PLAY_APP_SIGNING_SHA256 ?? process.env.ANDROID_APP_LINK_SHA256 ?? ""
  )
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.xmasgoat.games",
          sha256_cert_fingerprints: [...new Set([UPLOAD_CERTIFICATE, ...playCertificates])],
        },
      },
    ],
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
