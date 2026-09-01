# Task Memory: task_02

## Objective Snapshot

Don't-paint running views that passed the spike (US-01). Depends on task_01.

## Important Decisions

- Applied task_01 journal: knob 1 fail, knob 2 fail. Shipped neither. No `views.ts` / `index.ts` paint-policy diff. No Park (ADR-001 stop rule).
- Knob 2 restore/show listeners not added because knob 2 did not pass.
- Windows dogfood G-01/G-02 not run: no shipped knob and host is Darwin.

## Learnings

- Fail-closed non-ship still requires existing gates: `pnpm test`, `pnpm typecheck`, `pnpm verify:isolation` all green with today's attach-and-hide behavior.

## Files / Surfaces

- Not edited: `src/main/views.ts`, `src/main/index.ts`, `src/main/isolationVerify.ts`, renderer, IPC, workspace, layout, partitions.

## Errors / Corrections

- None.

## Ready for Next Run

- Non-ship recorded 2026-08-31. A future Windows-passing spike would be a new packet/task, not a silent retry of this slice.
