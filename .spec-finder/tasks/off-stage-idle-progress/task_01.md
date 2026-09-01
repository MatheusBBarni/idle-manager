---
status: pending
title: Journal keep-alive hide knobs
type: spike
complexity: medium
dependencies: []
---

# Task 01: Journal keep-alive hide knobs

## Overview

A maintainer needs to know which hide technique keeps a running account’s page visible and ticking without covering chrome, so production hide is not a guess. Primary **F-01** (also G-01, G-02, F-02). This spike only journals pass/fail for baseline `setVisible(false)`, off-screen park, and `removeChildView`. It gives up production `applyStage` changes.

## Source Artifacts

- PRD: `.spec-finder/tasks/off-stage-idle-progress/_prd.md`
- TechSpec: `.spec-finder/tasks/off-stage-idle-progress/_techspec.md`

<critical>
- Read `.spec-finder/tasks/off-stage-idle-progress/_prd.md`, `.spec-finder/tasks/off-stage-idle-progress/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** today's attach-and-hide behavior (off-stage / overlay `setVisible(false)`, view remains a `contentView` child)
- **When** the spike measures baseline hide, off-screen park, and `removeChildView` without `setVisible(false)`
- **Then** the packet journal records pass or fail per knob using TechSpec Contracts ship rule and Failure
- **Given** a local fixture page (not a game origin)
- **When** a knob is under test
- **Then** pass requires `document.visibilityState === 'visible'` **and** `setInterval` still incrementing over at least 2s **and** the view does not cover the stage or overlay
- **Given** a live Electron window cannot be used
- **When** the spike cannot be measured
- **Then** every knob is **fail** (not pass); the limitation is documented; production `src/` paint policy is unchanged

## Out of Scope

- **Production park or detach in `applyStage`** — task_02
- **`gameViewPlacement` production module** — task_02
- **RAM / Task Manager diet** — PRD Out of Scope (`running-session-performance`)
- **Game `executeJavaScript`, inject, always-paint over dialogs** — PRD / TechSpec Non-Goals
- **New IPC, `StageReport` fields, chrome, `pnpm` scripts** — TechSpec Non-Goals
- **Removing Chromium switches or `backgroundThrottling: true`** — TechSpec Non-Goals
- **Windows in-game dogfood as this spike’s pass criterion** — PRD G-01/G-02 after a shipped knob

<requirements>
1. MUST journal baseline, park, and detach separately against `.spec-finder/tasks/off-stage-idle-progress/_techspec.md` Contracts (fixture pass and ship rule).
2. MUST use a local privileged origin fixture, not a game document, for visibility and timer probes (same class as `isolationVerify`, not that CLI).
3. MUST treat a knob as fail if `visibilityState` is not `visible`, if the interval stalls, if the view covers stage/overlay, or if a live window cannot be used.
4. MUST NOT treat Task Manager / RAM drop as a pass or fail criterion.
5. MUST NOT edit `src/main/views.ts` paint policy, Chromium switches, or `backgroundThrottling`.
6. MUST record baseline plus the two keep-alive knobs in `memory/task_01.md` so task_02 can apply the ship rule without rediscovery.
7. SHOULD leave `pnpm verify:isolation` unrun unless this spike accidentally touches partitions (it must not).
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| F-01, G-01, G-02 | Prove which hide keeps ticks without covering chrome | fixture journal |
| F-02, US-02 | Overlay hide must not cover chrome | cover probe |
| TechSpec Sequencing 2 | No production hide yet | no `src/` paint-policy diff |
| ADR-002 | Per-knob fail-closed; park preferred later | journal fields |
| Constraints | No telemetry; no game injection | fixture only |

## Subtasks

- [ ] 01.1 Capture same-session baseline: running views, at least one off-stage or overlay-hidden, fixture `visibilityState`, `setInterval`, cover
- [ ] 01.2 Measure off-screen park (still a child, `setVisible(true)`, bounds off chrome, contents ≥ 8×8) against the criterion
- [ ] 01.3 Measure detach (`removeChildView`, do not `setVisible(false)`) against the criterion
- [ ] 01.4 Write per-knob pass/fail plus environment limitations into memory and the final report
- [ ] 01.5 Confirm production paint policy is unchanged; run the repository test gate

## Implementation Details

Follow `.spec-finder/tasks/off-stage-idle-progress/_techspec.md` Contracts (fixture pass, ship rule), Failure, Sequencing step 2, and ADR-002. Do not paste signatures.

Today `applyStage` (`src/main/views.ts`) sets `setVisible(false)` when there is no panel or `overlayOpen`, or contents `< 8px`; it still `addChildView` when a panel exists. `syncViews` keeps `webContents` until `destroyView`. IsolationVerify already uses `executeJavaScript` on a privileged local origin — reuse that class of fixture, do not probe game origins.

Prior packet `.spec-finder/tasks/running-session-performance/` fail-closed don’t-paint on Darwin Task Manager. This spike must **not** copy that fail, must **not** require Windows, and must **not** use RAM as the criterion.

### Relevant Files

- `.spec-finder/tasks/off-stage-idle-progress/memory/task_01.md` — journal (create if missing; do not overwrite unrelated memory)
- `src/main/views.ts` — read-only current hide (`applyStage`)
- `src/main/isolationVerify.ts` — read-only local-origin probe pattern
- `src/main/index.ts` — read-only Chromium switches / `backgroundThrottling`

### Dependent Files

- `src/renderer/src/components/Stage.tsx` — already reports `overlayOpen` / panels; do not add chrome
- `src/shared/layout.ts` — already omits other-tab accounts from panels; do not edit

### Related ADRs

- [ADR-001: Invisible keep-alive, same workflow](adrs/adr-001.md) — no inject / always-paint
- [ADR-002: Off-screen park, spike-gated keep-alive](adrs/adr-002.md) — knob order and fail-closed ship rule

## Deliverables

- Per-knob pass/fail journal (baseline, park, detach) with environment notes
- No production paint-policy diff
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [ ] Not applicable — spike journals Electron visibility/timers; no new shared logic required

### Integration Tests

- [ ] Not applicable — no new IPC (TechSpec Tests)

### Platform or Manual Evidence

- [ ] Baseline, park, and detach each recorded pass or fail with `visibilityState`, interval, and cover
- [ ] If a live Electron window cannot be used: document the limitation, mark knobs **fail**, continue; automated gate still required
- [ ] Production `src/main/views.ts` paint policy unchanged

### Verification Commands

- `pnpm test`
- Repository gate: `pnpm test`

## Rollout

- N/A — spike does not ship hide. No schema/IPC.

## Success Criteria

- Mapped acceptance and requirements are satisfied with a per-knob journal (or documented fail because no live window).
- Focused tests and repository gate pass to terminal exit.
- Coverage not measurable for this spike; `pnpm test` stays green.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
