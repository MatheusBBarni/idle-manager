---
status: pending
title: Lock idle/getting/ready/later and the update IPC types
type: backend
complexity: medium
dependencies: []
---

# Task 01: Lock idle/getting/ready/later and the update IPC types

## Overview

Chrome must not offer Apply unless the shared status machine says `ready`, and empty/error paths stay `idle`. Primary **US-05** (also F-06, US-04 reduce). This slice ships `reduceUpdateStatus` plus preload `onUpdate` / `updateCommand`. It gives up StatusBar copy, main electron-updater, and the GitHub feed.

## Source Artifacts

- PRD: `.spec-finder/tasks/in-app-auto-update/_prd.md`
- TechSpec: `.spec-finder/tasks/in-app-auto-update/_techspec.md`

<critical>
- Read `.spec-finder/tasks/in-app-auto-update/_prd.md`, `.spec-finder/tasks/in-app-auto-update/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_01.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** status `idle`
- **When** a checking, available, or progress event arrives
- **Then** status is `getting`
- **Given** status `getting`
- **When** a downloaded event with a version arrives
- **Then** status is `ready` with that version
- **Given** status `ready`
- **When** a later event arrives
- **Then** status is `later` and Apply is not implied
- **Given** any status
- **When** error, not-available, or reset arrives
- **Then** status is `idle`
- **Given** preload
- **When** chrome subscribes
- **Then** `onUpdate` and `updateCommand('apply' | 'later')` exist on `window.opsource` without workspace snapshot fields

## Out of Scope

- **StatusBar Apply/Later UI and i18n strings** — task_03
- **electron-updater wiring, quitAndInstall, packaged win32 gate** — task_04
- **latest.yml on GitHub Releases** — task_05
- **Workspace reducer / parseSnapshot / isolation** — PRD constraints; do not touch
- **Overlay, Settings check-now, failure copy** — PRD out of scope

<requirements>
1. MUST implement TechSpec Contracts `UpdateStatus`, `UpdateEvent`, `reduceUpdateStatus` in `src/shared` and unit-test the transition table next to the module.
2. MUST add `onUpdate` and `updateCommand` to `OpsourceAPI` and the CJS preload; do not add update fields to `WorkspaceSnapshot`.
3. MUST fail-closed to `idle` on `error`, `not-available`, and `reset`; `later` must not survive `reset`.
4. MUST no-op semantics for apply/later belong in types/comments only here; main enforces them in task_04.
5. SHOULD keep IPC channel names as TechSpec Contracts (`ops:update`, `ops:updateCommand`).
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-05, F-06 | Empty/error → idle, never fake ready | reduce tests |
| US-04 | ready → later; later + reset → idle | reduce tests |
| US-02 | checking/progress → getting | reduce tests |
| F-01 | ready carries version | reduce tests |
| TechSpec Sequencing 1–2 | Shared reduce then IPC types | this task |
| Constraints | No snapshot schema | ipc/preload only |

## Subtasks

- [ ] 01.1 Add shared reduce + unit tests for the TechSpec transition table.
- [ ] 01.2 Expose `onUpdate` / `updateCommand` on `OpsourceAPI` and preload without snapshot fields.
- [ ] 01.3 Leave main handlers unimplemented beyond what preload needs to compile (no updater process).
- [ ] 01.4 Run focused Vitest and `pnpm typecheck` to terminal exit.

## Implementation Details

Follow TechSpec Contracts (Public interfaces, reduce table), Architecture (`updateStatus.ts`, ipc/preload), Sequencing steps 1–2, and ADR-003. Do not paste those contracts here.

### Relevant Files

- `src/shared/updateStatus.ts` — create
- `src/shared/updateStatus.test.ts` — create
- `src/shared/ipc.ts` — extend `OpsourceAPI`
- `src/preload/index.ts` — expose new methods

### Dependent Files

- `src/renderer/src/store.ts` — task_03 will subscribe; do not add StatusBar this task
- `src/main/index.ts` — task_04 will handle `ops:updateCommand`; a stub that resolves is allowed if typecheck requires it
- `src/shared/workspace.ts` — do not change

### Related ADRs

- [ADR-003: electron-updater 6.x main process + IPC side channel](adrs/adr-003.md) — side channel, not snapshot

## Deliverables

- Tested `reduceUpdateStatus`
- Preload API for update push/command
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [ ] Given `idle`, when `checking` / `available` / `progress`, then `getting`.
- [ ] Given `getting`, when `downloaded` with `1.2.3`, then `ready` `{ version: '1.2.3' }`.
- [ ] Given `ready`, when `later`, then `later` with the same version.
- [ ] Given `later`, when `downloaded` same version, then stay `later`.
- [ ] Given `later`, when `reset`, then `idle`.
- [ ] Given any phase, when `error` or `not-available`, then `idle`.

### Integration Tests

- [ ] Not applicable — no Electron harness (TechSpec Tests).

### Platform or Manual Evidence

- [ ] Not applicable — contract is shared-pure; packaged apply is later dogfood.

### Verification Commands

- `pnpm test src/shared/updateStatus.test.ts`
- `pnpm typecheck`

## Rollout

- N/A — no snapshot schema; unused IPC until task_03/task_04. Rollback is delete the new module and API methods.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and `pnpm typecheck` pass to terminal exit.
- Coverage meets repository policy or reaches 80% for new `src/shared/updateStatus.ts` logic when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
