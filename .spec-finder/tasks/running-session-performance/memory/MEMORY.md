# Workflow Memory

## Current State

task_01–task_04 done. Diet did not ship. Metrics chrome and 7th-start warning shipped.

## Shared Decisions

- StatusBar shows process-wide CPU/RAM from all `getAppMetrics()` rows and GPU only when present. No chrome FPS number.
- 7th-running warning is StatusBar-only, derived from live running count (≥ 7). Starts are never blocked.
- Don't-paint: knob 1 fail, knob 2 fail on Darwin (Windows evidence cannot run). Production paint policy unchanged.

## Shared Learnings

- `ops:fps` remains registered in main but unused; renderer no longer sends it.

## Open Risks

- GPU vs Task Manager (G-03) is dogfood, not CI.
- G-01 quieter farm remains unshipped until a Windows spike pass.

## Handoffs

- None for this packet. Revisit don't-paint only with a new Windows journal that records a knob pass.
