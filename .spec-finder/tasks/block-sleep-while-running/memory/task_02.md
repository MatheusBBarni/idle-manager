# Task Memory: task_02

## Objective Snapshot

Sync one `prevent-app-suspension` blocker to `hasRunningAccount`; stop on empty set and `before-quit`.

## Important Decisions

- Single in-memory `blockerId`. If it is already `isStarted`, do not start another. Stale unstarted id is stopped then forgotten before retry.
- Failed `start` (`!isStarted(id)`): `console.error('sleep block start failed')`, store null, retry on next `syncSleepBlock`. Hint stays task_01.
- Wire: `commitAll`, successful `loadSnapshot`, import-workspace (`ops:import` bypasses `commit`), `before-quit` → `stopSleepBlock`.
- `--verify-isolation` still returns before `loadSnapshot`; no start on that path.

## Learnings

- Vitest cannot load Electron; shared predicate tests are the unit evidence. Isolation CLI is the isolation gate.
- Import game list goes through `commitAll`, so it inherits sync. Workspace import does not.

## Files / Surfaces

- `src/main/sleepBlock.ts` — new
- `src/main/index.ts` — sync/stop call sites
- `src/main/views.ts` / partitions — not edited

## Errors / Corrections

- None.

## Ready for Next Run

- G-01/G-03 overnight idle-timer journal is PRD dogfood, not this task’s CI gate.
