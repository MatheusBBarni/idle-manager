# Block sleep while running — Product Requirements Document

## Problem

A multi-account operator on a **Windows desktop** tiles about **3–6 isolated idle-game logins** and leaves them **running overnight or AFK** so idle progress continues.

The app already does the isolation job: each account is its own persistent session; several can sit in one window; **close** tears down that live view and keeps the login. Hidden, other-tab, and popped-out accounts that are still **running** stay live. Chromium background throttle is already off so those views are not treated as discarded browser tabs.

That fails the job when **Windows sleeps or hibernates on its idle timer**. The farm is still marked running. The PC is not. Overnight ticks stop — the same outcome as a parked game, but caused by the OS, not by a named Park. Changing the Windows power plan is global and easy to forget after the session. A separate keep-awake tool is not tied to “any account is running,” so it is easy to leave on after every panel is closed, or to forget before bed.

This is worth solving now for that Windows overnight operator. Lid-close laptops, dedicated boxes that already have OS sleep off, and casual one-account use are not the V1 center. Isolation does not change. This is not a bot, and it is not a Park that stops ticks.

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | Running = live view; close drops the view, keeps the jar | `README.md`, `src/main/views.ts` | 2026-09-01 | High | Close stays the stop; V1 is not a second sleep model for games |
| Repository | App fights Chromium throttle, not OS sleep | `src/main/index.ts`, `src/main/views.ts` | 2026-09-01 | High | Overnight failure is Windows sleep, not missing anti-throttle |
| Repository | Status bar already reports running count; dialogs cover the stage | `StatusBar.tsx`, `Stage.tsx` | 2026-09-01 | High | Hint lives in the status bar, not a covering modal |
| Repository | Prior packets exclude Park / auto-sleep that **stops ticks** | `running-session-performance/_prd.md` | 2026-08-31 | High | This packet blocks **OS** sleep so ticks continue |
| External | Keep-awake can leave the screen off; lock screen / user Sleep may still win | [PowerToys Awake](https://learn.microsoft.com/en-us/windows/powertoys/awake) | 2026-09-01 | High | V1 may let the display sleep; does not defeat Start→Sleep |
| External | Apps can request “in use” without rewriting the power plan | [SetThreadExecutionState](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-setthreadexecutionstate) | 2025-07-01 | High | Do not ship a power-plan editor |
| External | Status changes that do not steal focus should still be knowable | [WCAG 2.2 SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | 2026-09-01 | Medium | Hint is visible chrome, not a silent flag |
| User decision | Running-bound keep-awake; overnight journal; status-bar hint | Clarification + [ADR-001](adrs/adr-001.md) | 2026-09-01 | High | Locks this PRD |

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | A 3–6 account farm left running overnight/AFK keeps ticking because Windows did not idle-sleep | Unknown. Before change: 1–2 journaled nights with accounts running (did the PC sleep, did idle stop) | After change: same farm, PC still on in the morning, idle continued | Same journal, before vs after | First 1–2 dogfood weeks after the change |
| G-02 | Operator can tell from chrome that sleep is blocked while any account is running | No keep-awake hint today | Hint present whenever ≥1 account is running; absent when zero are running | Chrome review at ship + journal (“did I see that sleep was blocked?”) | At ship + same window |
| G-03 | Windows may sleep again when every account is closed (or the app is no longer running) | Today the OS already sleeps on idle — that is the problem while accounts run | After the last close or after quit, the keep-awake does not stick; usual sleep can occur | Journal: close all (and separately quit), then confirm the PC is allowed to sleep on its usual timer | Same window |

## Out of Scope

- **Named Park / Sleep that stops ticks** — Close already drops the live view. Reconsider only if operators ask for a named park after G-01.
- **Keep the display on all night** — Window need not stay visible; screen may sleep. Reconsider with a new ADR if the journal shows idle froze after monitor-off while the PC stayed on.
- **Settings toggle or “allow sleep anyway” while accounts still run** — Sleep returns only when every account is closed. Reconsider if shared-desktop complaint is that a daytime Start held the PC up.
- **Timed keep-awake / arm-until-morning** — Rejected approach B. Reconsider if G-03 misses because operators leave one account running for days.
- **Changing Windows power-plan settings, defeating lid-close, lock screen, or Start→Sleep** — User-initiated and lid sleep may still win. Reconsider only if G-01 misses on the V1 desktop *idle timer* and evidence shows the OS ignored an in-app request.
- **macOS/Linux as the success gate** — Measure on Windows. Do not worsen isolation on other OSes. Reconsider after Windows dogfood.
- **Tray icon, covering banner, Settings explanation row** — Extra chrome for a behavior with no control. Reconsider if G-02 misses because nobody looks at the status bar.
- **Launch-at-startup changes** — Already exists; does not keep the machine awake. Out unless a later packet ties boot to a live farm.
- **Gameplay automation, proxies, anti-detect, usage telemetry** — Product prohibition. Measurement is a local journal.

## In Scope (MVP)

Selected approach: **automatic keep-awake bound to running accounts, status-bar hint, release when none are running** ([ADR-001](adrs/adr-001.md)). Gives up display-on, an arm/disarm control, tray, and treating lid-close as a ship gate.

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | While any account is running, Windows idle sleep is blocked | Overnight/AFK farm is not killed by the OS timer | G-01, US-01, US-04 | PC can still be on in the morning with those accounts still ticking |
| F-02 | Status bar shows a clear hint that sleep is blocked | Operator is not surprised the PC stayed on | G-02, US-02 | Hint visible whenever ≥1 account is running |
| F-03 | When every account is closed, sleep is allowed again and the hint is gone | Closing the farm returns normal power behavior | G-03, US-03 | No hint; Windows may sleep on its usual timer |
| F-04 | Quitting the app also allows sleep | A stuck keep-awake cannot outlive the process | G-03, US-06 | After quit, Windows may sleep |
| F-05 | Other-tab, popped-out, and minimized running accounts still count | Off-stage is still a farm | G-01, US-04 | Hint and block remain until that account is closed |
| F-06 | Isolation and running/closed semantics are unchanged | Not a bot; not a Park | US-05 | Two logins of the same game stay distinct; close still drops only that live view |
| F-07 | Zero running accounts never blocks sleep | Empty farm is a normal PC | G-03, US-03 | No hint, no keep-awake |

## User Stories

### US-01: Overnight ticks survive idle sleep

- **Persona:** Multi-account operator (Windows desktop)
- **Story:** As an operator, I want Windows not to idle-sleep while my farm is running, so overnight progress is not lost.
- **Acceptance:**
  - **Given** a journaled 3–6 account farm left running overnight/AFK after V1
  - **When** the Windows idle sleep timer would otherwise have fired
  - **Then** the PC is still on in the morning and those accounts continued progressing
- **Skip:**
  - **Given** a dedicated box that already has OS sleep off
  - **When** I leave accounts running
  - **Then** V1 is not judged a failure if that already worked

### US-02: I can see that sleep is blocked

- **Persona:** Multi-account operator
- **Story:** As an operator, I want chrome to say sleep is blocked, so I know why the PC will not sleep.
- **Acceptance:**
  - **Given** at least one running account
  - **When** I look at the status bar (not a covering dialog)
  - **Then** I see a clear hint that sleep is blocked, and game panels stay visible
- **Empty:**
  - **Given** zero running accounts
  - **When** I look at the status bar
  - **Then** that hint is not shown

### US-03: Closing the last account returns sleep

- **Persona:** Multi-account operator
- **Story:** As an operator, I want sleep allowed again when every account is closed, so the PC does not stay awake after the farm is down.
- **Acceptance:**
  - **Given** several running accounts with sleep blocked
  - **When** I close every running account
  - **Then** the hint is gone and Windows may sleep on its usual timer
- **Partial:**
  - **Given** two running accounts
  - **When** I close only one
  - **Then** sleep stays blocked and the hint remains

### US-04: Off-stage running still holds the PC

- **Persona:** Multi-account operator
- **Story:** As an operator, I want other-tab, popped-out, and minimized running accounts to keep the PC awake, so I do not have to stare at the window all night.
- **Acceptance:**
  - **Given** at least one account left running, possibly on another tab, popped out, or with the window minimized
  - **When** I am not looking at that panel
  - **Then** sleep stays blocked and the hint remains until that account is closed

### US-05: Jars stay apart; close is still the stop

- **Persona:** Multi-account operator
- **Story:** As an operator, I want keep-awake to leave isolation and close behavior alone, so this is not a bot and not a Park.
- **Acceptance:**
  - **Given** two running accounts of the same origin
  - **When** sleep is blocked
  - **Then** each still has its own login / cookies / storage, as today
  - **Given** a running account
  - **When** I close that panel
  - **Then** it leaves the stage, that live view is gone, and the login is still there when I start it later

### US-06: Quit does not leave keep-awake stuck

- **Persona:** Multi-account operator
- **Story:** As an operator, I want quitting the app to allow sleep again, so a crashed or closed app cannot hold the PC up.
- **Acceptance:**
  - **Given** accounts were running and sleep was blocked
  - **When** I quit Idle manager
  - **Then** Windows may sleep on its usual timer

## Constraints

- Isolation: one persistent session per account id; never key off list index or display name.
- Running still means idle progress continues. V1 must not pause, discard, or reload a running account in order to save power.
- Close without wipe stays the explicit way to drop a live session.
- Success is judged on **Windows** overnight/AFK dogfood; other OSes must not get weaker isolation.
- The main window need not stay visible; the display may sleep.
- Hint stays in existing chrome (status bar). Do not cover game panels.
- Hint follows the operator’s UI language like the rest of chrome.
- No usage telemetry. Measurement is a local dogfood journal.
- No gameplay automation, proxy, or anti-detect.
- Do not rewrite the user’s Windows power plan.

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| Monitor-off pauses some games while the PC stays on | Display-on was a rejected non-goal; PowerToys defaults to screen off | Medium / High for G-01 on some titles | Journal notes screen-off vs ticks; new ADR for display-on only if that is the miss | Operator, after first nights |
| Lid close, lock screen, or Start→Sleep still sleeps the PC | PowerToys Awake; Modern Standby entry paths | High for those paths / Low for V1 desktop idle timer | Out of scope; G-01 is idle-timer overnight on a desktop | Do not fail V1 on lid-close |
| Operator misses the status-bar hint and leaves the PC on | Chrome A rejected extra surfaces | Medium / Medium | Accepted trade-off; revisit only if G-02 misses | New chrome ADR |
| Keep-awake sticks after last close | Process-level requests can leak | Low / High for G-03 | US-06 + G-03 journal of last close and quit | Maintainer, before calling G-03 |
| Shared household: daytime Start holds the PC all afternoon | Approach B rejected | Medium / Medium | Out of V1; arm control only with a new ADR | Shared-PC complaint after dogfood |

## Architecture Decision Records

- [ADR-001: Running-bound keep-awake](adrs/adr-001.md) — Automatic block while any account is running; status-bar hint; release when none are running; screen may sleep.

## Open Questions

- Exact hint wording (non-blocking; must clearly mean sleep is blocked, in the UI language).
- Whether particular games pause after monitor-off (filled by the G-01 journal, not a product branch).
