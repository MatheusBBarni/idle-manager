# Workflow Memory

## Current State

- task_01 pack helpers are in `src/shared/workspace.ts`.
- task_02 wired Settings IPC (`ops:exportGames` / `ops:importGames`) through `commitAll` of those helpers.

## Shared Decisions

- Two-task split (operator approved): shared helpers first so main cannot copy `snapshotFromImport`.
- README/site, workspace-import confirm, empty-bar CTA, and `verify:isolation` have no task.

## Shared Learnings

- `parseGameList` treats any own-property `accounts` (including `[]`) as a wrong document and returns `[]`.
- Game-list import must `commitAll` create+restore; assigning `snapshotFromImport` would wipe.

## Open Risks

- G-01 real handoff is dogfood, not CI. This environment did not run the Electron GUI.
- Wrong-click Import workspace still wipes (ADR-001 accepted).

## Handoffs

- Leftover `idle-manager-games.json` files are inert if handlers are removed; workspace `exportMetadata` v1 remains valid.
