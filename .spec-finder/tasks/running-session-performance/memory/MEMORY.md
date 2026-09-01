# Workflow Memory

## Current State

task_01 and task_02 implemented. task_03–task_04 pending.

## Shared Decisions

- StatusBar shows process-wide CPU/RAM from all `getAppMetrics()` rows and GPU only when present. No chrome FPS number.
- 7th-running warning is StatusBar-only, derived from live running count (≥ 7). Starts are never blocked.

## Shared Learnings

- `ops:fps` remains registered in main but unused; renderer no longer sends it.

## Open Risks

- GPU vs Task Manager (G-03) is dogfood, not CI.

## Handoffs

- task_03: chrome totals are whole-app + nullable GPU; journal those next to Task Manager. Do not edit `views.ts` paint policy.
- task_04: wait for task_03 pass/fail; warning and metrics chrome already ship.
