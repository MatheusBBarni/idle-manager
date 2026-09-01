# Task 02 Final Report: Honor remapped chords on loop and chrome paths

## Outcome

- Verdict: completed
- Date: 2026-08-31
- Provider/session: pi-coding-agent (manual sf-batch-tasks)

## Changes

- `src/main/accountLoop.ts` — interceptor matches `getSnapshot().shortcuts` with `matchShortcut(..., 'loop')`; `preventDefault` only after a committing match; overlay and chrome-editable skips unchanged.
- `src/shared/accountLoop.ts` — deleted frozen `matchAccountLoopChord`; wrap/create helpers kept; `ACCOUNT_LOOP_SHORTCUTS` derived from `SHORTCUT_DEFAULTS`.
- `src/shared/accountLoop.test.ts` — match cases removed (owned by `shortcuts.test.ts`); wrap/create/display remain.
- `src/renderer/src/components/Shell.tsx` — chrome catalog dispatched via `matchShortcut(..., 'chrome')` only.

Not changed: attach sites in `views.ts` / `index.ts`, partitions, Plus `AccountModal`, Settings UI, capturing flag, README / site keyboard pages.

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Loop interceptor uses `matchShortcut(map, 'loop')` and `getSnapshot().shortcuts`; attach points stay | satisfied | `src/main/accountLoop.ts`; `attachAccountLoop` still called from `views.ts` (game) and `index.ts` (chrome) |
| 2. Chrome catalog from `Shell.tsx` with `matchShortcut(map, 'chrome')` only; never on game contents | satisfied | Shell uses chrome scope; interceptor loop-only; no chrome commands on `before-input-event` |
| 3. `preventDefault` only after a loop match that commits; overlay/editable skips; no key log | satisfied | interceptor returns before `preventDefault` when overlay, chrome-editable, no match, or empty actions |
| 4. Stop frozen `matchAccountLoopChord` for live matching | satisfied | symbol gone from repo; matcher tests live in `shortcuts.test.ts` |
| 5. Plus AccountModal and partition/session isolation unchanged | satisfied | those files not in the diff |
| 6. SHOULD keep `ACCOUNT_LOOP_SHORTCUTS` for read-only Settings | satisfied | still exported; Dialogs still maps the four rows |
| 7. SHOULD leave `pnpm verify:isolation` unrequired | satisfied | session attach only still reads the map; isolation script not required |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test src/shared/shortcuts.test.ts src/shared/accountLoop.test.ts src/shared/workspace.test.ts` | pass | 3 files, 56 tests, 231ms, 2026-08-31 |
| `pnpm test` | pass | 7 files, 81 tests, 259ms, 2026-08-31 |
| `pnpm typecheck` | pass | `TypeScript: No errors found` |
| G-01 guest-focus after remap | not run | no Electron harness; documented CI gap |
| G-02 chrome-only under game focus | review | chrome commands are Shell-only; interceptor scope is `loop` |

## Risks and Follow-ups

- G-01 (remap then create → cycle → start while a game panel is focused) is dogfood, not CI.
- Settings still lists shipped default loop strings, not the live map, until task_03.
- Shell does not yet ignore chrome chords while capturing (task_03 capturing flag).

## Final Verdict

completed — remapped loop and chrome chords are matched from the snapshot map under today’s focus rules, the frozen live-match table is gone, unmatched keys are not `preventDefault`ed by the interceptor, and focused Vitest plus typecheck passed; G-01 remains a dogfood gap.
