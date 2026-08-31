# Task Memory: task_01

## Objective Snapshot

Journal Windows don't-paint knobs (F-01 spike). No production diet.

## Important Decisions

- Authority: task acceptance + ADR-002 fail-closed beat any macOS inference. Host is Darwin; Task Manager and a live Windows window are unavailable. Both knobs marked **fail**, not pass.
- Production `src/` and `package.json` scripts left unchanged (Sequencing step 1).
- Did not run a fixture on macOS and did not treat Electron docs as Task Manager evidence.

## Learnings

- Today's attach-and-hide (`applyStage`): off-stage / overlay uses `setVisible(false)`; tiny bounds (`< 8px`) also hide; views with a current panel are `addChildView`'d. Off-stage paths do **not** `removeChildView`. Live map keeps `webContents` until `destroyView`.
- Switches still present in `src/main/index.ts`: `disable-renderer-backgrounding`, `disable-background-timer-throttling`, `disable-backgrounding-occluded-windows`. `backgroundThrottling: false` on chrome and game views.
- `ops:window` `min` calls `minimize()` only; no `applyStage` refresh.

## Files / Surfaces

- Read-only: `src/main/views.ts` (`applyStage` / `syncViews` / `destroyView`)
- Read-only: `src/main/index.ts` (switches, `ops:window` `min`, `ops:reportStage`)
- Journal: this file; shared handoff in `memory/MEMORY.md`

## Errors / Corrections

- None. Spike did not attempt production diet when Windows evidence was unavailable.

## Ready for Next Run

### Spike journal (2026-08-31)

- **Environment:** Darwin (`uname -s`); no Windows Task Manager; no live Windows window. Limitation: knobs cannot be measured here.
- **Baseline:** not captured. Required same-session Task Manager working set with ≥3 running accounts and at least one off-stage was impossible without Windows.
- **Knob 1** (off-stage `removeChildView`, contents alive): **fail** — Windows evidence cannot run (ADR-002 / task acceptance).
- **Knob 2** (chrome minimized/hidden, same detach): **fail** — Windows evidence cannot run.
- **Fixture interval / `visibilityState`:** not measured (no Windows live window; no game `executeJavaScript`).
- **Production tree:** no `src/` or package-script edits.

### Handoff to task_02

Both knobs failed. task_02 must not change paint policy (`views.ts` / `index.ts` stay as today). Do not invent Park.
