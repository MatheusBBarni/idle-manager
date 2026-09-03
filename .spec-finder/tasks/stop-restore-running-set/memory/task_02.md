# Task Memory: task_02

## Objective Snapshot

Stop the whole farm (US-02). Implemented.

## Important Decisions

- `account/stopFarm` closes every `status === 'running'` account with `poppedOut: false`; last-set freeze reuses `withLastRunningAccountIds`.
- Sidebar Stop whole farm is always enabled (no live-tab requirement); empty farm is a reducer identity.
- i18n key is `stopFarm`. Icon is `CircleStop` to distinguish from tab `Square`.

## Learnings

- Live pop-out window teardown is not in Vitest; unit `poppedOut: false` is the gate.

## Files / Surfaces

- `src/shared/workspace.ts`, `src/shared/workspace.test.ts`
- `src/renderer/src/components/Sidebar.tsx`
- `src/shared/i18n.ts`, `src/shared/i18n.test.ts`

## Errors / Corrections

- None.

## Ready for Next Run

- task_03: add `account/restoreLastSet` in `reduceWorkspace`; do not fork last-set algebra.
