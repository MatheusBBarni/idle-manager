# Task 01 Final Report: Journal Windows don't-paint knobs

## Outcome

- Verdict: completed
- Date: 2026-08-31
- Provider/session: manual `sf-batch-tasks` (pi)

## Changes

- `.spec-finder/tasks/live-account-ram/memory/task_01.md` — Spike journal: environment, baseline not captured, knob 1 fail, knob 2 fail
- `.spec-finder/tasks/live-account-ram/memory/MEMORY.md` — Handoff for task_02 (both knobs fail; no diet)
- `.spec-finder/tasks/live-account-ram/task_01.md` — Lifecycle + checkpoint metadata only
- `.spec-finder/tasks/live-account-ram/_tasks.md` — Status column for task_01
- Production `src/`, IPC, snapshot types, renderer, and `package.json` scripts — unchanged

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Journal knob 1 and knob 2 separately against Sequencing / ADR-002 fail-closed | satisfied | `memory/task_01.md` Ready for Next Run: knob 1 fail, knob 2 fail |
| 2. Use a local fixture, not a game document | not applicable | Windows live window unavailable; no fixture run; no game `executeJavaScript` |
| 3. Fail if Task Manager does not drop, visibility/interval break, or Windows evidence cannot run | satisfied | Darwin host; Task Manager and live Windows window unavailable → both knobs fail |
| 4. MUST NOT edit `views.ts`, `index.ts`, IPC, snapshot types, renderer, or `package.json` scripts | satisfied | `git diff --stat -- src package.json` empty |
| 5. MUST NOT add Chromium switch changes or `backgroundThrottling: true` | satisfied | no `src/` edits; switches still as read in `src/main/index.ts` |
| 6. Record baseline and two knob measurements in `memory/task_01.md` | satisfied | journal records baseline not captured + per-knob fail |
| 7. Leave `pnpm verify:isolation` unrun unless partitions change | satisfied | partitions untouched; isolation CLI not run |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| Host OS | Darwin, not Windows | `uname -s` → `Darwin` |
| Windows Task Manager / live window | unavailable | no Windows environment in this session |
| Knob 1 (off-stage detach) | fail | Windows evidence cannot run; not inferred from macOS |
| Knob 2 (minimize/hide detach) | fail | Windows evidence cannot run; not inferred from macOS |
| Production tree | unchanged | `git diff --stat -- src package.json` empty |
| `pnpm test` | pass | vitest 6 files, 41 tests, 239ms, 2026-08-31 20:31:09 |
| `pnpm verify:isolation` | not run | spike must not touch partitions |

## Risks and Follow-ups

- G-01 Task Manager drop is unmeasured. A later Windows session would need a new spike before any don't-paint ship; this journal does not authorize diet.
- task_02 must implement the both-fail path: no `applyStage` / minimize-listener paint-policy change, no Park chrome.

## Final Verdict

completed — the spike recorded fail-closed results for both knobs because Windows evidence could not run on Darwin, left production code unchanged, and `pnpm test` passed (6 files, 41 tests).
