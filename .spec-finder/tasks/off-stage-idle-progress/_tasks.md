# off-stage-idle-progress tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Journal keep-alive hide knobs | F-01 | spike | medium | [] | pending |
| task_02 | Ship passing keep-alive placement | US-01 | backend | medium | [task_01] | pending |

## Execution order

1. **task_01** — Local-origin fixture journal for baseline `setVisible(false)`, off-screen park, and `removeChildView`. No production `applyStage` hide change.
2. **task_02** — Production placement **only** for the TechSpec ship rule (park if it passed, else detach if it passed, else no hide change). Other-tab and overlay share `gameViewPlacement`. Close stays `destroyView`.

**Roots:** task_01  
**Leaves:** task_02  
**Critical path:** task_01 → task_02  
**Parallelizable:** none  
**Spikes / blockers:** task_01 blocks all production hide changes. Baseline already passing, or park and detach both failing → task_02 is a documented non-ship, not inject or always-paint.

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| F-01 / G-01 / G-02 | task_01 | Decide which hide keeps `visibilityState === 'visible'`, `setInterval` firing, and does not cover stage/overlay |
| US-01 / F-01 (also US-02 / F-02 / F-03) | task_02 | Other-tab and overlay running accounts keep the live session; come-back is not a reload |

US-04 / F-04 (close), US-05 / F-05 (jars), F-06 / G-03 (no new chrome) are task_02 non-change plus existing gates — not separate tasks. Windows in-game G-01/G-02 dogfood is operator evidence after a shipped knob, not a task.

## Tie-break rationale

Spike before production hide (TechSpec Sequencing 2 before 3). Predicate ships with `applyStage` in task_02 so there is no foundation-only contract task. Overlay is not a separate task (same placement).

## Deliberate sequencing constraints

- Do not edit `src/main/views.ts` paint policy in task_01.
- task_02 must not ship a knob that failed task_01, invent inject/always-paint, or use Task Manager RAM as a pass criterion.
- `workspace.ts` / `parseSnapshot` stay unchanged in every task.
- No new IPC, `StageReport` fields, or chrome.
