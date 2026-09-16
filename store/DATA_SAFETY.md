# Play Data safety — implementation-based draft

Review these answers against the final build and your actual service-provider/retention agreements before submission. This is not a completed Console declaration.

## App scope

Android `com.xmasgoat.games` loads app.xmasgoat.com. Main website content, affiliate discovery and its optional analytics are external destinations. Legacy game/party code is retained but hidden from normal application navigation. Do not copy the older game/photo/analytics declarations without checking the shipped experience.

## Data processed

| Play category to review | Current behavior | Purpose / optionality |
| --- | --- | --- |
| Personal info: email, name, user IDs | Accounts, sign-in, exchange membership and display names. Gift recipients can be names entered by the user. | Account management and app functionality. Accounts are needed for persistent lists; guest link reading does not require one. |
| App activity: other user-generated content | Wishes, webpage links, recipient notes, exchange settings and reservations. | App functionality; users choose what content to enter/share. |
| Photos and videos: photos | User-selected wish photos/screenshots are saved privately. Optional Suggest a name sends the selected image to Google Gemini. | Optional app functionality. Account for both storage and AI processing in the Console declaration. |
| Financial info: purchase history | Users may record gift purchases and prices. No payments, card details or bank information are processed by the app. | Optional gift tracking. Confirm the Console category for user-entered gift purchase records. |
| Messages / other in-app messages | Invitations and legacy exchange/participant content should be reviewed against accessible routes. Transactional emails contain sign-in/exchange information. | App functionality and account access. |
| Device or other IDs / diagnostics | Hosting/security services receive technical requests; Google Play Install Referrer passes invitation IDs. No advertising ID permission and no app GA tracking. | Confirm actual logs/provider collection before selecting a category or declaring it absent. |

Data travels over HTTPS. Users can delete individual wishes/gifts and delete their account in Account settings; the public deletion URL also offers an email request path.

## Camera and photos

Camera permission is optional for QR scanning and taking wish photos. The code decodes camera frames and selected QR photos locally. These images are not uploaded by the QR flow. No contacts, location, microphone, broad photo-library or storage permission is requested by the app's manifest. Inspect the merged release manifest, because dependencies can add permissions.

## Sharing

Wish links expose wish text, photos, URLs and the list title to anyone with the link. Assigned Secret Santa wish-list visibility defaults on with an explicit opt-out. Private purchase records are not included. Reservations expose only availability to authorized buyers; the wish owner does not see reservations.

Google's Data safety definitions include specific exceptions for service-provider transfers and expected user-initiated sharing. Determine whether those exceptions apply to Supabase/Vercel/email processing and each sharing flow. Do not automatically answer “no sharing” merely because information is not sold.

Wish capture is separate from QR scanning: saved wish photos are uploaded, normalized and shown through the same authorized owner/shared-link/assigned-recipient access. Deletion removes their stored images. Local draft images survive navigation and expire on subsequent draft access after 24 hours. Android receives one shared image through a granted content URI without broad storage permission.

## Operational items the owner must confirm

- Gemini project billing/data-use settings under https://ai.google.dev/gemini-api/terms; do not claim zero retention or no training without confirming the applicable service terms/settings.
- Provider names/agreements and processing locations, email delivery provider and support mailbox access.
- Actual logging and backup retention, incident response and response handling for privacy/deletion requests.
- Whether any Console-linked SDK/service introduces collection beyond the checked bundle.
- Intended age audience; adults should manage children's participation.
- Ad declaration: the normal app has no ad placements. Gift-discovery links open the external website; confirm the final app/website configuration.

Reference: https://support.google.com/googleplay/android-developer/answer/10787469
