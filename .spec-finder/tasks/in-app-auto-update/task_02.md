---
status: pending
title: Spike pack/feed artifact names
type: spike
complexity: medium
dependencies: []
---

# Task 02: Spike pack/feed artifact names

## Overview

Task_05 cannot guess Windows feed globs. Primary **G-01**. This spike records (1) exact `dist/` names for `latest.yml` and blockmap on electron-builder 26 NSIS, and (2) whether current `files` plus `externalizeDepsPlugin` packs `electron-updater`. It gives up implementing the updater or changing CI.

## Source Artifacts

- PRD: `.spec-finder/tasks/in-app-auto-update/_prd.md`
- TechSpec: `.spec-finder/tasks/in-app-auto-update/_techspec.md`

<critical>
- Read `.spec-finder/tasks/in-app-auto-update/_prd.md`, `.spec-finder/tasks/in-app-auto-update/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** electron-builder 26 NSIS config in this repo
- **When** the spike inspects official docs and/or a local pack (`pnpm dist:win` or `--dir` if the environment can)
- **Then** `memory/MEMORY.md` and `memory/task_02.md` name the exact feed artifacts (or state they are not produced)
- **Given** `electron-builder.yml` `files` and `externalizeDepsPlugin`
- **When** the spike checks whether a production dependency would land in the asar
- **Then** memory records include vs exclude and the glob task_05 must use
- **Given** Windows pack cannot run in this environment
- **When** docs + config inspection is the only evidence
- **Then** the report documents that limitation and still records a decision criterion result (include/exclude + expected names)

## Out of Scope

- **Adding electron-updater or changing `release.yml`** — task_04 / task_05
- **StatusBar / IPC / reduce** — task_01 / task_03
- **Code signing purchase** — ADR-001 ship gate
- **macOS zip / latest-mac.yml** — PRD out of scope

<requirements>
1. MUST answer: what glob task_05 should attach for Windows feed metadata (`latest.yml`, blockmap, or neither if not generated with `--publish never`).
2. MUST answer: whether `files: out/**/*` + `package.json` packs `electron-updater` once it is a runtime dependency; if not, the glob/asarUnpack task_05 must add.
3. MUST promote those two answers to `memory/MEMORY.md` Handoffs for task_05.
4. SHOULD prefer a real `dist/` listing when `pnpm dist:win` or electron-builder `--win --dir` can run; otherwise docs + config with the gap recorded.
5. MUST NOT change application source or CI in this spike except memory/report.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| G-01 | Feed files exist on the GitHub Release | named globs |
| TechSpec Open Questions | Exact dist filenames | memory |
| TechSpec Architecture packing | asar includes updater | include/exclude decision |
| Sequencing 5–6 | Pack then attach yml | unblocks task_05 |

## Subtasks

- [ ] 02.1 Inspect builder 26 NSIS output names for `latest.yml` / blockmap with `--publish never`.
- [ ] 02.2 Inspect whether current `files` packs an externalized runtime dependency.
- [ ] 02.3 Write both answers into task and shared memory for task_05.
- [ ] 02.4 File `reports/task_02.md` with evidence paths or the pack-unavailable limitation.

## Implementation Details

Follow TechSpec Open Questions, Architecture packing risk, Sequencing 5–6, ADR-003 packing note. Do not paste contracts.

### Relevant Files

- `electron-builder.yml` — read; do not edit
- `electron.vite.config.ts` — `externalizeDepsPlugin`; read
- `.github/workflows/release.yml` — current `*.exe` glob; read
- `package.json` — `dist:win`; read

### Dependent Files

- task_05 will edit `release.yml` / `electron-builder.yml` using this spike’s globs

### Related ADRs

- [ADR-003: electron-updater 6.x main process + IPC side channel](adrs/adr-003.md) — keep `--publish never`; attach yml

### Spike decision criterion

- **Unknown:** artifact names + asar inclusion.
- **Resolved when:** two concrete strings exist in shared memory: (1) release upload glob for feed files, (2) pack change needed (`none` or a specific `files`/`asarUnpack` entry).
- **Evidence:** `dist/` listing and/or asar list, or documented builder 26 behavior plus config citation if pack cannot run.

## Deliverables

- Memory handoff with globs and pack decision
- `reports/task_02.md` evidence report
- No application code change

## Tests

### Unit Tests

- [ ] Not applicable — spike; no product logic.

### Integration Tests

- [ ] Not applicable.

### Platform or Manual Evidence

- [ ] `dist/` listing from a Windows pack if the environment can run it; otherwise cite builder 26 docs + `electron-builder.yml` and record the gap.

### Verification Commands

- `pnpm typecheck` (must stay green; no src edits expected)
- Optional: `pnpm dist:win` or `pnpm exec electron-builder --win --dir --publish never` when the environment allows

## Rollout

- N/A — documentation spike only.

## Success Criteria

- Decision criterion met (two answers in shared memory).
- Report records evidence and any pack-unavailable limitation.
- No src/CI mutation.
- Memory is current and `reports/task_02.md` exists.
