---
status: pending
title: Warn on 7th running start
type: frontend
complexity: medium
dependencies:
  - task_01
---

# Task 02: Warn on 7th running start

## Overview

An operator who already has a 3–6 live farm needs a visible warning when starting another account (the 7th running), without being blocked at four and without a modal that hides game views. Primary **US-06** (also F-06, G-04). This slice gives up a hard cap, persisted dismiss, and don't-paint.

## Source Artifacts

- PRD: `.spec-finder/tasks/running-session-performance/_prd.md`
- TechSpec: `.spec-finder/tasks/running-session-performance/_techspec.md`

<critical>
- Read `.spec-finder/tasks/running-session-performance/_prd.md`, `.spec-finder/tasks/running-session-performance/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** 6 accounts already running
- **When** the operator starts another (single start or Start all that crosses 7)
- **Then** chrome in status or sidebar shows a warning **and** the start still happens
- **Given** fewer than 6 running
- **When** the operator starts another
- **Then** they are not blocked and not warned for a normal farm
- **Given** the warning is visible
- **When** game views are on stage
- **Then** `overlayOpen` is not set for this warning (no confirm modal)

## Out of Scope

- **Honest metrics payload** — task_01
- **Don't-paint** — task_03 / task_04
- **Hard cap / blocked Start / Park** — PRD Out of Scope
- **Persisted dismiss flag** — TechSpec Data model
- **New `DialogKind`** — would hide views via `Stage.tsx` `overlayOpen`

<requirements>
1. MUST implement TechSpec Contracts `RUNNING_START_WARN_AFTER = 6` and `shouldWarnRunningStart(runningCountBeforeStart)` in `src/shared`.
2. MUST show the warning in StatusBar and/or Sidebar only; MUST NOT add a dialog or set `overlayOpen`.
3. MUST NOT block `account/setStatus` `{ status: 'running' }` or Start all.
4. MUST add i18n keys in `en`, `pt`, `es`, and `zh-Hans`.
5. MUST NOT add workspace / `parseSnapshot` fields.
6. SHOULD treat Start all that would cross 7 as one warning, still starting every closed account the operator requested.
7. SHOULD hide the warning when running count drops below 7.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-06, F-06, G-04 | Warn 7th; do not block 4th | predicate tests + chrome |
| TechSpec Contracts | `shouldWarnRunningStart(6) === true` | `src/shared` unit tests |
| PRD Constraints | No overlay over stage | no Dialogs change |
| ADR-002 | No persist; status/sidebar only | no workspace.ts |

## Subtasks

- [ ] 02.1 Shared predicate + unit tests (0–5 false, 6+ true)
- [ ] 02.2 Chrome warning in status/sidebar from current running count
- [ ] 02.3 Start / Start all still dispatch running; no modal
- [ ] 02.4 i18n four locales
- [ ] 02.5 Focused tests and repository gates

## Implementation Details

Follow `.spec-finder/tasks/running-session-performance/_techspec.md` Contracts (`shouldWarnRunningStart`), Architecture (warning on start, never blocked), Failure (Start all crossing 7; warning as Modal forbidden), Sequencing after step 1.

Running count today: `Object.values(snapshot.accounts).filter(status === 'running')` in `StatusBar.tsx`. Starts: `account/setStatus` from Sidebar / Stage / Start all.

### Relevant Files

- `src/shared/metricsDisplay.ts` — create; predicate + constant
- `src/shared/metricsDisplay.test.ts` — create
- `src/renderer/src/components/StatusBar.tsx` — warning text (and/or Sidebar if status is insufficient)
- `src/shared/i18n.ts` — warning copy

### Dependent Files

- `src/shared/i18n.test.ts` — new keys
- `src/renderer/src/components/Dialogs.tsx` — must not gain a start-warn dialog
- `src/renderer/src/components/Stage.tsx` — `overlayOpen` stays dialog-only
- `src/shared/workspace.ts` — do not touch
- `src/renderer/src/components/Sidebar.tsx` — Start all must still dispatch

### Related ADRs

- [ADR-001: Honest cost, then quieter farm](adrs/adr-001.md) — warning not a lock
- [ADR-002: Metrics chrome + don't-paint](adrs/adr-002.md) — no persist; no modal

## Deliverables

- Visible 7th-start warning that never blocks start
- Predicate unit tests
- Updated `memory/MEMORY.md` and `memory/task_02.md` when warranted
- `reports/task_02.md` final evidence report

## Tests

### Unit Tests

- [ ] Given `runningCountBeforeStart` 0..5, when `shouldWarnRunningStart` runs, then false
- [ ] Given 6 or 7, when `shouldWarnRunningStart` runs, then true
- [ ] Given new i18n keys, when `i18n.test.ts` runs, then all four locales define them

### Integration Tests

- [ ] Not applicable — no new IPC (TechSpec Tests)

### Platform or Manual Evidence

- [ ] Review: warning is not a `Dialogs` modal. If UI cannot be launched, document the limitation and continue; automated gates still required

### Verification Commands

- `pnpm test`
- `pnpm typecheck`
- Repository gate: `pnpm test` ; `pnpm typecheck`

## Rollout

- N/A for schema/migration — derived from running count. Rollback is a chrome revert. No README required.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for the predicate when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
