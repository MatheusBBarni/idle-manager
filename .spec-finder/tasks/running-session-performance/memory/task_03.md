# Task Memory: task_03

## Objective Snapshot

Journal Windows don't-paint knobs (F-07). Spike complete as fail-closed non-measure.

## Important Decisions

- Host is Darwin (`uname -s` Darwin, `process.platform` darwin). Windows Task Manager and a live Windows window cannot be used.
- Both knobs are **fail**, not pass. No macOS Activity Monitor inference. Prior `live-account-ram` Darwin fail is not reused as Windows evidence.
- Production `src/main/views.ts` / Chromium switches / `backgroundThrottling` were not edited.

## Learnings

- Today's production paint (read-only): off-stage uses `setVisible(false)` and still `addChildView` when a panel exists; tiny bounds hide but stay in tree. No `removeChildView` for unpainted running views in `applyStage`.

## Files / Surfaces

- `memory/task_03.md` — this journal
- `src/main/views.ts` — read-only
- `src/main/index.ts` — read-only

## Errors / Corrections

## Spike journal

### Environment

- OS: Darwin (not Windows)
- Task Manager: unavailable
- Live Electron window / local fixture probes: not run (would not satisfy the Windows criterion)
- Chrome totals from task_01: not captured in a live session (no Windows dogfood window)

### Baseline

- Same-session ≥3 running, one off-stage, Task Manager working set, chrome totals, fixture `setInterval`, `document.visibilityState`: **not measured** (environment cannot satisfy the pass criterion)

### Knob 1 — off-stage `removeChildView` while `webContents` stay alive

- Result: **fail**
- Reason: Windows evidence cannot run. Fail-closed (no Task Manager drop proof; no fixture visibility/interval proof).

### Knob 2 — chrome minimized/hidden, same detach

- Result: **fail**
- Reason: Windows evidence cannot run. Fail-closed.

### Production diet

- Do not ship either knob. task_04 must leave paint policy unchanged.

## Ready for Next Run

task_04: both knobs failed. No `applyStage` / minimize listener changes. Metrics + warning from task_01/02 stay.
