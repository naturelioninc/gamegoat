# Current unified app release

The Android package remains `com.xmasgoat.games` so existing testers receive an update. It opens https://app.xmasgoat.com and uses the same account and data model as the web application.

The visible product is Secret Santa, My Christmas List and Wish Lists. Old parties and games are preserved in source, outside the normal experience.

See [release checklist](../store/RELEASE_CHECKLIST.md) for version 1.7, signing, assets and the remaining Play Console steps. Do not deploy this repository's legacy Next.js website as the unified service.

## Photo wishes — 1.7 (8)

The existing SharedWish receiver now accepts a single image as well as text. It decodes off the UI thread, bounds image size, retains a private acknowledged draft, and hands the image to the hosted Add a wish flow. Web capture, optional AI naming and protected image sharing are implemented in the canonical web repository; this repository only packages the native receiver.

Web deployment: `aa47c62` — READY. See the updated release checklist for photo camera/picker and Sharesheet cold/warm checks. `store/DATA_SAFETY.md` now includes optional wish-photo storage and Gemini processing. The new bundle must be uploaded to Play before image shares appear in the installed app’s share targets. Physical-device tests and Play publication remain external.
