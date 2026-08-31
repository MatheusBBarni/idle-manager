---
status: completed
title: Prove the games-only pack contract
type: backend
complexity: medium
dependencies: []
---

# Task 01: Prove the games-only pack contract

## Overview

An operator’s in-bar games become a games-only pack (name + URL, no jars) that can be applied as new empty tabs without wiping anyone. Primary **F-02** (also F-03, F-05–F-08, G-01 file effect, G-02, G-04, US-03–US-06). This slice ships shared parse/export/actions and tests. It gives up Settings, IPC, and file dialogs.

## Source Artifacts

- PRD: `.spec-finder/tasks/config-import-export/_prd.md`
- TechSpec: `.spec-finder/tasks/config-import-export/_techspec.md`

<critical>
- Read `.spec-finder/tasks/config-import-export/_prd.md`, `.spec-finder/tasks/config-import-export/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** two in-bar tabs and one archived tab, each with accounts
- **When** `exportGameList` runs
- **Then** the pack lists only the two in-bar name+URL rows and has no account fields
- **Given** that pack
- **When** `parseGameList` then `gameListImportActions` then `applyAction` on a snapshot that already has a tab and an account
- **Then** two new tabs appear, account count is unchanged, archived is absent, and prior in-bar `activeTabId` is restored
- **Given** workspace-shaped JSON, missing `kind`, `accounts` present, null, or `[]`
- **When** `parseGameList` runs
- **Then** the result is empty and applying it mutates nothing
- **Given** a valid pack imported twice
- **When** actions are applied twice
- **Then** duplicate name/URL tabs exist with new ids and still no accounts from the pack

## Out of Scope

- **IPC, file dialogs, Settings buttons, i18n** — task_02
- **Changing `exportMetadata`, `parseSnapshot`, `snapshotFromImport`, `ops:export`, `ops:import`** — G-03 / ADR-001
- **New `WorkspaceAction` type or `src/shared/gameList.ts`** — TechSpec non-goals / ADR-002
- **Error dialog, empty-bar CTA, README/site** — PRD out of scope
- **`pnpm verify:isolation`** — partitions untouched

<requirements>
1. MUST add `exportGameList`, `parseGameList`, and `gameListImportActions` in `src/shared/workspace.ts` per TechSpec Contracts (Public interfaces) and ADR-002.
2. MUST export only `visibleTabs` name+URL in bar order; omit ids, layout, archived, accounts, locale, and theme.
3. MUST `parseGameList` return `[]` unless the document matches the game-list contract, including fail-closed when `accounts` is an own-property; skip rows that fail `isValidHttpUrl`.
4. MUST `gameListImportActions` emit `tab/create` without `id`, then `tab/activate` of the prior in-bar active tab when one existed; empty input → `[]`.
5. MUST NOT change `applyAction` tab-create rules, `exportMetadata`, or `parseSnapshot`.
6. SHOULD keep coverage of new helpers at least 80% via `workspace.test.ts` cases named in Tests.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| F-02, G-04, US-01 shape | In-bar name+URL only | `exportGameList` tests |
| F-03, US-06 | Archived omitted | export of mixed archived |
| F-05, F-06, G-01, G-02, US-03 | Additive creates; no accounts; restore active | `gameListImportActions` + `applyAction` |
| F-07, US-05 | Re-import duplicates | apply twice |
| F-08, US-04, Constraints | Junk / workspace JSON → `[]` | parse tests |
| US-01 empty pack | `tabs: []` import adds nothing | parse/actions empty |
| TechSpec Sequencing 1 | Shared helpers + tests first | this task |
| ADR-002 | Helpers in `workspace.ts`; no new action | files |

## Subtasks

- [x] 01.1 Export in-bar name+URL packs with no account or archived rows, covered by unit tests.
- [x] 01.2 Parse only valid game-list documents; skip bad URLs; reject workspace-shaped and junk input as empty.
- [x] 01.3 Build import actions that add tabs, create no jars, restore prior in-bar active, and duplicate on re-apply.
- [x] 01.4 Leave workspace snapshot parse/export and `applyAction` create rules unchanged.
- [x] 01.5 Run focused Vitest and `pnpm typecheck` to terminal exit.

## Implementation Details

Follow TechSpec Contracts (Public interfaces, parse/export rules, `gameListImportActions`), Architecture Sequencing step 1, Failure and Edge Cases (wrong-document, skip URL, restore active), and ADR-002. Do not paste those contracts here.

### Relevant Files

- `src/shared/workspace.ts` — add pack helpers next to `exportMetadata`
- `src/shared/workspace.test.ts` — pack contract cases

### Dependent Files

- `src/shared/urls.ts` — existing `isValidHttpUrl`; do not fork URL rules
- `src/shared/ids.ts` — `tab/create` mints UUID when `id` omitted; do not pass ids from the pack
- `src/main/index.ts` — do not add IPC in this task

### Related ADRs

- [ADR-001: Settings game-list pack, additive load](adrs/adr-001.md) — product: additive, no accounts in file
- [ADR-002: Game-list helpers in workspace.ts, IPC twins, tab/create import](adrs/adr-002.md) — helpers live here; import actions are `tab/create` + restore

## Deliverables

- Pack helpers in `workspace.ts` matching TechSpec Contracts
- `workspace.test.ts` cases listed below
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [x] Given two in-bar tabs and one archived with accounts, when `exportGameList`, then `tabs` has two `{ name, baseUrl }` rows, `kind` is game-list, and JSON has no account keys.
- [x] Given workspace-shaped raw (`version: 1`, `tabs`, `accounts: {}`), missing `kind`, `accounts` own-property on a game-list-shaped object, `null`, or `[]`, when `parseGameList`, then `[]`.
- [x] Given a valid pack row with `javascript:` or empty `baseUrl` plus one http(s) row, when `parseGameList`, then only the http(s) row remains.
- [x] Given a snapshot with in-bar `activeTabId` and one account, when `gameListImportActions` + `applyAction` for two pack tabs, then tab count grows by 2, account keys unchanged, `activeTabId` restored.
- [x] Given no in-bar active tab, when those actions apply one tab, then `activeTabId` is the created tab.
- [x] Given the same pack applied twice, then duplicate names/URLs exist with distinct ids and no new accounts.

### Integration Tests

- [ ] Not applicable — no IPC in this task; TechSpec Integration is none in CI.

### Platform or Manual Evidence

- [ ] Not applicable — file dialogs and G-01 handoff are task_02 / dogfood. If a GUI is unavailable, record that and continue with the automated gate.

### Verification Commands

- `pnpm test src/shared/workspace.test.ts`
- `pnpm test && pnpm typecheck`

## Rollout

- N/A — no user-facing path or on-disk format shipped until task_02.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for changed testable logic when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
