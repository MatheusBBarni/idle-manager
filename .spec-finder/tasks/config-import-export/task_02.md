---
status: pending
title: Ship Settings game-list export and import
type: frontend
complexity: high
dependencies:
  - task_01
---

# Task 02: Ship Settings game-list export and import

## Overview

A friend can import a game list from Settings and see those games with no jars from the file; the sender can export the live bar the same way. Primary **US-02** (also US-01 chrome, US-07, US-08, F-01, F-04, F-09, F-10, G-03). This slice wires IPC, dialogs, and PT/EN buttons. It gives up changing workspace Import and any first-run empty-bar control.

## Source Artifacts

- PRD: `.spec-finder/tasks/config-import-export/_prd.md`
- TechSpec: `.spec-finder/tasks/config-import-export/_techspec.md`

<critical>
- Read `.spec-finder/tasks/config-import-export/_prd.md`, `.spec-finder/tasks/config-import-export/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** Settings is open and the sender has in-bar tabs
- **When** they Export game list and save
- **Then** a pack file is written from one Settings action
- **Given** a recipient without those games
- **When** they Import game list and choose that pack
- **Then** those games appear in the bar and the account list gains nobody from the file
- **Given** the recipient already has a tab and an account
- **When** they Import game list
- **Then** that tab and account remain; pack games are added
- **Given** they cancel the file dialog or choose junk / workspace JSON
- **When** import finishes
- **Then** the workspace is unchanged (no `snapshotFromImport` assign)
- **Given** Settings is open in EN or PT
- **When** they look at backup actions
- **Then** workspace Export/Import are still there, and game-list labels are in that locale and not the workspace strings
- **Given** Settings is open
- **When** they reach Import game list with the keyboard
- **Then** they can start the same load without a pointer (existing Settings buttons)

## Out of Scope

- **Pack parse/export/action helpers** — task_01; call them, do not reimplement
- **Confirm or copy on Import workspace** — ADR-001 rejected approach B
- **Empty-bar “Load game list”** — ADR-001 rejected approach C
- **README/site mention** — PRD Open Questions
- **Error dialog on bad files** — TechSpec failure policy: silent `false`
- **`pnpm verify:isolation`** — no partition IO
- **Changing `exportMetadata` / `ops:export` / `ops:import` behavior** — G-03

<requirements>
1. MUST add `exportGameList` / `importGameList` on `OpsourceAPI` and IPC channels per TechSpec Changed boundaries; workspace methods stay.
2. MUST implement main handlers per TechSpec data flow: save/open dialogs, `writeFile` of `exportGameList(snapshot)`, import `commitAll(gameListImportActions(...))` only when parse is non-empty; catch IO/parse errors as `false`.
3. MUST NOT assign `snapshot = snapshotFromImport(...)` on the game-list path; MUST NOT call `clearAccountSession` here.
4. MUST add Settings buttons and PT/EN i18n keys distinct from `exportWorkspace` / `importWorkspace`.
5. MUST keep workspace Export/Import buttons and handlers unchanged.
6. SHOULD use dialog options in TechSpec Contracts (default save name, JSON filter, `openFile`); English main titles matching the existing workspace dialogs’ pattern.
7. SHOULD document G-01 handoff (or that GUI was unavailable) in the report and still pass the automated gate.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-02, F-04, G-01 | Import game list from Settings | IPC + `commitAll` |
| US-01 chrome, F-01, G-04 | Export from Settings | save dialog + `exportGameList` |
| US-03, G-02 | Additive; farm not replaced | `commitAll` creates only |
| US-04, F-08 | Cancel / junk no-op | `false`; no assign |
| US-07, F-09, G-03 | Workspace actions remain | Dialogs + unedited `ops:export`/`ops:import` |
| US-08, F-10 | Distinct PT/EN | `i18n.ts` + `i18n.test.ts` |
| US-02 keyboard | Settings buttons already `Button onPress` | no extra widget |
| TechSpec Sequencing 2–3 | IPC then Settings | this task |
| ADR-002 | IPC twins; `commitAll`; silent `false` | handlers |

## Subtasks

- [ ] 02.1 Expose game-list export/import on the preload API without changing workspace IPC.
- [ ] 02.2 Save and open a pack from main using task_01 helpers and `commitAll`; fail closed without replacing the snapshot.
- [ ] 02.3 Add Settings Export/Import game list next to workspace actions, with distinct PT/EN labels.
- [ ] 02.4 Prove i18n keys differ from workspace strings; leave workspace handlers untouched.
- [ ] 02.5 Run `pnpm test && pnpm typecheck` to terminal exit; record dogfood/GUI gap if the handoff cannot run here.

## Implementation Details

Follow TechSpec Contracts (OpsourceAPI, IPC names, dialog options, Errors), Architecture data flow and Impact, Sequencing steps 2–3, Failure and Edge Cases (cancel, workspace JSON on game import, write-fail), and ADR-002. Do not paste those contracts here.

### Relevant Files

- `src/shared/ipc.ts` — additive API methods
- `src/preload/index.ts` — invoke new channels
- `src/main/index.ts` — two handlers; existing `commitAll`
- `src/renderer/src/components/Dialogs.tsx` — Settings buttons
- `src/shared/i18n.ts` — PT/EN keys

### Dependent Files

- `src/preload/index.d.ts` — Window typing if it does not follow `OpsourceAPI`
- `src/shared/i18n.test.ts` — assert PT/EN game-list strings ≠ workspace strings
- `src/shared/workspace.ts` — task_01 helpers only; do not restyle snapshot import
- `src/main/views.ts` / `persistence.ts` — do not touch; persist via existing `commitAll` → `scheduleSave`

### Related ADRs

- [ADR-001: Settings game-list pack, additive load](adrs/adr-001.md) — Settings-only; workspace import unchanged
- [ADR-002: Game-list helpers in workspace.ts, IPC twins, tab/create import](adrs/adr-002.md) — channels, `commitAll`, silent skip, default save name

## Deliverables

- Working Settings export/import game list
- Unchanged workspace export/import
- i18n tests for new keys
- Updated `memory/MEMORY.md` and `memory/task_02.md` when warranted
- `reports/task_02.md` final evidence report

## Tests

### Unit Tests

- [ ] Given EN and PT, when reading the new keys, then they are non-empty, not equal to `exportWorkspace` / `importWorkspace`, and PT game-list import/export are not leftover English (`i18n.test.ts`).

### Integration Tests

- [ ] Not applicable in CI — TechSpec Integration is none; dialog/IPC are main-process. Do not add an Electron test harness in this task.

### Platform or Manual Evidence

- [ ] G-01: sender exports, recipient imports, pack tabs appear, zero accounts from file. If the execution environment cannot run the app, document that limitation in `reports/task_02.md` and continue with the automated gate.
- [ ] Cancel save and cancel open leave the workspace unchanged (dogfood or documented skip).
- [ ] Keyboard: Settings Import game list is a focusable `Button` (same as existing Settings actions).

### Verification Commands

- `pnpm test src/shared/i18n.test.ts src/shared/workspace.test.ts`
- `pnpm test && pnpm typecheck`

## Rollout

- Additive API and Settings actions. No snapshot version bump. Rolling back means removing the two methods and buttons; leftover `idle-manager-games.json` files are inert. Workspace `exportMetadata` v1 files stay valid.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for changed testable logic when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
