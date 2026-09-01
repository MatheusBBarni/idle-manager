# Live-account RAM (invisible diet) — Product Requirements Document

## Problem

A multi-account operator on a **shared Windows PC** tiles about **3–6 isolated idle-game logins** (one or two games) and leaves them **running** so idle progress continues while they use other apps.

The current workflow already does the isolation job: each account is its own persistent session; several can sit in one window; **close** tears down that live view and keeps the login. RAM per account and a total already appear in chrome. Switching layout or game tab only hides a panel. Every account still marked running stays live — including off-stage and other-tab accounts.

That fails the job when a few running logins make the **rest of the PC hard to use** (pressure, other apps, fans). The expensive part is not missing cookies. It is **paying a full live session for every running login**, with no operator-safe way to spend less without stopping the farm. Close-to-save-RAM stops progress. Chrome-style Memory Saver would deactivate “unused” tabs and **reload on return**, which is the wrong trade for idle games.

This is worth solving now for that Windows operator. Casual one-account use, dedicated 20-account boxes, and pop-out-heavy watchers are not the V1 center.

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | Running account = live isolated view; close drops the view, keeps the jar | `README.md`, `src/main/views.ts` | 2026-08-31 | High | Close is already the RAM lever; V1 is not “add close” |
| Repository | Hidden / other-tab running accounts stay live | `src/main/views.ts` `syncViews`, `src/shared/layout.ts` | 2026-08-31 | High | Off-stage still costs; auto-parking them is a product choice, not a bug |
| Repository | RAM chrome exists; it sums account working sets only | `src/main/metrics.ts`, `StatusBar.tsx` | 2026-08-31 | High | Dogfood cannot trust that total as whole-PC cost |
| External | Chrome Memory Saver deactivates unused tabs; they reload when opened | [Chrome Help](https://support.google.com/chrome/answer/12929150?hl=en) | 2026-08-31 | High | Auto-discard is out |
| External | Discard is now common; reload can wreck in-progress flows; no discard event | [Chrome 108 blog](https://developer.chrome.com/blog/memory-and-energy-saver-mode) | 2026-08-31 | High | Idle progress cannot depend on “the tab is still in the strip” |
| External | Extra processes buy isolation at memory cost | [Chromium process model](https://chromium.googlesource.com/chromium/src/+/HEAD/docs/process_model_and_site_isolation.md) | 2026-08-31 | High | Merging jars to save RAM is out |
| User decision | Farm vs PC; ~3–6 accounts; invisible diet; no auto-sleep | Clarification + [ADR-001](adrs/adr-001.md) | 2026-08-31 | High | Locks approach |
| Inference | Baseline GB unknown; 3 live idle sites are already a shared-PC problem | No dogfood journal yet | 2026-08-31 | Medium | Measure before claiming a cut |

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | Keep a 3–6 account farm running on a shared Windows PC without closing panels just to free the machine | Unknown. Before change: one journaled 3-account and one 6-account session (existing RAM readout, Task Manager, whether other apps stayed usable, whether any panel was closed for RAM) | After change: same farms stay running; operator does not close panels just to free the PC; other apps stay usable | Same journal, before vs after | First 1–2 dogfood weeks after the change |
| G-02 | Running accounts keep progressing (no discard / sleep / surprise reload) | Today, running views stay live | 0 unexpected reloads or stopped idle progress on accounts left running | Dogfood journal + operator notice of a game reload or frozen idle | Same window |
| G-03 | Start / close / tile workflow does not gain a sleep control | Current chrome | G-01 is met with no new Park, Memory Saver, live-cap, or pressure-nudge chrome | Chrome review at ship + dogfood | At ship |

## Out of Scope

- **Auto-sleep, auto-discard, Chrome Memory Saver** — Stops idle progress. Reconsider only with a new ADR if G-01 is impossible without parking.
- **Manual Park / Sleep state** — Close already drops the live view. Reconsider if operators ask for a named park after G-01.
- **Merging sessions or sharing a cookie jar** — Isolation is the product. No reconsideration without a product reversal.
- **Live-account cap or “confirm to run more”** — Fights the 3–6 target. Reconsider only as a last-resort ADR if the diet cannot ship.
- **Pressure-hint / “Fix now” chrome** — Rejected for V1. Reconsider if G-01 misses because nobody notices they over-started.
- **Honest whole-app RAM redesign** — Operator should not need new chrome to succeed. Dogfood may still use Task Manager. Reconsider if G-01 cannot be judged.
- **Pop-out extra-window diet, 20-account dedicated boxes** — Not the V1 user. Reconsider after shared-PC dogfood.
- **macOS/Linux as the success gate** — Measure on Windows. Do not worsen isolation on other OSes. Reconsider a platform ADR if Windows G-01 passes and other OSes regress.
- **Gameplay automation, proxies, anti-detect, usage telemetry** — Product prohibition.

## In Scope (MVP)

Selected approach: **invisible live-farm diet** ([ADR-001](adrs/adr-001.md)) — same start / close / tile; running keeps ticking; those live accounts cost less on the machine so other Windows apps stay usable. Gives up Park chrome, auto-sleep, live caps, and a RAM-readout project. If live accounts cannot cost less without pausing progress or merging jars, V1 does not ship a fake control.

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | A 3–6 account live farm leaves the shared PC usable | Farm does not evict other work | G-01, US-01 | Operator keeps those accounts running and still uses other apps |
| F-02 | Every running account keeps progressing, including hidden and other-tab ones | Off-stage is still a farm | G-02, US-02 | No surprise reload or stopped idle on accounts left running |
| F-03 | Close still drops that live session and keeps the login | Operator retains the only explicit RAM lever | G-03, US-03 | Closed account gone from the stage; login survives restart |
| F-04 | Isolation unchanged while the diet applies | Account A never sees B’s jar | US-04 | Two running logins of the same game stay distinct |
| F-05 | No new sleep / cap / pressure chrome required | Nothing to learn mid-raid | G-03, US-01 | Same chrome verbs as today |

## User Stories

### US-01: Farm plus other apps

- **Persona:** Multi-account operator (Windows, shared PC)
- **Story:** As an operator, I want a 3–6 account farm to leave the PC usable, so I do not close panels just to check mail or another app.
- **Acceptance:**
  - **Given** a journaled 3-account and 6-account farm after V1
  - **When** I use other Windows apps in a normal session
  - **Then** I can leave those accounts running; I do not close panels just to free the machine
- **Empty / skip:**
  - **Given** only one running account
  - **When** I use other apps
  - **Then** V1 is not judged a failure if that already worked

### US-02: Running still means ticking

- **Persona:** Multi-account operator
- **Story:** As an operator, I want every running account to keep progressing while I look at another app or another panel, so the farm is still a farm.
- **Acceptance:**
  - **Given** several accounts left running, some hidden or on another game tab
  - **When** I focus another app or another panel
  - **Then** those running accounts stay running and do not come back as a fresh load the way a discarded Chrome tab would
- **Failure:**
  - **Given** an account I did not close
  - **When** I return to it
  - **Then** I do not find it reloaded or idle-stopped because the app parked it to save RAM

### US-03: Close remains the stop

- **Persona:** Multi-account operator
- **Story:** As an operator, I want close to still drop the live session and keep the login, so I am not taught a second sleep model.
- **Acceptance:**
  - **Given** a running account
  - **When** I close that panel
  - **Then** it leaves the stage, that account’s live cost goes away, and the login is still there when I start it later

### US-04: Jars stay apart

- **Persona:** Multi-account operator
- **Story:** As an operator, I want the RAM diet to leave isolation alone, so two live users of the same game never share a login.
- **Acceptance:**
  - **Given** two running accounts of the same origin
  - **When** the diet is in effect
  - **Then** each still has its own login / cookies / storage, as today

## Constraints

- Isolation: one persistent session per account id; never key off list index or display name.
- Running means idle progress continues; V1 may not pause, discard, or reload a running account to save RAM.
- Close without wipe stays the operator’s explicit way to drop a live session.
- Success is judged on **Windows** dogfood; other OSes must not get weaker isolation.
- No usage telemetry. Measurement is a local dogfood journal.
- No gameplay automation, proxy, or anti-detect.
- Do not cover game panels with a new performance overlay (existing dialogs already hide views).

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| Live sessions cannot get cheaper without pausing ticks | Electron/Chromium process cost; idle needs timers | Medium / High — V1 has nothing to ship | Stop; do not add Park by stealth. New ADR if parking is proposed | Maintainer, after first diet attempt |
| Fake win: RAM drops because games froze | Chrome Memory Saver reload behavior | Medium / High | G-02 is a ship blocker | Dogfood |
| Invisible change has no baseline | Status-bar RAM understates the machine | High / Medium | G-01 journal before and after, including Task Manager and “did I close for RAM?” | Operator, before calling G-01 |
| Operators still over-start (8–20 accounts) | V1 user is 3–6 | Medium / Low | Out of scope; do not cap | Revisit if dogfood is actually a 20-account box |

## Architecture Decision Records

- [ADR-001: Invisible live-farm diet](adrs/adr-001.md) — Same workflow; running keeps ticking; live accounts cost less; no auto-sleep, Park, cap, or pressure chrome.

## Open Questions

- How many GB a typical 3- and 6-account farm uses **before** the diet (filled by the G-01 baseline journal, not a product branch).
- Whether GPU / whole-process RAM needs to appear in chrome later (explicitly out of V1).
