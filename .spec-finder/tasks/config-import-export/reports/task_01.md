# Task 01 Final Report: Prove the games-only pack contract

## Outcome

- Verdict: completed
- Date: 2026-08-31
- Provider/session: pi-coding-agent (manual sf-batch-tasks)

## Changes

- `src/shared/workspace.ts` — Added `GameListTab`, `GameListExport`, `exportGameList`, `parseGameList`, and `gameListImportActions` next to `exportMetadata`. Import now uses `isValidHttpUrl`. `applyAction`, `exportMetadata`, and `parseSnapshot` unchanged.
- `src/shared/workspace.test.ts` — Seven pack-contract cases: in-bar export without archived/accounts, parse fail-closed, skip bad URLs, additive create + restore active, empty-bar active, re-import duplicates, empty pack no-op.

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Add `exportGameList`, `parseGameList`, `gameListImportActions` in `workspace.ts` | satisfied | Functions exported from `src/shared/workspace.ts` matching TechSpec Contracts |
| 2. Export only `visibleTabs` name+URL in bar order; omit ids, layout, archived, accounts, locale, theme | satisfied | `exportGameList` maps `visibleTabs`; test `exports only in-bar name+URL rows and omits account keys` — two in-bar rows, archived omitted, `JSON.stringify(pack)` has no `/account/i` |
| 3. `parseGameList` returns `[]` unless game-list contract; fail-closed when `accounts` own-property; skip invalid URLs | satisfied | Tests reject workspace-shaped, missing `kind`, `accounts: {}` / `[]`, `null`, `[]`; skip `javascript:` and empty `baseUrl` |
| 4. `gameListImportActions` emits `tab/create` without `id`, then restore prior in-bar active; empty → `[]` | satisfied | Restore test: tab count +2, accounts unchanged, `activeTabId` restored; empty pack emits `[]` and apply identity; no-active test leaves created tab active |
| 5. MUST NOT change `applyAction` tab-create rules, `exportMetadata`, or `parseSnapshot` | satisfied | Diff adds helpers only; existing workspace tests still pass (18 tests in file) |
| 6. SHOULD keep coverage of new helpers ≥80% via named `workspace.test.ts` cases | satisfied | All six named Tests plus empty-pack case present; focused run 18/18 pass |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test src/shared/workspace.test.ts` | pass | Vitest 18 tests, 1 file, 3ms, 2026-08-31 |
| `pnpm test && pnpm typecheck` | pass | 6 files / 48 tests; `TypeScript: No errors found` |
| Platform / GUI | not applicable | File dialogs and G-01 handoff are task_02 |

## Risks and Follow-ups

- No IPC/Settings yet; packs cannot be written from the app until task_02.
- G-01 dogfood handoff remains task_02.
- Wrong-click Import workspace still wipes (ADR-001); out of scope.

## Final Verdict

task_01 is completed: shared pack helpers match the TechSpec contract, unit tests prove in-bar name+URL export, fail-closed parse, additive create without jars, active-tab restore, and re-import duplicates, and `pnpm test && pnpm typecheck` passed without changing snapshot parse/export or `applyAction` create rules.
