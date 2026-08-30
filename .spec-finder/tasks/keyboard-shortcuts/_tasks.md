# keyboard-shortcuts tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Ship the keyboard account loop | US-01 | backend | high | [] | completed |
| task_02 | Show loop binds in Settings and README | US-06 | frontend | medium | [task_01] | pending |
| task_03 | Ship PT+EN keyboard docs pages | F-09 | frontend | high | [task_01] | pending |

## Execution order

1. **task_01** — Shared matcher + main `before-input-event` interceptor for create / next / previous / start.
2. **task_02** — Read-only Settings list (PT/EN) and README Keyboard rows for those four chords.
3. **task_03** — Locale docs pages `{base}/en/keyboard/` and `{base}/pt/keyboard/`; landing nav **link** only (no bind list on the landing).

**Roots:** task_01  
**Leaves:** task_02, task_03  
**Critical path:** task_01 → task_02 (in-app G-04)  
**Parallelizable:** {task_02, task_03} after task_01 — no dependency between them; numeric order still runs 02 before 03.  
**Spikes / blockers:** none.

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| US-01 | task_01 | Operator creates, cycles, and starts accounts from reserved Mod chords while a game panel is focused |
| US-06 | task_02 | Operator finds the four loop chords in Settings and README |
| F-09 | task_03 | Same four binds on shareable PT+EN keyboard docs pages |

US-02, US-03, US-04, US-05, F-01–F-07, G-01, G-03, G-05 are covered inside task_01, not as separate tasks.  
US-07 / F-11 (mouse Plus dialog) is a non-change: task_01 must not alter `AccountModal`.  
F-08 and F-10 are task_02. G-02 (do not regress chrome README shortcuts) is task_01 out of scope on `Shell.tsx`.  
G-04 is task_02 (Settings/README) and task_03 (docs pages).

## Tie-break rationale

task_02 before task_03: in-app lookup unlocks G-04 without website coupling. task_03 depends only on task_01 (chords frozen), so it is parallelizable with task_02.

## Site surface

ADR-004: docs **pages**, not a landing section. task_03 creates `site/src/pages/en/keyboard.astro` and `pt/keyboard.astro` plus `site/src/content/keyboard.ts`. Landing may link; it must not list the binds.
