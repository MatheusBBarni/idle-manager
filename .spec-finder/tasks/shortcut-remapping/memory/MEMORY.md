# Workflow Memory

## Current State

- Packet `shortcut-remapping`: task_01 completed (map persisted). task_02 implemented (loop + chrome consume the map). task_03 pending.

## Shared Decisions

- Execution is linear: persist map → live dual-path dispatch → Settings capture tab.
- No spikes. `[`/`{` default dual-match stays inside shared matcher tests (task_01).
- README and site keyboard pages stay on shipped defaults for all three tasks.
- Catalog order is `SHORTCUT_COMMANDS`. `account-slot` persists `key: '1'`. Platform mod is implied, not stored.
- Live matching is `matchShortcut` + snapshot map with explicit `loop` / `chrome` scopes. Frozen `matchAccountLoopChord` is gone.

## Shared Learnings

- `emptySnapshot().shortcuts` is a clone of `SHORTCUT_DEFAULTS`. Missing `shortcuts` on v1 parse normalizes to that full map. `exportMetadata` includes it; `exportGameList` does not.
- Loop interceptor attach points are unchanged. Chrome catalog must not be registered on game contents.

## Open Risks

- G-01 guest-focus after remap is dogfood, not CI (task_02 report records the gap).
- Capture vs HeroUI modal Escape is task_03 platform evidence.

## Handoffs

- task_03: capturing flag is renderer-only; Shell must skip chrome dispatch while capturing. Do not lift loop overlay skip. Settings overlay already hides game views. Keep README / site keyboard pages on shipped defaults.
