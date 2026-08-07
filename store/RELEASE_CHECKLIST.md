# Game Goat mobile release checklist

The native projects use the application ID `com.xmasgoat.games`, version `1.0` (build 1), and the hosted production app at `https://games.xmasgoat.com`.

## Before internal testing

- Install Android Studio with JDK 21 and the Android 35 SDK, then run `npm run native:sync` and build an Android App Bundle from `android/`.
- On macOS, install Xcode and CocoaPods, run `npm run native:sync`, select the Apple developer team, and archive `ios/App/App.xcworkspace`.
- Create Play App Signing and Apple distribution certificates. Never commit signing keys or provisioning profiles.
- Add the release signing certificate fingerprint to `https://games.xmasgoat.com/.well-known/assetlinks.json` before enabling verified Android links in production.
- Add the Apple App ID/team identifier to `https://games.xmasgoat.com/.well-known/apple-app-site-association` and enable Associated Domains before relying on universal links.

## Store requirements

- Public privacy-policy and support URLs.
- App privacy/data-safety declarations covering account data, party/game data, photos, email delivery, analytics if added, and affiliate links.
- Phone screenshots for the game menu, lobby, live turn, Secret Santa planning, trivia, charades, and bingo.
- Google Play feature graphic and final 1024×1024 App Store icon review.
- Reviewer notes explaining that live multiplayer, private host recovery, haptics, camera/photo sharing, native deep links, offline recovery, and cross-device synchronization are core app behavior.

## Product risk

The current Capacitor shell loads the hosted application so server actions and live multiplayer work without duplicating the backend. Apple can reject thin website wrappers under guideline 4.2. Before public App Store submission, complete device testing and consider moving the built-in single-device games into the bundled shell so trivia, charades, and bingo remain playable offline. That would provide stronger native value while multiplayer rooms continue to use the hosted service.
