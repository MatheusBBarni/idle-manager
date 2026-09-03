# Task Memory: task_03

## Objective Snapshot

- Single-instance lock; second launch restores or focuses the first process.

## Important Decisions

- `requestSingleInstanceLock` runs at module load, before `whenReady`.
- Lost lock: `app.quit()` and `whenReady` returns immediately. Electron can still emit ready after quit; the guard prevents a second chrome farm.
- `second-instance`: hidden window → `restoreMainWindow()`; visible → unminimize if needed and `focus()`.

## Learnings

- Second-launch dogfood was not run in this host session.

## Files / Surfaces

- `src/main/index.ts` — lock, `second-instance`, whenReady/activate guards

## Errors / Corrections

## Ready for Next Run

- Packet leaf. Remaining work is Windows dogfood (G-01–G-04), not another task.
