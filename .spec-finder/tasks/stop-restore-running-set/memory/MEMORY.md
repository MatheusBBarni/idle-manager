# Workflow Memory

## Current State

task_01 and task_02 implemented. Next: task_03 (`account/restoreLastSet`), then task_04.

## Shared Decisions

- Last-set algebra lives in `withLastRunningAccountIds` and runs after every non-identity `applyAction`. Do not fork a second helper in task_03.
- Identity no-ops return the input snapshot reference from `reduceWorkspace` before last-set.
- Last-set order: unique ids in farm-wide tab `accountOrder` concatenation, then leftover account keys.
- `exportMetadata` omits `lastRunningAccountIds`; `snapshotFromImport` always `[]`.
- Start all remains the Sidebar loop of `account/setStatus`.
- i18n keys so far: `stopTab`, `stopFarm`. Expanded footer: Play / Square / CircleStop.

## Shared Learnings

- Expanded footer uses `flex-wrap` so extra bulk icon buttons stay in chrome, not over the stage. Collapsed sidebar still has no bulk controls.
- Stop whole farm does not require an active tab; empty farm is identity.

## Open Risks

- Guest-focus for the three loop chords is dogfood, not CI (same as prior shortcut packets).
- Live pop-out window close is existing `syncViews`; unit asserts `poppedOut: false` only.

## Handoffs

- task_03: add `account/restoreLastSet` in `reduceWorkspace`; skip missing ids; do not change `activeTabId`; last-set helper already exists.
