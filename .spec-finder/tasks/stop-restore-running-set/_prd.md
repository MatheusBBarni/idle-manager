# Stop and restore last running set — Product Requirements Document

## Problem

A farm operator tiles several isolated idle-game logins—typically one game, sometimes a second tab—and leaves them **running** so idle progress continues. Evening they need that live farm down so the rest of the PC is usable. Morning they need **the same jars** back.

Current workflow: **Start all** starts every **closed** account in the **current tab**. Stop is **per panel** (Close panel, stage X, double-click). Keyboard starts only the targeted account; start-all/stop were cut from the account-loop packet. Close already drops the live view and **keeps the login**. Running status is saved, so quitting **without** closing brings the farm back live.

Evening is one Close per live panel, including any other tab still running. Morning Start all is the wrong set: unused closed jars come up with last night’s farm. Cost: leftover live views overnight, or extra sessions meant to stay closed.

Worth solving now because Start all already exists, Close is already the stop, and shortcuts deferred this bottleneck. Primary user: the farm operator. One-account users keep per-panel Start/Close.

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | Start all = current tab, every closed jar | `src/renderer/src/components/Sidebar.tsx` | 2026-09-01 | High | Morning needs a different verb |
| Repository | Stop is per-panel Close; no bulk stop | `Sidebar.tsx`, `Stage.tsx`, `src/shared/i18n.ts` | 2026-09-01 | High | Evening is N clicks |
| Repository | Close keeps the jar; running persists across quit | `src/main/views.ts`, `src/shared/workspace.ts` | 2026-09-01 | High | Bulk stop ≠ wipe; quit-with-running already restores live |
| Repository | Keyboard start-all/stop deferred; auto-sleep out | `keyboard-shortcuts/_prd.md`; `running-session-performance/_prd.md` | 2026-08-30 | High | New verbs get keys; Park stays out |
| External | Wavebox: manual group sleep; default auto-sleep 15 min | [Sleep & Performance](https://hub.wavebox.io/sleep-performance/) (20 May 2026) | 2026-05-20 | High | Manual bulk sleep is the analog; timed sleep is not |
| External | Memory Saver discards unused tabs; reload on return | [Chrome 108 blog](https://developer.chrome.com/blog/memory-and-energy-saver-mode) | 2022-12-08 | High | Auto-discard is out |
| External | Pointer actions need a keyboard equivalent | [WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) | 2026-07-02 | High | Stop/restore are not chrome-only |
| User decision | Evening+last-set; farm operator; journal; last non-empty farm; keys for new verbs; explicit trio | Clarification + [ADR-001](adrs/adr-001.md) | 2026-09-01 | High | Locks this PRD |

**Inference (labeled):** operators may hit Start all instead of restore. Not measured.

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | Evening stop of the chosen scope drops those live views without wiping jars | One Close per running panel (unknown click count until journaled) | One journaled evening: stop this tab or whole farm puts that scope down in one action; logins still there | Local dogfood journal | ~1 week of sessions after the change |
| G-02 | Morning restore brings back only the last non-empty farm | Start all starts every closed jar in this tab | One journaled morning: restore starts that last farm; unused closed jars stay closed | Journal account list before vs after restore | Same window |
| G-03 | These actions never mix jars or wipe them | Per-panel close already keeps the login | 0 wipes and 0 mixed logins from stop/restore | Journal: same logins after stop then restore | Same window |
| G-04 | Stop this tab, stop whole farm, and restore work from the keyboard while a game panel is focused | Those three actions are mouse-only | Pass in real sessions for an operator who knows the binds | Dogfood journal | Same window |
| G-05 | Start all still starts every closed jar in the current tab | Sidebar Start all works today | No regression | Manual checklist + same week’s journal | Same window |

## Out of Scope

- **Auto-sleep, auto-discard, Memory Saver, timed/scheduled night stop** — Acts without the operator or stops idle progress. Reconsider with a new ADR only if G-01 is impossible without parking, or the journal shows they never remember to stop.
- **Named farm presets / last-set per tab** — One last non-empty farm is the morning job. Reconsider if a two-game operator needs two restores (G-02 miss).
- **Replacing Start all, or keyboard Start all** — Start all stays mouse-only. Reconsider if G-02 fails because they hit Start all, or Start all is still the mouse bottleneck.
- **Auto-start last-set on launch or as the empty-stage primary CTA** — Running already returns if they never stopped; auto-start after a stop undoes evening. Reconsider if G-02 fails because restore is unfindable.
- **Wipe, clear session, delete, sharing a cookie jar, bots, macros** — Product prohibition.
- **Changing per-panel Start, Close, or double-click** — Still the one-jar path.
- **Usage telemetry** — Dogfood journal only.

## In Scope (MVP)

Selected approach: **explicit trio** next to Start all — Stop this tab, Stop whole farm, Restore last set — plus those three keyboard binds while a game is focused ([ADR-001](adrs/adr-001.md)). Gives up auto-start, Start all keys, named presets, per-tab last-set, and burying farm-stop in a menu.

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | Stop this tab | Evening can put one game down | G-01, US-01 | Running accounts in the active tab close; other tabs’ running stay; logins remain |
| F-02 | Stop whole farm | Evening can put every live jar down | G-01, US-02 | Every running account closes; logins remain |
| F-03 | Remember last non-empty farm | Morning has a set to restore | G-02, US-03 | Restore uses the accounts that were running the last time any panel was live |
| F-04 | Restore last set | Morning is last night’s farm, not every closed jar | G-02, US-03 | Those still-existing accounts start; other closed jars stay closed |
| F-05 | Start all unchanged | Unused jars can still be brought up on purpose | G-05, US-05 | Start all still starts every closed account in the current tab |
| F-06 | Keyboard for the three new verbs while a game panel is focused | Evening/morning without a sidebar trip | G-04, US-04 | Stop tab, stop farm, and restore fire from those binds |
| F-07 | Empty and stale paths do nothing harmful | No surprise starts or wipes | US-03 | Stop with nothing running, or restore with no last-set / all those accounts gone, leaves the workspace as-is |
| F-08 | Isolation and keep-on-close unchanged | Two live users of one origin stay distinct | G-03, US-06 | Stop/restore never share a jar or clear site data |

A jar closed by hand while others still run is **not** in the next restore. Deleted accounts in the last set are skipped.

## User Stories

### US-01: Stop this tab

- **Persona:** Farm operator
- **Story:** As a farm operator, I want to stop every running account in the current tab in one action, so I can put this game down without clicking each Close panel.
- **Acceptance:**
  - **Given** two accounts running in the active tab and one running in another tab
  - **When** I stop this tab
  - **Then** the active tab’s running accounts are closed, the other tab’s account is still running, and all three logins are still there
  - **Given** no account is running in the active tab
  - **When** I stop this tab
  - **Then** nothing changes

### US-02: Stop whole farm

- **Persona:** Farm operator
- **Story:** As a farm operator, I want to stop every running account in one action, so evening teardown does not depend on which tab I am looking at.
- **Acceptance:**
  - **Given** running accounts in two tabs, including a popped-out panel
  - **When** I stop the whole farm
  - **Then** every account is closed (pop-outs included), and no login is wiped
  - **Given** nothing is running
  - **When** I stop the whole farm
  - **Then** nothing changes

### US-03: Restore last non-empty farm

- **Persona:** Farm operator
- **Story:** As a farm operator, I want to start the accounts that were running last, so morning is last night’s farm and not every closed jar in this tab.
- **Acceptance:**
  - **Given** accounts A, B, and C; A and B were running the last time any panel was live; C stayed closed
  - **When** I restore last set
  - **Then** A and B are running and C stays closed
  - **Given** I closed A by hand while B was still running, then stopped the rest so nothing was live
  - **When** I restore last set
  - **Then** A stays closed and the accounts that were still running at empty come back
  - **Given** one of those accounts was deleted
  - **When** I restore last set
  - **Then** the remaining last-set accounts start and the deleted one is not recreated
  - **Given** no last non-empty farm (nothing has run yet, or every account in it is gone)
  - **When** I restore last set
  - **Then** no account starts

### US-04: Keyboard trio

- **Persona:** Farm operator
- **Story:** As a farm operator, I want stop this tab, stop whole farm, and restore from the keyboard while a game is focused, so evening and morning do not require the sidebar.
- **Acceptance:**
  - **Given** a game panel is focused and some accounts are running
  - **When** I press the stop-this-tab bind (or stop-whole-farm bind)
  - **Then** that scope closes as in US-01 / US-02
  - **Given** a game panel is focused and a last set exists
  - **When** I press the restore bind
  - **Then** last set starts as in US-03
  - **Given** I type in a game field with keys that are not those reserved modifier chords
  - **When** I type
  - **Then** the game still receives the keystrokes

### US-05: Start all still means all in this tab

- **Persona:** Farm operator
- **Story:** As a farm operator, I want Start all to keep starting every closed jar in this tab, so last-set restore does not remove the “bring the rest up” action.
- **Acceptance:**
  - **Given** a tab with closed accounts that were not in the last set
  - **When** I Start all
  - **Then** every closed account in that tab is running

### US-06: Jars stay apart and unwiped

- **Persona:** Farm operator
- **Story:** As a farm operator, I want stop and restore to leave isolation and site data alone, so putting the farm down is not a logout.
- **Acceptance:**
  - **Given** two accounts of the same origin, both running
  - **When** I stop the farm and later restore last set
  - **Then** each is still its own login; neither session was cleared

## Constraints

- Isolation stays one persistent session per account; never keyed off list index or display name.
- Stop is Close panel: live view goes away, cookie jar stays. These actions must not clear site data.
- Not a bot, macro, auto-sleep, or anti-detect product.
- The three new keys work while a game panel is focused. Only reserved **modifier** chords; unmatched keys reach the game. No OS-global shortcuts.
- The three binds are listed with the other documented shortcuts (Settings and README). Exact chords are not this PRD.
- Chrome that covers the stage keeps existing overlay behavior (game views hide while covered).
- Windows is the primary shipping OS; macOS/Linux get the same operator-visible stop/restore.
- Labels ship in the app’s existing languages. No usage telemetry.

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| Operator hits Start all in the morning instead of restore | Four bulk actions; Start all already exists | Medium / Medium | Keep both verbs (G-05); journal; do not silently change Start all | Product; reopen “replace Start all” only if that week fails |
| Accidental whole-farm stop closes the other game | Farm-stop is always visible | Medium / Medium | Stop this tab remains; G-01 journal | Product; bury farm-stop only if dogfood shows accidents |
| Last-set missing a jar closed by hand during the day | Locked last non-empty farm | High / Low — expected | Documented in US-03; Start all still brings unused jars up | Named presets stay out unless operators ask |
| Restore starts jars on a tab that is not visible | Other-tab running already stays live | Medium / Low | Same as today’s off-stage farm | Revisit per-tab last-set if G-02 dogfood is confused |
| New chords collide with a game | Idle-game Mod use unknown | Medium / High | Modifier chords only; listed next to remappable binds | Product; remap if typing is stolen |

## Architecture Decision Records

- [ADR-001: Explicit evening/morning trio](adrs/adr-001.md) — Stop this tab, stop whole farm, restore last non-empty farm, plus those three keys; Start all unchanged.

## Open Questions

- Exact modifier chords for the three binds (TechSpec). Product rule: modifier chords only, never bare keys.
- Visible labels/icons for the four bulk actions so Start all and restore stay distinct (design/TechSpec, not a scope branch).
- Whether restore should also switch the active tab to one of the restored accounts (not required if starting them is enough for G-02).
