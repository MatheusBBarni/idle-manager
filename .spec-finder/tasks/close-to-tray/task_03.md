---
status: completed
title: Restore from a second launch
type: backend
complexity: low
dependencies:
  - task_02
---

# Task 03: Restore from a second launch

## Overview

A dismissed farm has no taskbar button, so launching Idle manager again must not open a second process on the same `persist:` jars. Primary **US-03** (second-launch path; also F-07 / ADR-002 lock). This slice adds `requestSingleInstanceLock` and restores or focuses the first process. It gives up any further tray features.

## Source Artifacts

- PRD: `.spec-finder/tasks/close-to-tray/_prd.md`
- TechSpec: `.spec-finder/tasks/close-to-tray/_techspec.md`

<critical>
- Read `.spec-finder/tasks/close-to-tray/_prd.md`, `.spec-finder/tasks/close-to-tray/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_03.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** Idle manager is already running with a dismissed live farm
- **When** I launch the app again
- **Then** the second process exits and the first restores the window with those accounts still running
- **Given** Idle manager is already running with the window visible
- **When** I launch the app again
- **Then** the second process exits and the first window is focused (not a second chrome)

## Out of Scope

- **Close interceptor, Tray, tooltip** — task_02
- **Settings Quit** — task_01
- **Changing partition naming or `views.ts` isolation** — PRD constraint
- **macOS/Linux Close-to-tray** — TechSpec non-goal (lock may still be process-wide per ADR-002)

<requirements>
1. MUST call `requestSingleInstanceLock` so a second process exits (TechSpec Contracts / Security).
2. MUST on `second-instance` call `restoreMainWindow()` when dismissed, otherwise focus the existing window.
3. MUST NOT create a second `BrowserWindow` farm on the same account stores.
4. SHOULD take the lock before `app.whenReady` work that opens chrome, matching Electron’s lock pattern.
5. MUST NOT add tray menu items or snapshot fields.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-03 | Second launch restores a dismissed farm | `second-instance` → restore |
| F-07, Constraints | No two processes on `persist:` jars | lock |
| G-04 | Restore path besides the tray | this slice |
| TechSpec Sequencing 5 | Lock after restore helper exists | depends task_02 |
| ADR-002 | App-wide single instance | lock on all OS; tray still win32 |

## Subtasks

- [x] 03.1 Take a single-instance lock; quit if this process lost.
- [x] 03.2 On second-instance, restore if dismissed else focus; do not open another chrome farm.
- [x] 03.3 Typecheck; record whether second-launch was exercised on this host.

## Implementation Details

Use TechSpec Contracts (`restoreMainWindow`), Changed boundaries (process instances), Security, and Sequencing step 5. Do not paste Electron samples.

Own only the lock wiring in `index.ts`. Reuse task_02 restore; do not reimplement hide/tray.

### Relevant Files

- `src/main/index.ts` — lock + `second-instance` handler

### Dependent Files

- `src/main/appSession.ts` — consume `restoreMainWindow`; do not expand tray scope
- `src/main/views.ts` — unchanged

### Related ADRs

- [ADR-002: Hide-in-place tray session](adrs/adr-002.md) — app-wide lock; second process exits

## Deliverables

- Second launch never starts a second farm; dismissed state restores
- `pnpm typecheck` clean (`pnpm test` still green)
- Updated `memory/MEMORY.md` and `memory/task_03.md` when warranted
- `reports/task_03.md` final evidence report

## Tests

### Unit Tests

- [ ] Not applicable — lock is Electron `app` API; no new shared predicate.

### Integration Tests

- [ ] Not applicable — Vitest has no second-process harness.

### Platform or Manual Evidence

- [ ] When the host can run two launches: start the app, dismiss a live farm (task_02), launch again, first window restores, only one process. Also launch again while visible and confirm focus, not a second window. If not exercisable, document the limitation and continue with the automated gate.

### Verification Commands

- `pnpm test`
- `pnpm typecheck`

## Rollout

- First-launch-wins instance policy (new vs today). No disk migration. Rollback = remove the lock.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage: not measurable for the lock; shared `trayPolicy` from task_02 remains covered.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
