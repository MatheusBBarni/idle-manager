# Task Memory: task_02

## Objective Snapshot

Warn on 7th running start (US-06). Implemented.

## Important Decisions

- Chrome shows the warning when current running count is ≥ 7 (`shouldWarnRunningStart(Math.max(0, running - 1))`), so a 6-account farm stays silent and closing back below 7 hides it.
- Warning lives in StatusBar only (signal color). Start / Start all still dispatch `account/setStatus` running. No dialog, no `overlayOpen`, no snapshot field.

## Learnings

- Start all already loops closed accounts and dispatches running; no change required for “one warning, still start all”.

## Files / Surfaces

- `src/shared/metricsDisplay.ts` / `metricsDisplay.test.ts`
- `src/renderer/src/components/StatusBar.tsx`
- `src/shared/i18n.ts` / `i18n.test.ts` — `runningStartWarning`
- `Dialogs.tsx`, `Stage.tsx`, `workspace.ts` — not edited

## Errors / Corrections

## Ready for Next Run

Done. task_03 is the Windows don't-paint spike; do not change paint policy here.
