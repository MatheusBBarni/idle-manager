# close-to-tray tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Add Settings Quit that always exits | US-04 | frontend | high | [] | pending |
| task_02 | Dismiss a live farm to the tray | US-01 | backend | high | [task_01] | pending |
| task_03 | Restore from a second launch | US-03 | backend | low | [task_02] | pending |

## Execution order

1. **task_01** — Settings Quit via `WindowCommand` `'quit'` and `beginQuit()`; i18n `quit` + `trayRestore` keys; Close still closes.
2. **task_02** — win32 Close with running accounts hides chrome to a Tray (tooltip count, Restore, Quit); empty Close still quits; Apply uses `beginQuit`.
3. **task_03** — `requestSingleInstanceLock`; second launch restores or focuses the first process.

**Roots:** task_01  
**Leaves:** task_03  
**Critical path:** task_01 → task_02 → task_03  
**Parallelizable:** none  
**Spikes / blockers:** none

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| US-04 | task_01 | Operator leaves a live farm from Settings; Close is not Quit yet |
| US-01 | task_02 | Operator Close on a live win32 farm dismisses to tray; ticks continue |
| US-03 | task_02, task_03 | Tray Restore (task_02) and Start-menu / second launch (task_03) bring the window back |

US-02 / F-02 (empty Close quits) is task_02 policy + interceptor.  
US-05 / F-03 / G-03 (tray count) is task_02 tooltip.  
US-06 / F-06 (Minimize unchanged) is a non-change on task_02.  
US-07 / F-07 (isolation) is a non-change on every task.  
F-05 tray Quit is task_02; F-05 Settings Quit is task_01.  
G-01–G-04 dogfood is platform evidence on task_02/task_03, not a separate task.  
macOS/Linux tray, pop-out tray, drawn glyph, balloons, start-hidden are PRD/TechSpec non-goals.

## Tie-break rationale

Only one legal order: `beginQuit` must exist before Close is intercepted, and `restoreMainWindow` must exist before second-instance restore. ipc/preload/`quit` i18n owned only by task_01.
