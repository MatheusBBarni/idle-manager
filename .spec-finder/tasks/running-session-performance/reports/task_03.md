# Task 03 Final Report: Journal Windows don't-paint knobs

## Outcome

- Verdict: completed
- Date: 2026-09-01
- Provider/session: pi / manual sf-batch-tasks

## Changes

- `.spec-finder/tasks/running-session-performance/memory/task_03.md` — per-knob fail-closed journal
- `.spec-finder/tasks/running-session-performance/memory/MEMORY.md` — task_04 handoff (both knobs fail)
- No production `src/` paint-policy diff

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Journal knob 1 and knob 2 separately, fail-closed | satisfied | `memory/task_03.md`: both **fail** |
| 2. Local fixture, not a game document | not applicable | Fixture not run; Windows evidence unavailable |
| 3. Fail if Task Manager does not drop, visibility/interval fail, or Windows evidence cannot run | satisfied | Host is Darwin; both knobs fail |
| 4. MUST NOT edit `views.ts` paint policy, Chromium switches, or `backgroundThrottling` | satisfied | `git diff -- src/main/views.ts src/main/index.ts` empty this slice |
| 5. Record baseline and knob measurements in `memory/task_03.md` | satisfied | Journal includes unmeasured baseline + fail reasons |
| 6. SHOULD leave `pnpm verify:isolation` unrun unless partitions touched | satisfied | Isolation CLI not run; partitions untouched |
| 7. SHOULD not infer pass from macOS Activity Monitor | satisfied | No Activity Monitor pass claimed |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| Host OS | Darwin | `uname -s` → Darwin; `process.platform` → darwin |
| Knob 1 | fail | Windows Task Manager / live window cannot run |
| Knob 2 | fail | same |
| `pnpm test` | passed | 9 files / 88 tests (no accidental src edits) |
| `pnpm typecheck` | passed | `TypeScript: No errors found` |
| Production paint policy | unchanged | no `src/` diff this slice |

## Risks and Follow-ups

- G-01 quieter-farm cannot ship from this packet unless a later Windows journal re-runs the spike and records a pass. task_04 is a documented non-ship of diet.
- Did not copy `.spec-finder/tasks/live-account-ram/` Darwin fail as Windows evidence.

## Final Verdict

task_03 completed as a fail-closed spike: both don't-paint knobs fail because Windows evidence cannot run on Darwin; production paint policy is unchanged.
