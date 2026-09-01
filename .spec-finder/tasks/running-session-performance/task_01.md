---
status: completed
title: Show whole-app cost in chrome
type: frontend
complexity: high
dependencies: []
---

# Task 01: Show whole-app cost in chrome

## Overview

An operator on a shared Windows PC needs chrome RAM/CPU to reflect the whole app (including GPU when present) so close-for-RAM is not based on a partial renderer sum or a shell FPS number. Primary **US-05** (also F-05, G-03). This slice gives up the quieter-farm diet and the 7th-start warning.

## Source Artifacts

- PRD: `.spec-finder/tasks/running-session-performance/_prd.md`
- TechSpec: `.spec-finder/tasks/running-session-performance/_techspec.md`

<critical>
- Read `.spec-finder/tasks/running-session-performance/_prd.md`, `.spec-finder/tasks/running-session-performance/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** several accounts running
- **When** the operator looks at status cost
- **Then** aggregate RAM/CPU include all `getAppMetrics()` processes, GPU is shown only when present (`null` omitted, never a fake `0`), and FPS is not a chrome `requestAnimationFrame` number
- **Given** no GPU process in metrics
- **When** chrome renders cost
- **Then** the GPU line is omitted/unknown, not `0 B` / `0.0%`

## Out of Scope

- **7th-start warning** — task_02
- **Don't-paint spike or `applyStage`** — task_03 / task_04
- **Park, hard cap, telemetry, new IPC channel** — PRD / TechSpec Non-Goals
- **`workspace.ts` / snapshot fields** — TechSpec Data model
- **Sidebar per-account renderer stats redesign** — keep today's per-account CPU/RAM; whole-app totals live in status

<requirements>
1. MUST implement TechSpec Contracts `AggregateMetrics` / `MetricsPayload` (`gpuCpu` / `gpuMemoryBytes` nullable; `fps: number | null`; aggregate totals from all processes).
2. MUST extract a pure summarizer in `src/shared` so Vitest can cover GPU-null vs GPU-present without Electron.
3. MUST stop the chrome rAF FPS loop in `Shell.tsx` and MUST NOT display fabricated FPS when `fps` is null.
4. MUST add i18n keys for GPU / omitted GPU in `en`, `pt`, `es`, and `zh-Hans`.
5. MUST NOT edit `src/main/views.ts` paint policy or Chromium switches.
6. SHOULD leave `ops:fps` handler inert if the renderer stops sending (do not require an `index.ts` rewrite).
7. SHOULD keep per-account `AccountMetrics` as renderer pid stats (TechSpec Architecture).
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-05, F-05, G-03 | Actable whole-app cost including GPU | StatusBar + summarizer tests |
| TechSpec Contracts | Payload shape; gpu null not 0; fps null | `src/shared` unit tests |
| TechSpec Sequencing 1 | Metrics chrome before diet | no `views.ts` paint diff |
| ADR-002 | Widen `ops:metrics`; remove rAF meter | Shell + metrics.ts |
| Constraints | No overlay over stage | status bar only |

## Subtasks

- [ ] 01.1 Widen shared `AggregateMetrics` / `MetricsPayload` per TechSpec Contracts
- [ ] 01.2 Pure-summarize `getAppMetrics`-like rows (all-process totals, GPU null vs present)
- [ ] 01.3 `collectMetrics` uses the summarizer; per-account renderer stats stay pid-based
- [ ] 01.4 Remove chrome rAF FPS; status shows process RAM/CPU and GPU only when not null
- [ ] 01.5 i18n four locales + focused tests and repository gates

## Implementation Details

Follow `.spec-finder/tasks/running-session-performance/_techspec.md` Contracts, Architecture, Failure (no GPU process), and Sequencing step 1. Do not paste signatures or diagrams.

Callers today: `setInterval` in `src/main/index.ts` → `collectMetrics` → `ops:metrics` → `useAppStore.setMetrics` → `StatusBar` / `Sidebar`. `Shell.tsx` currently rAF-loops `reportFps`.

### Relevant Files

- `src/shared/types.ts` — `AggregateMetrics` / `MetricsPayload`
- `src/shared/metricsAggregate.ts` — create; pure summarizer
- `src/shared/metricsAggregate.test.ts` — create
- `src/main/metrics.ts` — map `app.getAppMetrics()` into the summarizer
- `src/renderer/src/components/Shell.tsx` — remove rAF FPS loop
- `src/renderer/src/components/StatusBar.tsx` — whole-app + GPU; no fake FPS
- `src/shared/i18n.ts` — GPU / unknown copy

### Dependent Files

- `src/shared/i18n.test.ts` — frozen keys must include any new messages
- `src/renderer/src/components/Sidebar.tsx` — still reads `perAccount`; do not require a redesign
- `src/preload/index.ts` / `src/shared/ipc.ts` — `onMetrics` still `MetricsPayload`; no new channel
- `src/main/views.ts` — do not touch

### Related ADRs

- [ADR-001: Honest cost, then quieter farm](adrs/adr-001.md) — cost chrome ships even if diet cannot
- [ADR-002: Metrics chrome + don't-paint](adrs/adr-002.md) — widen payload; fps null; gpu null not 0

## Deliverables

- Honest status cost matching TechSpec Contracts
- Unit tests for summarizer + i18n keys
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [ ] Given process rows with a `GPU` type, when summarized, then `gpuMemoryBytes` / `gpuCpu` match that row and `memoryBytes` / `cpu` include every row
- [ ] Given process rows with no `GPU` type, when summarized, then `gpuMemoryBytes` and `gpuCpu` are `null` (not `0`)
- [ ] Given a payload with `fps: null`, when status renders, then no numeric FPS is shown (review plus no rAF sender)
- [ ] Given new i18n keys, when `src/shared/i18n.test.ts` runs, then all four locales define them

### Integration Tests

- [ ] Not applicable — no new IPC channel (TechSpec Tests)

### Platform or Manual Evidence

- [ ] Not required for this slice's gate. Windows G-03 journal vs Task Manager is dogfood after ship; if the executor cannot compare Task Manager, document the limitation and continue

### Verification Commands

- `pnpm test`
- `pnpm typecheck`
- Repository gate: `pnpm test` ; `pnpm typecheck`

## Rollout

- N/A for schema/migration — no snapshot field. Main and renderer must ship together (`AggregateMetrics` shape). Rollback is a code revert of payload consumers. No README required.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for the new summarizer when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
