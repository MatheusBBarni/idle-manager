---
status: completed
title: Select a Windows Download href from GitHub Releases JSON
type: frontend
complexity: medium
dependencies: []
---

# Task 02: Select a Windows Download href from GitHub Releases JSON

## Overview

Operators get a pure, unit-tested mapping from GitHub Releases JSON to a Download href: first allowlisted `.exe` or the fallback Releases page. Primary **US-03** (G-02, G-03 relaxed per ADR-004). This slice does not fetch in the browser or render the control (task_05). Independently testable without Electron.

## Source Artifacts

- PRD: `.spec-finder/tasks/product-website/_prd.md`
- TechSpec: `.spec-finder/tasks/product-website/_techspec.md`

<critical>
- Read `.spec-finder/tasks/product-website/_prd.md`, `.spec-finder/tasks/product-website/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_02.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, Failure, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** a successful latest-release JSON whose first `.exe` asset has an allowlisted `https` `browser_download_url`
- **When** `selectWindowsDownload` runs
- **Then** the result is `{ kind: 'asset', href, name }` for that asset
- **Given** 404, 429, empty assets, only `.dmg`, or a non-allowlisted href
- **When** `selectWindowsDownload` runs
- **Then** the result is `{ kind: 'fallback', href: fallbackHref }`

## Out of Scope

- **Browser fetch and Download `<a>`** — task_05
- **English/Portuguese page copy** — task_01, task_03
- **GitHub Pages workflow** — task_06
- **macOS/Linux asset picking** — TechSpec non-goal
- **Changing root `pnpm test` include** — AGENTS.md

<requirements>
1. MUST implement `selectWindowsDownload` with the signature and rules in TechSpec Contracts (`selectWindowsDownload`).
2. MUST pick the first case-insensitive `.exe` with allowlisted host; otherwise fallback (ADR-004).
3. MUST reject non-`https` or off-allowlist URLs as fallback (`AssetRejected`).
4. MUST unit-test 404/empty/429, first `.exe` wins, `.dmg` skipped, `javascript:` rejected.
5. SHOULD add `pnpm --dir site test` without altering root Vitest include; merge scripts if `site/package.json` already exists from task_01.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-03, F-04, G-02 | First `.exe` → asset href | Unit fixture |
| G-03 / ADR-004 | Empty/error → fallback href | Unit 404/429/empty |
| US-04 | Ignore `.dmg` / AppImage | Unit |
| TechSpec Errors | Named failure kinds map to fallback | Unit |
| ADR-004 | No DOM injection of raw JSON | Function returns href only |

## Subtasks

- [x] 02.1 Add `selectWindowsDownload` under `site/` as a pure function with no Electron imports.
- [x] 02.2 Cover TechSpec unit cases (404, empty, 429, first `.exe`, `.dmg`, bad protocol).
- [x] 02.3 Expose `pnpm --dir site test` for those tests without changing root `pnpm test`.

## Implementation Details

Follow TechSpec Contracts (`selectWindowsDownload`, Errors) and Tests (Unit). Sequencing step 4 (no page dependency). Numeric order still places this after task_01 on disk.

### Relevant Files

- `site/src/lib/selectWindowsDownload.ts` — create
- `site/src/lib/selectWindowsDownload.test.ts` — create
- `site/package.json` — create or merge `test` script
- `site/vitest.config.ts` or equivalent — create if needed for `pnpm --dir site test`

### Dependent Files

- `site/src/layouts/Landing.astro` — task_05 will import/call the probe using this function
- `vitest.config.ts` (root) — do not add `site/` to include

### Related ADRs

- [ADR-004: Browser GitHub Releases probe; fail-open to `/releases/latest`](adrs/adr-004.md) — picker rules and fallback

## Deliverables

- Pure picker + failing/passing unit cases listed in TechSpec Tests
- `pnpm --dir site test` green
- Updated `memory/MEMORY.md` and `memory/task_02.md` when warranted
- `reports/task_02.md` final evidence report

## Tests

### Unit Tests

- [x] Given `ok: false, status: 404`, when selecting, then `kind: 'fallback'`.
- [x] Given `ok: true` and `assets: []`, when selecting, then fallback.
- [x] Given `status: 429`, when selecting, then fallback.
- [x] Given two `.exe` assets, when selecting, then the first allowlisted `.exe`.
- [x] Given only `.dmg`, when selecting, then fallback.
- [x] Given `.exe` with `javascript:` URL, when selecting, then fallback.

### Integration Tests

- [ ] Not applicable — no network in this slice.

### Platform or Manual Evidence

- [ ] Not applicable — unit tests are the contract.

### Verification Commands

- `pnpm --dir site test`
- `pnpm test`

## Rollout

- N/A — library only; no production behavior until task_05.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage of `selectWindowsDownload` ≥ 80% when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
