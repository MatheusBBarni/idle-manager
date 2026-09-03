# Task 02 Final Report: Block OS sleep while any account is running and release on last close or quit

## Outcome

- Verdict: completed
- Date: 2026-09-03
- Provider/session: pi / manual sf-batch-tasks

## Changes

- `src/main/sleepBlock.ts` — `syncSleepBlock` / `stopSleepBlock`; one in-memory id; `prevent-app-suspension` only
- `src/main/index.ts` — `syncSleepBlock` after `commitAll`, `loadSnapshot`, and `ops:import`; `stopSleepBlock` on `before-quit`

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. TechSpec `syncSleepBlock` / `stopSleepBlock` in `src/main/sleepBlock.ts`; one id; only `prevent-app-suspension` | satisfied | `src/main/sleepBlock.ts`; `powerSaveBlocker.start('prevent-app-suspension')`; no `prevent-display-sleep` |
| 2. Call `syncSleepBlock(snapshot)` after `commitAll`, successful `loadSnapshot`, and import-workspace | satisfied | `index.ts` `commitAll`, post-`loadSnapshot`, `ops:import` after `snapshotFromImport` |
| 3. Call `stopSleepBlock` from `before-quit` and when the predicate is false | satisfied | `app.on('before-quit')`; `syncSleepBlock` calls `stopSleepBlock` when `!hasRunningAccount` |
| 4. Failed `start`: `console.error`, clear id, retry next sync; MUST NOT hide task_01 hint | satisfied | `!isStarted(id)` → `console.error('sleep block start failed')`, `blockerId = null`; StatusBar unchanged this task |
| 5. `stop` no-op when no id stored | satisfied | `stopSleepBlock` returns if `blockerId == null` |
| 6. MUST NOT start a blocker on `--verify-isolation` | satisfied | `if (verifying) { verifyIsolation(); app.exit; return }` before `loadSnapshot`; `pnpm verify:isolation` `{ "ok": true }` |
| 7. MUST NOT edit `views.ts`, preload, `OpsourceAPI`, or `parseSnapshot` | satisfied | `git diff` is `sleepBlock.ts` + `index.ts` (+ task file); views/preload/workspace parse untouched |
| 8. SHOULD never start a second id without stopping the first | satisfied | return when stored id `isStarted`; otherwise stop/forget before `start` |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test` | passed | Vitest 9 files / 94 tests (task_01 predicate coverage still green) |
| `pnpm typecheck` | passed | `TypeScript: No errors found` |
| `pnpm verify:isolation` | passed | `{ "ok": true, "primitive": "session.fromPartition(persist:opsource-account-{accountId})" }` |
| Electron `powerSaveBlocker` unit | not applicable | Vitest cannot load Electron; documented in task Tests |
| G-01/G-03 overnight idle-timer journal | not run | No Windows packaged idle-timer pass this session; PRD dogfood, not CI |

## Risks and Follow-ups

- Overnight proof that Windows idle sleep is actually blocked remains G-01 journal, not this gate.
- G-03 last-close / quit sleep-allowed is the same journal.
- Failed `start` leaves the footer hint on until the next snapshot sync (ADR-002).
- macOS closing the window while accounts stay `running` keeps the blocker (TechSpec non-goal).

## Final Verdict

task_02 completed: main holds one `prevent-app-suspension` blocker synced to `hasRunningAccount` after load, commit, and workspace import, releases on empty set and `before-quit`, and `pnpm test`, `pnpm typecheck`, and `pnpm verify:isolation` passed without touching isolation files.
