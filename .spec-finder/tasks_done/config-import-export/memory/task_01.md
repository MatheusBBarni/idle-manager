# Task Memory: task_01

## Objective Snapshot

Prove the games-only pack contract in `workspace.ts` with unit tests. No IPC or Settings.

## Important Decisions

- Helpers live next to `exportMetadata` in `src/shared/workspace.ts` (ADR-002); no new module or `WorkspaceAction`.
- `parseGameList` fail-closes on `Object.hasOwn(raw, 'accounts')`, including `accounts: []`.
- Empty `name` is allowed (`typeof === 'string'`); rows skipped unless `baseUrl` passes existing `isValidHttpUrl`.
- Restore-active uses `tabById` + `!archived`; empty `tabs` yields `[]` so apply is a no-op.

## Learnings

- Existing `tab/create` already mints UUID, empty `accountOrder`, and steals `activeTabId`; import must append `tab/activate` of the prior in-bar tab.
- `asString` rejects empty strings, so pack parse must not reuse it for `name`.

## Files / Surfaces

- `src/shared/workspace.ts` — `GameListTab`, `GameListExport`, `exportGameList`, `parseGameList`, `gameListImportActions`
- `src/shared/workspace.test.ts` — `describe('game list pack')`
- `applyAction`, `exportMetadata`, `parseSnapshot` unchanged

## Errors / Corrections

- None; focused Vitest and `pnpm test && pnpm typecheck` passed on first gate run.

## Ready for Next Run

- task_02 must call these helpers and `commitAll`; never assign `snapshotFromImport` on the game-list path.
