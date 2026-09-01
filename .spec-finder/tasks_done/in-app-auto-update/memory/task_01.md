# Task Memory: task_01

## Objective Snapshot

- Shared `reduceUpdateStatus` plus preload `onUpdate` / `updateCommand` without snapshot fields.

## Important Decisions

- Fail-closed: `error`, `not-available`, and `reset` from any phase → `idle`.
- `later` event only reduces from `ready`; idle/getting ignore it (main no-op belongs in task_04).
- `idle` + `downloaded` → `ready` so a cached download can surface Apply without a fake getting flash.
- `later` + `downloaded` same version stays `later`; different version → `ready`.
- `checking` / `available` / `progress` do not regress `ready` or `later` to `getting`.
- No main `ops:updateCommand` stub; typecheck did not require it.

## Learnings

- Vitest has no coverage reporter; table tests cover the TechSpec transitions plus fail-closed extras.

## Files / Surfaces

- `src/shared/updateStatus.ts`
- `src/shared/updateStatus.test.ts`
- `src/shared/ipc.ts`
- `src/preload/index.ts`

## Errors / Corrections

## Ready for Next Run

- Done. Chrome can subscribe in task_03; main should emit reduce results in task_04.
