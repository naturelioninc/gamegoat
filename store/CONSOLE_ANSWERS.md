# Play Console: first-publish answers (2026-09-16)

What is already done through the API: store listing (en-US, en-CA), icon, feature graphic, five screenshots, a **draft** production release of 1.8 (code 9), and 1.8 rolled out on internal testing. Play will not accept a non-draft production release until the dashboard's "Set up your app" tasks are complete and the first release is sent from the Console. These are the answers, grounded in the shipped app.

Console: https://play.google.com/console → XmasGoat → Dashboard → "Set up your app".

## App access
**All functionality is available without special access.** Every feature works without signing in; a name is asked for, an email only to share a list or open a Secret Santa match. If a reviewer login is still demanded, create one at https://app.xmasgoat.com/start with a fresh address and enter it only in the Console.

## Ads
**No, my app does not contain ads.**

## Content rating
Category: **Utility, productivity, communication, or other**. Answer **No** to every content question (no violence, sexuality, language, controlled substances, gambling, user-to-user free-form chat is not a feature; wish lists are shared by link, not open messaging). Result should be Everyone / PEGI 3.

## Target audience and content
Target age group: **18 and over** only. The app is for adults organizing gifts; an adult may enter a child's first name on a list they keep, but children do not use the app. Answer **No** to "could the app unintentionally appeal to children" (no cartoon-only content aimed at kids; the goat is brand art on an organizing tool).

## News app
**No.**

## COVID-19 contact tracing / status
**No.**

## Data safety
Encryption in transit: **Yes** (HTTPS everywhere). Deletion request path: **Yes**, https://app.xmasgoat.com/delete-account (and in Account settings).

Collected data, all **required for app functionality** unless marked optional; none is used for advertising or analytics; **none is shared** with third parties (Supabase, Vercel and Google Gemini act as service providers under contract):

| Category | Type | Collected | Notes |
| --- | --- | --- | --- |
| Personal info | Name | Yes | The one thing always asked for. |
| Personal info | Email address | Yes, **optional** | Only if the person adds one. A placeholder address on silent.xmasgoat.com is generated for everyone else; it identifies nobody. |
| Personal info | User IDs | Yes | Account identifier. |
| Photos and videos | Photos | Yes, **optional** | Wish photos, stored privately; the optional "suggest a name" sends the photo to Google Gemini for processing only (ephemeral). |
| App activity | Other user-generated content | Yes | Wishes, links, notes, gift records, exchange names. |
| Financial info | Purchase history | **No** | Users may type gift prices; the app processes no purchases or payment details. |
| Location, contacts, messages, health, device IDs, app info, calendar, files, audio | — | **No** | Not requested; no advertising ID; no app analytics. |

Data is user-provided, not collected automatically. Users can delete wishes, lists and their account.

## Privacy policy
https://app.xmasgoat.com/privacy

## Government apps
**No.**

## Financial features
**No financial features.**

## Health
**No health features.**

## Store settings
App category: **Lifestyle** (or Productivity). Tags: gifts, Christmas, Secret Santa, wish list. Contact email: naturelionmushrooms@outlook.com. External marketing: your choice.

## After the tasks are green
Production → Releases → the draft "1.8" → **Review release** → **Start rollout to production**. If the dashboard shows "Apply for production access" instead, the account is subject to the 12-testers-for-14-days rule: use **open testing** for the public listing meanwhile (Testing → Open testing → create release → same bundle, code 9), and run a closed test with 12 opted-in testers to unlock production.
