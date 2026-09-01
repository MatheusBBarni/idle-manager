---
status: pending
title: Stop this tab and remember last-set
type: backend
complexity: high
dependencies: []
---

# Task 01: Stop this tab and remember last-set

## Overview

A farm operator can put every running account in the **current tab** down in one action without wiping jars, and the workspace starts remembering the last non-empty farm. Primary **US-01** (also F-01, F-03, F-05, F-07, G-01). This slice gives up stop-farm, restore, and keyboard.

## Source Artifacts

- PRD: `.spec-finder/tasks/stop-restore-running-set/_prd.md`
- TechSpec: `.spec-finder/tasks/stop-restore-running-set/_techspec.md`

<critical>
- Read `.spec-finder/tasks/stop-restore-running-set/_prd.md`, `.spec-finder/tasks/stop-restore-running-set/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** two accounts running in the active tab and one running in another tab
- **When** I stop this tab
- **Then** the active tab’s running accounts are closed (pop-outs included), the other tab’s account is still running, and no login is wiped
- **Given** no account is running in the active tab
- **When** I stop this tab
- **Then** nothing changes
- **Given** the only running accounts were in this tab
- **When** I stop this tab
- **Then** last-set is those accounts (not only the last id closed)

## Out of Scope

- **Stop whole farm** — task_02
- **Restore last set** — task_03
- **Keyboard, Settings catalog, README binds** — task_04
- **Atomic Start all, auto-sleep, wipe, snapshot version bump** — PRD / TechSpec Non-Goals
- **Collapsed sidebar bulk controls** — Start all is expanded-footer only today

<requirements>
1. MUST add `lastRunningAccountIds` on snapshot v1 per TechSpec Contracts (parse missing/invalid → `[]`; omit from `exportMetadata`; `snapshotFromImport` → `[]`).
2. MUST implement last-set algebra on every status/membership path this slice touches (`account/setStatus`, `account/stopTab`, `account/delete`, `tab/delete`) per TechSpec Data model.
3. MUST add `account/stopTab` `{ tabId }` that closes running accounts in that tab with the same close rule as `account/setStatus` `'closed'`.
4. MUST return the input snapshot reference when `tabId` is unknown or nothing in that tab is running.
5. MUST keep Start all as the existing Sidebar loop of `account/setStatus` (no new start-all action).
6. MUST leave `accountIdsToWipe` empty for `account/stopTab`.
7. SHOULD show Stop this tab in the expanded sidebar footer next to Start all, with i18n in `en`, `pt`, `es`, and `zh-Hans`.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-01, F-01, G-01 | Stop current tab in one commit | `applyAction` + Sidebar + unit |
| F-03 | Last-set field + algebra | parse/setStatus/stopTab/delete tests |
| F-05, US-05, G-05 | Start all unchanged | Sidebar still loops `setStatus` |
| F-07 | Identity no-op | unit same-reference |
| F-08, US-06, G-03 | No wipe | `accountIdsToWipe` `[]` |
| TechSpec Sequencing 1 | Field + helper + `stopTab` first | no `stopFarm` / restore / chords |
| ADR-002 | Atomic `stopTab`; snapshot omit export | unit export/import |

## Subtasks

- [ ] 01.1 Snapshot field, parse/export/import defaults per Contracts
- [ ] 01.2 Last-set algebra on `setStatus` / delete / tab delete
- [ ] 01.3 `account/stopTab` closes that tab’s running accounts in one commit and freezes last-set only if the farm is empty afterward
- [ ] 01.4 Expanded sidebar Stop this tab; Start all loop untouched
- [ ] 01.5 Four-locale i18n + focused tests and repository gates

## Implementation Details

Follow `.spec-finder/tasks/stop-restore-running-set/_techspec.md` Contracts, Architecture, Failure (empty stop-tab), and Sequencing step 1. Do not paste signatures or diagrams.

Today Start all lives only in the expanded footer of `Sidebar.tsx` as a `for` loop of `account/setStatus`. `commitAll` already `syncViews` after each dispatched action; one `stopTab` is enough for views.

### Relevant Files

- `src/shared/types.ts` — `WorkspaceSnapshot` field
- `src/shared/workspace.ts` — parse, export, import, `applyAction`, last-set helper
- `src/shared/workspace.test.ts` — last-set + `stopTab` + wipe + parse
- `src/renderer/src/components/Sidebar.tsx` — expanded footer control
- `src/shared/i18n.ts` — `stopTab` (or equivalent key) in four locales
- `src/shared/i18n.test.ts` — frozen keys

### Dependent Files

- `src/main/index.ts` — `commit` / `syncViews` already generic; do not add IPC
- `src/main/views.ts` — close already follows `status === 'closed'`; do not change isolation
- `src/shared/shortcuts.ts` — do not add commands yet (task_04)

### Related ADRs

- [ADR-001: Explicit evening/morning trio](adrs/adr-001.md) — Stop this tab is the first visible verb
- [ADR-002: Atomic farm verbs in the workspace reducer](adrs/adr-002.md) — atomic `stopTab`; last-set on snapshot; Start all stays a loop

## Deliverables

- Operator can stop this tab from the expanded sidebar
- Last-set survives parse/quit defaults; not in workspace export
- Unit tests listed below
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [ ] Given running A,B in tab-1 and C in tab-2, when `account/stopTab` tab-1, then A and B are closed, C is running, `accountIdsToWipe` is `[]`
- [ ] Given only A,B,C running in one tab, when `account/stopTab`, then last-set is those three ids (not `{C}`)
- [ ] Given A,B running, when `account/setStatus` A closed, then last-set is `{B}`
- [ ] Given missing `lastRunningAccountIds` on parse, then `[]`
- [ ] Given `exportMetadata`, then the object has no `lastRunningAccountIds`
- [ ] Given `snapshotFromImport`, then `lastRunningAccountIds` is `[]`
- [ ] Given no running in the tab, when `account/stopTab`, then the snapshot reference is unchanged
- [ ] Given `account/delete` of a last-set member, then that id is gone from last-set
- [ ] Given new i18n keys, when `src/shared/i18n.test.ts` runs, then all four locales define them

### Integration Tests

- [ ] Not applicable — Vitest is node-only for `src/shared/**/*.test.ts`; `commitAll`/`syncViews` stay existing.

### Platform or Manual Evidence

- [ ] Not applicable in CI. Guest-focus and live view teardown are dogfood / existing `syncViews`. If Electron cannot run, document that and continue with the automated gate.

### Verification Commands

- `pnpm test`
- `pnpm typecheck`

## Rollout

- Old workspace JSON without the field loads as `[]`. Do not bump `version`. Older builds ignore the extra key.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for changed testable logic when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
