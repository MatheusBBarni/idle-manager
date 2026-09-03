# Task 01 Final Report: Stop this tab and remember last-set

## Outcome

- Verdict: completed
- Date: 2026-09-03
- Provider/session: pi / sf-batch-tasks manual invocation

## Changes

- `src/shared/types.ts` — `lastRunningAccountIds: string[]` on snapshot v1
- `src/shared/workspace.ts` — parse/export/import defaults; last-set helper; `account/stopTab`
- `src/shared/workspace.test.ts` — last-set, stopTab, wipe, parse, export, import, identity, delete
- `src/renderer/src/components/Sidebar.tsx` — expanded-footer Stop this tab; Start all loop unchanged
- `src/shared/i18n.ts` — `stopTab` in `en`, `pt`, `es`, `zh-Hans`
- `src/shared/i18n.test.ts` — frozen EN/PT strings for `stopTab`

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. `lastRunningAccountIds` on snapshot v1; parse missing/invalid → `[]`; omit export; import `[]` | satisfied | `parseLastRunningAccountIds`; `emptySnapshot` `[]`; `exportMetadata` has no field; `snapshotFromImport` sets `[]`. Unit: “parses missing last-set as empty, omits it from export, and clears it on import” |
| 2. Last-set algebra on `setStatus` / `stopTab` / `delete` / `tab/delete` | satisfied | `withLastRunningAccountIds` after every non-identity `applyAction`. Units: freeze on empty farm; shrink on hand-close; drop deleted id |
| 3. `account/stopTab` `{ tabId }` closes running in that tab with the same close rule as `setStatus` `'closed'` | satisfied | `reduceWorkspace` `account/stopTab` sets `status: 'closed', poppedOut: false`. Unit: A,B closed, C running |
| 4. Identity when unknown `tabId` or nothing running in that tab | satisfied | returns input snapshot. Unit: “returns the same snapshot when stopTab has no work” (`.toBe(state)`) |
| 5. Start all stays Sidebar `account/setStatus` loop | satisfied | `Sidebar.tsx` Start all `onPress` still loops `account/setStatus`; no start-all action added |
| 6. `accountIdsToWipe` empty for `account/stopTab` | satisfied | unit `expect(accountIdsToWipe(state, action)).toEqual([])` |
| 7. Stop this tab in expanded sidebar footer next to Start all; four-locale i18n | satisfied | Square icon button `aria-label={t(locale, 'stopTab')}` next to Play; keys in all four dictionaries; `i18n.test.ts` passed |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test` | pass | Vitest 10 files, 108 tests, 2026-09-03 14:21:00, duration 419ms |
| `pnpm typecheck` | pass | “TypeScript: No errors found” |
| Guest-focus / live view teardown | not applicable in CI | Existing `syncViews` on `status === 'closed'`; not asserted in node Vitest |

## Risks and Follow-ups

- Live Electron view teardown and guest-focus are dogfood, not CI.
- task_02/task_03 must not add a second last-set helper; `applyAction` already wraps `reduceWorkspace`.
- Collapsed sidebar still has no bulk stop (intentional; Start all is expanded-only).

## Final Verdict

task_01 is completed: snapshot v1 remembers last-set without exporting it, `account/stopTab` closes only the current tab’s running accounts without wiping, identity no-ops keep the same snapshot reference, Start all is still a renderer `setStatus` loop, and Stop this tab is in the expanded footer with four-locale copy. `pnpm test` (108) and `pnpm typecheck` passed to terminal exit.
