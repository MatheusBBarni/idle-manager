# Task 02 Final Report: Dismiss a live farm to the tray

## Outcome

- Verdict: completed
- Date: 2026-09-03
- Provider/session: pi / manual sf-batch-tasks

## Changes

- `src/shared/trayPolicy.ts` — `runningAccountCount`, `shouldDismissToTray`, `trayTooltip`
- `src/shared/trayPolicy.test.ts` — win32 true path; darwin/linux false; n=0 / quitting / !trayReady false; mixed running/closed count; en tooltip includes `4` and `runningCount`
- `src/main/appSession.ts` — `noteTrayReady`, `interceptClose` hide + skipTaskbar + Tray, `restoreMainWindow`, `syncDismissedSession`
- `src/main/index.ts` — win32 Close interceptor; bind session; sync tray on snapshot writes; `'min'`/`'max'` unchanged
- `src/main/updater.ts` — Apply calls `beginQuit()` then `quitAndInstall()`

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Shared `runningAccountCount`, `shouldDismissToTray`, `trayTooltip` with unit tests | satisfied | `trayPolicy.ts` + `trayPolicy.test.ts`; `pnpm test` 5 new tests |
| 2. Intercept chrome close only when policy true: hide, skipTaskbar, keep window/views | satisfied | `index.ts` `'close'` + `interceptClose()`; no `views.ts` / `setChromeWindow(null)` on hide |
| 3. Fail closed if Tray construct fails | satisfied | empty image or throw → `noteTrayReady(false)` and no preventDefault |
| 4. Tray only while dismissed: tooltip, Restore + Quit, click restores, destroy on restore | satisfied | `showTray` / `buildMenu` / `restoreMainWindow` destroys tray |
| 5. Apply calls `beginQuit` before `quitAndInstall` | satisfied | `updater.ts` persist → `beginQuit()` → `quitAndInstall()` |
| 6. Restore if `runningCount` becomes 0 while dismissed | satisfied | `syncDismissedSession` in `afterSnapshotWrite` |
| 7. MUST NOT change `'min'`/`'max'`, partitions, or `workspace.ts` | satisfied | `'min'` still `minimize()`; git diff excludes `workspace.ts`, `views.ts`, partitions |
| 8. Refresh tooltip when running count changes while dismissed | satisfied | `syncDismissedSession` `setToolTip` when tray alive |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test` | passed | Vitest 10 files / 102 tests (`trayPolicy.test.ts` 5) |
| `pnpm typecheck` | passed | `TypeScript: No errors found` |
| Windows dogfood (hide, tooltip, restore, tray Quit, empty Close, Minimize, ticks, Apply) | not run | Host is darwin; Vitest cannot construct Electron Tray |

## Risks and Follow-ups

- win32 Close-to-tray, overflow tooltip, ticks-while-hidden, and Apply-while-dismissed remain dogfood (G-01–G-04).
- Second-instance restore is task_03.
- `beginQuit` also `app.quit()`s before `quitAndInstall`; install() is sync in electron-updater, but packaged Apply was not run.

## Final Verdict

task_02 completed: shared dismiss policy is unit-tested, win32 Close hides in place to a Restore/Quit tray when Tray can be constructed, empty/fail-closed Close still quits, and Apply sets quitting before install.
