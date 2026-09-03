# stop-restore-running-set tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Stop this tab and remember last-set | US-01 | backend | high | [] | completed |
| task_02 | Stop the whole farm | US-02 | backend | medium | [task_01] | pending |
| task_03 | Restore the last running set | US-03 | backend | medium | [task_01] | pending |
| task_04 | Keyboard trio plus bind list | US-04 | backend | high | [task_01, task_02, task_03] | pending |

## Execution order

1. **task_01** — `lastRunningAccountIds` + last-set algebra + `account/stopTab` + expanded-sidebar Stop this tab. Start all stays a renderer loop.
2. **task_02** — `account/stopFarm` + sidebar control. Last-set freezes only when the farm hits zero.
3. **task_03** — `account/restoreLastSet` + sidebar control. Starts last-set only; skips missing ids.
4. **task_04** — Loop chords Mod+W / Mod+Shift+W / Mod+Shift+Enter, interceptor mapping, Settings + README list.

**Roots:** task_01  
**Leaves:** task_04  
**Critical path:** task_01 → task_02 → task_04 (task_03 also on the path to task_04)  
**Parallelizable:** none. task_02 and task_03 both depend only on task_01 but share `workspace.ts`, `Sidebar.tsx`, and `i18n.ts` — run 02 then 03 by ID.  
**Spikes / blockers:** none.

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| US-01 / F-01 / G-01 | task_01 | Operator puts the current tab’s live panels down in one action; last-set tracking starts |
| US-02 / F-02 / G-01 | task_02 | Operator puts every live jar down in one action |
| US-03 / F-03 / F-04 / G-02 | task_03 | Morning restore starts last night’s farm, not every closed jar |
| US-04 / F-06 / G-04 | task_04 | Stop tab, stop farm, and restore from the keyboard while a game is focused; binds are listed |

US-05 / F-05 (Start all unchanged) is a MUST NOT on task_01 (and not rewritten later).  
US-06 / F-08 / G-03 (no wipe, isolation) is `accountIdsToWipe` empty for the new actions in task_01–task_03.  
F-07 empty/stale no-ops are per-action identity in task_01–task_03.

## Tie-break rationale

Stop this tab first: it lands the snapshot field and last-set helper that every later verb uses (TechSpec Sequencing 1). Stop farm before restore by US order; they are not parallel because of shared files. Keyboard last because interceptor and Settings catalog need all three actions (Sequencing 3–5).

## Deliberate sequencing constraints

- Do not add `account/stopFarm` or `account/restoreLastSet` in task_01.
- Do not convert Start all to an atomic action in any task.
- Do not bump snapshot `version`.
- Do not call `clearAccountSession` / `accountIdsToWipe` for stop/restore.
- Do not add keyboard Start all, `globalShortcut`, game preload, or site `/keyboard/` pages.
- Collapsed sidebar stays without bulk controls (today has no Start all there).
