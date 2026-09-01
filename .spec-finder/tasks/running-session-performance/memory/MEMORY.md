# Workflow Memory

## Current State

task_01–task_03 done. task_04 pending.

## Shared Decisions

- StatusBar shows process-wide CPU/RAM from all `getAppMetrics()` rows and GPU only when present. No chrome FPS number.
- 7th-running warning is StatusBar-only, derived from live running count (≥ 7). Starts are never blocked.

## Shared Learnings

- `ops:fps` remains registered in main but unused; renderer no longer sends it.

## Open Risks

- GPU vs Task Manager (G-03) is dogfood, not CI.
- Don't-paint cannot be evidenced on this Darwin host.

## Handoffs

- task_04: **knob 1 fail, knob 2 fail**. Do not change `views.ts` / `index.ts` paint policy. Ship is metrics + warning only (documented non-ship of diet).
