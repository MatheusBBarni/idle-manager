# Task 01 Final Report: Persist the full shortcut map

## Outcome

- Verdict: completed
- Date: 2026-08-31
- Provider/session: pi-coding-agent (manual sf-batch-tasks)

## Changes

- `src/shared/shortcuts.ts` — catalog, defaults, identity, matcher, conflict occupancy, `normalizeShortcutMap`, `displayShortcut`.
- `src/shared/shortcuts.test.ts` — loop/chrome scope, no-mod/keyUp/repeat, slot 1–9, tab-next invert, remap isolation, normalize fallbacks.
- `src/shared/types.ts` — required `shortcuts` on `WorkspaceSnapshot`; version remains `1`.
- `src/shared/workspace.ts` — `emptySnapshot` / `parseSnapshot` / `exportMetadata` carry the full map; `prefs/shortcut` set/reset/no-op.
- `src/shared/workspace.test.ts` — missing-field defaults, legal set, duplicate/illegal no-op, `chord: null` reset, workspace vs game-list export.

Not changed: `src/main/accountLoop.ts`, `src/shared/accountLoop.ts` live matcher, `Shell.tsx`, Settings UI, partitions, README / site keyboard pages.

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Shared catalog, defaults, identity, matcher, conflict, `normalizeShortcutMap` in `src/shared` with unit tests | satisfied | `src/shared/shortcuts.ts` + `src/shared/shortcuts.test.ts` (18 tests) |
| 2. Snapshot `version` stays 1; full `shortcuts` on snapshot, empty, parse, `exportMetadata` | satisfied | `emptySnapshot().version` is 1; parse without field → `SHORTCUT_DEFAULTS`; `exportMetadata` includes map |
| 3. `prefs/shortcut` set or reset (`chord: null`); illegal/taken no-op | satisfied | workspace tests set unused chord; duplicate `b` / slot `1` / empty key keep `toBe(state)`; null restores create default |
| 4. Fail closed per command on parse | satisfied | missing field → all defaults; invalid chord → that command’s default; later duplicate → later default; unknown commands ignored |
| 5. Game-list export/import without binds | satisfied | `exportGameList` has no `shortcuts`; existing pack tests still omit account keys |
| 6. MUST NOT attach or change live loop interceptor or `Shell.tsx` | satisfied | those files not in the diff; `matchAccountLoopChord` still used by main interceptor |
| 7. SHOULD keep `ACCOUNT_LOOP_SHORTCUTS` for read-only Settings | satisfied | still exported and still read by `Dialogs.tsx` |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test src/shared/shortcuts.test.ts src/shared/workspace.test.ts` | pass | 2 files, 51 tests, 219ms, 2026-08-31 |
| `pnpm test` | pass | 7 files, 86 tests, 265ms, 2026-08-31 |
| `pnpm typecheck` | pass | `TypeScript: No errors found` |
| Guest-focus / live keys | not run | task_01 freezes listeners; G-01 is task_02 dogfood |

## Risks and Follow-ups

- Live keys still use the frozen `matchAccountLoopChord` table until task_02; remaps persist but do not fire yet.
- Parse of a corrupt file can still store a later command’s default even if that default collides with an earlier custom chord (per-command fallback).
- Coverage tooling is not configured in this repo; matcher/parse/apply cases are covered by the new unit tests.

## Final Verdict

completed — v1 snapshots always carry a full shortcut map, `prefs/shortcut` set/reset/no-op is in the reducer, workspace export includes the map and game-list export does not, and live interceptors stay frozen; focused Vitest, full `pnpm test` (86), and typecheck passed.
