# Workflow Memory

## Current State

task_01 spike journaled 2026-08-31: both knobs **fail**. task_02 pending; must not diet.

## Shared Decisions

- Host was Darwin; Windows Task Manager and a live Windows window were unavailable. Per ADR-002 fail-closed and task_01 acceptance, knob 1 and knob 2 are **fail**, not pass-by-inference.

## Shared Learnings

- Today's `applyStage` hides off-stage views with `setVisible(false)` but does not `removeChildView`; they remain live `webContents` until close/`destroyView`.

## Open Risks

- G-01 Windows RAM drop is unmeasured. V1 diet cannot ship until a Windows spike passes a knob.

## Handoffs

- task_02: read this journal. Knob 1 fail, knob 2 fail. Do not change `src/main/views.ts` or `src/main/index.ts` paint policy. Do not add Park. Detail: `memory/task_01.md`.
