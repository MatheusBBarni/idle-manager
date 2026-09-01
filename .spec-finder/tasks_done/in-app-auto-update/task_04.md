---
status: completed
title: Obtain and apply from packaged Windows
type: backend
complexity: high
dependencies:
  - task_01
---

# Task 04: Obtain and apply from packaged Windows

## Overview

A packaged Windows operator obtains a signed build in the background and Apply relaunches onto it; quitting without Apply does not install. Primary **US-03** (also US-02 emit, G-02, G-03, G-05, F-03, F-04, F-07). This slice wires electron-updater 6.x in main. It gives up StatusBar copy and attaching `latest.yml`.

## Source Artifacts

- PRD: `.spec-finder/tasks/in-app-auto-update/_prd.md`
- TechSpec: `.spec-finder/tasks/in-app-auto-update/_techspec.md`

<critical>
- Read `.spec-finder/tasks/in-app-auto-update/_prd.md`, `.spec-finder/tasks/in-app-auto-update/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_04.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** `app.isPackaged` is false or `platform` is not `win32`
- **When** the app starts
- **Then** the updater is not started and status stays `idle`
- **Given** packaged win32
- **When** the updater runs
- **Then** it checks/downloads via GitHub (`autoDownload`) and pushes reduce events over `ops:update` (no notify API)
- **Given** status `ready`
- **When** chrome sends `updateCommand('apply')`
- **Then** workspace is flushed (`saveSnapshot` + `flushAll`) and `quitAndInstall` runs
- **Given** status `ready`
- **When** chrome sends `updateCommand('later')`
- **Then** status becomes `later` (in-memory) and the process does not quit
- **Given** a downloaded update
- **When** the operator quits without Apply
- **Then** `autoInstallOnAppQuit` is false so that quit does not install
- **Given** feed/signature/network failure
- **When** the updater errors
- **Then** status is `idle` with no extra chrome copy

## Out of Scope

- **StatusBar / i18n** — task_03
- **release.yml latest.yml attach** — task_05
- **Disabling publisher signature verification** — ADR-001
- **electron-builder 27 / updater 7 / `checkForUpdatesAndNotify` / `electron-log`** — TechSpec non-goals
- **macOS/Linux updater** — PRD out of scope
- **workspace.ts / partitions / isolationVerify** — do not touch
- **Purchasing a code-signing cert** — ship gate, not this task

<requirements>
1. MUST add `electron-updater` ^6 as a runtime dependency (builder 26 line), not v7.
2. MUST start the updater only when packaged `win32`; map updater events through `reduceUpdateStatus` and `webContents.send('ops:update')`.
3. MUST set `autoInstallOnAppQuit` false; only `apply` when `ready` calls `quitAndInstall` after persist+view flush.
4. MUST keep `verifyUpdateCodeSignature` at packager default (on); do not set it false.
5. MUST no-op `apply`/`later` when not `ready`; errors reduce to `idle`.
6. SHOULD log check/error with `console` only; no telemetry.
7. MUST NOT edit `Stage.tsx` overlay or `workspace.ts`.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-02, F-02 | Background obtain | autoDownload + getting events |
| US-03, F-03, G-02 | Apply-only install | autoInstallOnAppQuit false |
| G-03, F-04 | Survive restart | flush before quitAndInstall |
| US-04 | Later in-memory | reduce later; no persist |
| US-05, F-07, G-05 | Non-win/dev/error idle; signed verify | start gate + fail closed |
| Sequencing 3 | Main updater after IPC types | this task |

## Subtasks

- [x] 04.1 Add `src/main/updater.ts` using electron-updater 6.x and the shared reduce.
- [x] 04.2 Register IPC and start only packaged win32 from `src/main/index.ts`.
- [x] 04.3 Flush persist+views on Apply; quit without Apply does not install.
- [x] 04.4 Add the runtime dependency; do not change isolation code.
- [x] 04.5 Run `pnpm test` and `pnpm typecheck` to terminal exit.

## Implementation Details

Follow TechSpec Architecture (`updater.ts`, data flow), Contracts (errors, commands), Failure table, Sequencing step 3, ADR-001, ADR-003. Do not paste APIs.

### Relevant Files

- `src/main/updater.ts` — create
- `src/main/index.ts` — register + start after window
- `package.json` — `electron-updater` ^6 dependency
- `src/shared/updateStatus.ts` — consume; do not fork the table

### Dependent Files

- `src/main/persistence.ts` — `saveSnapshot` on apply
- `src/main/views.ts` — `flushAll` on apply; do not change partition helpers
- `src/preload/index.ts` — task_01; wire handlers to match
- `electron-builder.yml` — packing globs are task_05

### Related ADRs

- [ADR-001: Windows operator-timed in-app apply, Authenticode as V1 gate](adrs/adr-001.md) — do not disable verify
- [ADR-003: electron-updater 6.x main process + IPC side channel](adrs/adr-003.md) — Apply-only, packaged win32

## Deliverables

- Main updater + IPC handlers
- `electron-updater` ^6 in dependencies
- Updated `memory/MEMORY.md` and `memory/task_04.md` when warranted
- `reports/task_04.md` final evidence report

## Tests

### Unit Tests

- [x] Existing `reduceUpdateStatus` tests still pass (do not weaken later/error → idle).

### Integration Tests

- [ ] Not applicable — no Electron updater job (TechSpec Tests).

### Platform or Manual Evidence

- [ ] G-01 packaged obtain+apply is dogfood after task_05 + signing. If this environment cannot pack Windows, document that and continue with `pnpm test` + `pnpm typecheck`.
- [x] Confirm `checkForUpdatesAndNotify` is not used (source grep).

### Verification Commands

- `pnpm test`
- `pnpm typecheck`

## Rollout

- Client checks only when packaged win32. Do not ship a tag that expects Apply until task_05 attaches `latest.yml` and ADR-001 signing exists. Rollback: stop starting `updater.ts`.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- `pnpm test` and `pnpm typecheck` pass to terminal exit.
- Coverage: shared reduce remains tested; main updater is not in Vitest env.
- `pnpm verify:isolation` is not required unless partition code changed (it must not).
- Memory is current and the final report records exact evidence and unresolved risks.
