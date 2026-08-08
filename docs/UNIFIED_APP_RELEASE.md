# XmasGoat unified app release

## Decision

The existing Google Play testing application remains the only mobile listing.
Its immutable package ID stays `com.xmasgoat.games`, while its displayed name
becomes **XmasGoat**. Version 1.2 (Android version code 3) introduces a unified
home and routes Party Goat and Games Goat through the same Capacitor shell.

## Web ownership

- `games.xmasgoat.com` owns live games, game history, room codes and the native
  `/app` home.
- `party.xmasgoat.com` owns parties, invitations, households and planning.
- `account.xmasgoat.com` owns profile, preferences and the cross-product hub.
- `xmasgoat.com` remains editorial and commerce content and opens externally
  unless a native feature explicitly requires it.

The applications continue to deploy independently. Shared Supabase cookies use
the `.xmasgoat.com` domain, so moving between the three in-app origins preserves
the authenticated session.

## Native link contract

The binary handles verified HTTPS links for:

- `https://games.xmasgoat.com/*`
- `https://party.xmasgoat.com/*`

It also accepts `xmasgoat://open?url=<trusted HTTPS URL>`. The prior
`gamegoat://open?target=<games path>` scheme remains supported so existing test
links do not break. Only Games, Party and Account Goat origins are accepted by
the native router.

Both Games and Party must serve matching files at:

- `/.well-known/assetlinks.json`
- `/.well-known/apple-app-site-association`

Set `GOOGLE_PLAY_APP_SIGNING_SHA256` on both Vercel projects to the **Play App Signing**
SHA-256 fingerprint shown in Play Console. This is different from the upload
certificate in most Play-managed applications. Multiple fingerprints are
comma-separated.

Set `APPLE_TEAM_ID` on both projects before an iOS release. Until it is set, the
Apple association endpoint intentionally publishes no app details.

## Play Console update

1. Do not create a new Play application.
2. Keep package name `com.xmasgoat.games` and upload version code 3 or greater.
3. Change the listing name to `XmasGoat: Parties & Games`.
4. Use an App-category listing rather than claiming the entire product is a
   single game; the description should lead with party planning and group play.
5. Replace screenshots with a balanced set: unified home, party overview,
   household RSVP, game picker, lobby and live game.
6. Update Data Safety for party guest/contact data, event photos and native
   camera/share/network functionality.
7. Add reviewer credentials and explain the Party and Games tabs plus guest game
   flows that do not require authentication.
8. Copy the App Signing certificate SHA-256 fingerprint into both Vercel
   projects, deploy, and confirm both Digital Asset Links endpoints before
   promoting the bundle beyond internal testing.

## Required release verification

- `npm run verify`
- `npm run native:sync`
- `./gradlew bundleRelease` with the configured upload signing setup
- Android App Link verification for both domains
- Cold launch opens `/app`
- Party → Games → Account → Party retains the session
- Party and Games HTTPS links open the installed app
- Links fall back to their responsive websites without the app
- Legacy `gamegoat://` links still open the requested game
- Android back exits only when no in-app history remains
- Camera, share, network state, status bar and haptics work from both origins
