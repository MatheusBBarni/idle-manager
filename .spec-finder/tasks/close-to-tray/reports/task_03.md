# Task 03 Final Report: Restore from a second launch

## Outcome

- Verdict: completed
- Date: 2026-09-03
- Provider/session: pi / manual sf-batch-tasks

## Changes

- `src/main/index.ts` — `requestSingleInstanceLock` before `whenReady`; lost lock quits and skips chrome setup; `second-instance` restores a hidden window via `restoreMainWindow()` or focuses a visible one

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Call `requestSingleInstanceLock` so a second process exits | satisfied | `gotTheLock = app.requestSingleInstanceLock()`; `if (!gotTheLock) app.quit()` |
| 2. `second-instance` restores when dismissed, otherwise focuses | satisfied | `!isVisible()` → `restoreMainWindow()`; else unminimize + `focus()` |
| 3. MUST NOT create a second `BrowserWindow` farm on the same stores | satisfied | no `createWindow` on `second-instance`; `whenReady` returns if lock lost |
| 4. Take the lock before `whenReady` work that opens chrome | satisfied | lock at module load, before `app.whenReady()` |
| 5. MUST NOT add tray menu items or snapshot fields | satisfied | diff is `index.ts` only; no tray/snapshot/workspace changes |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test` | passed | Vitest 10 files / 102 tests |
| `pnpm typecheck` | passed | `TypeScript: No errors found` |
| Two-launch dogfood (dismissed restore + visible focus) | not run | Host session did not launch two Electron processes |

## Risks and Follow-ups

- Second-instance restore of a win32 dismissed farm is still dogfood.
- Electron can emit `ready` after a losing instance `app.quit()`; the `gotTheLock` guard is what prevents a second farm.

## Final Verdict

task_03 completed: the first process keeps a single-instance lock, a second launch exits instead of opening another chrome farm, and the first window is restored when hidden or focused when visible.
