# XmasGoat Android 1.6 — release handoff

Package: `com.xmasgoat.games` (keep the existing Play listing).
Version: **1.6, code 7**. Hosted service: **https://app.xmasgoat.com**.
This supersedes the older party/game release instructions.

## Upload package

- Signed AAB: `android/app/build/outputs/bundle/release/xmasgoat-1.6-release.aab`.
- Upload to the existing app's internal test track first. If Play already has code 7 or higher, increment the code and rebuild; never change the package ID.
- Native source is on `feat/simple-santa-invitations` in `naturelioninc/gamegoat`.
- The production web service is in `naturelioninc/kriskringle-canada`; do not deploy this repository's old Game Goat website.
- App name: **XmasGoat: Gifts & Secret Santa**. Recommended category: **Productivity**, matching the gift-organizing focus.
- English Canadian/US copy: `store/listings/en-CA/` and `en-US/`.
- Icon: `store/assets/icon-512.png`; feature graphic: `store/assets/feature-graphic.png` (1024 × 500).
- Screenshots in `store/assets/screenshots/` show the current hosted mobile UI with disposable example data. They are not proof of physical-device testing.

## Console URLs

- Privacy: https://app.xmasgoat.com/privacy
- Account deletion: https://app.xmasgoat.com/delete-account
- Support: https://app.xmasgoat.com/support
- Contact: naturelionmushrooms@outlook.com

## Release notes

Organize Christmas gifts in one place with Secret Santa, My Christmas List and Wish Lists. Share webpage links to XmasGoat, save wishes, reserve gifts privately and track buying and wrapping. Includes clearer camera access, invitation links and connection recovery.

## Checks that require your phone / Play access

1. Install **1.6 (7)** from Play internal testing; upgrade from your current test version and confirm your existing account/lists remain.
2. In Chrome, open a product page → Share → XmasGoat. Confirm the wish, save it, reopen and verify. Repeat with the app closed and already open.
3. Join a test exchange using camera QR, a QR photo and a typed code. Deny camera access once and confirm the alternatives remain usable.
4. Open an invitation and shared wish-list link with the app installed. For deferred invitations, uninstall only on a spare test device, follow an invitation's Play link, install from Play, and verify the code/invitation is restored. Sideloading cannot validate Play Install Referrer.
5. Check keyboard, Android Back, status/navigation bars and large text on Android 15/16 and one older phone. Confirm the bottom navigation is not covered.
6. Launch in airplane mode → reconnect → Try again. While signed in, lose the network and confirm the offline message; retry saving after reconnecting.
7. Run Play's pre-launch report and address crashes/ANRs or accessibility blockers. Check App Links verification against the **Play app-signing certificate**, not the upload certificate.
8. Complete Console declarations: app access, content rating, target audience, ads and Data safety. Use `DATA_SAFETY.md` as a draft grounded in the implementation, and confirm operational/provider details. The product is intended for adult gift organizers; select the actual intended audience.
9. Provide Google reviewers a dedicated, empty test account with reusable password access if requested. Do not give them your personal account or accounts containing real assignments. The app supports normal password sign-in; create the reviewer account through the app and enter its credentials only in Play Console.
10. Confirm your developer identity, countries, contact details and production access. Some newer personal accounts require 12 opted-in closed testers for 14 consecutive days before production access.
11. Submit for review when the test results and declarations are complete. Prefer a limited initial rollout when Play offers it; monitor Android vitals and support mail.

## Verified here versus still external

See `docs/ANDROID_LAUNCH_AUDIT.md` for actual build, deployment and automated test results. A signed bundle is not the same as a Play-approved public release. No Play upload or physical-device test is claimed by this handoff.

## Rollback

For a hosted UI regression, restore the prior known-good Vercel deployment. Keep additive database migrations. For a native regression, halt rollout and submit a higher versionCode; Android will not install a lower code as an update. Do not delete user records to undo a release.

## Official requirements checked September 15, 2026

- Target API: https://support.google.com/googleplay/android-developer/answer/11926878
- 16 KB support: https://developer.android.com/guide/practices/page-sizes
- Account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Testing eligibility: https://support.google.com/googleplay/android-developer/answer/14151465

## Moderation operation

- Review https://app.xmasgoat.com/admin/wish-reports regularly using an account in the existing admin allowlist. Reports are stored privately; there is no email notification service for this queue.
- Open each report's content snapshot. Dismiss unfounded reports or hide the user's wish lists. A hidden user's shared/Secret Santa wishes remain unavailable until an administrator restores them.
- Users can report from shared lists and their Secret Santa match, and block wish-list owners. Signed-in blocks persist across devices; guest blocks apply on that device. Users can unblock from Wish Lists → Blocked users.
- Report explanations/content snapshots and account block preferences are additional optional user-generated content in the Data safety review.
