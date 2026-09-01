# Close-to-tray (dismissed farm) — Product Requirements Document

## Problem

A multi-account operator on a **shared Windows PC** tiles about **3–6 isolated idle-game logins** and leaves them **running** so idle progress continues while they use other apps.

The current workflow already isolates jars and can keep ticks going while the window is still around: several live views sit in one large chrome window; **Minimize** leaves that window on the taskbar; switching game tab only hides a panel. **Close (X)** is the normal way to get a Windows window out of the way. Today Close destroys every live view and quits the app. There is no way to dismiss the large window without ending the farm.

That fails the job in two ways at once. One Close click stops every running login (lost idle progress). Keeping the farm means occupying the desktop or taskbar, which fights using mail, browser, or another game on the same PC.

This is worth solving now for that Windows operator. Casual one-account use, dedicated always-on boxes, and pop-out-heavy watchers are not the V1 center. The farm-vs-PC **cost** packet (`running-session-performance`) is a different job; this packet is **window presence**.

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | Close (X) closes the window; last window destroys all live views and quits on Windows | `src/main/index.ts`, `Chrome.tsx` | 2026-09-01 | High | V1 must change what Close means when a farm is running, not add a bot |
| Repository | Minimize exists; running views are kept live (throttling off). No tray. Count lives in the status bar | `views.ts`, `StatusBar.tsx`, Settings | 2026-09-01 | High | Preserve Minimize; count must survive dismiss; do not pause hidden accounts |
| Repository | Running = live isolated session; close panel drops the view, keeps the login | `README.md`, `AGENTS.md` | 2026-09-01 | High | Dismissing chrome must not wipe jars or merge them |
| External | Stock Windows apps quit on last window; a tray stays only if the app does not quit | [Electron Tray tutorial](https://www.electronjs.org/docs/latest/tutorial/tray) | 2026-09-01 | High | Today’s quit-on-close matches OS default, not a farm |
| External | Notification area is for status of a program with **no desktop presence**; icons start in overflow; user promotes them | [Win32 notification area](https://learn.microsoft.com/en-us/windows/win32/shell/notification-area) | 2026-09-01 | High | Tray only after dismiss; do not balloon; count may sit in overflow |
| External | Hidden/minimized pages can stay “visible” if the app does not throttle them | [Electron BrowserWindow visibility](https://www.electronjs.org/docs/latest/api/browser-window) | 2026-09-01 | High | Ticks while dismissed are a product requirement, not an OS guarantee |
| User decision | Both failures; shared-PC 3–6 farm; journal success; no tray console; Close→tray only if running | Clarification + approach A | 2026-09-01 | High | Locks this PRD |
| Inference | Weekly “I hit X and killed the farm” count is unknown | No dogfood journal yet | 2026-09-01 | Medium | Baseline is behavior (Close always kills), not a fabricated rate |

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | Dismiss the large window on a 3–6 account Windows farm without stopping those running accounts, and use other apps without Idle manager occupying the desktop | Today every Close ends the farm; the window must stay up or minimized on the taskbar to keep ticks. Unknown weekly accident count — tally “Close killed ticks” / “left window up only to keep ticks” before change if possible, else record that starting behavior | After change: 0 Close/dismiss actions that stop running accounts; other apps used with Idle manager’s window not on the desktop | Same before/after dogfood journal (3-account and 6-account sessions) | First 1–2 dogfood weeks after the change |
| G-02 | Running accounts keep progressing while chrome is dismissed | Today, running views stay live while the window exists; dismissed-window ticks do not exist | 0 unexpected reloads or frozen idle on accounts left running while dismissed | Journal + operator notice of a game reload or frozen idle | Same window |
| G-03 | Operator can tell a dismissed farm is still running without restoring the window | Count exists only in the status bar, which goes away with the window | Running count is visible from the tray without restoring | Journal: “did I know how many were still running?” | Same window |
| G-04 | Operator can restore the window and can leave the app on purpose; empty chrome still quits | Today Close always quits; there is no dismiss/restore | Restore returns the same running farm; explicit Quit exits; Close with nothing running quits and leaves no tray | Journal + at-ship pass of empty Close vs live Close vs Quit vs restore | At ship + same window |

## Out of Scope

- **Tray as a farm console** (start / stop / mute / reload / switch account) — Chrome remains the operator surface. Reconsider only if dogfood shows restore-to-act is the new failure (new ADR).
- **Pause, sleep, or discard when dismissed** — Running still means ticking. No reconsideration without a product reversal.
- **Balloons / toasts** (“still running in the tray”) — Win32: notification area is not for interruption. Reconsider if G-01 misses because overflow hid the icon.
- **Start hidden at login** — Launch-at-startup already shows the window. Reconsider after G-01 if operators want a headless farm on boot.
- **Minimize-to-tray** — Minimize stays ordinary Windows minimize (taskbar button, ticks continue). Reconsider if dogfood treats Minimize as another accidental farm-killer (it is not, today).
- **Close-to-tray setting / classic Close=Quit opt-out** — One Close rule. Reconsider if operators demand Close=Quit for a live farm (new ADR).
- **Tray icon while the window is visible** — Tray is presence for a dismissed farm. Reconsider if count-in-chrome is not enough while the window is up.
- **macOS / Linux as the success gate** — Measure on Windows; do not worsen isolation elsewhere. Reconsider a platform ADR after Windows G-01.
- **Pop-out-specific tray** — Not the V1 user. Reconsider if dogfood is pop-out-heavy.
- **Gameplay automation, proxies, anti-detect, usage telemetry, merging jars** — Product prohibition.

## In Scope (MVP)

Selected approach: **dismissed-farm presence** ([ADR-001](adrs/adr-001.md)) — Close with a live farm hides the large window; ticks continue; tray shows running count; restore and Quit from the tray; Quit also from Settings while the window is open; Close with nothing running quits; Minimize unchanged. Gives up always-on tray, Close=Quit opt-out, minimize-to-tray, and a tray command surface.

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | Close while any account is running dismisses chrome off desktop and taskbar; those accounts keep running | `X` no longer kills the farm | G-01, G-02, US-01 | Window gone; running accounts still progressing |
| F-02 | Close with no running accounts quits | Empty chrome behaves like a normal Windows app | G-04, US-02 | App gone; no leftover tray |
| F-03 | Tray shows how many accounts are running without restoring | Operator knows the farm is alive | G-03, US-05 | Count readable from the tray |
| F-04 | Operator can bring the window back from the tray | Farm is still operable | G-04, US-03 | Same running accounts, window usable again |
| F-05 | Explicit Quit exits even when a farm is running (tray, and Settings while the window is open) | Leave on purpose | G-04, US-04 | Process gone; ticks stopped because the operator quit |
| F-06 | Minimize still minimizes to the taskbar and keeps ticks | Existing habit preserved | G-02, US-06 | Taskbar button remains; farm still running |
| F-07 | Isolation unchanged while dismissed | Account A never sees B’s jar | US-07 | Two running logins of the same game stay distinct |

## User Stories

### US-01: Dismiss a live farm

- **Persona:** Multi-account operator (Windows, shared PC)
- **Story:** As an operator, I want Close to put a running farm out of the way, so I can use other apps without stopping idle progress.
- **Acceptance:**
  - **Given** 3–6 accounts running in the main window
  - **When** I Close the window
  - **Then** the window is not on the desktop or taskbar, those accounts stay running, and idle progress continues
- **Failure / recovery:**
  - **Given** I dismissed a live farm and cannot see the window
  - **When** I look at the notification area (including overflow)
  - **Then** Idle manager is still present there with a running count, not gone as if I had Quit

### US-02: Empty Close still quits

- **Persona:** Multi-account operator
- **Story:** As an operator, I want Close to exit when nothing is running, so an empty window does not linger in the tray.
- **Acceptance:**
  - **Given** no accounts are running
  - **When** I Close the window
  - **Then** the app exits and no tray icon remains

### US-03: Restore

- **Persona:** Multi-account operator
- **Story:** As an operator, I want to bring the window back from the tray, so I can tile, log in, or close a panel again.
- **Acceptance:**
  - **Given** a live farm was dismissed to the tray
  - **When** I restore from the tray
  - **Then** the window returns with those accounts still running (not a fresh load of the farm)

### US-04: Quit on purpose

- **Persona:** Multi-account operator
- **Story:** As an operator, I want a Quit that always leaves, so Close-to-tray does not trap me in a resident app.
- **Acceptance:**
  - **Given** accounts are running and the window is dismissed
  - **When** I Quit from the tray
  - **Then** the app exits and ticks stop
- **Window still open:**
  - **Given** accounts are running and the window is visible
  - **When** I Quit from Settings
  - **Then** the app exits (Close would have dismissed, not quit)
- **Accessibility:**
  - **Given** the window is visible
  - **When** I cannot or do not use the notification area
  - **Then** I can still Quit from Settings; restore after dismiss still depends on the tray (see Risks)

### US-05: Count without restoring

- **Persona:** Multi-account operator
- **Story:** As an operator, I want to see how many accounts are still running from the tray, so I do not have to open the large window just to check the farm is alive.
- **Acceptance:**
  - **Given** a dismissed farm with N running accounts
  - **When** I inspect the tray icon
  - **Then** I can tell the running count is N without restoring
- **Empty / skip:**
  - **Given** nothing is running
  - **When** I Close
  - **Then** there is no tray count to show (US-02)

### US-06: Minimize unchanged

- **Persona:** Multi-account operator
- **Story:** As an operator, I want Minimize to keep the usual taskbar button and keep ticks, so “make it smaller” stays different from “put it in the tray.”
- **Acceptance:**
  - **Given** a live farm in the main window
  - **When** I Minimize
  - **Then** a taskbar button remains, the farm keeps running, and this is not the same as Close-to-tray

### US-07: Isolation while dismissed

- **Persona:** Multi-account operator
- **Story:** As an operator, I want each running login to stay its own session while chrome is dismissed, so background is not a shared jar.
- **Acceptance:**
  - **Given** two running accounts of the same game
  - **When** I dismiss the window and later restore
  - **Then** each account is still its own login; neither picked up the other’s session

## Constraints

- Windows is the V1 success platform; isolation on other OSes must not get worse.
- Dismissing chrome must not wipe partitions, share cookie jars, inject into game documents, or pause accounts that are still marked running.
- Tray is status + restore + Quit only — not a second chrome.
- Persistent tray appears only while a live farm is dismissed, not as an extra icon beside a visible window.
- In-window Quit lives in Settings so leaving a visible live farm does not require the notification area.
- No usage telemetry; G-xx are local dogfood journals.
- Not a bot, macro, proxy, or anti-detect product.

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| Tray icon sits in overflow; operator thinks they Quit | Win32: new icons start in overflow | High / G-01 and G-03 miss | Count on the icon/tooltip; journal whether they found it. Do not add balloons in V1 | If G-01/G-03 miss because the icon was invisible, consider a balloon or taskbar badge ADR |
| Operator cannot restore without a mouse / notification area | Windows notification area is a poor keyboard surface | Medium / a11y | Quit from Settings while visible; V1 restore is tray-based | If dogfood needs keyboard restore, new ADR — do not keep a taskbar button that undoes F-01 |
| Operator cannot find Quit and feels trapped | Close no longer exits a live farm | Medium / G-04 | Quit on tray and in Settings | If they still cannot leave, surface Quit more obviously — still no Close=Quit opt-out in V1 |
| Pop-out windows remain on screen after chrome dismisses | Pop-outs are extra windows today | Low / V1 user is not pop-out-heavy | Out of scope; do not invent pop-out tray rules | Reconsider if dogfood is pop-out-heavy |
| Hidden farm is mistaken for a bot/macro | Product positioning already fights that | Low / trust | No tray automation; ticks only because views stay live | Product prohibition |

## Architecture Decision Records

- [ADR-001: Dismissed-farm presence](adrs/adr-001.md) — Close with a live farm dismisses to the tray; empty Close quits; Minimize unchanged; tray is not a console.

## Open Questions

- Non-blocking: should a **pop-out** account window stay visible when main chrome is dismissed, or wait for a later pop-out ADR? V1 does not change pop-out rules.
- Non-blocking: after Windows G-01, whether macOS/Linux Close should match or keep platform-default quit.
