# Task 02 Final Report: Don't-paint running views that passed the spike

## Outcome

- Verdict: completed
- Date: 2026-08-31
- Provider/session: manual `sf-batch-tasks` (pi)

## Changes

- `.spec-finder/tasks/live-account-ram/memory/task_02.md` — Non-ship journal (neither knob)
- `.spec-finder/tasks/live-account-ram/memory/MEMORY.md` — Packet complete on fail-closed path
- `.spec-finder/tasks/live-account-ram/task_02.md` — Lifecycle + checkpoint metadata only
- `.spec-finder/tasks/live-account-ram/_tasks.md` — Status column for task_02
- Production paint policy (`src/main/views.ts`, `src/main/index.ts`) — unchanged (both knobs failed)

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Read task_01 pass/fail; implement only passed knobs; if none, do not change paint policy | satisfied | task_01 journal: knob 1 fail, knob 2 fail; `git diff --stat -- src package.json` empty |
| 2. Follow `shouldPaintGameView` / `applyStage` detach≠destroy; popped-out stay painted | not applicable | no paint-policy ship; today's `applyStage` unchanged |
| 3. Keep three Chromium switches and `backgroundThrottling: false` | satisfied | no `src/main/index.ts` / `views.ts` edits |
| 4. Re-`applyStage` on restore/show/hide/minimize if knob 2 shipped | not applicable | knob 2 failed; listeners not added |
| 5. Leave `partitionForAccount`, `destroyView`, `restartView`, renderer, IPC unchanged | satisfied | no production diffs |
| 6. Should not export paint predicate or add a workspace field | satisfied | no new export or snapshot field |
| 7. `pnpm verify:isolation` stays green | satisfied | `{"ok": true}` cookies a≠b, localStorage alpha≠beta |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| task_01 journal | both knobs fail | `memory/MEMORY.md`, `memory/task_01.md`, `reports/task_01.md` |
| Paint-policy diff | none | `git diff --stat -- src package.json` empty |
| Focused: `src/shared/workspace.test.ts`, `partition.test.ts`, `layout.test.ts` | pass | included in `pnpm test` 41/41 |
| `pnpm test` | pass | vitest 6 files, 41 tests, 227ms, 2026-08-31 20:32:22 |
| `pnpm typecheck` | pass | `TypeScript: No errors found` |
| `pnpm verify:isolation` | pass | `ok: true`; persist jars distinct |
| Windows dogfood G-01/G-02 | not applicable | no knob shipped; host Darwin |

## Risks and Follow-ups

- Invisible diet did not ship. G-01 remains unmeasured on Windows. A later passing spike is a new piece of work; this task must not be reopened to land don't-paint without that evidence.
- On-stage grids and popped-out windows stay expensive (known TechSpec limit; unused because nothing shipped).

## Final Verdict

completed — both spike knobs failed, so this slice is a documented non-ship: production paint policy unchanged, close/isolation/chrome untouched, and `pnpm test`, `pnpm typecheck`, and `pnpm verify:isolation` passed.
