# Workflow Memory

## Current State

- task_01 completed: `hasRunningAccount` plus StatusBar `sleepBlocked` hint.
- task_02 implemented: main `syncSleepBlock` / `stopSleepBlock` with one `prevent-app-suspension` id.

## Shared Decisions

- Hint is derived from running `status`, not from `powerSaveBlocker.isStarted` (ADR-002). Failed start must not hide the hint.
- Keep-awake type is `prevent-app-suspension` only. Display may sleep.

## Shared Learnings

- `hasRunningAccount` lives in `src/shared/workspace.ts`. Layout still excludes popped-out panels; keep-awake must not copy that filter.
- Workspace import (`ops:import`) bypasses `commitAll` and must sync keep-awake itself. Game-list import already goes through `commitAll`.

## Open Risks

- G-01/G-03 overnight idle-timer journal is not in CI. Lid-close / Start→Sleep / monitor-off pauses remain out of V1.
- Failed `start` is logged and retried on the next snapshot sync; hint can outpace OS ack until then.

## Handoffs

- Isolation files and `views.ts` were not edited. Re-run `pnpm verify:isolation` if those files change later.
