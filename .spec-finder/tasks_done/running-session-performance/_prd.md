# Running-session performance — Product Requirements Document

## Problem

A multi-account operator on a **shared Windows PC** tiles about **3–6 isolated idle-game logins** (one or two games) and leaves them **running** so idle progress continues while they use other apps.

The workflow already isolates jars: each account is its own persistent session; several can sit in one window; **close** tears down that live view and keeps the login. Switching layout or game tab only hides a panel. Every account still marked running stays live — including off-stage and other-tab accounts. Chrome already shows CPU, RAM, and FPS, but RAM/CPU omit whole-app cost (especially GPU) and FPS is the shell’s animation loop, not the games.

That fails the job when a few running logins make the **rest of the PC hard to use**. Close-to-save-RAM stops that account’s progress. Chrome Memory Saver would deactivate “unused” tabs and **reload on return**, which is the wrong trade for idle games. A prior packet (`live-account-ram`) tried an **invisible** cheaper farm with **no** cost chrome; it **did not ship** (Windows evidence never ran). The farm-vs-PC failure is unchanged.

This is worth solving now for that Windows operator. Casual one-account use, dedicated 20-account boxes, and pop-out-heavy watchers are not the V1 center.

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | Running = live isolated view; close drops the view, keeps the jar | `README.md`, `src/main/views.ts` | 2026-08-31 | High | Close is already the stop; V1 is not “add close” |
| Repository | Hidden / other-tab running accounts stay live | `src/main/views.ts` `syncViews` | 2026-08-31 | High | Off-stage still costs; pausing them is out |
| Repository | Chrome RAM/CPU omit GPU; FPS is shell rAF | `src/main/metrics.ts`, `Shell.tsx` | 2026-08-31 | High | Operator cannot judge the PC from chrome today |
| Repository | Invisible diet packet completed as non-ship | `.spec-finder/tasks/live-account-ram/` | 2026-08-31 | High | V1 may show cost; must not repeat “chrome-less or nothing” |
| External | Extra processes buy isolation at memory cost | [Chromium process model](https://raw.githubusercontent.com/chromium/chromium/main/docs/process_model_and_site_isolation.md) | 2026-03-22 | High | Merging jars to save RAM is out |
| External | Memory Saver deactivates tabs; they reload when opened | [Chrome Help](https://support.google.com/chrome/answer/12929150?hl=en), [Chrome 108 blog](https://developer.chrome.com/blog/memory-and-energy-saver-mode) | 2026-08-31 | High | Auto-discard is out |
| External | Measure first; throttling-off keeps pages “visible” | [Electron performance](https://www.electronjs.org/docs/latest/tutorial/performance), [BrowserWindow visibility](https://www.electronjs.org/docs/latest/api/browser-window) | 2026-08-31 | High | Quieter farm is evidence-gated; do not fake a saving |
| User decision | Farm vs PC; 3–6 Windows; journal success; no Park; cost chrome OK; approach A | Clarification + [ADR-001](adrs/adr-001.md) | 2026-08-31 | High | Locks this PRD |

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | Keep a 3–6 account farm running on a shared Windows PC without closing panels just to free the machine | Unknown. Before change: one journaled 3-account and one 6-account session (Task Manager, whether other apps stayed usable, whether any panel was closed for RAM, what chrome showed vs Task Manager) | After change: same farms stay running; operator does not close panels just to free the PC; other apps stay usable | Same journal, before vs after | First 1–2 dogfood weeks after the change |
| G-02 | Running accounts keep progressing (no discard / sleep / surprise reload) | Today, running views stay live | 0 unexpected reloads or stopped idle progress on accounts left running | Dogfood journal + operator notice of a game reload or frozen idle | Same window |
| G-03 | Operator can judge machine cost from chrome well enough to choose what to close | Today chrome omits GPU and treats shell FPS as “fps” | After change, operator’s close-for-RAM choice matches Task Manager well enough that they do not need a second tool to see they are in trouble | Journal: chrome vs Task Manager; “did chrome show I was in trouble?” | Same window |
| G-04 | Starting more than the 3–6 farm is warned, not blocked | Start all / extra starts are silent | Operator sees a warning when starting beyond the farm size; 3–6 starts stay unblocked | Chrome review at ship + dogfood of a 7th start vs a 4th start | At ship + same window |

## Out of Scope

- **Auto-sleep, auto-discard, Chrome Memory Saver** — Stops idle progress. Reconsider only with a new ADR if G-01 is impossible without parking.
- **Named Park / Sleep that stops ticks** — Close already drops the live view. Reconsider if operators ask for a named park after G-01/G-03.
- **Merging sessions or sharing a cookie jar** — Isolation is the product. No reconsideration without a product reversal.
- **Hard live-account cap or blocked Start** — 3–6 must stay unblocked (G-04). Reconsider only as a last-resort ADR if warnings do not stop ruinous over-start.
- **Dedicated 20-account boxes, pop-out extra-window diet, macOS/Linux as the success gate** — Not the V1 user. Measure on Windows; do not worsen isolation on other OSes. Reconsider after shared-PC dogfood.
- **Gameplay automation, proxies, anti-detect, usage telemetry** — Product prohibition. Measurement is a local dogfood journal.

## In Scope (MVP)

Selected approach: **honest machine cost, then a Windows-gated quieter live farm, start warning not a lock** ([ADR-001](adrs/adr-001.md)). Gives up Park, auto-sleep, hard caps, and merging jars. If live accounts cannot cost less without pausing progress, V1 still ships truthful cost chrome and the start warning — it does not ship a fake diet.

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | A 3–6 account live farm leaves the shared PC usable when a don’t-pause saving is evidenced | Farm does not evict other work | G-01, US-01 | Operator keeps those accounts running and still uses other apps |
| F-02 | Every running account keeps progressing, including hidden and other-tab ones | Off-stage is still a farm | G-02, US-02 | No surprise reload or stopped idle on accounts left running |
| F-03 | Close still drops that live session and keeps the login | Only explicit stop | US-03 | Closed account gone from the stage; login survives restart |
| F-04 | Isolation unchanged | Account A never sees B’s jar | US-04 | Two running logins of the same game stay distinct |
| F-05 | Chrome shows machine cost the operator can act on (including GPU; FPS is not passed off as the games) | Close-for-RAM is informed | G-03, US-05 | Operator can tell from chrome they are in trouble without Task Manager as the only source |
| F-06 | Starting beyond the 3–6 farm warns; it does not lock | Over-start is visible, 3–6 stays easy | G-04, US-06 | 7th start is warned; 4th start is not blocked |
| F-07 | Quieter farm ships only if Windows evidence shows cost down **and** ticks still alive | No fake win | G-01, G-02, US-01 | If evidence fails, chrome cost + warning still ship; running behavior stays as today |

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
- **Diet miss:**
  - **Given** Windows evidence did not allow a don’t-pause saving
  - **When** I still run 3–6
  - **Then** I still have F-05/F-06; G-01 may miss; V1 does not invent Park to fake G-01

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
- **Story:** As an operator, I want cost savings and cost chrome to leave isolation alone, so two live users of the same game never share a login.
- **Acceptance:**
  - **Given** two running accounts of the same origin
  - **When** cost chrome and any quieter-farm change are in effect
  - **Then** each still has its own login / cookies / storage, as today

### US-05: Cost I can act on

- **Persona:** Multi-account operator
- **Story:** As an operator, I want chrome to show when the live farm is stressing the PC, so I know which close would actually help.
- **Acceptance:**
  - **Given** several accounts running
  - **When** I look at chrome cost
  - **Then** I can see machine-level cost (not only a partial per-account sum) including GPU, and I am not told a shell animation rate as if it were the games
- **Failure:**
  - **Given** Task Manager shows the app is heavy
  - **When** I look only at chrome
  - **Then** I am not reassured by a small RAM number that omitted GPU

### US-06: Warned past the farm size

- **Persona:** Multi-account operator
- **Story:** As an operator, I want a warning when I start more than the 3–6 farm, so I notice over-start without being blocked at four accounts.
- **Acceptance:**
  - **Given** I already have about 3–6 running
  - **When** I start another
  - **Then** I see a warning and can still start
  - **Given** I have fewer than that farm size running
  - **When** I start another
  - **Then** I am not blocked and not scolded for a normal farm

## Constraints

- Isolation: one persistent session per account id; never key off list index or display name.
- Running means idle progress continues; V1 may not pause, discard, or reload a running account to save RAM.
- Close without wipe stays the operator’s explicit way to drop a live session.
- Success is judged on **Windows** dogfood; other OSes must not get weaker isolation.
- No usage telemetry. Measurement is a local dogfood journal.
- No gameplay automation, proxy, or anti-detect.
- Do not cover game panels with a new performance overlay (existing dialogs already hide views). Cost chrome stays in existing chrome (sidebar / status), not over the stage.

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| Live sessions cannot get cheaper without pausing ticks | Electron visibility + Chromium process cost | Medium / High — G-01 may miss | F-07 fail-closed diet; still ship F-05/F-06. Do not add Park by stealth | Maintainer, after Windows evidence |
| Fake win: RAM drops because games froze | Chrome Memory Saver reload | Medium / High | G-02 is a ship blocker for any quieter-farm change | Dogfood |
| Honest chrome still understates GPU | Today’s readout | Medium / Medium | G-03 journal vs Task Manager | Operator, before calling G-03 |
| Warning ignored; operator still Start-alls 12 | G-04 is not a lock | Medium / Low | Out of scope to hard-cap; new ADR if dogfood is actually a 20-account box | Revisit after journal |

## Architecture Decision Records

- [ADR-001: Honest cost, then quieter farm](adrs/adr-001.md) — Truthful machine cost first; Windows-gated don’t-pause diet; start warning not a lock; no Park / discard / merged jars.

## Open Questions

- How many GB a typical 3- and 6-account farm uses **before** change (filled by the G-01/G-03 baseline journal, not a product branch).
- Exact warning threshold copy (3 vs 6 vs “more than currently running in this tab”) — non-blocking; default to warning when starting a **7th** running account app-wide unless dogfood says otherwise.
