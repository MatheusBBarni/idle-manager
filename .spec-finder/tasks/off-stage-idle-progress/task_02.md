---
status: pending
title: Ship passing keep-alive placement
type: backend
complexity: medium
dependencies:
  - task_01
---

# Task 02: Ship passing keep-alive placement

## Overview

A multi-account operator can switch game tab or open a confirm dialog without those running accounts freezing or reloading. Primary **US-01** (also US-02, US-03, F-01–F-03, G-01, G-02). This slice ships keep-alive placement **only** for the TechSpec ship rule after task_01. It gives up inject, always-paint, RAM diet, and new chrome.

## Source Artifacts

- PRD: `.spec-finder/tasks/off-stage-idle-progress/_prd.md`
- TechSpec: `.spec-finder/tasks/off-stage-idle-progress/_techspec.md`

<critical>
- Read `.spec-finder/tasks/off-stage-idle-progress/_prd.md`, `.spec-finder/tasks/off-stage-idle-progress/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** task_01 recorded baseline already passing the fixture
- **When** this slice runs
- **Then** production hide in `applyStage` stays as today; no keep-alive knob is forced
- **Given** task_01 recorded baseline fail and park pass
- **When** a running account has no current stage panel or `overlayOpen` is true
- **Then** its view is parked off chrome (`setVisible(true)`, child, contents ≥ 8×8), not destroyed, not reloaded, and does not cover the dialog
- **Given** task_01 recorded baseline fail, park fail, and detach pass
- **When** the same off-stage or overlay case happens
- **Then** the view is detached (`removeChildView`) without `setVisible(false)`; `webContents` stay alive
- **Given** task_01 recorded no keep-alive knob pass
- **When** this slice runs
- **Then** `views.ts` paint policy stays as today; gates still run; no inject or always-paint is added
- **Given** a running account the operator closes
- **When** close is used
- **Then** the view is destroyed and the persist jar remains (today’s close)
- **Given** two running accounts of the same origin
- **When** keep-alive placement is in effect
- **Then** jars stay distinct
- **Given** the operator focuses the other-tab account again
- **When** a panel exists and overlay is closed
- **Then** the view paints in the hole without a fresh `loadURL`

## Out of Scope

- **Fixture measurement / visibility journal** — task_01
- **RAM don’t-paint / Task Manager** — PRD Out of Scope
- **Park chrome, Memory Saver, inject, always-paint over dialogs** — PRD Out of Scope
- **Minimize / OS occlusion / single-layout as the success gate** — PRD Out of Scope (same no-panel path may park; V1 is not judged on it)
- **New IPC, snapshot fields, renderer chrome** — TechSpec Non-Goals
- **Relaxing Chromium switches or `backgroundThrottling: true`** — TechSpec Non-Goals
- **Windows in-game G-01/G-02 journal as CI** — PRD measurement, not this gate

<requirements>
1. MUST read task_01 pass/fail and apply `.spec-finder/tasks/off-stage-idle-progress/_techspec.md` Contracts ship rule only; if no keep-alive knob ships, MUST NOT change paint policy.
2. MUST follow TechSpec Contracts `gameViewPlacement` when a knob ships: paint vs park; popped-out stays painted in its window; overlay and other-tab share the park path.
3. MUST keep `disable-renderer-backgrounding`, `disable-background-timer-throttling`, `disable-backgrounding-occluded-windows`, and game `backgroundThrottling: false`.
4. MUST leave `partitionForAccount`, `destroyView` close path, `restartView` crash path, and workspace snapshot unchanged.
5. MUST NOT `executeJavaScript` on game origins or add live-cue chrome.
6. SHOULD add `src/shared/gameViewPlacement.ts` plus tests only when a keep-alive knob ships (no unused module on non-ship).
7. SHOULD not export placement over IPC or add a workspace field.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-01, F-01, G-01 | Other-tab running stays live | park/detach if shipped |
| US-02, F-02, G-02 | Overlay hide does not freeze or cover | park/detach if shipped; no on-stage paint |
| US-03, F-03 | Come-back is not a reload | live map; no `loadURL` on show |
| US-04, F-04 | Close still drops the live view, keeps login | `destroyView` untouched |
| US-05, F-05 | Isolation unchanged | `pnpm verify:isolation` if `views.ts` ships |
| F-06, G-03 | No new chrome | no renderer/IPC |
| TechSpec Sequencing 3–4 | Hide only after spike; then gates | this task |
| ADR-002 | Ship rule; fail-closed | skip failed knobs |

## Subtasks

- [ ] 02.1 Apply task_01 journal: baseline-already-pass (no hide change), ship park, ship detach, or neither
- [ ] 02.2 If a keep-alive knob ships, land `gameViewPlacement` with unit tests from TechSpec Contracts
- [ ] 02.3 If park shipped, off-stage / overlay running views park off chrome while contents live
- [ ] 02.4 If detach shipped instead, off-stage / overlay views `removeChildView` without `setVisible(false)`
- [ ] 02.5 Confirm close, crash restart, pop-out, partitions, and chrome are unchanged; run gates (include `pnpm verify:isolation` only if `views.ts` production paint shipped)

## Implementation Details

Follow `.spec-finder/tasks/off-stage-idle-progress/_techspec.md` Contracts, Architecture, Failure, Sequencing steps 3–4, and ADR-002. Do not paste signatures or diagrams.

Callers today: `ops:reportStage` → `applyStage`; `syncViews` / `restartView` / `popIn` re-apply `latestStage`. `Stage.tsx` already sets `overlayOpen` when `dialog.id !== 'none'`. `layoutPanels` already omits other-tab running accounts. Do not re-filter in `syncViews`.

### Relevant Files

- `src/shared/gameViewPlacement.ts` — create only if a keep-alive knob ships
- `src/shared/gameViewPlacement.test.ts` — create only if the module ships
- `src/main/views.ts` — `applyStage` paint vs park/detach; do not change `destroyView` / `createView` session rules unless a knob ships, and then only placement

### Dependent Files

- `src/main/isolationVerify.ts` — must stay green if `views.ts` ships; do not rewrite
- `src/renderer/src/components/Stage.tsx` — already reports overlay/panels; do not add chrome
- `src/shared/layout.ts` — holes unchanged
- `src/shared/workspace.ts` — close vs running unchanged
- `src/shared/**/*.test.ts` — existing close/partition/layout tests must stay green
- `src/main/index.ts` — do not edit command-line switches

### Related ADRs

- [ADR-001: Invisible keep-alive, same workflow](adrs/adr-001.md) — no inject / always-paint / new chrome
- [ADR-002: Off-screen park, spike-gated keep-alive](adrs/adr-002.md) — ship rule; park then detach

## Deliverables

- Placement matching the ship rule, or an explicit non-ship with no paint-policy diff
- Automated gates green
- Updated `memory/MEMORY.md` and `memory/task_02.md` when warranted
- `reports/task_02.md` final evidence report

## Tests

### Unit Tests

- [ ] Given `gameViewPlacement` ships: popped-out → paint; panel ≥ 8×8 and `overlayOpen` false → paint; no panel → park; overlay true → park; 7×7 panel → park
- [ ] Given existing `src/shared/workspace.test.ts` close/import fixtures, when this slice lands, then close still uses status `closed` (no new account state)
- [ ] Given `src/shared/partition.test.ts`, when this slice lands, then `persist:opsource-account-{id}` is unchanged
- [ ] Given `src/shared/layout.test.ts`, when another tab or `single` layout, then off-stage accounts stay absent from `layoutPanels`
- [ ] If no knob ships: no new shared module; existing shared tests stay green

### Integration Tests

- [ ] Not applicable — no new IPC or Electron CI job (TechSpec Tests)

### Platform or Manual Evidence

- [ ] If a knob shipped: note that returning to the account must not `loadURL`; Windows in-game G-01/G-02 remains operator evidence, not CI
- [ ] If the executor cannot run Windows dogfood: document the limitation and continue; automated gates still required
- [ ] If no knob passed / baseline already passed: platform keep-alive evidence is N/A beyond the non-ship; report that

### Verification Commands

- `pnpm test`
- `pnpm typecheck`
- `pnpm verify:isolation` when `src/main/views.ts` production paint ships; otherwise `pnpm test` and `pnpm typecheck` only
- Repository gate: `pnpm test` ; `pnpm typecheck` ; `pnpm verify:isolation` if `views.ts` shipped

## Rollout

- N/A for schema/migration — no snapshot field. Always-on for a shipped knob. Rollback is a code revert of `views.ts` / optional `gameViewPlacement`. No chrome to roll back.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence (shipped knob or documented non-ship).
- Focused tests and repository gates pass to terminal exit.
- Coverage: new `gameViewPlacement` tests cover the TechSpec cases when the module ships; Electron `applyStage` is not Vitest-measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
