# Account-loop keyboard shortcuts — Product Requirements Document

## Problem

A multi-account operator in Idle manager can already add a **tab** (game URL) from the keyboard, but the **account loop** still needs the mouse: create a jar, move to another jar, start it. That loop is the job — several isolated logins of the same game in one window, set up once, then cycled during a session.

Current workflow: Plus opens a name dialog; create always starts closed; Start is a dropdown, double-click, empty-stage button, or Start all; `Mod+1…9` jumps to at most nine slots and does not start anything (`README.md`, `Shell.tsx`, `Sidebar.tsx`, `workspace.ts`). After the first Start, the pointer is on a live game panel. Documented chrome shortcuts live on the shell, not on that panel. Cost: every extra jar is a sidebar trip, and cycling while playing is click-heavy.

This is worth solving now because the shell already pretends to be keyboard-capable for tabs, and the missing loop is the product’s actual unit of work. Primary user: the operator who already runs several accounts. Casual single-account players keep the mouse paths.

### Evidence

| Kind | Finding | Source | Date | Confidence | Product consequence |
|---|---|---|---|---|---|
| Repository | Tab keys exist; create / next-prev / start do not | `README.md` Keyboard, `Shell.tsx` | 2026-08-30 | High | V1 is the account loop, not more tab keys |
| Repository | Create starts closed; Start is mouse-only; Plus disabled without a tab | `workspace.ts`, `Sidebar.tsx`, `Stage.tsx` | 2026-08-30 | High | Keyboard create ≠ run; empty path is no-op |
| Repository | Second create does not take `activeAccountId` if one exists | `workspace.ts` | 2026-08-30 | High | After keyboard create, Start must hit the new jar |
| Inference | Shell keys likely do not run while a game panel is focused | `views.ts` vs `Shell.tsx` | 2026-08-30 | Medium | Loop must work during real play, not only in chrome |
| External | Chrome-class reserved modifier chords for app actions | [Chrome Help](https://support.google.com/chrome/answer/157179) | 2026-08-30 | High | A few Mod chords will not reach the game |
| External | Keyboard equivalent for pointer actions; does not invent missing objects | [WCAG 2.1.1](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) (2026-07-02) | 2026-07-02 | High | No tab → no account create |
| User decision | Mouse-free loop while a game is focused; default name | `_idea.md`, ADR-001 | 2026-08-30 | High | Locks V1 actions |
| User decision | No-op without a tab; README + Settings list; PT+EN keyboard **docs pages** (not a landing section) | ADR-002, ADR-004 | 2026-08-30 | High | Shareable `/en/keyboard/` and `/pt/keyboard/` |

## Goals

| ID | Goal | Baseline | Target | Measurement method | Window |
|---|---|---|---|---|---|
| G-01 | Operator completes create → cycle → start without the mouse for those actions, including while a game panel is focused | unknown (those actions are mouse-only) | Pass in real sessions for an operator who knows the binds | Dogfood journal | ~1 week of sessions |
| G-02 | Existing chrome-focused README shortcuts still work | Documented set works when chrome is focused | No regression of that set from chrome focus | Manual checklist | Same week |
| G-03 | Typing in the game (including login) is not stolen outside reserved modifier chords | unknown | Zero reports of eaten letters / Enter / Tab | Dogfood journal | Same week |
| G-04 | Operator can find the three binds without asking a person | README Keyboard exists; Settings/site have no list | Can find them in Settings **or** the site keyboard docs page (README still updated) | Dogfood | Same week |
| G-05 | Keyboard create then Start runs the new account | Second mouse create leaves the previous active account | Start after keyboard create runs the new jar | Dogfood + observable account state | Same week |

## Out of Scope

- **Stop, close, delete, wipe, start-all** — Cut in `_idea.md`. Reconsider if dogfood shows morning start-all is still the bottleneck.
- **Remapping, command palette, OS-global shortcuts** — Quick win. Reconsider if reserved chords collide with games (G-03).
- **Making every existing README shortcut work while a game is focused** — Approach C rejected (ADR-002). Reconsider if G-02 dogfood shows reload/mute/URL-bar still force a chrome click.
- **Name dialog on the keyboard create path** — Default name only. Mouse Plus dialog stays. Reconsider if operators refuse unnamed jars.
- **Docs hub / extra articles** (changelog, full manual, `/docs` index) — One keyboard page per locale only (ADR-004). Reconsider when more shortcuts ship.
- **Keyboard bind list as a landing section** — Superseded; landing may only **link** to the docs page.
- **Pop-out windows** — Second focus surface. Reconsider if pop-outs become the default play mode.
- **Gameplay automation or injecting keys into the game** — Product prohibition.
- **Usage telemetry** — Dogfood, not instrumentation.

## In Scope (MVP)

Selected approach: tight account loop while a game panel is focused, plus README + read-only Settings list + PT+EN **keyboard docs pages** on the existing site (`/en/keyboard/`, `/pt/keyboard/`) — not a landing section, not a docs hub, not a shortcut platform.

| ID | Capability | User value | Mapped goals/stories | Observable outcome |
|---|---|---|---|---|
| F-01 | Create account from the keyboard while a game panel is focused | No mouse trip to Plus | G-01, US-01 | A new closed account appears |
| F-02 | Keyboard create uses the default name (`Account N` / `Conta N`) | Setup does not stop to name | G-01, US-01 | Name is the next default; no create dialog |
| F-03 | Keyboard create makes the new account the Start target | Create then Start is one loop | G-05, US-01 | Next Start runs that new jar |
| F-04 | Next/previous walks the tab’s full account list, including closed, and wraps | Cycle without slot memory | G-01, US-02 | Active account moves one step and wraps |
| F-05 | Start runs the targeted account | Closed jars come up from the keyboard | G-01, US-03 | Targeted closed account becomes running; already-running is unchanged |
| F-06 | Loop keys do nothing when they cannot run (no tab; cycle/start with no accounts) | No surprise New tab | G-01, US-04 | Workspace unchanged |
| F-07 | Unmatched keys still reach the game | Login and chat keep working | G-03, US-05 | Only reserved modifier chords are taken |
| F-08 | Read-only shortcuts list in existing Settings (PT+EN) | In-app lookup | G-04, US-06 | Settings shows the three binds; no remapping |
| F-09 | Keyboard docs pages on the site (PT+EN) | Public, shareable lookup | G-04, US-06 | `/en/keyboard/` and `/pt/keyboard/` list the same four binds |
| F-10 | README Keyboard table lists the three binds | Source-of-truth for contributors | G-04 | Table matches Settings and the docs pages |
| F-11 | Mouse Plus → name dialog still creates an account | Casual path unchanged | US-07 | Dialog create still works |

`Mod+1…9` stays a jump to slots 1–9; it is not replaced by next/previous.

## User Stories

### US-01: Create from the keyboard

- **Persona:** Multi-account operator
- **Story:** As an operator, I want to add an account from the keyboard while a game is focused, so that setup does not require the sidebar.
- **Acceptance:**
  - **Given** a tab is active and a game panel is focused
  - **When** I press the create bind
  - **Then** a new closed account appears with the default name, it is the Start target, and no name dialog opens
  - **Given** no tab exists
  - **When** I press the create bind
  - **Then** nothing is created and New tab does not open

### US-02: Cycle accounts

- **Persona:** Multi-account operator
- **Story:** As an operator, I want next/previous from the keyboard, so that I can walk every jar without remembering slot numbers.
- **Acceptance:**
  - **Given** a tab with two or more accounts and a game panel focused
  - **When** I press next (or previous) repeatedly
  - **Then** the targeted account moves through the full list, including closed, and wraps
  - **Given** a tab with zero accounts, or no tab
  - **When** I press next or previous
  - **Then** nothing changes

### US-03: Start the targeted account

- **Persona:** Multi-account operator
- **Story:** As an operator, I want to start the targeted account from the keyboard, so that a closed jar comes up without a dropdown.
- **Acceptance:**
  - **Given** the targeted account is closed and a game panel is focused
  - **When** I press the start bind
  - **Then** that account is running
  - **Given** the targeted account is already running
  - **When** I press start
  - **Then** it stays running (no extra window, no restart requirement)
  - **Given** I just created an account from the keyboard
  - **When** I press start
  - **Then** the new account runs, not an older one

### US-04: Empty and blocked paths

- **Persona:** Multi-account operator
- **Story:** As an operator, I want loop keys to do nothing when the shell cannot add or run an account, so that first launch stays New tab.
- **Acceptance:**
  - **Given** first launch with no tab
  - **When** I press create, next, previous, or start
  - **Then** the empty state is unchanged; I still use New tab / `Mod+T` if I need a tab

### US-05: Game typing is preserved

- **Persona:** Multi-account operator
- **Story:** As an operator, I want ordinary typing to reach the game, so that login and chat still work.
- **Acceptance:**
  - **Given** focus is in a game field
  - **When** I type letters, Tab, or Enter, or use keys that are not the reserved modifier chords
  - **Then** the game receives them

### US-06: Look up the binds

- **Persona:** Multi-account operator
- **Story:** As an operator, I want to see the three binds in Settings and on a site docs page, so that I do not have to ask someone.
- **Acceptance:**
  - **Given** I open Settings
  - **When** I look for keyboard shortcuts
  - **Then** I see a read-only PT or EN list of create, next/previous, and start (matching app locale)
  - **Given** I open the keyboard docs page in PT or EN
  - **When** I read the page
  - **Then** I see the same four binds at `/en/keyboard/` or `/pt/keyboard/`; the landing does not embed that list

### US-07: Mouse create still names

- **Persona:** Casual or naming-careful operator
- **Story:** As an operator, I want Plus to still open the name dialog, so that keyboard defaults do not remove naming for the mouse path.
- **Acceptance:**
  - **Given** a tab exists
  - **When** I use Add account in the sidebar
  - **Then** the name dialog still appears and can create an account

## Constraints

- Loop keys must work while a game panel is focused; they are not “chrome only.”
- Only a small reserved set of **modifier** chords may be taken from the game (Chrome-class). No global (out-of-app) shortcuts.
- Passwords and other game keystrokes stay in that account’s session; the product must not log what was typed.
- Settings list and keyboard docs pages ship in Portuguese and English, matching existing app/site locales.
- Menus and Settings that cover the stage keep using the existing overlay behavior (game views hide while covered).
- Windows is the primary shipping OS; macOS/Linux get the same operator-visible loop.
- Not a bot, macro, or anti-detect product.

## Risks and Mitigations

| Risk | Evidence | Likelihood/impact | Mitigation | Owner/decision trigger |
|---|---|---|---|---|
| Reserved chords collide with a game | Idle-game Mod use unknown | Medium / High | Modifier chords only; G-03 dogfood; remap is out unless G-03 fails | Product; reopen remapping if dogfood reports collisions |
| Operators never find the binds | README-only would hide them; user added Settings + docs page | Medium / Medium | F-08–F-10; G-04; landing nav link to the page | Product; if G-04 fails, consider first-use hint |
| Docs page drifts from the app | Four surfaces (matcher, README, Settings, docs) | Medium / Medium | Same four accelerators; update together | App + site owners when binds change |
| Keyboard create then Start hits the wrong jar | Later creates do not take the active account | High / High | F-03, G-05 | Block ship if G-05 fails |
| Settings overlay hides all running views | Existing overlay rule | High / Low | Accept for lookup; play continues after close | None unless operators refuse to open Settings |

## Architecture Decision Records

- [ADR-001: Mouse-free account loop during real play](adrs/adr-001.md) — Create (default name), next/previous, start while a game panel is focused; not a command platform.
- [ADR-002: Tight loop plus Settings list and landing Keyboard section](adrs/adr-002.md) — No-op without a tab; README + Settings list (site surface superseded).
- [ADR-004: PT+EN keyboard docs pages](adrs/adr-004.md) — `/en/keyboard/` and `/pt/keyboard/`; landing may link, must not list binds.

## Open Questions

- Exact modifier chords (TechSpec). Product rule: modifier chords only, never bare keys.
- Whether next/previous should skip popped-out accounts (pop-outs remain out of V1).
- Visual emphasis of the targeted account beyond today’s active-row treatment (not required if sidebar already shows active).
