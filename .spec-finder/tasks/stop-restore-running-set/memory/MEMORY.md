# Workflow Memory

## Current State

task_01 implemented (last-set field + algebra + `account/stopTab` + expanded-sidebar Stop this tab). Next: task_02 (`account/stopFarm`), then task_03, then task_04.

## Shared Decisions

- Last-set algebra lives in `withLastRunningAccountIds` and runs after every non-identity `applyAction`. Do not fork a second helper in task_02/task_03.
- Identity no-ops return the input snapshot reference from `reduceWorkspace` before last-set.
- Last-set order: unique ids in farm-wide tab `accountOrder` concatenation, then leftover account keys.
- `exportMetadata` omits `lastRunningAccountIds`; `snapshotFromImport` always `[]`.
- Start all remains the Sidebar loop of `account/setStatus`. i18n key for this slice: `stopTab`.

## Shared Learnings

- Expanded footer uses `flex-wrap` so extra bulk icon buttons stay in chrome, not over the stage. Collapsed sidebar still has no bulk controls.

## Open Risks

- Guest-focus for the three loop chords is dogfood, not CI (same as prior shortcut packets).

## Handoffs

- task_02: add `account/stopFarm` case in `reduceWorkspace`; last-set freeze on farm-empty is already handled by the helper.
