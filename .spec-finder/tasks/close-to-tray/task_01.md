---
status: pending
title: Add Settings Quit that always exits
type: frontend
complexity: high
dependencies: []
---

# Task 01: Add Settings Quit that always exits

## Overview

A live farm must be leavable on purpose from Settings because later Close will not exit. Primary **US-04** (Settings path of F-05, G-04). This slice ships `WindowCommand` `'quit'`, main `beginQuit()`, a Settings control, and i18n keys `quit` and `trayRestore`. It gives up hide-to-tray, the interceptor, and single-instance.

## Source Artifacts

- PRD: `.spec-finder/tasks/close-to-tray/_prd.md`
- TechSpec: `.spec-finder/tasks/close-to-tray/_techspec.md`

<critical>
- Read `.spec-finder/tasks/close-to-tray/_prd.md`, `.spec-finder/tasks/close-to-tray/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** accounts are running and the main window is visible
- **When** I Quit from Settings
- **Then** the app exits (ticks stop because the operator quit)
- **Given** the same live farm
- **When** I Close the window
- **Then** Close still closes as today (this slice does not intercept)
- **Given** chrome types
- **When** `windowControl` is called with `'quit'`
- **Then** main runs `beginQuit()` even if the window reference is missing

## Out of Scope

- **Close interceptor, hide, skipTaskbar, Tray** — task_02
- **Updater `quitAndInstall` allow-close hook** — task_02 (interceptor is what can block Apply)
- **Single-instance lock** — task_03
- **trayPolicy / running-count tooltip logic** — task_02
- **Partitions, `workspace.ts`, game-view preload** — PRD constraints; do not touch
- **Tray farm console, balloons, start-hidden** — PRD out of scope

<requirements>
1. MUST add `'quit'` to `WindowCommand` per TechSpec Contracts and handle `ops:window` `'quit'` by calling `beginQuit()`.
2. MUST implement `beginQuit()` so a later Close interceptor can see quitting (TechSpec Sequencing 2–3); do not hide the window here.
3. MUST add a Settings control that calls `windowControl('quit')` while the window is open (US-04).
4. MUST add i18n keys `quit` and `trayRestore` to en, pt, es, and zh-Hans and extend `i18n.test.ts` frozen dictionaries.
5. SHOULD keep Close / Minimize / Maximize handlers unchanged.
6. MUST NOT add snapshot fields or `WorkspaceAction`s for quit or dismiss.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-04, F-05 | Settings Quit exits a live farm | Settings control + `beginQuit` |
| G-04 | Explicit Quit exists before Close changes meaning | this slice |
| TechSpec Contracts `WindowCommand` | `'quit'` on `ops:window` | typecheck |
| TechSpec Sequencing 2 | Quit IPC before tray intercept | this task |
| ADR-002 | One quit seam for Settings (tray/Apply later) | `beginQuit` |
| Constraints | No telemetry; no jar wipe | review |

## Subtasks

- [ ] 01.1 Extend `WindowCommand` and preload so chrome can request Quit.
- [ ] 01.2 Add `beginQuit()` in main and wire `ops:window` `'quit'` without changing Close.
- [ ] 01.3 Add Settings Quit using `quit` copy in all four locales; add `trayRestore` keys for task_02.
- [ ] 01.4 Prove i18n dictionaries stay aligned; typecheck the new command.

## Implementation Details

Use TechSpec Contracts (`WindowCommand`, `beginQuit`), Architecture (`appSession.ts` new, Settings, ipc/preload), and Sequencing step 2. Do not paste those signatures here.

`trayRestore` is keys-only in this slice so task_02 does not fight `i18n.test.ts`.

### Relevant Files

- `src/shared/ipc.ts` — `WindowCommand` union
- `src/preload/index.ts` — existing `windowControl` already forwards the union
- `src/renderer/src/components/Settings.tsx` — General settings; add Quit
- `src/shared/i18n.ts` — add `quit`, `trayRestore`
- `src/shared/i18n.test.ts` — frozen per-locale keys
- `src/main/appSession.ts` — create: quitting flag + `beginQuit()`
- `src/main/index.ts` — `'quit'` branch; do not intercept `'close'` yet

### Dependent Files

- `src/preload/index.d.ts` — re-exports `@shared/ipc`; no extra API if types flow
- `src/renderer/src/components/Chrome.tsx` — Close stays `windowControl('close')`
- `src/main/updater.ts` — Apply hook is task_02

### Related ADRs

- [ADR-001: Dismissed-farm presence](adrs/adr-001.md) — Quit is how a live farm leaves
- [ADR-002: Hide-in-place tray session](adrs/adr-002.md) — `beginQuit` before any Close intercept

## Deliverables

- Settings Quit exits the process; Close unchanged
- i18n keys `quit` and `trayRestore` in four locales
- `pnpm test` and `pnpm typecheck` clean
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [ ] Given the four locale dictionaries, when keys are listed, then `quit` and `trayRestore` exist and `i18n.test.ts` frozen maps include them.
- [ ] Given `WindowCommand`, when chrome types `windowControl('quit')`, then TypeScript accepts it (no remaining `'min' | 'max' | 'close' | 'isMaximized'`-only alias).

### Integration Tests

- [ ] Not applicable — Vitest is `src/shared/**/*.test.ts` only; Electron Quit is not in that harness.

### Platform or Manual Evidence

- [ ] If a Windows (or local Electron) session is available: start ≥1 account, Quit from Settings, process exits. If the host cannot run the app, record that limitation in the report and continue with the automated gate.

### Verification Commands

- `pnpm test`
- `pnpm typecheck`

## Rollout

- Additive IPC. Existing chrome that never sends `'quit'` is unchanged. No migration.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for changed testable logic when measurable (`i18n` key presence is the measurable part).
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
