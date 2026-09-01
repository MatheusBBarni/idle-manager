# Off-stage idle progress — Product Requirements Document

## Problem

A multi-account operator on a **shared Windows PC** tiles about **3–6 isolated idle-game logins** (one or two games). They start accounts, leave them **running**, then switch to another game tab or open a confirm dialog.

The current workflow already isolates jars and keeps a live session for every running account. Close tears down that view and keeps the login. Switching tab or opening a dialog does **not** close those accounts. It only takes them off the stage (or hides every on-stage view so chrome can cover the games). Idle progress then **stops**. The extra logins only earn while they stay on the focused tab. That is lost farm time — the reason those accounts were started.

This is not a missing Start/Close control. It is not machine pressure (`running-session-performance` already owns cost chrome and a fail-closed RAM diet). Chrome Memory Saver would deactivate “unused” tabs and **reload on return**, which is the wrong trade for idle games.

This is worth solving now for that Windows operator. Casual one-account use, dedicated 20-account boxes, and pop-out-heavy watchers are not the V1 center.

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | Running = live isolated view; close drops the view, keeps the jar | `README.md`, `src/main/views.ts` | 2026-09-01 | High | V1 is not “add close” |
| Repository | Other-tab and dialog hide use `setVisible(false)`; contents stay until close | `views.ts` `applyStage`, `Stage.tsx` `overlayOpen` | 2026-09-01 | High | Hide is the freeze surface |
| Repository | Product copy claims hidden views keep idle loops alive; no journal of game progress off-stage | `README.md`; RAM spike never measured `visibilityState` | 2026-09-01 | High | Intent ≠ evidenced progress |
| External | Hidden pages throttle timers/rAF; sites pause on `visibilitychange` | [MDN Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) | 2026-09-01 | High | Games can freeze even if the view still exists |
| External | Memory Saver deactivates unused tabs; they reload when opened | [Chrome Help](https://support.google.com/chrome/answer/12929150?hl=en), [Chrome 108 blog](https://developer.chrome.com/blog/memory-and-energy-saver-mode) | 2026-09-01 | High | Auto-discard is out |
| External | Window-level throttling-off keeps Page Visibility `visible`; `setVisible` only documents hide-from-display | [Electron BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window), [View.setVisible](https://raw.githubusercontent.com/electron/electron/main/docs/api/view.md) | 2026-09-01 | High | View hide may still look hidden to the game |
| User decision | Freeze is the failure; Windows 3–6; invisible keep-alive; approach A | Clarification + [ADR-001](adrs/adr-001.md) | 2026-09-01 | High | Locks this PRD |
| Inference | Baseline freeze duration unknown; many idle games self-pause on hidden | No dogfood journal yet | 2026-09-01 | Medium | Journal in-game progress, not fixture timers alone |

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | A 3–6 account farm keeps idle progress while another game tab is focused | Unknown. Before change: one journaled 3-account and one 6-account session on Windows. Leave running accounts on another game tab for a set interval; record whether in-game idle advanced, froze, or reloaded | After change: same farms keep progressing; 0 freeze or surprise reload on accounts left running while another tab is focused | Operator journal of in-game progress (not chrome FPS). Same interval before vs after | First 1–2 dogfood weeks after the change |
| G-02 | Opening a confirm dialog does not freeze running accounts | Unknown. Same baseline sessions: open a confirm dialog that covers the stage; record whether in-game idle advanced or froze | After change: 0 freeze or surprise reload caused by that overlay hide | Same journal | Same window |
| G-03 | Operator needs no new chrome to succeed | Current start / close / tab / dialog verbs | G-01 and G-02 are met with no live-cue, Park, Memory Saver, or overlay-on-stage status | Chrome review at ship + dogfood | At ship + same window |

## Out of Scope

- **RAM diet / cheaper live farm** — Different failure; already `running-session-performance`. Reconsider only if freeze-fix makes the shared PC unusable.
- **Chrome Memory Saver, auto-sleep, auto-discard** — Stops or reloads idle. No reconsideration without a product reversal.
- **Named Park / Sleep** — Close already drops the live view. Reconsider if operators ask for a named park after G-01.
- **Merging sessions or sharing a cookie jar** — Isolation is the product. No reconsideration without a product reversal.
- **Gameplay bots, macros, inject into game pages** — Product prohibition. If only inject would unfreeze, stop; new ADR — do not spoof visibility inside the game.
- **Painting running views over modals** — Views sit above HTML; overlay chrome must stay usable. Reconsider only if dialogs move entirely into chrome with a new ADR.
- **Single-layout siblings as the success gate** — Same-tab unpainted freeze can remain. Promote if dogfood shows operators farm in single layout, not other-tab.
- **Minimized window / OS occlusion as the success gate** — Not the stated failure. Promote if journal shows minimize is how they leave the farm.
- **macOS/Linux as the success gate** — Measure on Windows. Do not weaken isolation on other OSes. Reconsider a platform ADR if Windows G-01 passes and other OSes regress.
- **Live “still ticking” cue** — Rejected for V1. Reconsider if G-03 succeeds but operators still refuse to leave the tab because they cannot tell.
- **Usage telemetry** — Measurement is a local dogfood journal.

## In Scope (MVP)

Selected approach: **invisible keep-alive, same workflow** ([ADR-001](adrs/adr-001.md)). Gives up a live cue, always-paint, RAM diet, inject, and single-layout/minimize as gates.

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | Running accounts on another game tab keep idle progress | Multi-tab is still a farm | G-01, US-01 | Operator switches tab; those accounts still advance in-game |
| F-02 | Running accounts hidden under a confirm dialog keep idle progress | Dialogs do not tax the farm | G-02, US-02 | Overlay open; running accounts still advance |
| F-03 | Returning to an account left running is not a fresh load | Client idle is not thrown away | G-01, US-03 | Come-back is the same session, not a Memory Saver-style reload |
| F-04 | Close still drops that live session and keeps the login | Only explicit stop | US-04 | Closed account gone from the stage; login survives restart |
| F-05 | Isolation unchanged | Account A never sees B’s jar | US-05 | Two running logins of the same game stay distinct |
| F-06 | No new keep-alive / Park / cue chrome | Nothing to learn mid-farm | G-03, US-01 | Same verbs as today |

## User Stories

### US-01: Other tab, farm still earns

- **Persona:** Multi-account operator (Windows, shared PC)
- **Story:** As an operator, I want running accounts on another game tab to keep idling, so I can watch one game without pausing the rest of the farm.
- **Acceptance:**
  - **Given** a journaled 3-account and 6-account farm after V1, with running accounts on a tab that is not focused
  - **When** I focus another game tab for the journaled interval
  - **Then** those running accounts still show idle progress; I did not have to keep their tab focused
- **Empty / skip:**
  - **Given** only one running account on the focused tab
  - **When** I never switch tabs
  - **Then** V1 is not judged a failure if that already worked

### US-02: Dialog does not pause the farm

- **Persona:** Multi-account operator
- **Story:** As an operator, I want running accounts to keep idling while a confirm dialog covers the stage, so a delete/create prompt does not cost farm time.
- **Acceptance:**
  - **Given** several accounts left running
  - **When** a confirm dialog covers the stage
  - **Then** those running accounts still show idle progress after the dialog
- **Failure:**
  - **Given** I only opened a dialog and did not close any account
  - **When** I dismiss the dialog
  - **Then** I do not find frozen idle or a fresh load caused by that hide

### US-03: Come-back is not a reload

- **Persona:** Multi-account operator
- **Story:** As an operator, I want to return to an account I left running and find the same session, so off-stage time is not thrown away.
- **Acceptance:**
  - **Given** an account I left running on another tab
  - **When** I focus that tab again
  - **Then** it is not a discarded-tab reload; idle that accrued off-stage is still there
- **Failure:**
  - **Given** I did not close or reload that account
  - **When** I return
  - **Then** I do not land on a login screen or a fresh client because the app hid it

### US-04: Close remains the stop

- **Persona:** Multi-account operator
- **Story:** As an operator, I want close to still drop the live session and keep the login, so I am not taught a second sleep model.
- **Acceptance:**
  - **Given** a running account
  - **When** I close that panel
  - **Then** it leaves the stage, that live session ends, and the login is still there when I start it later

### US-05: Jars stay apart

- **Persona:** Multi-account operator
- **Story:** As an operator, I want keep-alive to leave isolation alone, so two live users of the same game never share a login.
- **Acceptance:**
  - **Given** two running accounts of the same origin
  - **When** keep-alive is in effect (including off-stage and overlay hide)
  - **Then** each still has its own login / cookies / storage, as today

## Constraints

- Isolation: one persistent session per account id; never key off list index or display name.
- Running means idle progress continues; V1 may not pause, discard, or reload a running account to hide it.
- Close without wipe stays the operator’s explicit way to drop a live session.
- Success is judged on **Windows** dogfood of real games; other OSes must not get weaker isolation.
- No usage telemetry. Measurement is a local dogfood journal of **in-game** progress.
- No gameplay automation, proxy, anti-detect, or injection into game documents.
- Confirm dialogs that cover the stage may hide views for chrome; they may not freeze running idle.

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| Games self-pause on `document.hidden` even if timers fire | MDN Page Visibility; View.setVisible undocumented for visibility | High / High — G-01 can miss | Journal in-game progress, not fixture timers. Do not inject. New ADR if only inject would work | Maintainer, after journal |
| Fake win: “alive” because the view exists | README already claimed loops stay alive | Medium / High | G-01/G-02 require observed game progress and no surprise reload | Dogfood |
| Overlay hide vs chrome | Views paint above HTML | Medium / Medium | F-02 allows hide; forbids freeze and forbids painting over dialogs | Chrome review |
| Operators still use single layout or minimize | Out of scope as gates | Medium / Low | Stay out unless journal shows that is the real leave-farm path | Revisit after journal |

## Architecture Decision Records

- [ADR-001: Invisible keep-alive, same workflow](adrs/adr-001.md) — Same start / close / tab / dialog; running keeps progressing off-stage and under overlay; no new chrome; no RAM diet, Park, Memory Saver, inject, or always-paint.

## Open Questions

- Exact journal interval (e.g. 10 vs 30 minutes off-stage) — non-blocking; default to an interval long enough to see idle in the operator’s games, same before vs after.
- Whether a later packet should cover single-layout siblings or minimize — explicitly out of V1; promotion trigger is in Out of Scope.
