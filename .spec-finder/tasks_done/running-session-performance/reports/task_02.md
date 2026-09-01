# Task 02 Final Report: Warn on 7th running start

## Outcome

- Verdict: completed
- Date: 2026-09-01
- Provider/session: pi / manual sf-batch-tasks

## Changes

- `src/shared/metricsDisplay.ts` — `RUNNING_START_WARN_AFTER = 6`, `shouldWarnRunningStart`
- `src/shared/metricsDisplay.test.ts` — 0–5 false; 6 and 7 true
- `src/renderer/src/components/StatusBar.tsx` — warning when current running count ≥ 7
- `src/shared/i18n.ts` — `runningStartWarning` in `en`, `pt`, `es`, `zh-Hans`
- `src/shared/i18n.test.ts` — frozen EN/PT strings

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. `RUNNING_START_WARN_AFTER = 6` and `shouldWarnRunningStart` in `src/shared` | satisfied | `metricsDisplay.ts`; tests 0–5 false, 6+ true |
| 2. Warning in StatusBar/Sidebar only; no dialog / `overlayOpen` | satisfied | StatusBar span only; `Dialogs.tsx` / `Stage.tsx` unedited |
| 3. MUST NOT block `account/setStatus` running or Start all | satisfied | Sidebar Start all still dispatches running; no start-path guard added |
| 4. i18n in four locales | satisfied | `runningStartWarning` in all four dictionaries; `i18n.test.ts` passed |
| 5. MUST NOT add workspace / `parseSnapshot` fields | satisfied | `workspace.ts` unedited |
| 6. SHOULD treat Start all crossing 7 as one warning, still starting all | satisfied | Existing Start all loop unchanged; one status warning from running count |
| 7. SHOULD hide warning when running count drops below 7 | satisfied | `shouldWarnRunningStart(Math.max(0, running - 1))` is false at 6 running |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test` | passed | 9 files / 88 tests, including `metricsDisplay.test.ts` (2) |
| `pnpm typecheck` | passed | `TypeScript: No errors found` |
| Warning not a Dialogs modal | passed (review) | No new `DialogKind`; StatusBar text only |
| UI launch | not required | Limitation documented; automated gates ran |

## Risks and Follow-ups

- Warning is always-on while ≥ 7 accounts run (no persist/dismiss), per TechSpec.
- Copy/threshold still listed as a PRD open question; default is 7th running app-wide.

## Final Verdict

task_02 completed: the 7th running account is warned in the status bar, starts are not blocked, and shared tests plus typecheck passed without a modal or snapshot field.
