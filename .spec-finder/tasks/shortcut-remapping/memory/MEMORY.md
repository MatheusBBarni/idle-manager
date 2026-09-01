# Workflow Memory

## Current State

- Packet `shortcut-remapping`: task_01 implemented (catalog + full snapshot map + `prefs/shortcut`). task_02–task_03 pending.

## Shared Decisions

- Execution is linear: persist map → live dual-path dispatch → Settings capture tab.
- No spikes. `[`/`{` default dual-match stays inside shared matcher tests (task_01).
- README and site keyboard pages stay on shipped defaults for all three tasks.
- Catalog order is `SHORTCUT_COMMANDS`. `account-slot` persists `key: '1'`. Platform mod is implied, not stored.

## Shared Learnings

- `emptySnapshot().shortcuts` is a clone of `SHORTCUT_DEFAULTS`. Missing `shortcuts` on v1 parse normalizes to that full map. `exportMetadata` includes it; `exportGameList` does not.

## Open Risks

- G-01 guest-focus after remap is dogfood, not CI (task_02 report must record the gap).
- Capture vs HeroUI modal Escape is task_03 platform evidence.

## Handoffs

- task_02: consume `getSnapshot().shortcuts` with `matchShortcut(map, 'loop'|'chrome')`; stop using frozen `matchAccountLoopChord` for live matching. Do not add Settings UI. Keep `ACCOUNT_LOOP_SHORTCUTS` until task_03.
- task_03: capturing flag is renderer-only; do not lift loop overlay skip.
