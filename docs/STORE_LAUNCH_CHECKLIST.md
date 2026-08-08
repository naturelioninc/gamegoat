# Game Goat staged launch checklist

## Before the next Android bundle

- Run `npm run verify` and the two-device walkthrough.
- Confirm status bar, bottom safe area, keyboard, native back, Share, QR, offline/resume, and low-memory restart on a physical Android phone.
- Test guest host/participant, signed-in host/participant, manual player, lobby lock/removal, replay, and account claiming.
- Test 200% text, TalkBack focus order, reduced motion, and touch targets.
- Capture current phone screenshots only after the exact release candidate is installed.
- Review Play data-safety answers against the shipped build; telemetry contains event type and game family only.

## Staged rollout

1. Internal testers: developer plus 3–5 devices and Android versions.
2. Closed test: representative hosts and participants; monitor crashes, ANRs, startup, join failures, and stalled rooms.
3. Production: begin with a small staged percentage and halt on any assignment leak, deadlock, login loop, or elevated crash rate.

## Rollback and incident response

- Web-wrapper UI rollback: promote the prior known-good Vercel deployment.
- Database rollback: additive migrations remain in place; disable the affected UI path rather than dropping live columns.
- Security/privacy incident: stop rollout, preserve logs, revoke exposed credentials, and ship a corrected web deployment before resuming.
- Gameplay incident: retain room records, remove personal data from support notes, and diagnose using room status—not assignments or player tokens.
