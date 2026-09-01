# Workflow Memory

## Current State

- Packet `shortcut-remapping` tasks generated: task_01–task_03 pending.

## Shared Decisions

- Execution is linear: persist map → live dual-path dispatch → Settings capture tab.
- No spikes. `[`/`{` default dual-match stays inside shared matcher tests (task_01).
- README and site keyboard pages stay on shipped defaults for all three tasks.

## Shared Learnings

## Open Risks

- G-01 guest-focus after remap is dogfood, not CI (task_02 report must record the gap).
- Capture vs HeroUI modal Escape is task_03 platform evidence.

## Handoffs

- task_02: consume `getSnapshot().shortcuts` with `matchShortcut` scopes; do not add Settings UI.
- task_03: capturing flag is renderer-only; do not lift loop overlay skip.
