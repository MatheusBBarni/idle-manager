---
status: completed
title: Journal Windows don't-paint knobs
type: spike
complexity: medium
dependencies:
  - task_01
---

# Task 03: Journal Windows don't-paint knobs

## Overview

An operator on a shared Windows PC needs to know whether detaching unpainted running views frees Task Manager RAM **without** stopping idle ticks. Primary **F-07** (also G-01, G-02, F-01, F-02). This spike only journals pass/fail for two knobs. It gives up production `applyStage` changes. It depends on task_01 so the journal can use honest chrome totals alongside Task Manager.

## Source Artifacts

- PRD: `.spec-finder/tasks/running-session-performance/_prd.md`
- TechSpec: `.spec-finder/tasks/running-session-performance/_techspec.md`

<critical>
- Read `.spec-finder/tasks/running-session-performance/_prd.md`, `.spec-finder/tasks/running-session-performance/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** today's attach-and-hide behavior (off-stage `setVisible(false)`, view remains a `contentView` child)
- **When** the spike measures knob 1 (off-stage `removeChildView` while `webContents` stay alive) and knob 2 (chrome minimized or hidden, same detach)
- **Then** the packet journal records pass or fail per knob using TechSpec Sequencing / Failure
- **Given** a local fixture page (not a game origin)
- **When** a knob is under test
- **Then** pass requires Task Manager working set lower than the same-session baseline **and** `setInterval` still firing **and** `document.visibilityState === 'visible'`
- **Given** the execution environment is not Windows, or Task Manager / a live window cannot be used
- **When** the spike cannot be measured
- **Then** both knobs are **fail** (not pass); the limitation is documented; production `src/` paint policy is unchanged

## Out of Scope

- **Production don't-paint in `applyStage`** — task_04
- **Minimize/show listeners in `index.ts`** — task_04
- **Park, auto-sleep, live cap, metrics redesign** — already task_01 / PRD Out of Scope
- **Removing Chromium switches or `backgroundThrottling: true`** — TechSpec Non-Goals
- **`--verify-live-diet` or any new Electron CLI / `pnpm` script** — TechSpec Non-Goals
- **`executeJavaScript` into game origins** — TechSpec Security

<requirements>
1. MUST journal knob 1 and knob 2 separately against TechSpec Sequencing / ADR-002 fail-closed rules.
2. MUST use a local fixture, not a game document, for visibility and timer probes.
3. MUST treat a knob as fail if Task Manager does not drop, if `visibilityState` is not `visible`, if the interval stalls, or if Windows evidence cannot run.
4. MUST NOT edit `src/main/views.ts` paint policy, Chromium switches, or `backgroundThrottling`.
5. MUST record baseline (including task_01 chrome totals when available) and the two knob measurements in `memory/task_03.md` so task_04 can read pass/fail without rediscovery.
6. SHOULD leave `pnpm verify:isolation` unrun unless this spike accidentally touches partitions (it must not).
7. SHOULD not infer pass from macOS Activity Monitor.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| F-07, G-01, G-02 | Prove a live farm can cost less without pausing | spike journal Task Manager |
| US-02, F-02 | Timers and visibility stay live | fixture interval + `visibilityState` |
| TechSpec Sequencing 2 | No production diet yet | no `src/` paint-policy diff |
| ADR-002 | Per-knob fail-closed; no blur-as-occlusion | journal fields |
| Constraints | No telemetry; no game injection | fixture only |

## Subtasks

- [ ] 03.1 Capture same-session baseline: ≥3 running, at least one off-stage, Task Manager, chrome totals from task_01, fixture interval, `visibilityState`
- [ ] 03.2 Measure knob 1 (off-stage detach, contents alive) against the criterion
- [ ] 03.3 Measure knob 2 (chrome minimized/hidden detach) against the criterion
- [ ] 03.4 Write per-knob pass/fail plus environment limitations into memory and the final report
- [ ] 03.5 Confirm production paint policy is unchanged; run the repository test gate

## Implementation Details

Follow `.spec-finder/tasks/running-session-performance/_techspec.md` Contracts (`shouldPaintGameView` as the intended knob, not shipped), Failure (spike rows), Sequencing step 2, and ADR-002. Do not paste signatures.

Prior packet `.spec-finder/tasks/live-account-ram/` already fail-closed both knobs on Darwin. This spike must be re-run; do not copy that fail as Windows evidence, and do not copy a macOS pass.

### Relevant Files

- `.spec-finder/tasks/running-session-performance/memory/task_03.md` — journal
- `.spec-finder/tasks/running-session-performance/memory/MEMORY.md` — handoff pass/fail for task_04

### Dependent Files

- `src/main/views.ts` — read-only this slice
- `src/main/index.ts` — read-only this slice
- `src/main/metrics.ts` — chrome totals from task_01 may be recorded; do not change paint policy

### Related ADRs

- [ADR-001: Honest cost, then quieter farm](adrs/adr-001.md) — diet is evidence-gated
- [ADR-002: Metrics chrome + don't-paint](adrs/adr-002.md) — fail-closed knobs; flags unchanged

## Deliverables

- Per-knob pass/fail journal
- No production paint-policy diff
- Updated memory
- `reports/task_03.md` final evidence report

## Tests

### Unit Tests

- [ ] Not applicable — spike journals Windows Task Manager / visibility; no new shared logic required
- [ ] Given `pnpm test`, when this spike finishes, then existing shared tests still pass (no accidental src edits)

### Integration Tests

- [ ] Not applicable — no new IPC / Electron CI (TechSpec Tests)

### Platform or Manual Evidence

- [ ] Knob 1 pass/fail recorded with the TechSpec criterion, or **fail** if Windows evidence cannot run
- [ ] Knob 2 pass/fail recorded the same way
- [ ] If the executor cannot run Windows Task Manager / a live window: both knobs **fail**; document the limitation; continue with automated gates

### Verification Commands

- `pnpm test`
- `pnpm typecheck`
- Repository gate: `pnpm test` ; `pnpm typecheck`

## Rollout

- N/A — no production behavior change. task_04 is the only paint-policy ship path.

## Success Criteria

- Mapped acceptance and requirements are satisfied with a pass/fail journal (including fail-closed when Windows cannot run).
- Focused tests and repository gate pass to terminal exit.
- Coverage: not measurable for the spike itself.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
