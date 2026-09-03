# Workflow Memory

## Current State

- task_01 completed: Settings Quit via `WindowCommand` `'quit'` and `beginQuit()`.
- task_02 implemented: win32 Close dismisses to Tray; empty Close quits; Apply uses `beginQuit`. task_03 pending.

## Shared Decisions

- Graph: task_01 Settings Quit, task_02 dismiss-to-tray, task_03 second-launch restore.
- ipc/preload/`quit` i18n keys owned only by task_01 (`trayRestore` keys-only there).
- Updater Apply `beginQuit` hook is task_02 (interceptor is what can block install).
- Single-instance lock is task_03 only.
- Quitting flag lives in `src/main/appSession.ts` (`isQuitting()` / `beginQuit()`). No snapshot field.
- `restoreMainWindow()` is the only restore seam (tray click, tray menu, runningCount→0, later second-instance).

## Shared Learnings

- `ops:window` `'quit'` must run `beginQuit()` even when `mainWindow` is missing.
- win32 `trayReady` is optimistic until Tray construct; failure fail-closes that Close.

## Open Risks

- Windows hide/ticks/second-instance evidence is dogfood, not CI. This host is darwin.
- Settings Quit was not dogfooded in a live Electron session on this host.
- Apply `beginQuit` then `quitAndInstall` was not exercised on a packaged win32 build.

## Handoffs

- task_03: own only `requestSingleInstanceLock` + `second-instance` in `index.ts`. Reuse `restoreMainWindow`; do not expand tray scope.
