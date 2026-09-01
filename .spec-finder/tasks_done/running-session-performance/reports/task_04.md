# Task 04 Final Report: Don't-paint knobs that passed

## Outcome

- Verdict: completed
- Date: 2026-09-01
- Provider/session: pi / manual sf-batch-tasks

## Changes

- No production paint-policy diff (`src/main/views.ts`, `src/main/index.ts` command-line switches, `destroyView`, partitions unchanged)
- Packet memory updated with the documented non-ship

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Implement only passed knobs; if none passed, MUST NOT change paint policy | satisfied | task_03 journal: both fail; no `views.ts` / window-listener paint diff |
| 2. `shouldPaintGameView` / detach ≠ destroy / popped-out stay painted | not applicable | No knob passed; predicate not shipped |
| 3. Keep anti-throttle switches and game `backgroundThrottling: false` | satisfied | `index.ts` still appends the three switches; `views.ts` createView still `backgroundThrottling: false` |
| 4. Re-`applyStage` on restore/show/hide/minimize if knob 2 shipped | not applicable | Knob 2 fail; no new window listeners |
| 5. Leave `partitionForAccount`, `destroyView`, `restartView`, workspace snapshot unchanged | satisfied | those files not edited this slice |
| 6. SHOULD not export the paint predicate or add a workspace field | satisfied | no export, no snapshot field |
| 7. SHOULD not require isolation behavior change — only stay green | satisfied | `pnpm verify:isolation` ok: true; distinct jars |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| task_03 journal | both knobs fail | `memory/task_03.md` |
| `pnpm test` | passed | 9 files / 88 tests including workspace close, partition, layout |
| `pnpm typecheck` | passed | `TypeScript: No errors found` |
| `pnpm verify:isolation` | passed | `"ok": true`; cookies a=`account-a` b=`account-b`; localStorage alpha/beta |
| Windows diet dogfood | N/A | no knob shipped |
| Paint policy diff | none | `git diff -- src/main/views.ts src/main/index.ts` empty |

## Risks and Follow-ups

- G-01 (farm leaves the PC usable) is unmet by this packet’s diet path. F-05/F-06 still ship from task_01/02.
- A future Windows spike pass would be required before any `applyStage` detach.

## Final Verdict

task_04 completed as a documented non-ship: both don't-paint knobs failed in task_03, production paint policy is unchanged, and `pnpm test`, `pnpm typecheck`, and `pnpm verify:isolation` passed.
