---
status: pending
title: Persist the full shortcut map
type: backend
complexity: high
dependencies: []
---

# Task 01: Persist the full shortcut map

## Overview

A workspace that has never opened Shortcuts still has every documented command on the shipped default chords, and those chords are a full map on snapshot v1 that survives parse and workspace export. Primary **US-08** (F-10, US-07, G-05). This slice gives up live interceptor/Shell wiring and the Settings tab.

## Source Artifacts

- PRD: `.spec-finder/tasks/shortcut-remapping/_prd.md`
- TechSpec: `.spec-finder/tasks/shortcut-remapping/_techspec.md`

<critical>
- Read `.spec-finder/tasks/shortcut-remapping/_prd.md`, `.spec-finder/tasks/shortcut-remapping/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_01.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** a v1 snapshot with no `shortcuts` field
- **When** it is parsed
- **Then** every catalog command equals the shipped default map
- **Given** `prefs/shortcut` sets a legal unused chord on one command
- **When** the snapshot is exported as workspace metadata
- **Then** the full map is in that file, including the custom row
- **Given** a taken or illegal chord
- **When** `prefs/shortcut` runs
- **Then** the snapshot is unchanged
- **Given** `prefs/shortcut` with `chord: null` on a remapped command
- **When** applied
- **Then** that command stores its shipped default again
- **Given** a game-list export
- **When** inspected
- **Then** it has no shortcut map

## Out of Scope

- **Loop interceptor and `matchAccountLoopChord` wiring** — task_02
- **`Shell.tsx` chrome keydown** — task_02
- **Settings Tabs, capture, i18n rows** — task_03
- **README / site keyboard pages showing custom maps** — PRD non-goal
- **`globalShortcut`, new IPC, snapshot version bump, unbind** — TechSpec non-goals

<requirements>
1. MUST add the shared catalog, defaults, chord identity, matcher, conflict helper, and `normalizeShortcutMap` per TechSpec Contracts in `src/shared`, with unit tests next to the module.
2. MUST keep snapshot `version` at 1 and put a full `shortcuts` map on `WorkspaceSnapshot`, `emptySnapshot`, `parseSnapshot`, and `exportMetadata`.
3. MUST add `prefs/shortcut` that sets one command or resets it (`chord: null`); illegal or taken chords no-op.
4. MUST fail closed per command on parse: missing field → all defaults; invalid chord or later duplicate in catalog order → that command’s default; unknown commands ignored.
5. MUST leave game-list export/import without binds.
6. MUST NOT attach or change the live loop interceptor or `Shell.tsx` in this slice.
7. SHOULD keep `ACCOUNT_LOOP_SHORTCUTS` working for today’s read-only Settings list until task_03.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-08, F-10, G-05 | Missing map → shipped defaults | `parseSnapshot` / `emptySnapshot` tests |
| US-07, F-09 | Full map persists and workspace-exports | `prefs/shortcut` + `exportMetadata` tests |
| F-04 (reducer) | Duplicate/illegal no-op | `applyAction` tests |
| US-05 (data) | Reset writes default, still stored | `chord: null` test |
| Constraints | Game-list omits map; no version bump; no key log | export game-list test; review |
| TechSpec Sequencing 1–2 | Catalog then snapshot field | this task |

## Subtasks

- [ ] 01.1 Ship the shared catalog, defaults, identity, matcher, and normalize helpers with unit tests.
- [ ] 01.2 Put a full shortcut map on snapshot v1 parse, empty snapshot, and workspace export.
- [ ] 01.3 Apply `prefs/shortcut` set/reset with duplicate and illegal no-ops.
- [ ] 01.4 Keep game-list documents bind-free and leave live key listeners frozen.
- [ ] 01.5 Run focused Vitest and `pnpm typecheck` to terminal exit.

## Implementation Details

Follow TechSpec Contracts (Public interfaces, matcher rules, conflict occupancy for `account-slot`), Architecture (`shortcuts.ts` new; workspace field), Failure and Edge Cases (corrupt row, old snapshot), Sequencing steps 1–2, ADR-002 (shared catalog), and ADR-003 (full map, per-command fallback). Do not paste those contracts here.

### Relevant Files

- `src/shared/shortcuts.ts` — create
- `src/shared/shortcuts.test.ts` — create
- `src/shared/types.ts` — add `shortcuts` on `WorkspaceSnapshot`
- `src/shared/workspace.ts` — action, parse, empty, export
- `src/shared/workspace.test.ts` — parse/apply/export cases

### Dependent Files

- `src/shared/accountLoop.ts` — keep frozen matcher and `ACCOUNT_LOOP_SHORTCUTS` for Settings until later tasks
- `src/renderer/src/components/Dialogs.tsx` — still reads `ACCOUNT_LOOP_SHORTCUTS`; do not add Tabs here
- Tests that build snapshots — prefer `emptySnapshot()` / `parseSnapshot` so the new required field is present

### Related ADRs

- [ADR-001: Settings Shortcuts tab for documented modifier chords](adrs/adr-001.md) — catalog is every documented action
- [ADR-002: Shared shortcut catalog with dual dispatch paths](adrs/adr-002.md) — catalog lives in `src/shared`; do not wire listeners here
- [ADR-003: Full snapshot shortcut map with per-command fallback](adrs/adr-003.md) — full map, implied mod, parse fallback

## Deliverables

- Full default map on new and old v1 snapshots
- `prefs/shortcut` set/reset/no-op
- Workspace export includes the map; game-list does not
- Matcher/normalize unit tests (unused by live listeners yet)
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [ ] Given `matchShortcut` defaults and `loop` scope, when each loop default chord is pressed with mod, then that loop command; chrome defaults in `loop` scope → `null`.
- [ ] Given no platform mod, keyUp, or repeat, when matched, then `null`.
- [ ] Given `account-slot` default, when keys `1`–`9` with the stored shift/alt, then `account-slot`; given another command at `Ctrl+1`, then `shortcutConflict` reports occupancy.
- [ ] Given `tab-next` default, when shift is inverted, then still `tab-next` (previous-tab family, not a catalog row).
- [ ] Given raw without `shortcuts`, when `normalizeShortcutMap` / `parseSnapshot`, then `SHORTCUT_DEFAULTS`.
- [ ] Given two commands with the same identity, when normalized, then the later catalog command falls back to its default.
- [ ] Given `prefs/shortcut` legal unused chord, when applied, then only that command changes; duplicate or no-mod chord → snapshot unchanged; `chord: null` → shipped default stored.
- [ ] Given a remapped snapshot, when `exportMetadata`, then `shortcuts` is present; `exportGameList` has no such field.

### Integration Tests

- [ ] Not applicable — no Electron harness (TechSpec Tests).

### Platform or Manual Evidence

- [ ] Not applicable — persistence is proven in Vitest; live keys stay frozen until task_02. If a guest view cannot be exercised, document that limitation in the report and continue with the automated gate.

### Verification Commands

- `pnpm test src/shared/shortcuts.test.ts src/shared/workspace.test.ts`
- `pnpm typecheck`

## Rollout

- First save after upgrade writes the full default map (ADR-003). Existing v1 files without the field parse to current defaults. Rollback: ignore `shortcuts` on parse.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and `pnpm typecheck` pass to terminal exit.
- Coverage meets repository policy or reaches 80% for new `src/shared/shortcuts.ts` logic when measurable.
- No unrelated file or approved behavior changes (interceptor, `Shell.tsx`, Settings UI, partitions).
- Memory is current and the final report records exact evidence and unresolved risks.
