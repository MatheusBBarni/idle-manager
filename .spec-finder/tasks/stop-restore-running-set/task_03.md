---
status: completed
title: Restore the last running set
type: backend
complexity: medium
dependencies:
  - task_01
---

# Task 03: Restore the last running set

## Overview

A farm operator can start **only** the accounts that were running the last time any panel was live, so morning is last night’s farm and not every closed jar in the tab. Primary **US-03** (also F-04, F-07, G-02). This slice gives up keyboard. Last-set tracking from task_01 must already exist.

## Source Artifacts

- PRD: `.spec-finder/tasks/stop-restore-running-set/_prd.md`
- TechSpec: `.spec-finder/tasks/stop-restore-running-set/_techspec.md`

<critical>
- Read `.spec-finder/tasks/stop-restore-running-set/_prd.md`, `.spec-finder/tasks/stop-restore-running-set/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** accounts A, B, and C; A and B were running the last time any panel was live; C stayed closed
- **When** I restore last set
- **Then** A and B are running and C stays closed
- **Given** I closed A by hand while B was still running, then emptied the farm
- **When** I restore last set
- **Then** A stays closed and the accounts still running at empty come back
- **Given** one last-set account was deleted
- **When** I restore last set
- **Then** the remaining last-set accounts start and the deleted one is not recreated
- **Given** no last-set (or every id in it is gone)
- **When** I restore last set
- **Then** no account starts

## Out of Scope

- **Keyboard / Settings / README** — task_04
- **Changing Start all** — task_01 / G-05
- **Switching `activeTabId` on restore** — TechSpec Non-Goals
- **Named presets / last-set per tab** — PRD Out of Scope
- **Auto-start on launch or empty-stage CTA** — PRD Out of Scope

<requirements>
1. MUST add `account/restoreLastSet` that sets `status: 'running'` on still-existing last-set members that are closed, in one commit.
2. MUST skip unknown/deleted ids and MUST NOT create accounts.
3. MUST leave unused closed jars (not in last-set) closed.
4. MUST return the input snapshot reference when there is nothing to start.
5. MUST leave `accountIdsToWipe` empty for `account/restoreLastSet`.
6. SHOULD show Restore last set in the expanded sidebar footer, i18n in all four locales.
7. MUST NOT change `activeTabId` as a restore side effect.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-03, F-04, G-02 | Restore last-set only | `applyAction` + Sidebar + unit |
| F-03 | Uses persisted last-set | unit after stop-then-restore |
| F-07 | Empty/stale no-op | identity unit |
| F-08, G-03 | No wipe, no new jars | wipe `[]`; no `account/create` |
| TechSpec Non-Goals | No active-tab switch | unit activeTabId unchanged |
| ADR-002 | Atomic restore | one action |

## Subtasks

- [x] 03.1 `account/restoreLastSet` starts existing closed last-set members only
- [x] 03.2 Skip missing ids; identity when nothing to start
- [x] 03.3 Expanded sidebar Restore last set + four-locale copy
- [x] 03.4 Focused tests and repository gates

## Implementation Details

Follow `.spec-finder/tasks/stop-restore-running-set/_techspec.md` Contracts (`account/restoreLastSet`), Data model filter step, Failure (empty restore, deleted id), and Sequencing after the stop verbs. Do not paste the algebra; call the helper from task_01.

Hand-close-then-empty is already last-set behavior from task_01 `setStatus` + emptying; this slice only consumes the frozen set.

### Relevant Files

- `src/shared/workspace.ts` — `account/restoreLastSet` case
- `src/shared/workspace.test.ts` — restore / skip / identity / wipe
- `src/renderer/src/components/Sidebar.tsx` — expanded footer control
- `src/shared/i18n.ts` — `restoreLastSet` (or equivalent) in four locales
- `src/shared/i18n.test.ts` — frozen keys

### Dependent Files

- `src/main/views.ts` — starting `running` already creates views; do not change partitions
- `src/renderer/src/components/Stage.tsx` — empty CTA stays Start first account (non-goal)

### Related ADRs

- [ADR-002: Atomic farm verbs in the workspace reducer](adrs/adr-002.md) — restore one commit; skip ghosts; no export of last-set

## Deliverables

- Operator can restore last-set from the expanded sidebar
- Unit tests listed below
- Updated `memory/MEMORY.md` and `memory/task_03.md` when warranted
- `reports/task_03.md` final evidence report

## Tests

### Unit Tests

- [ ] Given last-set `[A,B]` and unused closed C, when `account/restoreLastSet`, then A and B are running and C is closed
- [ ] Given last-set includes a deleted id, when restore, then remaining members start and no account is created for the missing id
- [ ] Given last-set `[]` or all ids gone, when restore, then the snapshot reference is unchanged
- [ ] Given restore, when `accountIdsToWipe`, then `[]`
- [ ] Given restore that starts accounts on another tab, then `activeTabId` is unchanged
- [ ] Given new i18n keys, when `src/shared/i18n.test.ts` runs, then all four locales define them

### Integration Tests

- [ ] Not applicable — node Vitest only.

### Platform or Manual Evidence

- [ ] Not applicable in CI. Off-stage running after restore is existing product behavior; document if not demoed and continue with the automated gate.

### Verification Commands

- `pnpm test`
- `pnpm typecheck`

## Rollout

- N/A — uses the task_01 field. Empty last-set is a no-op for operators who never ran a farm.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for changed testable logic when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
