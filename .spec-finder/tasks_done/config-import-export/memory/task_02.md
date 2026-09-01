# Task Memory: task_02

## Objective Snapshot

Ship Settings Export/Import game list via new IPC and `commitAll` of task_01 actions. Workspace export/import unchanged.

## Important Decisions

- New IPC twins `ops:exportGames` / `ops:importGames`; workspace `ops:export` / `ops:import` bodies left as-is.
- Import applies `commitAll(gameListImportActions(...))` only when `parseGameList` is non-empty; catch IO/parse as `false`.
- Dialog titles English: `Export game list` / `Import game list`; default save `idle-manager-games.json`.
- Chrome keys `exportGameList` / `importGameList` (EN) vs `Exportar/Importar lista de jogos` (PT).
- Game-list Settings buttons sit in a second row of HeroUI `Button onPress` next to unchanged workspace actions.

## Learnings

- `commitAll` already persist/broadcast/syncs; tab/create does not hit `accountIdsToWipe`, so this path never calls `clearAccountSession`.
- `src/preload/index.d.ts` already types `Window.opsource` as `OpsourceAPI`; no extra declaration needed.

## Files / Surfaces

- `src/shared/ipc.ts`, `src/preload/index.ts`
- `src/main/index.ts` — `ops:exportGames` / `ops:importGames`
- `src/renderer/src/components/Dialogs.tsx`
- `src/shared/i18n.ts`, `src/shared/i18n.test.ts`

## Errors / Corrections

- First import-handler draft mixed `filePath` (save) with open-dialog `filePaths`; corrected before verification.

## Ready for Next Run

- G-01 sender→recipient handoff still needs a real GUI session; automated gate cannot prove dialogs.
