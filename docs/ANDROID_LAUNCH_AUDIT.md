# Android launch audit — September 15, 2026

## Scope and architecture

The actual Play package is `com.xmasgoat.games` in this repository. The similarly named Android directory in the main XmasGoat website repository is not the Play package. This release preserves the existing package, upload key, Capacitor 7 wrapper, Supabase accounts, exchange/draw infrastructure and unified hosted service.

The app has three main jobs: Secret Santa, My Christmas List and Wish Lists. Previous games/parties remain in source and storage outside normal navigation. No user data was deleted to simplify the product.

## Fixed for this release

- Version 1.6, code 7, target/compile API 36, Android Gradle Plugin 8.9.2. Gradle 8.11.1 and JDK 21 retained.
- Android 15/16 system-bar/cutout handling uses Capacitor's automatic WebView margins instead of relying on the Android 15 opt-out flag.
- Offline startup opens a bundled, branded retry screen. Loaded native pages display a connection warning when offline. The retry returns to the hosted app; it does not reload the error page forever.
- Backups/device transfers exclude local app data so sign-in state and pending invitation/share drafts are not restored onto another installation. Cloud account data remains on the server.
- Android text sharing opens a private, editable wish draft. Handles initial launch and a running app. Payloads are bounded, webpage URLs are validated, and saving requires confirmation. Drafts travel through local browser storage, not public URL parameters. Webpage content is not fetched by the server.
- Wish lists provide an Add screen, immediate navigation to sharing/saved lists, native/browser sharing and a copy-link fallback. Repeated saves of an existing link reuse the wish.
- Updated app-specific privacy policy, public account-deletion path and support page. Account deletion now also clears the local login session. Signup/account privacy links point to the app policy.
- In-app reporting and owner blocking for shared/Secret Santa wishes, reusing existing admin authentication and rate-limiting infrastructure. Existing event reports are guest/event-specific, so small separate RLS-protected wish-report/block tables were needed. Suspensions have no user-write policy; owners cannot lift their own moderation decision.
- Store descriptions now describe gift organization, not parties/games. Icon, feature graphic and four real mobile-web screenshots supplied.

## Automated web verification

Passed on production with disposable accounts, without sending invitation emails:

- Three-job mobile home, no horizontal overflow and noindex.
- Recipient budgets, gift price/status, purchased/wrapped persistence and cross-account privacy.
- Shared wish draft saving, browser draft cleanup and repeated-link deduplication.
- Guest shared-link reading, inline saving to an existing recipient, revocation and rotated-link recipient reuse.
- Secret Santa setup, QR-photo decode, code lookup, authenticated joining, draw privacy, assigned personal wishes and shared gift tracking.
- Personal wishes default on for Secret Santa with persisted opt-out/opt-in.
- Private reservations, exactly one winner in a concurrent claim, owner/guest privacy, cancellation preserving purchase records.
- Actual account deletion via the UI, including an organized exchange, personal wishes, recipients, gifts, sharing links and signed-out state.

Scoped unit tests passed for URL/referrer parsing and legacy-route simplification (10 tests). Scoped ESLint had no errors; NativeRuntime retains a navigation-style warning for its deliberate full WebView navigation.

Safety migration 0076 passed rollback-only SQL tests: report privacy, self-managed blocks, anonymous isolation and protection against owners clearing suspensions. Production safety-flow results and final native verification are recorded below after completion.

## External release gates

No physical Android device or emulator is available here. The Play signing certificate association is deployed, but verified-link behavior and Play Install Referrer still require a Play-installed build on a phone. OS camera prompts, Android 16 keyboard/system-bar layout, Sharesheet cold/warm launch and offline recovery need the short device walkthrough in the release checklist.

The bundle has not been uploaded to Play from this session. Console declarations, reviewer access, any account-specific closed-testing requirement, pre-launch reports and Google review remain with the owner. These are actual remaining gates, not claims of completed validation.

## Operations

- Production web deployment uses `naturelioninc/kriskringle-canada`, branch `agent/kris-kringle-mvp`.
- Build/sign: `scripts/release-android.sh`. Signing files stay outside Git in the existing protected signing directory.
- Private moderation queue: https://app.xmasgoat.com/admin/wish-reports. Owner must monitor it; no automatic email notification is configured.
- Detailed Console handoff and official policy sources: [release checklist](../store/RELEASE_CHECKLIST.md).

## Final results

- Web deployment **17389155a54b824b58b2441d32192de9decfd66d — READY** (`kriskringle-canada-4r0hfeywk-andrews-projects-adb9024a.vercel.app`). Changed public pages returned 200; production image optimization returned a valid resized image.
- The final home screen was checked at 360 × 640: all three job headings fit above the bottom navigation.
- Production safety tests passed: anonymous reporting, private snapshots, account/device blocking, unblock, suspension and denial of non-admin access. Existing Secret Santa and reservation suites passed again after these changes.
- Patched direct Sharp to 0.35.4 and transitive nanoid to 3.3.19. `npm audit --omit=dev` reports **0 vulnerabilities**. Sharp resize/encode/decode passed. This is a production-dependency audit, not an independent security certification or a claim about development-only tooling.
- Android release command: **BUILD SUCCESSFUL**, 509 tasks. The earlier optional debug APK assembly was stopped after the release bundle finished; the final command reran the release/test/lint gates successfully. No debug APK is supplied as a release artifact.
- Android unit tests: 2 passed. Release lint: **0 errors**, 16 warnings (dependency update suggestions, generated/unused resources, icon variants and manifest ordering).
- Signed upload bundle: `xmasgoat-1.6-release.aab`, using the existing `gamegoat-upload` key. `jarsigner -verify` passed. Its self-signed upload-certificate warnings are expected; Google Play uses its separate app-signing certificate for installed releases.
- SHA-256: `5d86416e93a068f7292e6ae15e49eaca87250e79e55b818679fdf311fd30a0c9`.
- Google bundletool 1.18.3 validation passed. Manifest assertions confirmed package `com.xmasgoat.games`, version 1.6 (7), target API 36, no debuggable release and disabled backup. The compiled SharedWish plugin is present.
- Bundle inspection found **no native `.so` libraries** requiring 16 KB alignment. The merged permissions are Internet, optional Camera, Vibrate, network state, Play Install Referrer binding and AndroidX's signature-protected internal receiver permission.

## 1.8 (code 9) — built 2026-09-16

- `scripts/release-android.sh` on the VPS: unit tests, lintRelease and bundleRelease passed; jarsigner verified. 41 minutes under a load average of ~17.
- Bundle: `releases/xmasgoat-1.8-release.aab`, sha256 `45d89a7d34674985c614a3e58d7bc2ab620ac9602488259e7156204c26eb4611`.
- Changes: allowNavigation restricted to `app.xmasgoat.com`; the `party.xmasgoat.com` App Links filter removed; store screenshots and release notes for the redesigned, sign-up-free app (see `store/RELEASE_CHECKLIST.md`).
- Not verified here: install from Play, physical QR scan, App Links against the Play signing certificate, the Console declarations. Those are the checklist's phone items.
