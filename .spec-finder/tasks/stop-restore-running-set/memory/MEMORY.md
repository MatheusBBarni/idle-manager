# Workflow Memory

## Current State

task_01–task_03 implemented. Next: task_04 (loop chords, interceptor, Settings + README).

## Shared Decisions

- Last-set algebra lives in `withLastRunningAccountIds` after every non-identity `applyAction`.
- Identity no-ops return the input snapshot reference from `reduceWorkspace` before last-set.
- Last-set order: unique ids in farm-wide tab `accountOrder` concatenation, then leftover account keys.
- `exportMetadata` omits `lastRunningAccountIds`; `snapshotFromImport` always `[]`.
- Start all remains the Sidebar loop of `account/setStatus`.
- i18n keys: `stopTab`, `stopFarm`, `restoreLastSet`.
- Footer icons: Play / Square / CircleStop / RotateCcw. Restore does not switch `activeTabId`.

## Shared Learnings

- Expanded footer uses `flex-wrap`. Collapsed sidebar still has no bulk controls.
- Stop whole farm and restore do not require an active tab; empty paths are identity.

## Open Risks

- Guest-focus for the three loop chords is dogfood, not CI (same as prior shortcut packets).

## Handoffs

- task_04: add `account-stop-tab` / `account-stop-farm` / `account-restore-last` to `LOOP_COMMANDS` + `SHORTCUT_DEFAULTS` (Mod+W, Mod+Shift+W, Mod+Shift+Enter); map in `src/main/accountLoop.ts` `actionsForCommand`; Settings `SHORTCUT_LABELS` + README Keyboard table. For `account-stop-tab`, emit the action when `liveTab()` exists so Mod+W is not leaked. Do not add these to chrome scope.
