---
status: pending
title: Honor remapped chords on loop and chrome paths
type: backend
complexity: high
dependencies:
  - task_01
---

# Task 02: Honor remapped chords on loop and chrome paths

## Overview

After `prefs/shortcut` changes a command, the next matching key runs that action under today’s focus rules: loop commands while a game panel is focused, chrome commands only when chrome is focused. Primary **US-02** (US-03, F-06, F-07). This slice gives up the Settings capture tab.

## Source Artifacts

- PRD: `.spec-finder/tasks/shortcut-remapping/_prd.md`
- TechSpec: `.spec-finder/tasks/shortcut-remapping/_techspec.md`

<critical>
- Read `.spec-finder/tasks/shortcut-remapping/_prd.md`, `.spec-finder/tasks/shortcut-remapping/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_02.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** create/prev/next/start have been remapped via `prefs/shortcut` and a game panel is focused
- **When** the new loop chords are pressed
- **Then** create (default name + start target), wrap cycle, and start still run; the old default loop chords do not, unless another command owns them
- **Given** a remapped chrome command (for example new tab) and chrome is focused
- **When** the new chord is pressed
- **Then** that chrome action runs
- **Given** a game panel is focused
- **When** a remapped chrome chord is pressed
- **Then** the chrome action does not run (same focus rule as today)
- **Given** overlay open or unmatched / bare keys
- **When** those keys arrive
- **Then** the loop interceptor does not `preventDefault`; typing still reaches the game
- **Given** no remap
- **When** shipped default chords are used
- **Then** behavior matches today’s loop + README chrome set

## Out of Scope

- **Settings Tabs, click-to-press, capturing flag** — task_03
- **i18n labels for chrome rows** — task_03
- **README / `/keyboard/` copy** — PRD non-goal (keep defaults)
- **Moving chrome commands onto `before-input-event`** — ADR-002 rejected
- **`globalShortcut`, game-view preload, new IPC** — TechSpec non-goals
- **Electron keyboard e2e** — G-01 guest-focus is dogfood

<requirements>
1. MUST dispatch loop commands through the existing main interceptor using `matchShortcut(map, 'loop')` and `getSnapshot().shortcuts`; attach points stay `attachSessionHandlers` + chrome contents.
2. MUST dispatch chrome catalog commands from `Shell.tsx` using `matchShortcut(map, 'chrome')` only — never register chrome-scoped commands on game contents.
3. MUST `preventDefault` only after a loop match that commits; keep overlay and chrome-editable skips; never log keys.
4. MUST stop using the frozen `matchAccountLoopChord` table for live matching (delegate or delete match-only code so defaults cannot drift from `SHORTCUT_DEFAULTS`).
5. MUST leave Plus `AccountModal` and partition/session isolation unchanged.
6. SHOULD keep `ACCOUNT_LOOP_SHORTCUTS` display strings available for the still-read-only Settings list until task_03.
7. SHOULD leave `pnpm verify:isolation` unrequired unless session code beyond reading the map changes.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-02, F-06, G-01 | Remapped loop chords while game focused | interceptor + map; dogfood |
| US-03, F-07, G-02 | Remapped chrome chords chrome-only | Shell scope tests / review |
| US-06, F-08, G-03 | Unmatched keys pass | matcher null; preventDefault only on commit |
| F-03 | Next use of a stored chord runs the action | map-driven match |
| US-08 | No remap → defaults | defaults still in map from task_01 |
| TechSpec Sequencing 3–4 | Interceptor then Shell | this task |
| ADR-002 | Dual paths, explicit scope | review |

## Subtasks

- [ ] 02.1 Point the loop interceptor at `matchShortcut` + snapshot map without new attach sites.
- [ ] 02.2 Point Shell chrome keydown at `matchShortcut` + `chrome` scope for the documented chrome catalog.
- [ ] 02.3 Keep overlay/editable skips and unmatched keys reaching the game.
- [ ] 02.4 Remove frozen live-match duplication so defaults cannot drift from the shared map.
- [ ] 02.5 Run focused Vitest and `pnpm typecheck` to terminal exit.

## Implementation Details

Follow TechSpec Contracts (scopes, matcher rules, `tab-next` shift invert, slot family), Architecture data flow (live key → loop vs chrome), Failure (game typing), Sequencing steps 3–4, and ADR-002. Do not paste those contracts here.

### Relevant Files

- `src/main/accountLoop.ts` — read `getSnapshot().shortcuts`; loop scope only
- `src/shared/accountLoop.ts` — drop frozen live match; keep wrap/create helpers
- `src/shared/accountLoop.test.ts` — wrap/create tests remain; match cases move to `shortcuts.test.ts` if not already there
- `src/renderer/src/components/Shell.tsx` — chrome catalog via shared matcher

### Dependent Files

- `src/shared/shortcuts.ts` — matcher from task_01
- `src/main/views.ts` / `src/main/index.ts` — attach already exists; do not add a second interceptor
- `src/renderer/src/store.ts` — capturing flag is task_03; do not add it here
- `src/renderer/src/components/Dialogs.tsx` — read-only list still OK
- `src/renderer/src/components/Dialogs.tsx` AccountModal — do not change

### Related ADRs

- [ADR-002: Shared shortcut catalog with dual dispatch paths](adrs/adr-002.md) — do not unify onto interceptor
- [ADR-003: Full snapshot shortcut map with per-command fallback](adrs/adr-003.md) — map is the live source

## Deliverables

- Loop and chrome live paths honor the snapshot map
- Frozen match table no longer drives live keys
- Shared unit tests still cover match/scope
- Updated `memory/MEMORY.md` and `memory/task_02.md` when warranted
- `reports/task_02.md` final evidence report

## Tests

### Unit Tests

- [ ] Given a custom loop chord on `account-create` in the map, when `matchShortcut(..., 'loop')`, then `account-create`; the shipped create chord → `null` unless reassigned.
- [ ] Given that same custom chord, when `matchShortcut(..., 'chrome')`, then `null`.
- [ ] Given a custom `tab-new` chord, when chrome scope, then `tab-new`; loop scope → `null`.
- [ ] Given default map, when shipped loop and chrome chords are matched in their scopes, then the same commands as today.
- [ ] Given wrap/create helpers, when `nextAccountId` / `keyboardCreateActions` run, then existing task_01-era behavior is unchanged.

### Integration Tests

- [ ] Not applicable — no Electron harness (TechSpec Tests).

### Platform or Manual Evidence

- [ ] G-01 guest-focus after remap is out of CI. If a focused guest view cannot be exercised in this environment, document that limitation in the report and continue with the automated gate.
- [ ] G-02: remapped and default chrome actions still require chrome focus (diff/review: no chrome commands on game `before-input-event`).

### Verification Commands

- `pnpm test src/shared/shortcuts.test.ts src/shared/accountLoop.test.ts src/shared/workspace.test.ts`
- `pnpm typecheck`

## Rollout

- N/A schema — map already persisted in task_01. Rollback: interceptor/Shell ignore map and use `SHORTCUT_DEFAULTS` only.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and `pnpm typecheck` pass to terminal exit.
- Coverage meets repository policy or reaches 80% for changed match/dispatch logic when measurable.
- No unrelated file or approved behavior changes (Settings UI, partitions, Plus dialog).
- Memory is current and the final report records exact evidence and unresolved risks (including G-01 CI gap).
