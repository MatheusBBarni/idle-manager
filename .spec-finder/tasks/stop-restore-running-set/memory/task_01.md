# Task Memory: task_01

## Objective Snapshot

Stop this tab and remember last-set (US-01). Implemented.

## Important Decisions

- Last-set algebra runs on every non-identity `applyAction` via `withLastRunningAccountIds` after `reduceWorkspace`, so later `stopFarm` / `restoreLastSet` reuse it without a second helper.
- Identity no-ops (`unknown tabId`, nothing running in tab) return the input snapshot reference before last-set.
- Running-id order is farm-wide `accountOrder` concatenation, then leftover account keys.
- Sidebar Stop this tab is an expanded-footer icon next to Start all; Start all stays a `account/setStatus` loop.
- i18n key is `stopTab`.

## Learnings

- `accountIdsToWipe` stays `[]` for `account/stopTab` because only `account/delete` and wiping `tab/delete` populate it.
- Guest-focus and live view teardown are existing `syncViews`; not asserted in Vitest.

## Files / Surfaces

- `src/shared/types.ts`, `src/shared/workspace.ts`, `src/shared/workspace.test.ts`
- `src/renderer/src/components/Sidebar.tsx`
- `src/shared/i18n.ts`, `src/shared/i18n.test.ts`

## Errors / Corrections

- None.

## Ready for Next Run

- task_02 can add `account/stopFarm` in `reduceWorkspace`; last-set wrap is already in `applyAction`.
