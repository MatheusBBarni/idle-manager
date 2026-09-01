# Task Memory: task_04

## Objective Snapshot

Don't-paint knobs that passed (US-01). Documented non-ship: both knobs failed in task_03.

## Important Decisions

- Read `memory/task_03.md`: knob 1 fail, knob 2 fail. No `applyStage` detach, no minimize/restore listeners, no Park control.
- Chromium anti-throttle switches and game `backgroundThrottling: false` left as today.
- Isolation CLI re-run only to stay green, not because paint policy changed.

## Learnings

- `pnpm verify:isolation` still reports distinct persist jars (`account-a` / `account-b` cookies and localStorage).

## Files / Surfaces

- No production paint-policy files edited this slice.

## Errors / Corrections

## Ready for Next Run

Packet diet is a non-ship. Cost chrome (task_01) and 7th-start warning (task_02) remain the V1 ship.
