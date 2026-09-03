# block-sleep-while-running tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Show sleep-blocked hint from the running set | US-02 | frontend | medium | [] | completed |
| task_02 | Block OS sleep while any account is running and release on last close or quit | US-01 | backend | medium | [task_01] | completed |

## Execution order

1. **task_01** — Shared `hasRunningAccount` plus status-bar `sleepBlocked` hint (four locales). No OS blocker yet.
2. **task_02** — Main `prevent-app-suspension` while the predicate is true; stop on empty running set and `before-quit`.

**Roots:** task_01  
**Leaves:** task_02  
**Critical path:** task_01 → task_02  
**Parallelizable:** none  
**Spikes / blockers:** none. G-01/G-03 overnight journal is PRD dogfood, not a task.

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| US-02 / F-02 / G-02 | task_01 | Operator sees Sleep blocked in the footer iff any account is running |
| US-01 / F-01 / G-01 | task_02 | OS idle sleep is blocked while any account is running; last close or quit releases |

US-04 (popped-out still counts) is the task_01 predicate plus task_02 using it.  
US-03 / US-06 / F-03 / F-04 / G-03 are task_02 stop paths.  
F-05 is the same predicate (off-stage still running).  
F-06 / F-07 / US-05 are non-touch isolation plus empty hint/stop.  
Constraints (no overlay, four locales, display may sleep, no power-plan) apply on both tasks.

## Tie-break rationale

Hint first: user-visible G-02 and the shared contract task_02 calls. Blocker second: needs that predicate; overnight ticks are not in CI.

## Deliberate sequencing constraints

- Do not add snapshot fields, `WorkspaceAction`, or `OpsourceAPI` methods.
- Do not edit `src/main/views.ts`, partitions, Chromium switches, or `backgroundThrottling`.
- Do not start `prevent-display-sleep`.
- `--verify-isolation` must never start a blocker (exits before load).
- task_01 must not create `sleepBlock.ts` or wire `index.ts`.
- task_02 must not restyle StatusBar or add i18n keys.
