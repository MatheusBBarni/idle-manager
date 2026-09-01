---
status: pending
title: Block OS sleep while any account is running and release on last close or quit
type: backend
complexity: medium
dependencies:
  - task_01
---

# Task 02: Block OS sleep while any account is running and release on last close or quit

## Overview

An operator who leaves accounts running needs Windows (and other OSes) not to idle-sleep, then needs sleep allowed again when every account is closed or the app quits. Primary **US-01** (also F-01, F-03, F-04, US-03, US-06, G-01, G-03). This slice ships main `syncSleepBlock` / `stopSleepBlock`. It gives up hint chrome (task_01) and display-forced-on.

## Source Artifacts

- PRD: `.spec-finder/tasks/block-sleep-while-running/_prd.md`
- TechSpec: `.spec-finder/tasks/block-sleep-while-running/_techspec.md`

<critical>
- Read `.spec-finder/tasks/block-sleep-while-running/_prd.md`, `.spec-finder/tasks/block-sleep-while-running/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_02.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** `hasRunningAccount` is true after load, commit, or import
- **When** main syncs keep-awake
- **Then** a single `powerSaveBlocker` of type `prevent-app-suspension` is started (or already `isStarted`)
- **Given** several running accounts with a blocker started
- **When** the last running account is closed
- **Then** `stopSleepBlock` runs
- **Given** accounts were running and sleep was blocked
- **When** the app is quitting (`before-quit`)
- **Then** `stopSleepBlock` runs
- **Given** `--verify-isolation`
- **When** the process takes the verify path
- **Then** no blocker is started
- **Given** `start` is not `isStarted`
- **When** the next snapshot sync runs with running accounts still present
- **Then** main logs, forgets the id, and retries start; hint policy stays task_01 (running count)

## Out of Scope

- **StatusBar hint and `sleepBlocked` copy** — task_01
- **`prevent-display-sleep`, power-plan editor, lid/Start→Sleep defeat** — PRD Out of Scope
- **`src/main/views.ts`, partitions, Chromium switches, `backgroundThrottling`** — US-05 / TechSpec Non-Goals
- **New IPC, snapshot fields, Settings toggle** — TechSpec Non-Goals
- **Electron unit CI / overnight idle-timer spike as ship gate** — TechSpec Tests / user evidence A

<requirements>
1. MUST implement TechSpec Contracts `syncSleepBlock` / `stopSleepBlock` in `src/main/sleepBlock.ts` using one in-memory id and only `prevent-app-suspension`.
2. MUST call `syncSleepBlock(snapshot)` after `commitAll`, after successful `loadSnapshot`, and after import-workspace (that path bypasses `commit`).
3. MUST call `stopSleepBlock` from `app` `before-quit` and when the predicate is false.
4. MUST treat failed `start` as: `console.error`, clear stored id, retry on the next `syncSleepBlock`; MUST NOT hide the task_01 hint.
5. MUST no-op `stop` when no id is stored.
6. MUST NOT start a blocker on the `--verify-isolation` path (exits before load).
7. MUST NOT edit `views.ts`, preload, `OpsourceAPI`, or `parseSnapshot`.
8. SHOULD never start a second id without stopping the first.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-01, F-01, G-01 | Blocker on while any running | `syncSleepBlock` + load/commit |
| US-03, F-03, F-07, G-03 | Last close → stop | empty predicate → `stopSleepBlock` |
| US-06, F-04 | Quit → stop | `before-quit` |
| US-04, F-05 | Off-stage running still blocks | uses task_01 predicate |
| US-05, F-06 | Isolation unchanged | no views/partition edits; `verify:isolation` |
| TechSpec Failure | Failed start logs and retries | `sleepBlock.ts` |
| ADR-002 | No IPC; all-OS; one id | this module |

## Subtasks

- [ ] 02.1 Add `sleepBlock.ts` with single-id start/stop per TechSpec Contracts.
- [ ] 02.2 Wire sync on `commitAll`, load, and import-workspace; stop on `before-quit`.
- [ ] 02.3 Failed start logs, clears id, retries next sync; isolation-verify path untouched.
- [ ] 02.4 Run `pnpm test`, `pnpm typecheck`, and `pnpm verify:isolation` to terminal exit.

## Implementation Details

Follow TechSpec Contracts (`syncSleepBlock`, `stopSleepBlock`, `prevent-app-suspension` only), Architecture data flow, Failure table, Sequencing step 2, ADR-002. Do not paste diagrams.

### Relevant Files

- `src/main/sleepBlock.ts` — create; one blocker id
- `src/main/index.ts` — `commitAll`, load after `loadSnapshot`, import-workspace snapshot replace, existing `before-quit`
- `src/shared/workspace.ts` — `hasRunningAccount` from task_01; do not change reducer rules

### Dependent Files

- `src/main/views.ts` — must not change
- `src/main/isolationVerify.ts` — verify path must remain blocker-free
- `src/renderer/src/components/StatusBar.tsx` — hint already from predicate; do not restyle

### Related ADRs

- [ADR-001: Running-bound keep-awake](adrs/adr-001.md) — automatic while any running; screen may sleep
- [ADR-002: Snapshot-derived keep-awake](adrs/adr-002.md) — main module, retry on next sync, all OS

## Deliverables

- Main keep-awake synced to the running set; release on empty and quit
- Automated gates including isolation
- Updated `memory/MEMORY.md` and `memory/task_02.md` when warranted
- `reports/task_02.md` final evidence report

## Tests

### Unit Tests

- [ ] Not applicable for `powerSaveBlocker` — Vitest cannot load Electron. Predicate coverage remains task_01. Re-run `pnpm test` to prove shared tests still pass.

### Integration Tests

- [ ] Not applicable — no Electron test harness in this repo (TechSpec Non-Goals).

### Platform or Manual Evidence

- [ ] G-01/G-03 overnight idle-timer journal cannot run in CI. If a Windows packaged idle-timer pass is unavailable, document that limitation in the report and continue with the automated gates. Do not invent Park or `prevent-display-sleep` to fake G-01.

### Verification Commands

- `pnpm test`
- `pnpm typecheck`
- `pnpm verify:isolation`

## Rollout

- N/A — no disk format or installer change. All OS get the same blocker; Windows journal remains G-01 (PRD), not this task’s CI gate.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit (`pnpm test`, `pnpm typecheck`, `pnpm verify:isolation`).
- Coverage: new Electron module is not unit-testable here; shared predicate coverage from task_01 must remain green.
- No unrelated file or approved behavior changes (`views.ts` / partitions untouched).
- Memory is current and the final report records exact evidence, isolation result, and the overnight-journal gap if platform evidence did not run.
