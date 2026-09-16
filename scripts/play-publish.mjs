// Publish an Android App Bundle to a Google Play track from this machine.
//
// Uses the Google Play Developer API (androidpublisher v3) as the
// play-publisher service account, reached by impersonation from the gcloud
// sign-in on this machine (info@naturelion.ca). There is no key file: the
// organisation policy forbids service-account keys, and impersonation is
// what Google recommends instead. The service account must be invited in
// Play Console (Users and permissions) with release permission for the app.
//
//   node scripts/play-publish.mjs tracks                    # list tracks and releases
//   node scripts/play-publish.mjs upload <file.aab> <track> # internal | alpha | beta | production
//     [--notes "text"] [--draft]                           # --draft leaves the release unrolled
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PACKAGE = "com.xmasgoat.games";
const SERVICE_ACCOUNT = "play-publisher@root-opus-475504-n0.iam.gserviceaccount.com";
const GCLOUD = path.join(process.env.HOME ?? "", "google-cloud-sdk/bin/gcloud");
const API = "https://androidpublisher.googleapis.com/androidpublisher/v3";
const UPLOAD = "https://androidpublisher.googleapis.com/upload/androidpublisher/v3";

/** A short-lived Play-scoped token for the service account, minted from the user sign-in. */
async function accessToken() {
  const userToken = execFileSync(GCLOUD, ["auth", "print-access-token"], {
    env: { ...process.env, CLOUDSDK_CONFIG: path.join(process.env.HOME ?? "", ".config/gcloud") },
    encoding: "utf8",
  }).trim();
  const res = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SERVICE_ACCOUNT}:generateAccessToken`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${userToken}`, "content-type": "application/json" },
      body: JSON.stringify({ scope: ["https://www.googleapis.com/auth/androidpublisher"], lifetime: "1800s" }),
    },
  );
  const json = await res.json();
  if (!json.accessToken) throw new Error(`impersonation: ${JSON.stringify(json).slice(0, 300)}`);
  return json.accessToken;
}

async function call(token, method, url, body, contentType = "application/json") {
  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body ? { "content-type": contentType } : {}),
    },
    body: body && contentType === "application/json" ? JSON.stringify(body) : body,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}: ${text.slice(0, 400)}`);
  return json;
}

async function withEdit(token, fn) {
  const edit = await call(token, "POST", `${API}/applications/${PACKAGE}/edits`, {});
  try {
    return await fn(edit.id);
  } finally {
    // Commits happen inside fn; anything left over is discarded.
    await call(token, "DELETE", `${API}/applications/${PACKAGE}/edits/${edit.id}`).catch(() => {});
  }
}

async function tracks() {
  const token = await accessToken();
  await withEdit(token, async (editId) => {
    const res = await call(token, "GET", `${API}/applications/${PACKAGE}/edits/${editId}/tracks`);
    for (const t of res.tracks ?? []) {
      const releases = (t.releases ?? [])
        .map((r) => `${r.status}${r.name ? ` "${r.name}"` : ""} codes=${(r.versionCodes ?? []).join(",") || "-"}`)
        .join(" | ");
      console.log(`${t.track.padEnd(12)} ${releases || "(no releases)"}`);
    }
  });
}

async function upload(file, track, notes, draft) {
  if (!fs.existsSync(file)) throw new Error(`no such file: ${file}`);
  const token = await accessToken();
  await withEdit(token, async (editId) => {
    const bundle = await call(
      token,
      "POST",
      `${UPLOAD}/applications/${PACKAGE}/edits/${editId}/bundles?uploadType=media`,
      fs.readFileSync(file),
      "application/octet-stream",
    );
    console.log(`uploaded bundle versionCode=${bundle.versionCode} sha256=${bundle.sha256}`);
    const release = {
      versionCodes: [String(bundle.versionCode)],
      status: draft ? "draft" : "completed",
      ...(notes ? { releaseNotes: [{ language: "en-US", text: notes }] } : {}),
    };
    await call(token, "PUT", `${API}/applications/${PACKAGE}/edits/${editId}/tracks/${track}`, {
      track,
      releases: [release],
    });
    const committed = await call(token, "POST", `${API}/applications/${PACKAGE}/edits/${editId}:commit`);
    console.log(`committed edit ${committed.id}: ${track} ← versionCode ${bundle.versionCode} (${release.status})`);
  });
}

const [cmd, ...rest] = process.argv.slice(2);
try {
  if (cmd === "tracks") await tracks();
  else if (cmd === "upload") {
    const [file, track] = rest;
    if (!file || !track) throw new Error("usage: upload <file.aab> <track> [--notes text] [--draft]");
    const notesIdx = rest.indexOf("--notes");
    await upload(file, track, notesIdx > -1 ? rest[notesIdx + 1] : null, rest.includes("--draft"));
  } else {
    console.log("usage: play-publish.mjs tracks | upload <file.aab> <track> [--notes text] [--draft]");
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
