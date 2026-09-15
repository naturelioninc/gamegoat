# Secret Santa invitations — Android 1.5 (6)

The existing `com.xmasgoat.games` package loads `https://app.xmasgoat.com/`.
The hosted app now has a Join/Create entry screen, a short full-screen creation
flow, and camera/photo/code joining. This release adds the native permissions
and first-install invitation handoff needed by those screens.

## Invitation handoff

- Share `https://app.xmasgoat.com/join/<invite_slug>`.
- The invitation page offers Android visitors a Play link carrying only
  `referrer=invite%3D<invite_slug>` for the existing package.
- `InstallInvitation` reads Play Install Referrer once, accepts only a validated
  invitation slug or six-character code, and retains the resulting internal
  join path until the web app acknowledges opening it.
- An explicit app link takes precedence over a deferred invitation. Deferred
  links open only from the app home, so they cannot interrupt account setup or
  an exchange already in use.
- No email, participant name, wish, or other private profile field is included.
- Failed Play connections can retry on a later launch. Normal web invitations
  remain usable without installing the app.

## Release

1. Copy the native shell with `npx cap copy android`.
2. Run `./gradlew --no-daemon --max-workers=1 :app:testDebugUnitTest :app:bundleRelease`
   from `android/` using JDK 21 and the configured Android SDK.
3. Sign the AAB with the existing upload key (kept outside the repository).
4. Upload version code 6 to the existing Google Play testing application.
5. On a real Android device, uninstall the older test build, open a fresh
   invitation in the browser, follow its Play link, install, and open the app.
   Confirm it opens that invitation. Join once and confirm later launches do
   not return to it.
6. Verify installed-app cold/warm invitation links, camera permission granted
   and denied, QR scanning, QR-photo selection, and the Android back button.

The server deployment alone does not add Install Referrer or camera permission
to older Android binaries. End-to-end Play-install verification requires the
new testing release to be available in Google Play.
