# Workflow Memory

## Current State

- task_01 implemented: Settings Quit via `WindowCommand` `'quit'` and `beginQuit()`; Close unchanged. task_02–task_03 pending.

## Shared Decisions

- Graph: task_01 Settings Quit, task_02 dismiss-to-tray, task_03 second-launch restore.
- ipc/preload/`quit` i18n keys owned only by task_01 (`trayRestore` keys-only there).
- Updater Apply `beginQuit` hook is task_02 (interceptor is what can block install).
- Single-instance lock is task_03 only.
- Quitting flag lives in `src/main/appSession.ts` (`isQuitting()` / `beginQuit()`). No snapshot field.

## Shared Learnings

- `ops:window` `'quit'` must run `beginQuit()` even when `mainWindow` is missing.

## Open Risks

- Windows hide/ticks/second-instance evidence is dogfood, not CI.
- Settings Quit was not dogfooded in a live Electron session on this host.

## Handoffs

- task_02: import `isQuitting`/`beginQuit` from `appSession.ts`; consume `trayRestore` / `quit` i18n; do not re-own ipc/preload.
