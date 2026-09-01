# Game-list starter pack — Product Requirements Document

## Problem

A friend or new operator who is handed an Idle manager setup today cannot receive **which games to open**. The current workflow is: the sender uses Settings → Export workspace, or the recipient recreates every tab by typing URLs. Export workspace writes tab names and URLs **and** account names, colors, and home URLs. Import workspace then **replaces the whole workspace** with no confirm and closes every session. Cookie jars are not in that file and stay on the sender’s PC (`README.md` Privacy; `exportMetadata`; `ops:import`).

That fails the handoff. The recipient either rebuilds the game bar by hand, or loads a file that carries account identity metadata and can wipe what they already added. Destructive chrome (delete tab, wipe jar) already confirms; this Import does not.

This is worth solving now because the workspace file is already in Settings and looks like the way to share a setup. Primary user: the **recipient** of a starter pack. Secondary: the operator who already has games in the bar and can export them. Mid-farm backup of jars is not this job.

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | Settings Export/Import already exist; file includes account name/color/URL | `Dialogs.tsx`, `workspace.ts` `exportMetadata` | 2026-08-31 | High | V1 is a **separate** games pack, not a tweak of that file |
| Repository | Import replaces the snapshot, closes sessions, no confirm | `src/main/index.ts` `ops:import` | 2026-08-31 | High | Game-list load must not use that replace path |
| Repository | Tab = game URL; account = isolated jar; cookies stay on device | `AGENTS.md`, `README.md` | 2026-08-31 | High | Pack may list games; it must not list jars |
| External | Chrome bookmark import is additive if bookmarks already exist | [Chrome Help](https://support.google.com/chrome/answer/96816) | 2026-08-31 | High | Load **adds** games; it does not replace the bar |
| External | VS Code shares workspace settings; profile export drops machine-specific values | [VS Code settings](https://code.visualstudio.com/docs/configure/settings), [profiles](https://code.visualstudio.com/docs/configure/profiles) | 2026-08-31 | High | Share games, not device/account state |
| External | Ferdium documents accountless backup of services, separate from logins | [Ferdium FAQ](https://ferdium.org/faq) | 2026-08-31 | Medium | Starter pack ≠ session move |
| Inference | A friend can click Import workspace by mistake | Two buttons will sit in Settings | 2026-08-31 | Medium | Accepted V1 risk (ADR-001); not in scope to guard |
| User decision | Settings pack only; additive; in-bar tabs; recipient is primary | Clarification + ADR-001 | 2026-08-31 | High | Locks approach A |

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | A recipient who did not already have those games ends with the pack’s tabs in the bar and **zero** account records from the file | Today: type each URL, or Import workspace (accounts + full replace) | One real sender→recipient handoff passes | Dogfood journal of that handoff | ~1 week of sessions |
| G-02 | Import game list does not delete or close the recipient’s existing tabs or accounts | Import workspace replaces the workspace | 0 tabs/accounts removed in that handoff | Compare bar + account list before vs after | Same week |
| G-03 | Workspace Export/Import remain available and still carry today’s workspace metadata | Those two Settings actions work now | Still present; still a full workspace file, not the pack | Manual Settings checklist | Same week |
| G-04 | Sender can produce the pack from Settings in one export of every in-bar tab | No games-only export | One Settings action writes the live list (no archived, no accounts) | Dogfood: open the file’s effect on a recipient, not a schema review | Same week |

## Out of Scope

- **Account records, cookie jars, running/closed, mute, zoom, pop-out** — Contradicts the need. Reconsider only if a later ADR makes session move the job.
- **Locale, theme, window size, launch-at-startup** — Device preference, not a game list. Reconsider if a “clone my chrome” request is evidenced after G-01.
- **Using today’s workspace Export as the pack, or removing it** — Non-goal and G-03. Reconsider if two Settings pairs confuse the handoff (G-01 miss).
- **Confirm or extra copy on Import workspace** — Approach B, rejected. Reconsider if dogfood fails because the friend used that action.
- **Empty-bar “Load game list” control** — Approach C, rejected. Reconsider if the recipient cannot find Settings.
- **Picker of which games to export** — Sender ships the live bar in one click. Reconsider if packs are routinely too large.
- **Archived tabs in the pack** — Friend should see a starter bar, not history. Reconsider if senders need to include closed games.
- **Replace-the-bar import** — Additive load is locked. Reconsider only with a confirm ADR.
- **Cloud, URL, or gist sharing** — File handoff only. Reconsider if passing a file is the G-01 failure.
- **Gameplay automation, proxies, anti-detect, usage telemetry** — Product prohibition; dogfood only.

## In Scope (MVP)

Selected approach: **Settings game-list pack, additive load** ([ADR-001](adrs/adr-001.md)) — Export/Import game list for in-bar name+URL; existing tabs/accounts stay; workspace Export/Import unchanged. Gives up a wrong-click guard and a first-run control.

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | Export game list from Settings | Sender can hand over games | G-04, US-01 | A file is saved from one Settings action |
| F-02 | Pack is every in-bar tab’s name and URL | Live list, no jars | G-01, G-04, US-01, US-06 | Recipient sees those games; no accounts from the file |
| F-03 | Archived tabs are omitted | Friend gets a starter bar | G-04, US-06 | Closed/archived games do not appear from the pack |
| F-04 | Import game list from Settings | Recipient loads games without typing URLs | G-01, US-02 | Pack tabs appear in the bar |
| F-05 | Import **adds**; it does not replace | Existing setup survives | G-02, US-03 | Prior tabs and accounts still there |
| F-06 | This import never creates accounts | Starter pack ≠ identity | G-01, US-02, US-04 | Account list gains nobody from the file |
| F-07 | Duplicate names/URLs are allowed | Same as the product today | US-05 | A second add of the same game is another tab |
| F-08 | Cancel, empty, or unreadable pack leaves the workspace as-is | No surprise wipe | US-04 | Bar and accounts unchanged |
| F-09 | Workspace Export/Import stay | Operators keep today’s backup | G-03, US-07 | Both actions still in Settings |
| F-10 | EN and PT labels for the new actions | Chrome is bilingual | US-08 | Both locales name game list, not only “workspace” |

## User Stories

### US-01: Sender exports the live bar

- **Persona:** Operator with games already in the bar (sender)
- **Story:** As a sender, I want to export every game currently in the bar in one Settings action, so that I can give a friend the list without account names.
- **Acceptance:**
  - **Given** two in-bar tabs and one archived tab, each with accounts
  - **When** I Export game list and save
  - **Then** a recipient of that file can get the two in-bar games and cannot get accounts or the archived tab from it
  - **Given** I cancel the save
  - **When** the dialog closes
  - **Then** my workspace is unchanged
  - **Given** no in-bar tabs
  - **When** I Export game list and a recipient imports that file
  - **Then** the recipient gains no tabs and no accounts

### US-02: Recipient loads the pack

- **Persona:** Friend / new operator (recipient)
- **Story:** As a recipient, I want to import a game list from Settings, so that those games appear without creating jars.
- **Acceptance:**
  - **Given** I do not have those games
  - **When** I Import game list and choose the sender’s pack
  - **Then** those games are in my bar and my account list did not gain rows from the file
  - **Given** Settings is open
  - **When** I reach Import game list with the keyboard
  - **Then** I can start the same load without a pointer

### US-03: Existing setup stays

- **Persona:** Recipient who already added a tab or account
- **Story:** As a recipient, I want my existing games and jars left alone, so that a pack cannot wipe me.
- **Acceptance:**
  - **Given** I already have a tab and an account
  - **When** I Import game list
  - **Then** that tab and account are still present, and pack games are added beside them

### US-04: Bad or cancelled load is a no-op

- **Persona:** Recipient
- **Story:** As a recipient, I want a cancelled or unreadable file to do nothing, so that I do not lose my bar.
- **Acceptance:**
  - **Given** I start Import game list
  - **When** I cancel the file dialog
  - **Then** my workspace is unchanged
  - **Given** I choose a file that is empty or not a game list
  - **When** the import finishes
  - **Then** no accounts are created and my existing tabs are not deleted

### US-05: Same game twice

- **Persona:** Recipient
- **Story:** As a recipient, I want a second import of the same pack to add again, so that I am not blocked because I already tried.
- **Acceptance:**
  - **Given** I already imported a pack
  - **When** I import it again
  - **Then** another copy of those tabs appears; no accounts are created from the file

### US-06: Archived games stay off the pack

- **Persona:** Sender
- **Story:** As a sender, I want archived games left out, so that my friend does not load my history.
- **Acceptance:**
  - **Given** a game is archived
  - **When** I Export game list
  - **Then** that game is not one the recipient receives

### US-07: Workspace backup still there

- **Persona:** Operator
- **Story:** As an operator, I want Export/Import workspace still in Settings, so that the old full-workspace file still exists.
- **Acceptance:**
  - **Given** Settings is open
  - **When** I look at backup actions
  - **Then** workspace Export and Import are still there in addition to game list Export and Import

### US-08: Bilingual names

- **Persona:** Recipient using PT or EN
- **Story:** As a recipient, I want the new actions labeled in my chrome language, so that I can tell game list from workspace.
- **Acceptance:**
  - **Given** locale is EN or PT
  - **When** I open Settings
  - **Then** game-list export/import strings are in that locale and are not the same as the workspace strings

## Constraints

- The pack must not contain account identity (names, colors, URLs of jars) or cookie/session data. Sessions stay on the device that created them.
- Import game list must not wipe or close jars, even if the chosen file looks like a workspace dump.
- Duplicate tab names are already allowed; this pack must not invent a uniqueness rule.
- Chrome stays PT and EN.
- Not a bot, macro, proxy, or anti-detect path. No usage telemetry; G-01 is dogfood.

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| Friend clicks Import workspace | Two pairs in Settings; that import replaces the workspace | Medium / high | Accepted in ADR-001; distinct labels (F-10) | Revisit approach B if G-01 fails on wrong click |
| Sender exports workspace by habit | Those buttons already exist | Medium / medium | Separate action names; G-04 checks the pack’s effect | Revisit preview if the sent file still has account names |
| Recipient cannot find Settings | Primary user is new | Medium / high | V1 is Settings-only by choice | Revisit approach C if G-01 fails on findability |
| Duplicate games clutter the bar | Additive load + re-import allowed | Low / low | Matches existing duplicate-name rule | Revisit only if dogfood complains |
| Empty export confuses a friend | Sender with no in-bar tabs | Low / low | US-01: recipient gains nothing | No extra empty-state in V1 |

## Architecture Decision Records

- [ADR-001: Settings game-list pack, additive load](adrs/adr-001.md) — Separate in-bar name+URL pack in Settings; additive import; workspace Export/Import unchanged.

## Open Questions

- Default name in the save dialog (non-blocking; does not change who or what is in the pack).
- Whether README/site should mention the pack after G-01 (docs only; not required to pass the handoff).
