# Workflow Memory

## Current State

- task_01 implemented: shared `hasRunningAccount` plus StatusBar `sleepBlocked` hint. OS blocker is still task_02.
- task_02 pending; depends on task_01.

## Shared Decisions

- Hint is derived from running `status`, not from `powerSaveBlocker.isStarted` (ADR-002). Failed start later must not hide this hint.

## Shared Learnings

- `hasRunningAccount` lives next to other snapshot helpers in `src/shared/workspace.ts`. Layout still excludes popped-out panels; the keep-awake predicate must not copy that filter.

## Open Risks

- G-02 chrome review and overnight journal are not in CI. Hint can appear before task_02 actually blocks sleep.

## Handoffs

- task_02: call `hasRunningAccount`; do not restyle StatusBar or add i18n keys; do not edit `views.ts`.
