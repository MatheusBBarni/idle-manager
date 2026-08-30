---
status: pending
title: Ship the keyboard account loop
type: backend
complexity: high
dependencies: []
---

# Task 01: Ship the keyboard account loop

## Overview

A multi-account operator can create, cycle, and start accounts from reserved modifier chords while a game panel is focused. Primary **US-01** (also US-02–US-05, F-01–F-07, G-01, G-03, G-05). This slice ships the shared matcher and main interceptor. It gives up Settings copy, README rows, and the keyboard docs pages.

## Source Artifacts

- PRD: `.spec-finder/tasks/keyboard-shortcuts/_prd.md`
- TechSpec: `.spec-finder/tasks/keyboard-shortcuts/_techspec.md`

<critical>
- Read `.spec-finder/tasks/keyboard-shortcuts/_prd.md`, `.spec-finder/tasks/keyboard-shortcuts/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** a tab is active and a game panel is focused
- **When** the operator presses the create chord
- **Then** a new closed account appears with the default name, it is the Start target, and no name dialog opens
- **Given** two or more accounts on the tab
- **When** the operator presses next or previous repeatedly
- **Then** the targeted account walks the full `accountOrder`, including closed, and wraps
- **Given** the targeted account is closed
- **When** the operator presses the start chord
- **Then** that account is running
- **Given** no tab, or an overlay/chrome editable is focused
- **When** those chords are pressed
- **Then** the workspace does not change (no New tab, no extra account)
- **Given** focus is in a game field
- **When** the operator types unmatched keys
- **Then** the game still receives them (`preventDefault` only after a match that commits)

## Out of Scope

- **Settings shortcut list and i18n labels** — task_02
- **README Keyboard rows** — task_02
- **Keyboard docs pages and landing nav link** — task_03
- **`Shell.tsx` README shortcuts** (`Mod+T/B/L/R/M`, zoom, Tab, 1–9) — G-02; do not migrate onto the interceptor
- **Mouse Plus name dialog** — US-07 / F-11; do not change `AccountModal`
- **`globalShortcut`, application menu, new IPC, new `WorkspaceAction` types, game-view preload** — TechSpec non-goals
- **Electron keyboard e2e job** — TechSpec Tests; G-01 guest-focus is dogfood

<requirements>
1. MUST implement TechSpec Contracts (`matchAccountLoopChord`, `nextAccountId`, `keyboardCreateActions`) in `src/shared` and unit-test them next to the module.
2. MUST attach `before-input-event` on chrome `webContents` and every live game `webContents` via existing `attachSessionHandlers` so create/restart/pop-out keep the hook (ADR-003).
3. MUST `preventDefault` only when dispatching a match; skip `commit` and `preventDefault` when `overlayOpen` or chrome editable is focused; never log `input.key`.
4. MUST keyboard-create with `newId()` then `account/create` + `account/activate`; mouse create without an id must still not steal `activeAccountId` when one exists (G-05).
5. MUST no-op without `activeTabId`, empty order, or missing active account on start; start on already-running is idempotent `setStatus running`.
6. SHOULD pin `[` / `]` (and `{` / `}` if the spike in Open Questions requires it) in matcher tests so layout variants cannot silently drift.
7. SHOULD leave `pnpm verify:isolation` unrequired unless partition/session code beyond the input hook changes.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-01, F-01, F-02, F-03 | Keyboard create, default name, start target | matcher + create-then-activate tests |
| US-02, F-04 | Next/prev wrap full order | `nextAccountId` tests |
| US-03, F-05 | Start targeted; already-running unchanged | interceptor + reducer idempotent |
| US-04, F-06 | No-op without tab | no `commit` |
| US-05, F-07, G-03 | Unmatched keys pass | matcher null; preventDefault only on dispatch |
| G-01 | Works while game contents focused | attach on game views; dogfood |
| G-02 | Do not change Shell binds | `Shell.tsx` untouched |
| G-05 | Create then activate supplied id | `workspace.test.ts` |
| Constraints | Mod chords; no global; no key log | ADR-003 |
| TechSpec Sequencing 1–2 | Shared module then main attach | this task |

## Subtasks

- [ ] 01.1 Add the shared chord matcher, wrap helper, and create-then-activate action pair with unit tests for hits, nulls, wrap, and G-05.
- [ ] 01.2 Dispatch those commands from main on chrome and live game contents without new IPC or `WorkspaceAction` types.
- [ ] 01.3 Skip overlay and chrome-editable matches; `preventDefault` only when committing.
- [ ] 01.4 Keep `touch()` activity identity-free and `Shell.tsx` / `AccountModal` unchanged.
- [ ] 01.5 Run focused Vitest and `pnpm typecheck` to terminal exit.

## Implementation Details

Follow TechSpec Contracts (Public interfaces, matcher table), Architecture (components, data flow), Failure and Edge Cases, Sequencing steps 1–2, and ADR-003. Do not paste those contracts here.

### Relevant Files

- `src/shared/accountLoop.ts` — create
- `src/shared/accountLoop.test.ts` — create
- `src/shared/workspace.test.ts` — add create-then-activate vs mouse-create-does-not-steal-active
- `src/main/accountLoop.ts` — create
- `src/main/views.ts` — attach on `attachSessionHandlers` after existing `touch`
- `src/main/index.ts` — chrome attach; pass `commit` / overlay

### Dependent Files

- `src/shared/ids.ts` — `newId()` for keyboard create
- `src/shared/workspace.ts` — existing actions only; do not change `account/create` activate rule
- `src/renderer/src/components/Shell.tsx` — do not add loop chords
- `src/renderer/src/components/Dialogs.tsx` — do not change `AccountModal`
- `src/shared/types.ts` — `StageReport.overlayOpen` already exists

### Related ADRs

- [ADR-001: Mouse-free account loop during real play](adrs/adr-001.md) — product loop while focused
- [ADR-003: Loop-only main before-input interceptor](adrs/adr-003.md) — matcher, attach, chords, skip rules

## Deliverables

- Loop chords commit existing workspace actions from chrome and game contents
- Shared unit tests for matcher, wrap, and create-then-activate
- `Shell.tsx` and Plus dialog unchanged
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [ ] Given keyDown `Mod+Shift+N` (meta or control), when matched, then `account-create`; `n` without mod, keyUp, repeat, and alt → `null`.
- [ ] Given keyDown `Mod+Shift+[` / `]`, when matched, then prev/next; pin the `key` values chosen for shifted brackets.
- [ ] Given keyDown `Mod+Enter` without shift, when matched, then `account-start`.
- [ ] Given `accountOrder` `[a,b,c]` and active `c`, when next, then `a`; when prev from `a`, then `c`; empty order → `null`.
- [ ] Given a tab with active account `acc-a`, when `keyboardCreateActions` then `applyAction`, then the new id is `activeAccountId`; a second `account/create` without id does not steal `acc-a`.

### Integration Tests

- [ ] Not applicable — no Electron harness (TechSpec Tests).

### Platform or Manual Evidence

- [ ] G-01 guest-focus dogfood is out of CI. If a focused guest view cannot be exercised in this environment, document that limitation in the report and continue with the automated gate.
- [ ] G-02: `Shell.tsx` still owns the existing README shortcuts (diff check).

### Verification Commands

- `pnpm test src/shared/accountLoop.test.ts src/shared/workspace.test.ts`
- `pnpm typecheck`

## Rollout

- N/A — no snapshot schema change; chords are unused until task_02 documents them. Rollback is remove listeners.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and `pnpm typecheck` pass to terminal exit.
- Coverage meets repository policy or reaches 80% for new `src/shared/accountLoop.ts` logic when measurable.
- No unrelated file or approved behavior changes (`Shell.tsx`, `AccountModal`, partitions).
- Memory is current and the final report records exact evidence and unresolved risks (including G-01 CI gap).
