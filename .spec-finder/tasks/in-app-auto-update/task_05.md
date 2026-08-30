---
status: pending
title: Attach Windows latest.yml on GitHub Releases
type: infra
complexity: medium
dependencies:
  - task_02
  - task_04
---

# Task 05: Attach Windows latest.yml on GitHub Releases

## Overview

A tagged Windows release must publish feed metadata next to the NSIS installer so in-app Apply is not a dead button. Primary **G-01** (also F-01 feed). This slice uses task_02 globs to attach `latest.yml` (and blockmap if produced) and to pack `electron-updater`. It gives up StatusBar and updater behavior.

## Source Artifacts

- PRD: `.spec-finder/tasks/in-app-auto-update/_prd.md`
- TechSpec: `.spec-finder/tasks/in-app-auto-update/_techspec.md`

<critical>
- Read `.spec-finder/tasks/in-app-auto-update/_prd.md`, `.spec-finder/tasks/in-app-auto-update/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_05.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** task_02 recorded feed globs
- **When** the Windows release job uploads artifacts
- **Then** those feed files are included and the job fails if they are missing (`if-no-files-found: error` or equivalent)
- **Given** task_02 recorded a pack include/exclude decision
- **When** `electron-builder.yml` / asar config is applied
- **Then** `electron-updater` is present in the packaged app per that decision
- **Given** macOS and Linux jobs
- **When** they upload
- **Then** they still attach dmg/AppImage only (no fake in-app feed claim)
- **Given** `--publish never`
- **When** the workflow runs
- **Then** electron-builder still does not publish; GitHub Release attachment remains the path (ADR-003)

## Out of Scope

- **Updater client / StatusBar** — task_03 / task_04
- **`--publish always` or generic S3/R2 feed** — rejected in TechSpec
- **macOS zip / latest-mac.yml / Linux AppImage updater** — PRD out of scope
- **Buying Authenticode** — ADR-001; workflow may still set `CSC_IDENTITY_AUTO_DISCOVERY: false` until signing exists
- **SHA256SUMS of yml** — optional; do not block on checksum format

<requirements>
1. MUST keep `electron-builder --publish never` and the two-job release shape.
2. MUST attach Windows feed metadata using the exact globs from `memory/MEMORY.md` (task_02); fail-closed if missing.
3. MUST apply the task_02 pack decision so `electron-updater` is inside the asar/files set.
4. MUST NOT upload mac/linux updater metadata as if V1 apply existed there.
5. SHOULD leave installer names (`idle-manager-*-win-x64.exe`) working for the website download path.
6. MUST NOT set `verifyUpdateCodeSignature` false.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| G-01, F-01 | Feed on GitHub Release | release.yml globs |
| TechSpec Changed boundaries | latest.yml + optional blockmap | workflow |
| Sequencing 5–6 | Pack then attach | electron-builder.yml + release.yml |
| ADR-003 | `--publish never` | workflow still `never` |

## Subtasks

- [ ] 05.1 Read task_02 handoff; apply pack glob/asarUnpack if required.
- [ ] 05.2 Extend the Windows artifact upload and GitHub Release files to include feed metadata; fail if missing.
- [ ] 05.3 Leave mac/linux artifact patterns installer-only.
- [ ] 05.4 Run `pnpm typecheck` (and `pnpm test` if src unchanged still green).

## Implementation Details

Follow TechSpec Sequencing 5–6, Changed boundaries (GitHub Release assets), ADR-003 attach-yml decision, and task_02 memory. Do not invent globs that contradict the spike.

### Relevant Files

- `.github/workflows/release.yml` — Windows `artifacts` + release `files`
- `electron-builder.yml` — `files` / asar only if task_02 required a pack change

### Dependent Files

- `site/` download selectors — do not break `.exe` choice
- `package.json` `dist:win` — unchanged unless pack requires it

### Related ADRs

- [ADR-003: electron-updater 6.x main process + IPC side channel](adrs/adr-003.md) — attach yml, do not `--publish always`
- [ADR-001: Windows operator-timed in-app apply, Authenticode as V1 gate](adrs/adr-001.md) — signing still required for a live Apply

## Deliverables

- Windows feed files on the GitHub Release path
- Pack includes `electron-updater` per spike
- Updated `memory/MEMORY.md` and `memory/task_05.md` when warranted
- `reports/task_05.md` final evidence report

## Tests

### Unit Tests

- [ ] Not applicable — workflow/config only.

### Integration Tests

- [ ] Not applicable — no CI pack in this task’s gate unless already running.

### Platform or Manual Evidence

- [ ] Diff: Windows upload glob includes task_02 feed names; mac/linux unchanged.
- [ ] If a Windows pack can run, list `dist/` and confirm yml/blockmap names; otherwise document and rely on spike + workflow review.

### Verification Commands

- `pnpm test`
- `pnpm typecheck`

## Rollout

- First updater-enabled tag needs signed NSIS (ADR-001) plus these assets. Unsigned 0.2.0 still uses the website installer once. Rollback: stop attaching yml; installers remain.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- `pnpm test` and `pnpm typecheck` pass to terminal exit.
- Workflow fail-closed on missing Windows feed files.
- Memory is current and the final report records exact globs and remaining signing gap.
