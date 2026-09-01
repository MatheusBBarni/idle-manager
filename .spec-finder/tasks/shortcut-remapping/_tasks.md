# shortcut-remapping tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Persist the full shortcut map | US-08 | backend | high | [] | completed |
| task_02 | Honor remapped chords on loop and chrome paths | US-02 | backend | high | [task_01] | completed |
| task_03 | Ship Settings Shortcuts tab with capture and reset | US-01 | frontend | high | [task_02] | pending |

## Execution order

1. **task_01** — Shared catalog, full `shortcuts` map on snapshot v1, `prefs/shortcut`, parse/export fallbacks. Live listeners stay frozen.
2. **task_02** — Loop interceptor and Shell chrome keydown consume the map (`loop` vs `chrome` scope).
3. **task_03** — Settings General + Shortcuts tabs, click-to-press capture, per-row reset, capturing guard.

**Roots:** task_01  
**Leaves:** task_03  
**Critical path:** task_01 → task_02 → task_03  
**Parallelizable:** none  
**Spikes / blockers:** none.

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| US-08 | task_01 | Never-remapped workspaces keep shipped defaults; a full map persists and exports |
| US-02 | task_02 | Remapped create/prev/next/start (and chrome actions) fire under today’s focus rules |
| US-01 | task_03 | Operator finds every documented action in Settings and changes a bind without asking |

US-07, F-09, F-10, G-05, reducer F-04 are inside task_01.  
US-03, US-06, F-03, F-06–F-08, G-01–G-03 are inside task_02.  
US-04, US-05, F-01–F-05, G-04, capture/i18n are inside task_03.  
README / `/keyboard/` custom maps, unbind, `globalShortcut`, chrome-under-game-focus are PRD/TechSpec non-goals.

## Tie-break rationale

Linear. task_02 before task_03 because capture must not race live Shell dispatch (TechSpec Sequencing step 5).
