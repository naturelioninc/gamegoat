# Game Goat product roadmap

## Product promise

Starting a Christmas game is anonymous and immediate. Resuming, organizing, and remembering games becomes progressively better with a free XmasGoat account.

Game Goat should feel like a Christmas party companion, not a collection of responsive web forms. Every screen must help the group reach the next shared moment quickly, clearly, and joyfully.

## Experience principles

1. **Play before registration.** Joining and hosting never require an account.
2. **Never lose the room.** A game started or joined on a device is visible in My Games immediately.
3. **Roles belong to rooms.** Hosting one room never grants host authority in another.
4. **One dominant action.** Every setup, lobby, turn, reveal, and result screen has one obvious next step.
5. **Celebrate meaning, not taps.** Animation, haptics, and sound reward joins, starts, steals, draws, reveals, and completions—not ordinary navigation.
6. **Fast is part of the design.** No artificial loading delay. Branded loading appears only while real work is happening.
7. **Private by construction.** Secret assignments and secure room credentials never enter analytics, previews, or public history.
8. **Accessible excitement.** Reduced motion, readable contrast, touch targets, screen-reader announcements, and non-haptic equivalents are required.
9. **No dark patterns.** Engagement comes from useful continuity, anticipation, social play, and satisfying feedback—not misleading scarcity or obstructive prompts.

## Reference findings

- Kahoot makes owned games and past sessions first-class, with date, mode, participant count, replay, and reporting. We should borrow continuity without its workspace complexity.
- Jackbox minimizes participant friction, gives the host clear authority, and treats each lobby as part of the game world. We should borrow room-code simplicity, host controls, and visual staging.
- Plato makes cross-platform play lightweight and social, but reviews show how discovery, chat, news, and public rooms can make navigation confusing. We should borrow recent-group continuity, not become a social network.
- Heads Up succeeds through one unmistakable physical mechanic, rapid rounds, reaction capture, and strong completion moments. We should borrow immediacy and shareable memories.
- AirConsole clearly communicates the role of the host screen and each controller. Game Goat must label Host phone, Own phone, and Spectator states just as clearly.
- Duolingo uses animation at genuine milestones and makes achievements shareable. Game Goat should celebrate a full lobby, game start, first steal, completed draw, and final result.
- Supercell's Brawl Stars loading work shows that visual polish cannot compensate for waiting. Target interactive startup under 2.5 seconds on a modern device and under 5 seconds on supported low-end Android hardware.

## Target information architecture

### Mobile navigation outside live rooms

1. Home
2. My Games
3. Play
4. Join
5. Account

### Live-room navigation

Live rooms keep the compact wordmark header and remove the standard bottom navigation and SEO footer. A room menu provides:

- My Games
- My Account
- Room settings (host only)
- Leave game
- Help

### My Games sections

- Continue Playing
- Active
- Planning
- Recent
- Archived

Cards show game type, room display name/code, role, status, player count, last activity, and one context-aware action.

## Data model

### Device history (guest capable)

A versioned local index stores only resumable metadata and the existing secure player token:

- schema version
- room code and canonical URL
- game type
- player ID and token
- player display name
- role on this room
- room status
- player count
- created, last visited, and completed timestamps
- optional display label
- archived flag

The index is bounded, validates every record, tolerates corrupted storage, and never stores Secret Santa assignment plaintext.

### Account membership

Introduce a room membership table with:

- room ID
- auth user ID (nullable until claimed)
- player ID
- role: host, cohost, participant
- device-session relationship
- is manual/host-managed
- joined and last-active timestamps
- archived timestamp
- notification preference

Uniqueness is scoped to room and player. Authorization always checks the membership for the current room; roles never carry between rooms.

### Room metadata

Normalize user-facing metadata needed for history:

- display name
- game type and rules preset
- lifecycle status
- created, started, completed, expires, and last-active timestamps
- player count
- optional party/exchange relationship
- replay source room ID

## Delivery phases

### Phase 0 — Baseline and safeguards

**Outcome:** a verified foundation and traceable rollout.

- Document the roadmap and acceptance criteria.
- Preserve and commit the existing launch foundation as an intentional baseline.
- Confirm engine, type, build, live multiplayer, and bridge smoke tests.
- Add feature flags for account sync and immersive effects where rollback needs isolation.
- Record performance and accessibility baselines.

**Exit criteria:** clean verification suite; known database migrations identified; production rollback point exists.

### Phase 1 — Device My Games

**Outcome:** every game started or joined on a device can be found again without signing in.

- Add validated, versioned local game-history utilities.
- Register White Elephant and Secret Santa host/join sessions.
- Refresh metadata during lobby, active play, reconnect, and completion.
- Build `/my-games` with Continue Playing, Active, Recent, archived/expired handling, and empty state.
- Add Continue Playing to Home when relevant.
- Change navigation to Home, My Games, Play, Join, Account.
- Add My Games and Account to the live-room menu.
- Add archive/remove-from-device controls without deleting server data.

**Acceptance:** history survives reload; corrupt storage fails safely; no assignment data is exposed; roles and statuses display correctly; a guest resumes in two taps.

### Phase 2 — Account-linked live-room memberships

**Outcome:** signed-in users keep games across devices without changing guest-first play.

- Add membership and normalized metadata migrations.
- Attach authenticated hosts at room creation.
- Attach authenticated participants at join.
- Build a secure claim flow for device games after sign-in.
- Detect duplicate claims and mismatched identity safely.
- Update last-active and lifecycle metadata transactionally.
- Add server-side list APIs/actions scoped to the authenticated user.

**Acceptance:** host/participant roles are room-specific; unauthorized users cannot enumerate rooms; guest tokens continue working; claiming does not alter permissions.

### Phase 3 — Unified Account Goat games

**Outcome:** Account Goat becomes the cross-product organizational source of truth.

- Display live Game Goat rooms alongside planned exchanges.
- Separate Hosted, Cohosted, and Joined views.
- Add Active, Upcoming, Completed, and Archived filters.
- Launch Game Goat through the `/open` pathway with safe web fallback.
- Preserve external routing for product and shopping links.
- Add account prompts that explain value without blocking play.

**Acceptance:** both repositories agree on role/status vocabulary; native/web routing works; account pages never expose private assignment data.

### Phase 4 — Room lifecycle and host tools

**Outcome:** rooms remain manageable when real parties become messy.

- Add reconnect and disconnected-presence feedback.
- Add late-join policy and lobby lock.
- Add remove inactive player, transfer/cohost, pause, resume, end, and restart controls.
- Add clear confirmation for destructive room actions.
- Add replay with copied rules but new credentials.
- Add results history and shareable, privacy-safe recap cards.
- Define expiry, archive, and cleanup jobs.

**Acceptance:** host tools are unavailable to participants; disconnected players can recover; room state cannot deadlock; replay never reuses assignments or secure tokens.

### Phase 5 — Immersive app shell

**Outcome:** Game Goat feels unmistakably native and custom from launch through lobby.

- Add a lightweight branded boot/skeleton state shown only during real initialization.
- Add first-open welcome art with Skip and reduced-motion behavior; never show it on every launch.
- Give each hero game a distinct scene palette while retaining the Goat family system.
- Add illustrated lobby stages with compact functional foreground panels.
- Add purposeful route and card transitions (150–300 ms).
- Add progressive image loading and WebP/AVIF budgets.
- Add offline, reconnecting, and resumed visual states.
- Add native splash/status-bar parity and verify Android/iOS safe areas.

**Performance budgets:** boot art under 120 KB, individual decorative scene under 180 KB, no transition blocks input over 300 ms, no cumulative layout shift from delayed art.

### Phase 6 — Gameplay feedback and celebration

**Outcome:** important social moments feel rewarding and legible.

- Join: avatar arrival and roster pulse.
- Lobby ready: brief full-group flourish.
- Start: game-specific curtain/unwrap transition.
- White Elephant: gift open, steal transfer, lock, displaced-player alert, final-turn spotlight, results celebration.
- Secret Santa: shuffle/mix anticipation, sealed private reveal, recipient card, completed-draw celebration.
- Warmups: countdown, correct/pass feedback, score tick, round recap.
- Add Capacitor haptics with web-safe fallback.
- Add optional sound effects with mute persisted and default behavior respectful of device context.
- Generate privacy-safe share cards and party-photo prompts.

**Acceptance:** every effect communicates state; rapid taps cannot duplicate actions; reduced-motion mode replaces movement with opacity/color; sound is never required to understand results.

### Phase 7 — Useful retention and personalization

**Outcome:** users return because the product remembers and helps, not because it pressures them.

- Play Again and seasonal rematch suggestions.
- Recent party group shortcuts.
- Optional reminders for planned exchanges.
- Secret Santa budget, date, private notes, wishlist, and purchased status.
- Custom trivia/charades packs with family suitability controls.
- Personal statistics limited to useful summaries.
- External gift discovery at contextually appropriate post-draw moments.

**Acceptance:** notifications are opt-in; commerce opens externally; users can remove history and preferences; no artificial urgency.

### Phase 8 — Observability, accessibility, and store launch hardening

**Outcome:** launch quality is measurable and recoverable.

- Add privacy-safe product events: create, join, resume, start, action failure, completion, replay, claim, and exit.
- Never log names, room tokens, assignments, wishlists, or free-text prompts.
- Add startup/load, realtime latency, reconnect, and stalled-state monitoring.
- Add automated multi-context gameplay and role-security tests.
- Add accessibility audits for focus, announcements, contrast, touch targets, motion, and text scaling.
- Add Android device matrix, native back, keyboard, safe-area, offline/resume, camera/share, and low-memory tests.
- Produce store screenshots, feature graphics, privacy disclosures, and staged rollout checklist.

**Acceptance:** zero critical accessibility findings; no known gameplay deadlocks; crash/ANR and startup targets met; rollback and incident playbooks documented.

## Visual system specification

### Motion tiers

- **Micro (80–180 ms):** tap compression, toggles, score ticks.
- **State (180–350 ms):** card arrival, turn change, modal reveal.
- **Moment (500–900 ms):** first steal, completed draw, final results.
- **Milestone (up to 1.5 s, skippable):** first hosted game or meaningful seasonal achievement.

Only one Moment or Milestone animation runs at once. Functional controls remain available as soon as the underlying state permits.

### Loading hierarchy

1. Render app shell immediately.
2. Show skeletons matching final geometry.
3. Show branded Goat activity only after 300 ms of real waiting.
4. After 5 seconds, show progress language and recovery action.
5. Never use fake percentages.

### Celebration hierarchy

- Small confirmation: joined, copied, saved.
- Medium celebration: room ready, gift opened, assignment revealed.
- Large celebration: completed game, completed draw, first hosted room.

### Brand direction

Use the generated Goat characters as hosts and state communicators, not repeated decoration. White Elephant uses cranberry, icy blue, wrapping-paper texture, and physical gift motion. Secret Santa uses spruce, gold, sealed-card motifs, masks, and private-stage lighting. Warmups receive their own accent colors but share typography, borders, shadows, motion curves, and audio language.

## Test matrix per phase

- Guest host, guest participant, signed-in host, signed-in participant.
- Host on one room and participant on another.
- Manual/host-phone player.
- Mobile web, installed Android wrapper, desktop-friendly web.
- Fresh install, returning device, corrupted local history.
- Offline before action, disconnect during action, resume after backgrounding.
- Reduced motion, text scaling, keyboard-only, screen reader.
- Empty, minimum, typical, and maximum roster.

## Commit and rollout policy

- One scoped commit per completed phase, with migrations and compatible application code together.
- Never mix unrelated user work into a phase commit.
- Each phase passes typecheck, engine tests, production build, targeted multiplayer tests, and bridge/device smoke tests before deployment.
- Database changes are additive first; destructive cleanup occurs only after the compatible application is deployed and verified.
- Feature flags protect account claiming, new lifecycle controls, and richer visual effects until their telemetry and failure modes are validated.
