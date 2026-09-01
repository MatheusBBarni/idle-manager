---
status: pending
title: Keyboard trio plus bind list
type: backend
complexity: high
dependencies:
  - task_01
  - task_02
  - task_03
---

# Task 04: Keyboard trio plus bind list

## Overview

A farm operator can stop this tab, stop the whole farm, and restore last set from the keyboard **while a game panel is focused**, and can find those binds in Settings and the README. Primary **US-04** (also F-06, G-04). This slice gives up keyboard Start all and site `/keyboard/` pages.

## Source Artifacts

- PRD: `.spec-finder/tasks/stop-restore-running-set/_prd.md`
- TechSpec: `.spec-finder/tasks/stop-restore-running-set/_techspec.md`

<critical>
- Read `.spec-finder/tasks/stop-restore-running-set/_prd.md`, `.spec-finder/tasks/stop-restore-running-set/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_04.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** a game panel is focused and some accounts are running
- **When** I press the stop-this-tab bind (or stop-whole-farm bind)
- **Then** that scope closes as in US-01 / US-02
- **Given** a game panel is focused and a last set exists
- **When** I press the restore bind
- **Then** last set starts as in US-03
- **Given** I type in a game field with keys that are not those reserved modifier chords
- **When** I type
- **Then** the game still receives the keystrokes
- **Given** I open Settings Shortcuts or the README Keyboard table
- **When** I look for the new actions
- **Then** I see stop this tab, stop whole farm, and restore with the shipped defaults

## Out of Scope

- **Keyboard Start all** — PRD Out of Scope
- **Site `/keyboard/` pages** — TechSpec Non-Goals
- **`globalShortcut`, game preload, chrome-scope-only binds** — TechSpec Non-Goals
- **Changing reducer verbs** — task_01–task_03
- **Bare keys** — Constraints / matcher already rejects them

<requirements>
1. MUST add the three `LOOP_COMMANDS` and `SHORTCUT_DEFAULTS` in TechSpec Contracts (Mod+W, Mod+Shift+W, Mod+Shift+Enter).
2. MUST map those commands in `src/main/accountLoop.ts` `actionsForCommand` to `account/stopTab`, `account/stopFarm`, and `account/restoreLastSet` per Contracts.
3. MUST keep match-only `preventDefault` (existing interceptor: no actions → key reaches the game). For `account-stop-tab`, emit the action when `liveTab()` exists so Mod+W is not leaked into the game when a tab is open.
4. MUST list the three actions in Settings Shortcuts (`SHORTCUT_LABELS`) and the README Keyboard table.
5. MUST add shortcut i18n in `en`, `pt`, `es`, and `zh-Hans`.
6. MUST NOT add a Start all command or `globalShortcut`.
7. SHOULD leave overlay skip and chrome-editable skip unchanged.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-04, F-06, G-04 | Loop chords + listed binds | matcher unit + Settings/README |
| Constraints | Modifier-only; no OS-global | defaults + no `globalShortcut` |
| TechSpec Sequencing 2–3, 5 | Catalog then interceptor then Settings/README | this slice after verbs |
| ADR-002 | W family + Shift+Enter; loop scope | `SHORTCUT_DEFAULTS` + `LOOP_COMMANDS` |
| G-03 typing | Unmatched keys pass | matcher null tests |

## Subtasks

- [ ] 04.1 Catalog the three loop commands and shipped defaults without conflicts
- [ ] 04.2 Interceptor maps commands to the three workspace actions
- [ ] 04.3 Settings Shortcuts rows + four-locale labels
- [ ] 04.4 README Keyboard table rows matching Settings
- [ ] 04.5 Focused matcher/i18n tests and repository gates

## Implementation Details

Follow `.spec-finder/tasks/stop-restore-running-set/_techspec.md` Contracts (ShortcutCommand defaults, `actionsForCommand`), Architecture (loop interceptor), and Sequencing steps 2, 3, and 5. Do not paste the chord table.

`src/shared/accountLoop.ts` `ACCOUNT_LOOP_SHORTCUTS` already maps `LOOP_COMMANDS`; growing that array should pick up display rows if Settings still uses the explicit `SHORTCUT_LABELS` record — update that record.

### Relevant Files

- `src/shared/shortcuts.ts` — command union, `LOOP_COMMANDS`, defaults
- `src/shared/shortcuts.test.ts` — match loop scope + no default conflict
- `src/main/accountLoop.ts` — `actionsForCommand` mapping
- `src/renderer/src/components/Settings.tsx` — `SHORTCUT_LABELS`
- `src/shared/i18n.ts` — shortcut labels in four locales
- `src/shared/i18n.test.ts` — frozen keys
- `README.md` — Keyboard table

### Dependent Files

- `src/shared/accountLoop.ts` — `ACCOUNT_LOOP_SHORTCUTS` derived from `LOOP_COMMANDS`
- `src/shared/workspace.ts` — `normalizeShortcutMap` / `prefs/shortcut` already per-command; new names must be in `SHORTCUT_COMMANDS`
- `src/renderer/src/chromeShortcuts.ts` — do not add these commands to chrome scope

### Related ADRs

- [ADR-002: Atomic farm verbs in the workspace reducer](adrs/adr-002.md) — loop chords; remappable; no `globalShortcut`

## Deliverables

- Three loop binds fire the task_01–task_03 actions
- Settings + README list the shipped defaults
- Unit tests listed below
- Updated `memory/MEMORY.md` and `memory/task_04.md` when warranted
- `reports/task_04.md` final evidence report

## Tests

### Unit Tests

- [ ] Given default map and Mod+W, when `matchShortcut(..., 'loop')`, then `account-stop-tab`; chrome scope does not match it as a chrome command
- [ ] Given Mod+Shift+W, then `account-stop-farm`; given Mod+Shift+Enter, then `account-restore-last`
- [ ] Given `SHORTCUT_DEFAULTS`, when `shortcutConflict` is checked for the three new chords against the rest of the map, then no conflict
- [ ] Given unmatched letter without the reserved chords, when `matchShortcut` loop, then `null`
- [ ] Given new i18n keys, when `src/shared/i18n.test.ts` runs, then all four locales define them

### Integration Tests

- [ ] Not applicable — interceptor guest-focus is not in Vitest.

### Platform or Manual Evidence

- [ ] Guest-focus (G-04) cannot be proven in CI. Document that limitation in the report and continue; automated gate is matcher + typecheck + i18n. Do not add Electron e2e.

### Verification Commands

- `pnpm test`
- `pnpm typecheck`

## Rollout

- README Keyboard table is operator-facing docs for this slice. Site `/keyboard/` is out of scope; do not require it. Existing shortcut maps on disk gain the three defaults via `normalizeShortcutMap`.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for changed testable logic when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
