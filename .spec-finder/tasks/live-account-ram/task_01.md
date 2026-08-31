---
status: pending
title: Journal Windows don't-paint knobs
type: spike
complexity: medium
dependencies: []
---

# Task 01: Journal Windows don't-paint knobs

## Overview

An operator on a shared Windows PC needs to know whether detaching unpainted running views frees Task Manager RAM **without** stopping idle ticks. Primary **F-01** (also G-01, G-02, F-02). This spike only journals pass/fail for two knobs. It gives up production `applyStage` changes.

## Source Artifacts

- PRD: `.spec-finder/tasks/live-account-ram/_prd.md`
- TechSpec: `.spec-finder/tasks/live-account-ram/_techspec.md`

<critical>
- Read `.spec-finder/tasks/live-account-ram/_prd.md`, `.spec-finder/tasks/live-account-ram/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** today's attach-and-hide behavior (off-stage `setVisible(false)`, view remains a `contentView` child)
- **When** the spike measures knob 1 (off-stage `removeChildView` while `webContents` stay alive) and knob 2 (chrome minimized or hidden, same detach)
- **Then** the packet journal records pass or fail per knob using `.spec-finder/tasks/live-account-ram/_techspec.md` Sequencing
- **Given** a local fixture page (not a game origin)
- **When** a knob is under test
- **Then** pass requires Task Manager working set lower than the same-session baseline **and** `setInterval` still firing **and** `document.visibilityState === 'visible'`
- **Given** the execution environment is not Windows, or Task Manager / a live window cannot be used
- **When** the spike cannot be measured
- **Then** both knobs are **fail** (not pass); the limitation is documented; production `src/` is unchanged

## Out of Scope

- **Production don't-paint in `applyStage`** — task_02
- **Minimize/show listeners in `index.ts`** — task_02
- **Park, auto-sleep, live cap, pressure chrome, metrics redesign** — PRD Out of Scope
- **Removing Chromium switches or `backgroundThrottling: true`** — TechSpec Non-Goals
- **`--verify-live-diet` or any new Electron CLI / `pnpm` script** — TechSpec Non-Goals / contract A
- **`executeJavaScript` into game origins** — TechSpec Security
- **Pop-out diet, on-stage grid diet, blur-as-occlusion** — TechSpec Non-Goals

<requirements>
1. MUST journal knob 1 and knob 2 separately against TechSpec Sequencing / ADR-002 fail-closed rules.
2. MUST use a local fixture, not a game document, for visibility and timer probes.
3. MUST treat a knob as fail if Task Manager does not drop, if `visibilityState` is not `visible`, if the interval stalls, or if Windows evidence cannot run.
4. MUST NOT edit `src/main/views.ts`, `src/main/index.ts`, IPC, snapshot types, renderer, or `package.json` scripts.
5. MUST NOT add Chromium switch changes or `backgroundThrottling: true` “to make RAM drop.”
6. SHOULD record baseline (3 running, some off-stage) and the two knob measurements in `memory/task_01.md` so task_02 can read pass/fail without rediscovery.
7. SHOULD leave `pnpm verify:isolation` unrun unless this spike accidentally touches partitions (it must not).
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| F-01, G-01 | Prove a live farm can cost less without closing panels | spike journal Task Manager |
| G-02, F-02, US-02 | Timers and visibility stay live | fixture interval + `visibilityState` |
| TechSpec Sequencing 1 | No production diet yet | no `src/` paint-policy diff |
| ADR-002 | Per-knob fail-closed; no blur-as-occlusion | journal fields |
| Constraints | No telemetry; no game injection | fixture only |

## Subtasks

- [ ] 01.1 Capture same-session baseline: ≥3 running accounts, at least one off-stage, Task Manager working set, fixture interval, `visibilityState`
- [ ] 01.2 Measure knob 1 (off-stage detach, contents alive) against the criterion
- [ ] 01.3 Measure knob 2 (chrome minimized/hidden detach) against the criterion
- [ ] 01.4 Write per-knob pass/fail plus environment limitations into memory and the final report
- [ ] 01.5 Confirm production `src/` and package scripts are unchanged; run the repository test gate

## Implementation Details

Follow `.spec-finder/tasks/live-account-ram/_techspec.md` Contracts, Architecture data flow (Windows spike), Failure (spike rows), Sequencing step 1, and ADR-002. Do not paste those interfaces here.

Today off-stage views already `setVisible(false)` but stay children of `chromeWindow.contentView` (`applyStage`). Command-line switches and `backgroundThrottling: false` stay on; this spike must not flip them.

### Relevant Files

- `src/main/views.ts` — **read-only**: current `applyStage` / `syncViews` / `destroyView` (verify what “today” is)
- `src/main/index.ts` — **read-only**: switches; `ops:window` `min`; `ops:reportStage`
- `.spec-finder/tasks/live-account-ram/_techspec.md` — spike criterion
- `.spec-finder/tasks/live-account-ram/adrs/adr-002.md` — fail-closed knobs

### Dependent Files

- `.spec-finder/tasks/live-account-ram/memory/task_02.md` — will consume pass/fail (create only the task_01 memory/report in this slice)
- `src/main/isolationVerify.ts` — do not run unless partitions change (they must not)

### Related ADRs

- [ADR-001: Invisible live-farm diet](adrs/adr-001.md) — if both knobs fail, stop; do not invent Park
- [ADR-002: Don't-paint live views](adrs/adr-002.md) — two knobs; Windows has no occlusion event

## Deliverables

- Spike journal: baseline + knob 1 + knob 2 + pass/fail + environment
- No production code change
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [ ] Not applicable — no new testable production logic; this spike must not add `src/shared` helpers.

### Integration Tests

- [ ] Not applicable — no new Electron CLI or IPC.

### Platform or Manual Evidence

- [ ] Windows: baseline vs knob 1 vs knob 2 with Task Manager working set, fixture `setInterval`, `document.visibilityState === 'visible'`
- [ ] If Windows / Task Manager / a live window is unavailable: document the limitation, mark **both knobs fail**, do not pass knobs by inference, continue to the automated gate

### Verification Commands

- `pnpm test`
- `pnpm test` (repository gate; production tree must still pass because this task does not diet)

## Rollout

- N/A — journal only; no operator-facing change and no migration.

## Success Criteria

- Mapped acceptance and requirements are satisfied with a per-knob decision.
- `pnpm test` passes to terminal exit.
- Coverage not applicable (no new testable logic).
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence, environment limits, and unresolved risks.
