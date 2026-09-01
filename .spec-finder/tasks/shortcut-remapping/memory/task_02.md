# Task Memory: task_02

## Objective Snapshot

- Honor remapped chords on loop interceptor and Shell chrome path.

## Important Decisions

- Loop interceptor reads `getSnapshot().shortcuts` with `matchShortcut(..., 'loop')`. Attach points unchanged (`attachAccountLoop` on game + chrome contents).
- `preventDefault` still only after a loop match that yields commit actions.
- Overlay skip and chrome-editable skip stay in front of matching so unmatched/overlay keys are not logged or swallowed.
- Shell chrome `keydown` uses `matchShortcut(..., 'chrome')` only. No chrome commands on game `before-input-event`.
- Deleted frozen `matchAccountLoopChord` so live matching cannot drift from `SHORTCUT_DEFAULTS` / the snapshot map.
- `ACCOUNT_LOOP_SHORTCUTS` now derives display strings from `SHORTCUT_DEFAULTS` via `displayShortcut` for the still-read-only Settings list.
- Capturing flag left for task_03.

## Learnings

- G-01 guest-focus after remap cannot be proven in this Vitest/node environment.

## Files / Surfaces

- `src/main/accountLoop.ts`
- `src/shared/accountLoop.ts`
- `src/shared/accountLoop.test.ts`
- `src/renderer/src/components/Shell.tsx`

## Errors / Corrections

## Ready for Next Run

- Done. task_03 adds Settings capture and a renderer-only capturing guard in Shell.
