# Workflow Memory

## Current State

- Packet `close-to-tray` tasks generated, none started: task_01–task_03 pending.

## Shared Decisions

- Graph: task_01 Settings Quit, task_02 dismiss-to-tray, task_03 second-launch restore.
- ipc/preload/`quit` i18n keys owned only by task_01 (`trayRestore` keys-only there).
- Updater Apply `beginQuit` hook is task_02 (interceptor is what can block install).
- Single-instance lock is task_03 only.

## Shared Learnings

## Open Risks

- Windows hide/ticks/second-instance evidence is dogfood, not CI.

## Handoffs
