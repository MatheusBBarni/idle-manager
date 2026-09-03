---
status: completed
title: Stop the whole farm
type: backend
complexity: medium
dependencies:
  - task_01
---

# Task 02: Stop the whole farm

## Overview

A farm operator can put **every** running account down in one action, including other tabs and pop-outs, without wiping jars. Primary **US-02** (also F-02, G-01). This slice gives up restore and keyboard. Last-set algebra from task_01 must already exist.

## Source Artifacts

- PRD: `.spec-finder/tasks/stop-restore-running-set/_prd.md`
- TechSpec: `.spec-finder/tasks/stop-restore-running-set/_techspec.md`

<critical>
- Read `.spec-finder/tasks/stop-restore-running-set/_prd.md`, `.spec-finder/tasks/stop-restore-running-set/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** running accounts in two tabs, including a popped-out panel
- **When** I stop the whole farm
- **Then** every account is closed (pop-outs included), last-set is those formerly running ids, and no login is wiped
- **Given** nothing is running
- **When** I stop the whole farm
- **Then** nothing changes

## Out of Scope

- **Restore last set** — task_03
- **Keyboard / Settings / README** — task_04
- **Changing Stop this tab or Start all** — task_01
- **Auto-sleep, wipe, `globalShortcut`** — PRD / TechSpec Non-Goals

<requirements>
1. MUST add `account/stopFarm` that closes every running account in one commit using the same close rule as `account/setStatus` `'closed'`.
2. MUST freeze last-set to the pre-action running ids when the farm goes empty (not the last id in a loop).
3. MUST return the input snapshot reference when nothing is running.
4. MUST leave `accountIdsToWipe` empty for `account/stopFarm`.
5. SHOULD show Stop whole farm in the expanded sidebar footer with the other bulk controls, i18n in all four locales.
6. MUST NOT add restore or shortcut commands.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-02, F-02, G-01 | Stop every live jar in one commit | `applyAction` + Sidebar + unit |
| F-03 | Farm-empty freeze of last-set | unit three-id freeze |
| F-07 | Identity no-op | unit same-reference |
| F-08, G-03 | No wipe | `accountIdsToWipe` `[]` |
| TechSpec Failure | Pop-out closes with status | unit `poppedOut: false` |
| ADR-002 | Atomic `stopFarm` | one action not N `setStatus` |

## Subtasks

- [x] 02.1 `account/stopFarm` closes all running accounts in one commit
- [x] 02.2 Last-set freezes to the full pre-empty running set
- [x] 02.3 Expanded sidebar Stop whole farm + four-locale copy
- [x] 02.4 Focused tests and repository gates

## Implementation Details

Follow `.spec-finder/tasks/stop-restore-running-set/_techspec.md` Contracts (`account/stopFarm`), Failure (empty farm, pop-outs), and Sequencing after step 1. Reuse the last-set helper from task_01; do not fork a second algebra.

### Relevant Files

- `src/shared/workspace.ts` — `account/stopFarm` case
- `src/shared/workspace.test.ts` — farm stop + freeze + identity + wipe
- `src/renderer/src/components/Sidebar.tsx` — expanded footer control
- `src/shared/i18n.ts` — `stopFarm` (or equivalent) in four locales
- `src/shared/i18n.test.ts` — frozen keys

### Dependent Files

- `src/main/index.ts` / `src/main/views.ts` — existing `syncViews` on closed status; no new IPC
- `src/shared/types.ts` — last-set field already from task_01

### Related ADRs

- [ADR-002: Atomic farm verbs in the workspace reducer](adrs/adr-002.md) — one commit; close not wipe

## Deliverables

- Operator can stop the whole farm from the expanded sidebar
- Unit tests listed below
- Updated `memory/MEMORY.md` and `memory/task_02.md` when warranted
- `reports/task_02.md` final evidence report

## Tests

### Unit Tests

- [ ] Given A running in tab-1, B running popped-out in tab-2, when `account/stopFarm`, then both are `closed` with `poppedOut: false` and last-set is `{A,B}`
- [ ] Given A,B,C running, when `account/stopFarm`, then last-set is those three, not `{C}`
- [ ] Given nothing running, when `account/stopFarm`, then the snapshot reference is unchanged
- [ ] Given `account/stopFarm`, when `accountIdsToWipe`, then `[]`
- [ ] Given new i18n keys, when `src/shared/i18n.test.ts` runs, then all four locales define them

### Integration Tests

- [ ] Not applicable — node Vitest only.

### Platform or Manual Evidence

- [ ] Not applicable in CI. If a live pop-out window cannot be asserted here, unit `poppedOut: false` is the gate; document that and continue.

### Verification Commands

- `pnpm test`
- `pnpm typecheck`

## Rollout

- N/A — no snapshot shape change beyond task_01. New action is ignored by older binaries (default branch).

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for changed testable logic when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
