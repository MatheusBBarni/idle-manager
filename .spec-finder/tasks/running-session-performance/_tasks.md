# running-session-performance tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Show whole-app cost in chrome | US-05 | frontend | high | [] | completed |
| task_02 | Warn on 7th running start | US-06 | frontend | medium | [task_01] | completed |
| task_03 | Journal Windows don't-paint knobs | F-07 | spike | medium | [task_01] | completed |
| task_04 | Don't-paint knobs that passed | US-01 | backend | medium | [task_03] | pending |

## Execution order

1. **task_01** — Widen `MetricsPayload`, collect whole-app + GPU, drop chrome rAF FPS, show actable cost in status.
2. **task_02** — Status/sidebar warning when a start would be the 7th running account; never block; never modal.
3. **task_03** — Windows spike journal for knob 1 (off-stage detach) and knob 2 (minimize/hide detach). No production diet.
4. **task_04** — `applyStage` / window restore don't-paint **only** for knobs that passed. If none passed, leave production paint policy unchanged.

**Roots:** task_01  
**Leaves:** task_02, task_04  
**Critical path:** task_01 → task_03 → task_04  
**Parallelizable:** none (task_02 shares StatusBar/i18n with task_01)  
**Spikes / blockers:** task_03 blocks all production diet. Fail both knobs → task_04 is a documented non-ship, not Park.

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| US-05 / F-05 / G-03 | task_01 | Operator can judge machine cost from chrome (GPU included; no fake FPS) |
| US-06 / F-06 / G-04 | task_02 | 7th start is warned; 4th is not blocked |
| F-07 / G-02 | task_03 | Decide which don't-paint knobs may ship without pausing idle progress |
| US-01 / F-01 / G-01 | task_04 | Unpainted running accounts still tick; shared PC can use other apps when a knob shipped |

US-02 / F-02 (ticks), US-03 / F-03 (close), US-04 / F-04 (jars) are task_04 non-change plus existing gates — not separate tasks.

## Tie-break rationale

Honest cost first (user-visible + journal). Warning next because it edits the same chrome. Spike after metrics so the journal can use real totals. Diet last (fail-closed).

## Deliberate sequencing constraints

- Do not edit `src/main/views.ts` paint policy in task_01–task_03.
- task_02 must not use `Dialogs` / `overlayOpen` for the warning.
- task_04 must not invent Park, throttling, or a live-diet CLI if the spike failed.
- `workspace.ts` / `parseSnapshot` stay unchanged in every task.
