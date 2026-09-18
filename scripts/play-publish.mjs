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
//   node scripts/play-publish.mjs promote <versionCode> <track> [--notes "text"] [--draft]
//                                                          # an already-uploaded bundle onto another track
//   node scripts/play-publish.mjs listing [lang]            # show the store listing (default en-US)
//   node scripts/play-publish.mjs set-listing <lang> <dir>  # title.txt / short-description.txt / full-description.txt
//   node scripts/play-publish.mjs images <lang>             # icon, feature graphic and phone screenshots from store/assets
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

async function promote(versionCode, track, notes, draft) {
  const token = await accessToken();
  await withEdit(token, async (editId) => {
    const release = {
      versionCodes: [String(versionCode)],
      status: draft ? "draft" : "completed",
      ...(notes ? { releaseNotes: [{ language: "en-US", text: notes }] } : {}),
    };
    await call(token, "PUT", `${API}/applications/${PACKAGE}/edits/${editId}/tracks/${track}`, {
      track,
      releases: [release],
    });
    const committed = await call(token, "POST", `${API}/applications/${PACKAGE}/edits/${editId}:commit`);
    console.log(`committed edit ${committed.id}: ${track} ← versionCode ${versionCode} (${release.status})`);
  });
}

async function listing(lang = "en-US") {
  const token = await accessToken();
  await withEdit(token, async (editId) => {
    const res = await call(token, "GET", `${API}/applications/${PACKAGE}/edits/${editId}/listings`);
    for (const l of res.listings ?? []) {
      console.log(`[${l.language}] ${l.title}\n  short: ${l.shortDescription}\n  full: ${(l.fullDescription ?? "").length} chars`);
    }
    const imgs = await call(token, "GET", `${API}/applications/${PACKAGE}/edits/${editId}/listings/${lang}/phoneScreenshots`).catch(() => ({}));
    console.log(`phone screenshots (${lang}): ${(imgs.images ?? []).length}`);
  });
}

async function setListing(lang, dir) {
  const read = (f) => fs.readFileSync(path.join(dir, f), "utf8").trim();
  const body = {
    language: lang,
    title: read("title.txt"),
    shortDescription: read("short-description.txt"),
    fullDescription: read("full-description.txt"),
  };
  if (body.title.length > 30) throw new Error(`title is ${body.title.length} chars (max 30)`);
  if (body.shortDescription.length > 80) throw new Error(`short description is ${body.shortDescription.length} chars (max 80)`);
  if (body.fullDescription.length > 4000) throw new Error(`full description is ${body.fullDescription.length} chars (max 4000)`);
  const token = await accessToken();
  await withEdit(token, async (editId) => {
    await call(token, "PUT", `${API}/applications/${PACKAGE}/edits/${editId}/listings/${lang}`, body);
    const committed = await call(token, "POST", `${API}/applications/${PACKAGE}/edits/${editId}:commit`);
    console.log(`committed edit ${committed.id}: listing ${lang} "${body.title}"`);
  });
}

async function images(lang) {
  const token = await accessToken();
  const assets = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "store", "assets");
  const put = async (editId, type, file) => {
    const res = await call(
      token,
      "POST",
      `${UPLOAD}/applications/${PACKAGE}/edits/${editId}/listings/${lang}/${type}?uploadType=media`,
      fs.readFileSync(file),
      "image/png",
    );
    console.log(`${type} ← ${path.basename(file)} (${res.image?.id ?? "ok"})`);
  };
  await withEdit(token, async (editId) => {
    for (const type of ["icon", "featureGraphic", "phoneScreenshots"]) {
      await call(token, "DELETE", `${API}/applications/${PACKAGE}/edits/${editId}/listings/${lang}/${type}`).catch(() => {});
    }
    await put(editId, "icon", path.join(assets, "icon-512.png"));
    await put(editId, "featureGraphic", path.join(assets, "feature-graphic.png"));
    for (const f of fs.readdirSync(path.join(assets, "screenshots")).filter((f) => f.endsWith(".png")).sort()) {
      await put(editId, "phoneScreenshots", path.join(assets, "screenshots", f));
    }
    const committed = await call(token, "POST", `${API}/applications/${PACKAGE}/edits/${editId}:commit`);
    console.log(`committed edit ${committed.id}: images for ${lang}`);
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
  } else if (cmd === "promote") {
    const [code, track] = rest;
    if (!code || !track) throw new Error("usage: promote <versionCode> <track> [--notes text] [--draft]");
    const notesIdx = rest.indexOf("--notes");
    await promote(code, track, notesIdx > -1 ? rest[notesIdx + 1] : null, rest.includes("--draft"));
  } else if (cmd === "listing") await listing(rest[0]);
  else if (cmd === "set-listing") {
    if (!rest[0] || !rest[1]) throw new Error("usage: set-listing <lang> <dir>");
    await setListing(rest[0], rest[1]);
  } else if (cmd === "images") {
    if (!rest[0]) throw new Error("usage: images <lang>");
    await images(rest[0]);
  } else {
    console.log("usage: play-publish.mjs tracks | upload | promote | listing | set-listing | images");
  }
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
