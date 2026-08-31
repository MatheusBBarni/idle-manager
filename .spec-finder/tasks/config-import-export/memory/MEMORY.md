# Workflow Memory

## Current State

- task_01 pack helpers implemented in `src/shared/workspace.ts` and covered by `workspace.test.ts`.
- task_02 Settings IPC still pending.

## Shared Decisions

- Two-task split (operator approved): shared helpers first so main cannot copy `snapshotFromImport`.
- README/site, workspace-import confirm, empty-bar CTA, and `verify:isolation` have no task.

## Shared Learnings

- `parseGameList` treats any own-property `accounts` (including `[]`) as a wrong document and returns `[]`.

## Open Risks

- G-01 real handoff is dogfood, not CI (task_02 report must record GUI gap if the app cannot run).
- Wrong-click Import workspace still wipes (ADR-001 accepted).

## Handoffs

- task_02 must call `exportGameList` / `parseGameList` / `gameListImportActions` from task_01 and `commitAll`; never assign `snapshotFromImport` on the game-list path.
