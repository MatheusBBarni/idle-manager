# Workflow Memory

## Current State

- Packet `shortcut-remapping`: task_01–task_03 implemented (persist map → live dual-path dispatch → Settings capture tab).

## Shared Decisions

- Execution is linear: persist map → live dual-path dispatch → Settings capture tab.
- README and site keyboard pages stay on shipped defaults for all three tasks.
- Catalog order is `SHORTCUT_COMMANDS`. `account-slot` persists `key: '1'`. Platform mod is implied, not stored.
- Live matching is `matchShortcut` + snapshot map with explicit `loop` / `chrome` scopes.
- Capturing flag is renderer-only. Loop overlay skip is not used for capture.

## Shared Learnings

- `emptySnapshot().shortcuts` is a clone of `SHORTCUT_DEFAULTS`. Missing `shortcuts` on v1 parse normalizes to that full map. `exportMetadata` includes it; `exportGameList` does not.
- Loop interceptor attach points are unchanged. Chrome catalog must not be registered on game contents.
- Settings capture uses capture-phase keydown plus `isKeyboardDismissDisabled` so Escape cancels capture without closing the modal.

## Open Risks

- G-01 guest-focus after remap is dogfood, not CI.
- G-04 Settings capture/reset in a live window was not driven in this agent environment.

## Handoffs

- None remaining in this packet.
