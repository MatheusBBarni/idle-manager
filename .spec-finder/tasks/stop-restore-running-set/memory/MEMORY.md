# Workflow Memory

## Current State

task_01–task_04 completed. Packet execution finished.

## Shared Decisions

- Last-set algebra lives in `withLastRunningAccountIds` after every non-identity `applyAction`.
- Identity no-ops return the input snapshot reference from `reduceWorkspace` before last-set.
- Start all remains the Sidebar loop of `account/setStatus`.
- i18n keys: `stopTab`, `stopFarm`, `restoreLastSet` (also Settings shortcut labels).
- Loop chords: Mod+W / Mod+Shift+W / Mod+Shift+Enter. Chrome scope does not match them.
- `account-stop-tab` emits whenever `liveTab()` exists so Mod+W is not leaked into the game.

## Shared Learnings

- Expanded footer uses `flex-wrap`. Collapsed sidebar still has no bulk controls.
- Stop farm and restore do not require an active tab; empty paths are identity.

## Open Risks

- Guest-focus for the three loop chords is dogfood, not CI (same as prior shortcut packets).

## Handoffs

- None remaining in this packet.
