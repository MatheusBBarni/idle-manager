---
status: pending
title: Don't-paint running views that passed the spike
type: backend
complexity: medium
dependencies:
  - task_01
---

# Task 02: Don't-paint running views that passed the spike

## Overview

A multi-account operator can leave 3–6 accounts running while using other apps (and while looking at another tab or a single panel) without those unpainted sessions being destroyed or discarded. Primary **US-01** (also US-02, F-01, F-02, F-05, G-01–G-03). This slice ships don't-paint **only** for knobs that passed task_01. It gives up Park chrome, switch surgery, and dieting an on-stage grid.

## Source Artifacts

- PRD: `.spec-finder/tasks/live-account-ram/_prd.md`
- TechSpec: `.spec-finder/tasks/live-account-ram/_techspec.md`

<critical>
- Read `.spec-finder/tasks/live-account-ram/_prd.md`, `.spec-finder/tasks/live-account-ram/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** task_01 marked knob 1 pass
- **When** a running account has no current stage panel (other tab, single layout, overlay, or tiny bounds)
- **Then** its view is not painted (detached / not a drawn child) **and** `webContents` stay alive (not `destroyView`, not reloaded)
- **Given** task_01 marked knob 2 pass
- **When** the chrome window is minimized or not visible
- **Then** non-popped-out running views are unpainted the same way; on restore/show they paint again if they have a panel
- **Given** task_01 marked both knobs fail
- **When** this slice runs
- **Then** `views.ts` / `index.ts` paint policy stay as today; gates still run; no Park control is added
- **Given** a running account the operator closes
- **When** close is used
- **Then** the view is destroyed and the persist jar remains (today’s close)
- **Given** two running accounts of the same origin
- **When** don't-paint is in effect
- **Then** jars stay distinct

## Out of Scope

- **Spike measurement / Task Manager journal** — task_01
- **Park, Memory Saver, live cap, pressure hint, honest RAM chrome** — PRD Out of Scope
- **Relaxing the three Chromium switches or `backgroundThrottling: true`** — TechSpec Non-Goals
- **Blur-as-occlusion, pop-out diet, on-stage grid diet** — TechSpec Non-Goals
- **IPC, snapshot, metrics, preload, renderer chrome, new `pnpm` scripts** — TechSpec Contracts
- **New shared unit-test helper required by evidence A** — TechSpec Tests

<requirements>
1. MUST read task_01 pass/fail and implement only passed knobs; if none passed, MUST NOT change paint policy.
2. MUST follow TechSpec Contracts `shouldPaintGameView` / changed `applyStage` boundaries: detach ≠ destroy; popped-out views stay painted in their window.
3. MUST keep `disable-renderer-backgrounding`, `disable-background-timer-throttling`, `disable-backgrounding-occluded-windows`, and `backgroundThrottling: false`.
4. MUST re-`applyStage` on restore/show/hide/minimize if knob 2 shipped, so holes are not left blank.
5. MUST leave `partitionForAccount`, `destroyView` close path, `restartView` crash path, renderer, and IPC unchanged.
6. SHOULD not export the paint predicate or add a workspace field.
7. SHOULD not require `pnpm verify:isolation` to change behavior — only to stay green.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-01, F-01, G-01 | Unpainted farm can leave the PC usable | knob 2 if passed; dogfood note |
| US-02, F-02, G-02 | Running still ticks; no surprise reload | detach not destroy; flags unchanged |
| US-03, F-03 | Close still drops the live view, keeps login | `destroyView` untouched |
| US-04, F-04 | Isolation unchanged | `pnpm verify:isolation` |
| G-03, F-05 | No new chrome | renderer untouched |
| TechSpec Sequencing 2–4 | Diet only after spike; then gates; then dogfood | this task |
| ADR-002 | Fail-closed per knob | skip failed knobs |

## Subtasks

- [ ] 02.1 Apply task_01 journal: ship knob 1, knob 2, both, or neither (neither = no paint-policy diff)
- [ ] 02.2 If knob 1 passed, off-stage / overlay / tiny-bounds running views don't-paint while contents live
- [ ] 02.3 If knob 2 passed, minimized/hidden chrome don't-paint and restore/show re-paints on-stage views
- [ ] 02.4 Confirm close, crash restart, pop-out, partitions, and chrome UI are unchanged
- [ ] 02.5 Run focused tests plus `pnpm test`, `pnpm typecheck`, and `pnpm verify:isolation`

## Implementation Details

Follow `.spec-finder/tasks/live-account-ram/_techspec.md` Contracts, Architecture, Failure, Sequencing steps 2–4, and ADR-002. Do not paste signatures or diagrams.

Callers today: `ops:reportStage` → `applyStage`; `syncViews` / `restartView` / `popIn` re-apply `latestStage`; `ops:window` `min` minimizes without a stage refresh (`src/main/index.ts`). Isolation proof stays `src/main/isolationVerify.ts`.

### Relevant Files

- `src/main/views.ts` — `applyStage` paint vs detach; do not change `destroyView` / `createView` session rules
- `src/main/index.ts` — minimize/restore/show/hide re-apply **only if knob 2 passed**; do not edit command-line switches

### Dependent Files

- `src/main/isolationVerify.ts` — must stay green; do not rewrite
- `src/main/metrics.ts` — unchanged (status bar still renderer working sets)
- `src/renderer/src/components/Stage.tsx` — already reports `overlayOpen` / panels; do not add chrome
- `src/shared/layout.ts` — already omits off-tab / single-layout accounts from panels; do not re-filter in `syncViews`
- `src/shared/workspace.ts` — close vs running unchanged
- `src/shared/**/*.test.ts` — existing close/partition/layout tests must stay green

### Related ADRs

- [ADR-001: Invisible live-farm diet](adrs/adr-001.md) — no fake control if diet cannot ship
- [ADR-002: Don't-paint live views](adrs/adr-002.md) — detach; flags unchanged; no blur

## Deliverables

- Paint policy matching passed knobs, or an explicit non-ship with no paint-policy diff
- Automated gates green
- Updated `memory/MEMORY.md` and `memory/task_02.md` when warranted
- `reports/task_02.md` final evidence report

## Tests

### Unit Tests

- [ ] Given existing workspace close/import fixtures in `src/shared/workspace.test.ts`, when this slice lands, then close still destroys only via status `closed` (no new account state)
- [ ] Given `src/shared/partition.test.ts`, when this slice lands, then `persist:opsource-account-{id}` is unchanged
- [ ] Given `src/shared/layout.test.ts`, when layout is `single` or another tab, then off-stage accounts are still absent from `layoutPanels` (renderer holes unchanged)
- [ ] Not applicable to a new `shouldPaintGameView` export — TechSpec keeps it internal; coverage is not measurable inside Electron `views.ts`

### Integration Tests

- [ ] Not applicable — no new IPC or Electron CI job (TechSpec Tests)

### Platform or Manual Evidence

- [ ] If a knob shipped: dogfood note that running accounts did not surprise-reload (G-02); Windows G-01 journal remains operator evidence, not CI
- [ ] If the executor cannot run Windows dogfood: document the limitation and continue; automated gates still required
- [ ] If no knob passed: platform diet evidence is N/A; report the non-ship

### Verification Commands

- `pnpm test`
- `pnpm typecheck`
- `pnpm verify:isolation` (repository isolation gate; required because this slice can touch views)
- Repository gate: `pnpm test` ; `pnpm typecheck` ; `pnpm verify:isolation`

## Rollout

- N/A for schema/migration — no snapshot field. Always-on for shipped knobs. Rollback is a code revert of `views.ts` / window listeners. No README/chrome copy.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence (shipped knobs or documented non-ship).
- Focused tests and repository gates pass to terminal exit.
- Coverage: existing shared tests stay green; new Electron paint logic is not Vitest-measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
