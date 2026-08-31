# Workflow Memory

## Current State

- Packet `config-import-export` tasks generated; task_01 and task_02 pending.
- Graph: task_01 pack contract → task_02 Settings IPC. No spikes.

## Shared Decisions

- Two-task split (operator approved): shared helpers first so main cannot copy `snapshotFromImport`.
- README/site, workspace-import confirm, empty-bar CTA, and `verify:isolation` have no task.

## Shared Learnings

## Open Risks

- G-01 real handoff is dogfood, not CI (task_02 report must record GUI gap if the app cannot run).
- Wrong-click Import workspace still wipes (ADR-001 accepted).

## Handoffs

- task_02 must call `exportGameList` / `parseGameList` / `gameListImportActions` from task_01 and `commitAll`; never assign `snapshotFromImport` on the game-list path.
