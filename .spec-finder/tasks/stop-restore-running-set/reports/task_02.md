# Task 02 Final Report: Stop the whole farm

## Outcome

- Verdict: completed
- Date: 2026-09-03
- Provider/session: pi / sf-batch-tasks manual invocation

## Changes

- `src/shared/workspace.ts` — `account/stopFarm` closes every running account in one commit (`status: 'closed'`, `poppedOut: false`); identity when none running
- `src/shared/workspace.test.ts` — pop-out close, three-id last-set freeze, identity, wipe `[]`
- `src/renderer/src/components/Sidebar.tsx` — expanded-footer Stop whole farm (`CircleStop`)
- `src/shared/i18n.ts` — `stopFarm` in `en`, `pt`, `es`, `zh-Hans`
- `src/shared/i18n.test.ts` — frozen EN/PT strings for `stopFarm`

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. `account/stopFarm` closes every running account in one commit with the same close rule as `setStatus` `'closed'` | satisfied | `reduceWorkspace` `account/stopFarm`. Unit: A running + B popped-out both `closed` and `poppedOut: false` |
| 2. Freeze last-set to pre-action running ids when the farm goes empty | satisfied | existing `withLastRunningAccountIds`; unit three-id freeze `['acc-a','acc-b','acc-c']` not `{C}` |
| 3. Identity when nothing is running | satisfied | unit `expect(applyAction(emptySnapshot(), { type: 'account/stopFarm' })).toBe(state)` |
| 4. `accountIdsToWipe` empty | satisfied | unit `expect(accountIdsToWipe(state, action)).toEqual([])` |
| 5. Stop whole farm in expanded sidebar footer; four-locale i18n | satisfied | `aria-label={t(locale, 'stopFarm')}` next to Stop this tab; keys in all four dictionaries; `i18n.test.ts` passed |
| 6. MUST NOT add restore or shortcut commands | satisfied | no `restoreLastSet` action; `shortcuts.ts` / `accountLoop.ts` untouched this slice |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test` | pass | Vitest 10 files, 111 tests, 2026-09-03 14:23:06, duration 424ms |
| `pnpm typecheck` | pass | “TypeScript: No errors found” |
| Live pop-out window | not applicable in CI | unit `poppedOut: false`; `syncViews` already tears down closed views |

## Risks and Follow-ups

- Live Electron pop-out window close is not asserted here.
- task_03 should only consume last-set, not rewrite the helper.

## Final Verdict

task_02 is completed: `account/stopFarm` puts every live jar down in one reducer commit, freezes last-set to the full pre-empty running set, no-ops by identity when the farm is already empty, never wipes, and is available in the expanded sidebar with four-locale copy. `pnpm test` (111) and `pnpm typecheck` passed to terminal exit.
