# Keyboard shortcuts for the account loop

## Overview

- **Problem:** A multi-account operator still has to use the mouse for the three actions that define the job: create an account, move to another account, and start/run it. Tab chrome already has keys; the account loop does not.
- **Primary user:** An operator who already runs several isolated accounts in one window and repeats add / focus / run during session setup and while cycling accounts.
- **Value:** Those three actions work from the keyboard **while a game panel is focused**, so real play does not require a mouse trip through the sidebar.
- **Selected V1 direction:** Mouse-free account loop during real play ([ADR-001](adrs/adr-001.md)). Create uses the existing default name (`Account N` / `Conta N`); next/previous walks the tab’s full account order; start/run starts the targeted account. Reserved modifier chords do not reach the game (Chrome-class). This is a **quick win**, not a customizable command platform.

## Problem

Idle manager is a desktop shell for many isolated idle-game accounts in one window. A **tab** is one game URL. An **account** is one persistent Chromium partition inside that tab (`AGENTS.md`, `README.md`).

Today the operator can already press `Mod+T` for a new tab, `Mod+Tab` to cycle tabs, and `Mod+1…9` to jump to an account slot (`README.md` Keyboard; `src/renderer/src/components/Shell.tsx`). The account loop is still mouse-heavy:

1. **Create** — sidebar Plus (or empty-stage CTA) opens `account-create`. The operator types a name or leaves it blank. `account/create` always lands `status: 'closed'` (`src/shared/workspace.ts`).
2. **Navigate** — click a sidebar row or press `Mod+1…9`. Digits jump by `accountOrder` index, do not wrap, and stop at nine. There is no next/previous.
3. **Run** — sidebar dropdown Start, row double-click, empty-stage Start, or Start all (`Sidebar.tsx`, `Stage.tsx`). No keyboard path. Activate ≠ run.

**Trigger:** session setup (add jars, start them) and live cycling (move to the next jar, start it if closed). **Frequency:** every multi-account session (qualitative; no telemetry). **Workaround:** mouse through sidebar/menus, or `Mod+1…9` then mouse to start. That workaround fails the job because (a) start is still a click, (b) create is still a click, (c) after the first Start, focus is in a `WebContentsView` that paints above the React chrome, so even the documented shortcuts likely never fire (`src/main/views.ts`; app menu is `null` in `src/main/index.ts`).

### Evidence

| Kind | Finding | Source | Date | Confidence |
|---|---|---|---|---|
| Repository | README documents chrome shortcuts; none are create, next/prev, or start | `README.md` Keyboard | 2026-08-30 | High |
| Repository | Implementation is chrome `window` `keydown` requiring Mod/Ctrl | `src/renderer/src/components/Shell.tsx` | 2026-08-30 | High |
| Repository | `Mod+1…9` dispatches `account/activate` by `accountOrder` index (no wrap, max 9) | `Shell.tsx` | 2026-08-30 | High |
| Repository | `account/create` starts `closed`; empty name → `Account N` / `Conta N` | `src/shared/workspace.ts` | 2026-08-30 | High |
| Repository | Start is dropdown, double-click, empty CTA, or start-all | `Sidebar.tsx`, `Stage.tsx` | 2026-08-30 | High |
| Repository | Game views are sandboxed `WebContentsView`s; `before-input-event` only records activity; `Menu.setApplicationMenu(null)` | `src/main/views.ts`, `src/main/index.ts` | 2026-08-30 | High |
| Repository | Duplicate display names allowed; isolation is by account UUID, never name or list index | `AGENTS.md`, `workspace.test.ts` | 2026-08-30 | High |
| External | Chrome tab accelerators (`Ctrl+T`, `Ctrl+Tab`, `Ctrl+1–8`) are tab-level, not “account inside a tab” | [Chrome Help](https://support.google.com/chrome/answer/157179) | 2026-08-30 | High |
| External | In-app Electron shortcuts are menu accelerators; `before-input-event` + `preventDefault` intercepts keys before a page; `globalShortcut` is OS-global | [Keyboard Shortcuts](https://www.electronjs.org/docs/latest/tutorial/keyboard-shortcuts), [webContents](https://www.electronjs.org/docs/latest/api/web-contents) (last-modified 2026-08-30) | 2026-08-30 | High |
| External | Wavebox documents first-class, customizable shortcuts (Chrome-like defaults, optional global, Quick Switch) | [Wavebox KB](https://hub.wavebox.io/keyboard-shortcuts/) (updated 20 May 2026) | 2026-08-30 | High |
| External | SessionBox sells multi-account-in-one-window and does not lead with keyboard | [sessionbox.io](https://sessionbox.io/) | 2026-08-30 | Medium |
| External | Firefox Multi-Account Containers: 405,454 users, 4.6/8,047 reviews; listing describes long-click new tab, not shortcuts | [AMO](https://addons.mozilla.org/en-US/firefox/addon/multi-account-containers/) (v8.3.8, updated 24 Jun 2026) | 2026-08-30 | High |
| External | Windows apps are expected to offer accelerator keys for quick actions | [Microsoft Learn](https://learn.microsoft.com/en-us/windows/apps/design/input/keyboard-interactions) (ms.date 2024-06-11) | 2024-06-11 | High |
| Inference | Chrome-only `keydown` does not fire while a game `WebContentsView` is focused, so mouse-free cycling fails unless V1 also catches those keys | Architecture/engineering council + `views.ts` / `Shell.tsx` | 2026-08-30 | Medium |
| Inference | This is table-stakes power-user chrome, not a moat | Wavebox vs SessionBox/Firefox MAC | 2026-08-30 | Medium |
| User decision | Pain, user, V1 loop, quick win, dogfood success, direction A | Idea-factory clarification + opportunity scan | 2026-08-30 | High |

## Target Users

| Persona | Context | Need | Current workaround |
|---|---|---|---|
| Multi-account operator (primary) | Several isolated accounts of one game in one window; setup then cycle during a live session | Create, cycle, and start without taking a hand off the keyboard, including while a panel is focused | Sidebar Plus + name dialog; click or `Mod+1…9` to focus; dropdown / double-click / CTA / start-all to run |
| Casual / single-account player (not design center) | One jar, occasional use | Unchanged mouse paths | Existing buttons and dialogs remain |

## Core Features

| ID | Priority | Feature | Observable user value | Evidence |
|---|---|---|---|---|
| F-01 | Critical | Create account from the keyboard while a game panel is focused | A new closed account appears without a mouse trip | User V1 set; `account/create` already exists |
| F-02 | Critical | Create uses the default display name (`Account N` / `Conta N`); no name dialog on the hot path | Setup does not stop to name each jar; rename stays mouse | User direction A; reducer already default-names; `AccountModal` has no Enter-to-submit |
| F-03 | Critical | After create, the new account is the start target | The following Start key starts the jar just created, not an older active one | `account/create` only sets `activeAccountId` when none exists (`workspace.ts`) |
| F-04 | Critical | Next/previous account walks the current tab’s full `accountOrder` (closed included) and wraps | Cycling is sequential and unbounded, unlike `Mod+1…9` | User V1 set; council T2 |
| F-05 | Critical | Start/run the targeted (active) account from the keyboard | Closed jars come up without sidebar/double-click | User V1 set; `account/setStatus` `running` |
| F-06 | Critical | The three actions work while a game panel is focused | Mouse-free dogfood is true in real play, not only when chrome is focused | ADR-001; `WebContentsView` paints above HTML |
| F-07 | High | Only reserved **modifier chords** are swallowed; unmatched keys reach the game (including login fields) | No stolen passwords/chat; Chrome-class chord reservation | Security council; Electron `before-input-event` docs |
| F-08 | Medium | `Mod+1…9` remains a jump to slots 1–9 | Existing muscle memory kept; cycle does not replace jump | Current `Shell.tsx`; user did not remove it |
| F-09 | Medium | Operator can learn the three new binds without asking someone (README Keyboard at minimum; in-app hint allowed later) | Dogfood users can actually use V1 | README already has a Keyboard table |

## KPIs

| ID | KPI | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| KPI-01 | Mouse-free create → cycle → run | unknown (those three actions are mouse-only today) | A shortcut-aware operator completes the loop with no mouse for F-01–F-05, including while a game panel is focused | Dogfood journal (pass/fail per session) | ~1 week of real sessions |
| KPI-02 | Existing chrome-focused README shortcuts still work | Documented set works when chrome is focused | No regression of `Mod+T/B/L/R/M`, zoom, `Mod+Tab`, `Mod+1…9` from chrome focus | Manual checklist | Same week |
| KPI-03 | Game/login keys not eaten | unknown | Zero dogfood reports of stolen typing (letters, Enter, Tab) outside reserved modifier chords | Dogfood journal | Same week |
| KPI-04 | Operator can find the three new binds | README Keyboard exists; in-app unknown | Can use them without asking another person | Dogfood | Same week |
| KPI-05 | Create-then-start hits the new account | Today, a second create leaves the previous `activeAccountId` | After keyboard create, Start runs the new jar | Dogfood + reducer-level test of the user-visible target | Same week |

## Feature Assessment

| Criterion | Score | Evidence-backed rationale |
|---|---|---|
| Impact | Strong | Hits the actual account loop; existing binds miss create/cycle/start (`Shell.tsx`, `Sidebar.tsx`). Not Must-do for product survival (mouse paths already complete the loop). |
| Reach | Maybe | Design center is multi-account operators only (user clarification). Casual users get little V1 value. |
| Frequency | Strong | Setup and cycling happen every multi-account session (qualitative; telemetry unknown). |
| Differentiation | Pass | Wavebox already ships a richer shortcut system (KB 20 May 2026). SessionBox / Firefox MAC do not lead with keyboard. Isolation is the product moat, not chords. |
| Defensibility | Pass | Shortcut tables are copyable. No data or workflow lock-in beyond muscle memory. |
| Feasibility | Maybe | Reducer verbs already exist. The hard part is keys while a `WebContentsView` is focused, plus allowlisted intercept so login typing is not stolen. Runtime of current binds under game focus is unverified. |

## Independent Critique

Five real delegated advisors, two rounds (pragmatic engineering, architecture, security/privacy, product, devil’s advocate). Child runs reported `failed` status in the host workflow but produced complete critiques; synthesis uses those texts, not simulated roles.

### Consensus

- The account-loop gap is real: tab keys exist; create/start are mouse-only; `Mod+1…9` is a jump, not a cycle.
- Chrome-only `Shell.tsx` `keydown` cannot satisfy mouse-free dogfood once a game panel is focused.
- Do not use `globalShortcut`. Do not log key identity. Do not inject into the game document.
- Swallow only an allowlisted modifier-chord table; unmatched keys pass through.
- This is not a customizable command platform and not a bot/macro surface.
- Three more renderer listeners would extend a README that already over-promises once a view is focused.

### Unresolved Tensions

| Tension | Position A | Position B | Decision consequence |
|---|---|---|---|
| Must V1 catch keys while a game view is focused? | Architecture, engineering, product: yes, or KPI-01 is false | Devil: fix existing chords first; do not fund a loop initiative. Security: yes, but only an allowlist | **A (ADR-001):** loop must work while focused; allowlist only |
| Next/prev vs `Mod+1…9` | Product: jump ≠ cycle; wrap + unbounded required | Devil: next/prev duplicates digits | **Keep both:** next/prev in V1; digits stay |
| Create dialog on the hot path | Dialog + default name + Enter could be mouse-free | Engineering/product: `AccountModal` has no Enter-to-submit; create does not activate the new id; overlay hides views | **Skip dialog;** default name; defined start target |
| Spec packet vs chore | Product/architecture: one-page spec, not a `Shell.tsx` chore | Devil: table-stakes hygiene; do not open a packet | **Packet exists** because input routing and create-target are product decisions. Ambition stays quick win |

### Position Evolution and Dissent

| Advisor | Opening | Final | What moved |
|---|---|---|---|
| Pragmatic engineering | Ship the loop via a main interceptor, not more `Shell.tsx` listeners | Hold T1/T3; partial T2/T4 | Digits help ≤9 but do not replace cycle; not a product *initiative*, still a one-page spec |
| Architecture | Mouse-free is false without focused-view capture | Hold T1; T4 hold if the dogfood bar stays | If the bar were relaxed to chrome-only, devil would win |
| Security/privacy | Allowlisted Mod chords only; never read unmatched keys | Partial T1 | Agrees capture is required for the metric; restates it as allowlist-or-input-steal |
| Product | Strong as a spec packet; Pass as a chore | Hold T2/T3/T4 | Create-as-modal is not current mouse-free behavior |
| Devil’s advocate | Do not fund this; cheaper workarounds already shipped | Hold T2/T4; partial T1/T3 | Still dissents that this should be a spec packet |

**Dissent retained:** devil’s advocate — success is unmeasured personal dogfood; mouse CTAs + `Mod+1…9` + start-all already exist; port existing README shortcuts under game focus before adding create/next/start.

### Recommended Direction

Council majority: mouse-free account loop on one focused-contents path, skip-modal default-name create, next/prev over full `accountOrder`, start active, keep `Mod+1…9`. User selected that direction (opportunity A).

## Opportunity Decision

| Direction | Outcome | Effort | Principal risk | Decision |
|---|---|---|---|---|
| A. Mouse-free loop during real play | Create, next/prev, start while a game is focused; default name | Medium (focus routing, not three renderer binds) | Reserved Mod chords stolen from the game; create-then-start hits the wrong jar | **Selected (user A)** |
| B. Cycle and start only | Next/prev + start while focused; create stays mouse/dialog | Smaller | Locked create success metric fails | Rejected |
| C. Command-layer first slice | Loop plus port README shortcuts onto one system | Larger | Contradicts quick-win ambition | Rejected |

**Why A:** matches the locked V1 action set and the one-week mouse-free bar. Council evidence that chrome-only binds fail after the first Start. **Sacrifices:** no name prompt on create; no keymap UI; existing README shortcuts may remain chrome-only until a follow-up; stop / start-all / pop-outs stay mouse-only.

## Out of Scope (V1)

- **Stop, close panel, delete, clear session, start-all** — User cut the V1 set to create / next-prev / start. Reconsider if dogfood shows morning start-all or recovery is still a mouse bottleneck.
- **Customizable keymap, command palette, OS-global shortcuts** — Contradicts quick win; Wavebox-class platform is V2+. Reconsider if operators cannot live with the reserved chords (KPI-03 conflicts).
- **Porting every existing README shortcut onto the focused-view path** — Opportunity C rejected. Reconsider if KPI-02 dogfood shows operators still need reload/mute/URL-bar without clicking chrome.
- **Tab create/cycle, layout, URL bar, zoom as new work** — Already exist when chrome is focused; not the account loop.
- **Pop-out windows** — Second focus island; V1 is the tiled stage.
- **Gameplay automation, injected keys into the game document, proxy/fingerprint** — Product prohibition (`AGENTS.md`).
- **Usage telemetry** — User chose observable dogfood, not instrumentation.

## Architecture Decision Records

- [ADR-001: Mouse-free account loop during real play](adrs/adr-001.md) — V1 is create (default name) + next/prev + start while a game panel is focused; allowlisted modifier chords only; not a command platform.

## Research Limitations

- Runtime not traced: whether current README shortcuts already fail when a game view is focused is an **inference** (Medium), not a captured session.
- No product telemetry; frequency of add/focus/run is qualitative.
- How often idle-game pages consume `Ctrl`/`Cmd` chords (login, in-game hotkeys) is unknown.
- Apple HIG keyboard page did not render without JavaScript (fetch 2026-08-30); Microsoft + Chrome + Electron used instead.
- SessionBox public site does not document shortcuts; absence of marketing copy is not evidence they lack binds.
- Council child runs reported host `failed` status; critique text was still produced by five independent agents and used here.
- NN/g keyboard-shortcut articles were not retrieved (HTTP 404/challenge).

## Open Questions

- Exact modifier chords (techspec). Product constraint: modifier chords only, never bare keys.
- Whether keyboard create should still be possible when no tab exists (today Plus is disabled without a tab).
- Whether next/prev should skip popped-out accounts (pop-outs are out of V1).
- PT/EN labels for the new binds in README and any in-app hint (i18n required if in-app copy ships).
