# Keyboard shortcut remapping — Product Requirements Document

## Problem

A multi-account operator in Idle manager can already run the account loop from the keyboard (create, previous, next, start) and can already fire a larger chrome set (new tab, sidebar, URL bar, reload, mute, zoom, tab cycle, slot jump). Those keys only exist on **frozen** chords. Settings shows the four loop binds as a read-only list. Chrome binds are not in Settings at all.

The operator who already has Chrome-class habits does not relearn Idle manager’s frozen set. Current workaround: keep using the mouse for Plus, Start, reload, mute, and tab chrome, or force the new chords. Cost: the keyboard loop shipped to remove those mouse trips never gets adopted.

This is worth solving now because the actions and the Settings list already exist; the failure is ownership of the chords, not missing verbs. Primary user: the multi-account operator with existing keyboard habits. Casual single-account players keep the mouse paths and can ignore the Shortcuts tab.

This is not “users want a Settings tab.” It is not the prior packet’s collision escape hatch.

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | Settings lists four loop binds read-only; no tabs | `Dialogs.tsx` | 2026-08-31 | High | V1 adds a Shortcuts tab that can edit, not another frozen paragraph |
| Repository | Loop chords frozen; work while a game is focused | `accountLoop.ts` | 2026-08-31 | High | Remapped loop chords must keep that property |
| Repository | Chrome README binds are a separate chrome-only table | `Shell.tsx`, `README.md` | 2026-08-31 | High | They are in the remap list; they stay chrome-focused |
| Repository | Prior PRD deferred remapping unless game collision (G-03) | `keyboard-shortcuts/_prd.md` | 2026-08-30 | High | This packet is habit-match, not that trigger |
| External | Wavebox: Settings list, click, press, reset; optional global | [Wavebox KB](https://hub.wavebox.io/keyboard-shortcuts/) (20 May 2026) | 2026-08-31 | High | In-app edit + reset; no OS-global in V1 |
| External | VS Code: change / remove / reset in one editor | [VS Code keybindings](https://code.visualstudio.com/docs/configure/keybindings) | 2026-08-31 | High | Reset yes; unbind no (user cut remove) |
| External | Chrome documents a large **fixed** shortcut table | [Chrome Help](https://support.google.com/chrome/answer/157179) | 2026-08-31 | High | Fixed-table is the thing operators already memorized |
| User decision | Muscle memory; loop operators; remap-then-loop; all documented binds; modifier-only; approach A | Clarification + ADR-001 | 2026-08-31 | High | Locks this PRD |

**Inference (labeled):** operators bounce on frozen chords rather than collide with a game. Not measured; no telemetry.

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | Operator remaps loop actions to existing habits, then completes create → cycle → start without the mouse for those actions, including while a game panel is focused | Four loop chords frozen; 0 custom maps | Pass in real sessions for one shortcut-aware multi-account operator | Dogfood journal | ~1 week of sessions |
| G-02 | Documented chrome actions still work from chrome focus after remap (or on defaults if untouched) | README chrome set works when chrome is focused | No lost chrome action in that week; remapped chrome chords fire from chrome focus | Manual checklist + dogfood | Same week |
| G-03 | Typing in the game (login/chat) is not stolen by a remapped bind | Modifier-only loop already; remap does not exist | Zero reports of eaten letters / Enter / Tab from a legal bind | Dogfood journal | Same week |
| G-04 | Operator can find every documented action in Settings and change a bind without asking a person | Read-only four-row list; chrome binds absent | Can open Shortcuts, see the documented set, assign a new modifier chord | Dogfood | Same week |
| G-05 | An operator who never opens Shortcuts keeps today’s defaults | Current frozen chords | Untouched actions still fire the shipped chords | Manual checklist | Same week |

## Out of Scope

- **Command palette, OS-global shortcuts (app unfocused), per-game or per-tab maps** — Platform, not habit-match. Reconsider if G-01 fails because the operator needs the bind outside the window.
- **Unbind-to-empty and last-assignment-wins** — Approach C rejected. Reconsider if dogfood cannot swap two chords with a parking-spot chord (ADR-001).
- **Making chrome README shortcuts work while a game panel is focused** — User accepted chrome-focused remaps. Reconsider if G-02 dogfood shows remapped reload/mute/new tab still force a chrome click as the remaining bottleneck.
- **Bare-key binds** — Would steal game typing. Reconsider only with a new G-03 decision.
- **Per-slot remapping of accounts 1–9** — Family stays one modifier + digits 1–9. Reconsider if operators need to drop the digit jump.
- **Public docs / README showing this machine’s custom map** — Shareable pages stay defaults. Reconsider if G-04 fails because operators teach each other off the site.
- **Gameplay automation, injecting keys into the game, proxy/anti-detect** — Product prohibition.
- **Usage telemetry** — Dogfood, not instrumentation.

## In Scope (MVP)

Selected approach: **Settings Shortcuts tab** for every documented keyboard action; click and press a modifier chord; duplicates refused; per-row reset; no unbind; docs stay defaults; chrome remaps stay chrome-focused; slot jumps stay a 1–9 family ([ADR-001](adrs/adr-001.md)). Gives up unbind, steal-on-conflict, and a shortcut platform.

Documented actions are the current README Keyboard table: new tab, reopen last closed tab, sidebar, URL bar, reload active, reload all in tab, mute, zoom in, zoom out, zoom reset, next tab, account slots 1–9 (one family), create account, previous account, next account, start targeted account.

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | Shortcuts tab in Settings | Edit is findable without crowding General | G-04, US-01 | Operator can switch to Shortcuts and back; General prefs still there |
| F-02 | Tab lists every documented action with its current chord | Chrome binds are no longer README-only | G-04, US-01 | Each README action appears; loop vs chrome-only is visible |
| F-03 | Click a row, press a new modifier chord, it becomes that action’s bind | Matches existing habits | G-01, G-02, US-02, US-03 | Next use of that chord runs that action under today’s focus rules |
| F-04 | Duplicate chord refused | No silent steal | G-04, US-04 | Both rows unchanged; operator is told the chord is taken |
| F-05 | Per-row reset to shipped default | Recovery without unbind | G-05, US-05 | That action fires the original default chord again |
| F-06 | Loop remaps work while a game panel is focused | Habit-matched loop during play | G-01, US-02 | Create / prev / next / start honor the new chords in a live panel |
| F-07 | Chrome remaps work only when chrome is focused | Same as today, with new chords | G-02, US-03 | Remapped reload/mute/new tab fire from chrome, not from a focused game |
| F-08 | Only modifier chords accepted | Login/chat survive | G-03, US-06 | Bare letter / unmatched key still reaches the game |
| F-09 | Custom map survives the next session | Dogfood week is real | G-01, US-07 | After restart, the same chords still fire |
| F-10 | Untouched rows keep shipped defaults | Casual path unchanged | G-05, US-08 | Never-opened Shortcuts behaves as today |

## User Stories

### US-01: Find the editable list

- **Persona:** Multi-account operator
- **Story:** As an operator, I want every documented shortcut in a Settings Shortcuts tab, so that I can change chords I already know without hunting the README.
- **Acceptance:**
  - **Given** Settings is open
  - **When** I open the Shortcuts tab
  - **Then** I see each documented action and its current chord, including chrome actions that were not in the old read-only list
  - **Given** I am on Shortcuts
  - **When** I return to the general Settings pane
  - **Then** language, theme, startup, and import/export are still there

### US-02: Remap the account loop

- **Persona:** Multi-account operator
- **Story:** As an operator, I want to assign create / previous / next / start to modifier chords I already use, so that I can run the loop without learning Idle manager’s frozen set.
- **Acceptance:**
  - **Given** a tab with accounts and a game panel focused
  - **When** I assign new modifier chords to create, previous, next, and start, then use those chords
  - **Then** I can create (default name), cycle the full list, and start the targeted account without the mouse for those actions
  - **Given** I have remapped create
  - **When** I press the old default create chord
  - **Then** it no longer creates an account unless another action now owns it

### US-03: Remap a chrome action

- **Persona:** Multi-account operator
- **Story:** As an operator, I want to change a documented chrome bind (for example new tab or reload) to a chord I already use, so that chrome matches my habits too.
- **Acceptance:**
  - **Given** chrome is focused
  - **When** I remap a chrome action and press the new chord
  - **Then** that chrome action runs
  - **Given** a game panel is focused
  - **When** I press that remapped chrome chord
  - **Then** the chrome action does not run (same focus rule as today)

### US-04: Conflict and illegal chord

- **Persona:** Multi-account operator
- **Story:** As an operator, I want a taken or illegal chord to be refused, so that I do not silently lose another action or eat game typing.
- **Acceptance:**
  - **Given** I am capturing a new chord for an action
  - **When** I press a modifier chord already used by another listed action
  - **Then** neither row changes and I can see that the chord is already assigned
  - **Given** I am capturing
  - **When** I press a bare letter, or cancel (Escape or leaving capture)
  - **Then** the row stays on its previous chord

### US-05: Reset one action

- **Persona:** Multi-account operator
- **Story:** As an operator, I want to reset one action to the shipped default, so that I can recover without clearing every bind.
- **Acceptance:**
  - **Given** an action is remapped
  - **When** I reset that row
  - **Then** it fires the original default chord again and the custom chord is free if nothing else took it

### US-06: Game typing preserved

- **Persona:** Multi-account operator
- **Story:** As an operator, I want ordinary typing to reach the game, so that login and chat still work after I remap.
- **Acceptance:**
  - **Given** focus is in a game field
  - **When** I type letters, Tab, or Enter, or any non-modifier key
  - **Then** the game receives them

### US-07: Map persists

- **Persona:** Multi-account operator
- **Story:** As an operator, I want my chords still there tomorrow, so that a week of dogfood is not a one-session trick.
- **Acceptance:**
  - **Given** I remapped at least one action and quit
  - **When** I open the app again
  - **Then** those custom chords still run those actions

### US-08: Defaults if I never remap

- **Persona:** Casual or naming-careful operator
- **Story:** As an operator who never opens Shortcuts, I want today’s keys unchanged, so that remapping is opt-in.
- **Acceptance:**
  - **Given** Shortcuts has never been used on this workspace
  - **When** I use the shipped chords
  - **Then** they behave as they do today, including mouse Plus still opening the name dialog

## Constraints

- Loop remaps must work while a game panel is focused; chrome remaps must not start doing so in this PRD.
- Legal binds are modifier chords only (Ctrl/Cmd plus a key, optional Shift/Alt). No OS-global (out-of-app) shortcuts.
- Passwords and other game keystrokes stay in that account’s session; the product must not log what was typed.
- Shortcuts tab labels ship in existing chrome locales (currently Portuguese, English, Spanish).
- Public `/en/keyboard/` and `/pt/keyboard/` and README keep **default** chords.
- Menus and Settings that cover the stage keep using overlay behavior (game views hide while covered).
- Custom binds persist with this workspace’s Settings prefs. Game-list export/import does not carry binds. Import workspace already replaces workspace prefs.
- `Mod+1…9` remains one family: remappable modifier, digits 1–9 still mean slots 1–9.
- Windows is the primary shipping OS; macOS/Linux get the same operator-visible remap.
- Not a bot, macro, or anti-detect product.

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| Operator remaps reload/new tab and expects it during play | Chrome binds are chrome-only today; user still included them | High / Medium | F-02 visibility of chrome-only; G-02 dogfood | Product; reopen focused-chrome-port if that week fails |
| Swap of two chords needs a parking-spot chord | No unbind, duplicate refused (ADR-001) | Medium / Medium | US-04/US-05; spare modifier | Product; reopen approach C if swaps fail G-01 |
| Public docs disagree with a customized machine | Approach A: docs stay defaults | High / Low | G-04 is in-app tab, not the site | None unless operators teach from the site |
| Casual user changes binds by mistake | Shortcuts is in Settings; not the design center | Low / Medium | Per-row reset; G-05 | Product; first-use confirm only if G-05 fails |
| Settings overlay hides running views | Existing overlay rule | High / Low | Accept for edit; play continues after close | None unless operators refuse to open Settings |

## Architecture Decision Records

- [ADR-001: Settings Shortcuts tab for documented modifier chords](adrs/adr-001.md) — Tab; all documented actions; click-press; refuse duplicates; per-row reset; no unbind; docs stay defaults; chrome remaps stay chrome-focused.

## Open Questions

- Exact default chord strings already live in README / `ACCOUNT_LOOP_SHORTCUTS`; TechSpec owns display parity, not new product verbs.
- Whether next-tab’s Shift variant (previous tab in `Shell.tsx`) is listed as its own row; README today only names next tab.
- Visual treatment of loop vs chrome-only rows (required outcome: the difference is visible; layout is not).
