# Workflow Memory

## Current State

task_01 completed: both knobs fail. task_02 completed: documented non-ship; production paint policy unchanged.

## Shared Decisions

- Host was Darwin; Windows Task Manager and a live Windows window were unavailable. Per ADR-002 fail-closed and task_01 acceptance, knob 1 and knob 2 are **fail**, not pass-by-inference.
- task_02 shipped neither knob. No Park control. No `applyStage` / minimize-listener diet.

## Shared Learnings

- Today's `applyStage` hides off-stage views with `setVisible(false)` but does not `removeChildView`; they remain live `webContents` until close/`destroyView`.

## Open Risks

- G-01 Windows RAM drop is unmeasured. V1 diet cannot ship until a Windows spike passes a knob.

## Handoffs

- Packet complete for this fail-closed path. Revisit only with a new Windows spike, not by inferring pass from macOS.
