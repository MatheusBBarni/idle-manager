# config-import-export tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Prove the games-only pack contract | F-02 | backend | medium | [] | completed |
| task_02 | Ship Settings game-list export and import | US-02 | frontend | high | [task_01] | completed |

## Execution order

1. **task_01** — `exportGameList` / `parseGameList` / `gameListImportActions` in `workspace.ts` with unit tests (no IPC, no Settings).
2. **task_02** — New IPC pair, main dialog handlers via `commitAll`, Settings buttons, PT/EN copy. Workspace Export/Import unchanged.

**Roots:** task_01  
**Leaves:** task_02  
**Critical path:** task_01 → task_02  
**Parallelizable:** none  
**Spikes / blockers:** none

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| F-02 | task_01 | In-bar name+URL pack; apply adds empty tabs; junk/workspace JSON applies nothing |
| US-02 | task_02 | Recipient loads that pack from Settings; sender can write it from Settings |

US-03, US-04, US-05, US-06, F-03, F-05–F-08, G-01 (file effect), G-02, G-04 live in task_01.  
US-01 chrome, US-07, US-08, F-01, F-04, F-09, F-10, G-03 live in task_02.  
US-01 file *shape* (in-bar, no accounts, empty pack) is task_01; the save dialog is task_02.

README/site, workspace-import confirm, empty-bar CTA, and `pnpm verify:isolation` are PRD/TechSpec non-goals — no task.

## Tie-break rationale

Only one legal order. Shared pack helpers must exist before main import may `commitAll` them; otherwise handlers would copy `snapshotFromImport`.
