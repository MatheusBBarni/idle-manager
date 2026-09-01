# Workflow Memory

## Current State

task_01 implemented (honest whole-app cost in status). task_02–task_04 pending.

## Shared Decisions

- StatusBar shows process-wide CPU/RAM from all `getAppMetrics()` rows and GPU only when present. No chrome FPS number.

## Shared Learnings

- `ops:fps` remains registered in main but unused; renderer no longer sends it.

## Open Risks

- GPU vs Task Manager (G-03) is dogfood, not CI.

## Handoffs

- task_02: add 7th-start warning in status/sidebar only; keep GPU/RAM lines; no `overlayOpen`.
- task_03: chrome totals are whole-app + nullable GPU; journal those next to Task Manager.
