# Task 01 Final Report: Lock idle/getting/ready/later and the update IPC types

## Outcome

- Verdict: completed
- Date: 2026-08-30
- Provider/session: manual `sf-batch-tasks` (Pi)

## Changes

- `src/shared/updateStatus.ts` — `UpdateStatus`, `UpdateEvent`, `UpdateCommand`, `reduceUpdateStatus`
- `src/shared/updateStatus.test.ts` — TechSpec transition table plus fail-closed extras
- `src/shared/ipc.ts` — `onUpdate` / `updateCommand` on `OpsourceAPI`; no snapshot fields
- `src/preload/index.ts` — `ops:update` subscribe and `ops:updateCommand` invoke

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. `UpdateStatus` / `UpdateEvent` / `reduceUpdateStatus` in `src/shared` with unit tests | satisfied | `updateStatus.ts` + 10 tests in `updateStatus.test.ts` |
| 2. `onUpdate` and `updateCommand` on `OpsourceAPI` and CJS preload; no snapshot fields | satisfied | `ipc.ts`, `preload/index.ts`; `WorkspaceSnapshot` untouched |
| 3. Fail-closed to `idle` on `error`, `not-available`, `reset`; `later` does not survive `reset` | satisfied | fail-closed loop over all phases; later+reset case |
| 4. apply/later no-op semantics in types/comments only | satisfied | `UpdateCommand` comment in `updateStatus.ts` and `ipc.ts`; no main handler |
| 5. IPC names `ops:update` / `ops:updateCommand` | satisfied | preload `on` / `invoke` |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test src/shared/updateStatus.test.ts` | pass | Vitest 1 file / 10 tests, exit 0 |
| `pnpm typecheck` | pass | `TypeScript: No errors found` |
| Coverage 80% on `updateStatus.ts` | not measured | Vitest config has no coverage reporter; table tests cover the contract |

## Risks and Follow-ups

- Main does not handle `ops:updateCommand` yet (task_04). Invoking Apply/Later before that is a no-op at runtime.
- Unspecified extras: `idle`+`downloaded` → `ready`; later+different version → `ready`; checking/progress do not leave `ready`/`later`.
- Packaged apply remains dogfood (G-01).

## Final Verdict

task_01 is completed: the shared reduce table is unit-tested, chrome can subscribe via preload without snapshot schema, apply/later remain comments until main exists, and focused Vitest plus typecheck passed.
