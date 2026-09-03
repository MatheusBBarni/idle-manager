---
status: completed
title: Show sleep-blocked hint from the running set
type: frontend
complexity: medium
dependencies: []
---

# Task 01: Show sleep-blocked hint from the running set

## Overview

An operator with any account running needs a footer hint that sleep is blocked, including popped-out and other-tab accounts, and no hint when every account is closed. Primary **US-02** (also F-02, F-07 empty, G-02, US-04 hint side). This slice ships `hasRunningAccount` plus StatusBar copy. It gives up OS keep-awake.

## Source Artifacts

- PRD: `.spec-finder/tasks/block-sleep-while-running/_prd.md`
- TechSpec: `.spec-finder/tasks/block-sleep-while-running/_techspec.md`

<critical>
- Read `.spec-finder/tasks/block-sleep-while-running/_prd.md`, `.spec-finder/tasks/block-sleep-while-running/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** at least one account with `status === 'running'` (including `poppedOut: true` or another tab)
- **When** the operator looks at the status bar
- **Then** a `role="status"` hint uses `sleepBlocked` and game panels are not covered (`overlayOpen` unchanged)
- **Given** zero running accounts
- **When** the operator looks at the status bar
- **Then** that hint is not shown
- **Given** locale `en`, `pt`, `es`, or `zh-Hans`
- **When** the hint renders
- **Then** every map has the key; EN is `Sleep blocked`

## Out of Scope

- **`powerSaveBlocker`, `sleepBlock.ts`, `index.ts` sync/stop** — task_02
- **`prevent-display-sleep`, Settings toggle, tray, covering banner** — PRD Out of Scope
- **`src/main/views.ts`, partitions, Chromium switches** — US-05 / TechSpec Non-Goals
- **Snapshot fields or `OpsourceAPI` changes** — TechSpec Contracts

<requirements>
1. MUST export `hasRunningAccount(snapshot)` from `src/shared/workspace.ts` per TechSpec Contracts (true iff some account `status === 'running'`; ignore `poppedOut` and visibility).
2. MUST unit-test 0 running → false; 1 running → true; popped-out running → true; all closed → false.
3. MUST render the footer hint from that predicate in `StatusBar.tsx` with `role="status"`; MUST NOT set `overlayOpen` or add a dialog.
4. MUST add `sleepBlocked` to `en`, `pt`, `es`, and `zh-Hans`; EN MUST be `Sleep blocked`; extend `i18n.test.ts` so all four maps stay aligned (non-en differs from EN per existing locale tests).
5. MUST NOT add workspace / `parseSnapshot` fields or `WorkspaceAction` variants.
6. MUST NOT create `src/main/sleepBlock.ts` or call `powerSaveBlocker`.
7. SHOULD keep the existing `h-8` footer compact (text span, no button).
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-02, F-02, G-02 | Footer hint iff running ≥ 1 | predicate tests + StatusBar |
| US-04 | Popped-out running still shows hint | predicate unit |
| F-07 | Zero running → no hint | predicate + StatusBar branch |
| Constraints | Four locales; no overlay | i18n tests; no Stage/Dialogs |
| TechSpec Sequencing 1 and 3 | Predicate + StatusBar before main wire | this task |
| ADR-001 / ADR-002 | Status bar only; derived from running set | no IPC |

## Subtasks

- [x] 01.1 Export `hasRunningAccount` and unit-test empty, running, popped-out running, and all-closed.
- [x] 01.2 Add `sleepBlocked` in all four i18n maps; EN `Sleep blocked`; extend i18n tests.
- [x] 01.3 Show the hint on StatusBar from the predicate with `role="status"`; hide at zero running.
- [x] 01.4 Run focused tests and repository gates to terminal exit.

## Implementation Details

Follow TechSpec Contracts (`hasRunningAccount`, i18n key), Architecture (StatusBar), Sequencing steps 1 and 3, ADR-002. Do not paste signatures.

### Relevant Files

- `src/shared/workspace.ts` — add predicate next to existing snapshot helpers
- `src/shared/workspace.test.ts` — predicate cases
- `src/shared/i18n.ts` — four dictionaries
- `src/shared/i18n.test.ts` — key present; EN frozen string; non-en differs
- `src/renderer/src/components/StatusBar.tsx` — footer span from predicate

### Dependent Files

- `src/main/index.ts` / `src/main/sleepBlock.ts` — task_02; do not create or wire here
- `src/renderer/src/components/Stage.tsx` — `overlayOpen` must stay unrelated

### Related ADRs

- [ADR-001: Running-bound keep-awake](adrs/adr-001.md) — status-bar hint; no covering chrome
- [ADR-002: Snapshot-derived keep-awake](adrs/adr-002.md) — hint from running count, not `isStarted`

## Deliverables

- Predicate + StatusBar hint + four-locale copy
- Unit evidence for predicate and i18n
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [x] Given `emptySnapshot()`, when `hasRunningAccount`, then `false`.
- [x] Given one account `status: 'running'`, when `hasRunningAccount`, then `true`.
- [x] Given one running account with `poppedOut: true`, when `hasRunningAccount`, then `true`.
- [x] Given only `status: 'closed'` accounts, when `hasRunningAccount`, then `false`.
- [x] Given `sleepBlocked`, when `t('en', 'sleepBlocked')`, then `Sleep blocked`.
- [x] Given `pt`, `es`, `zh-Hans`, when `t(locale, 'sleepBlocked')`, then non-empty and not equal to EN.

### Integration Tests

- [x] Not applicable — Vitest is `src/shared/**/*.test.ts` only; StatusBar is renderer.

### Platform or Manual Evidence

- [x] StatusBar `role="status"` and no overlay cannot be proven in Vitest. If a packaged UI pass is unavailable, document that limitation in the report and continue with `pnpm test` + `pnpm typecheck`.

### Verification Commands

- `pnpm test`
- `pnpm typecheck`

## Rollout

- N/A — no persist, IPC, or installer change. Hint may appear before task_02 actually blocks sleep (ADR-002 / failure policy).

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for `hasRunningAccount` (measurable in unit tests).
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
