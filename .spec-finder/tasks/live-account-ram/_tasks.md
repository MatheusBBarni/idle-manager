# live-account-ram tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Journal Windows don't-paint knobs | F-01 | spike | medium | [] | pending |
| task_02 | Don't-paint running views that passed the spike | US-01 | backend | medium | [task_01] | pending |

## Execution order

1. **task_01** — Windows spike journal for knob 1 (off-stage detach) and knob 2 (chrome minimized/hidden detach). No production diet.
2. **task_02** — `applyStage` / window restore don't-paint **only** for knobs that passed. If none passed, leave production code unchanged.

**Roots:** task_01  
**Leaves:** task_02  
**Critical path:** task_01 → task_02  
**Parallelizable:** none  
**Spikes / blockers:** task_01 blocks all production diet. Fail both knobs → task_02 is a documented non-ship, not Park.

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| F-01 | task_01 | Decide which don't-paint knobs may ship without pausing idle progress |
| US-01 | task_02 | Unpainted running accounts still tick; shared PC can use other apps when a knob shipped |

US-02, F-02, F-05, G-01, G-02 are covered inside task_01 (criterion) and task_02 (ship).  
US-03 / F-03 (close), US-04 / F-04 (isolation), G-03 / F-05 (no new chrome) are task_02 non-change plus existing gates — not separate tasks.

## Tie-break rationale

Only one legal order: spike before diet (TechSpec Sequencing 1 then 2). No tie.

## Deliberate sequencing constraints

- Do not edit `src/main/views.ts` paint policy in task_01.
- task_02 must not invent Park, throttling, or a live-diet CLI if the spike failed.
