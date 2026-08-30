---
status: pending
title: Wire Download probe and SmartScreen warning
type: frontend
complexity: medium
dependencies:
  - task_01
  - task_02
  - task_03
---

# Task 05: Wire Download probe and SmartScreen warning

## Overview

A Windows player always sees Download. Default href is GitHub `/releases/latest`; after a browser GET of latest release, href becomes the first allowlisted `.exe` when present. SmartScreen/unsigned warning sits next to the control. Primary **US-03** (US-02 empty state as fallback, F-03–F-05, G-02). Uses task_02’s picker; both locales from task_03.

## Source Artifacts

- PRD: `.spec-finder/tasks/product-website/_prd.md`
- TechSpec: `.spec-finder/tasks/product-website/_techspec.md`

<critical>
- Read `.spec-finder/tasks/product-website/_prd.md`, `.spec-finder/tasks/product-website/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_05.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, Failure, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** no GitHub Releases (API 404) or JS disabled
- **When** I look at Download on EN or PT
- **Then** the control is present and href is the TechSpec `fallbackDownload` (not a missing file on our origin)
- **Given** latest release JSON includes an allowlisted `.exe`
- **When** the probe succeeds
- **Then** Download href is that `browser_download_url` and the unsigned/SmartScreen warning is visible
- **Given** I am not offered macOS/Linux installer buttons
- **When** I look for install
- **Then** I only have Windows Download plus source (US-04)

## Out of Scope

- **Redefining `selectWindowsDownload` rules** — task_02; only consume them
- **Pages Action** — task_06
- **Hiding Download when empty** — ADR-004 / user override of G-03
- **Code signing** — PRD non-goal
- **Retry loops on 429** — TechSpec Failure

<requirements>
1. MUST render Download on EN and PT with default href = TechSpec `fallbackDownload`.
2. MUST GET TechSpec `api` unauthenticated, then set href from `selectWindowsDownload` (ADR-004).
3. MUST show unsigned / unknown-publisher / SmartScreen warning with the control (F-05).
4. MUST not add GitHub tokens, analytics pixels, or macOS/Linux installer buttons.
5. MUST not retry in a loop on 429.
6. SHOULD remain keyboard-activatable (US-07).
7. SHOULD keep CSP `connect-src` compatible with `https://api.github.com` if a CSP is added.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-03, F-04, G-02 | Probe → asset href | Script + picker |
| US-02, G-03/ADR-004 | Always-on control; fallback href | Default HTML href |
| F-05 | SmartScreen copy | HTML both locales |
| US-04 | No other-OS installers | HTML |
| G-04, US-05 | No pixels; API already disclosed in task_04 | HTML |
| TechSpec Failure | 404/429/network → fallback | picker tests + default href |

## Subtasks

- [ ] 05.1 Add Download on both locales with fallback href and SmartScreen copy.
- [ ] 05.2 Wire a small script that GET latest release and applies `selectWindowsDownload`.
- [ ] 05.3 Ensure no token, no retry storm, no extra pixels.
- [ ] 05.4 Re-run `pnpm --dir site test` and `pnpm --dir site build`.

## Implementation Details

Follow TechSpec Contracts (Download control, Public URLs, Errors), Failure table, ADR-004. Do not paste the TypeScript signature; import the task_02 module.

### Relevant Files

- `site/src/layouts/Landing.astro` — Download + warning + script
- `site/src/lib/selectWindowsDownload.ts` — consume only
- `site/src/pages/en/index.astro` / `pt/index.astro` — only if control is page-local

### Dependent Files

- `site/src/lib/selectWindowsDownload.test.ts` — keep green
- task_06 deploy will ship this script as static JS

### Related ADRs

- [ADR-004](adrs/adr-004.md) — always-on Download, allowlisted hrefs, no token
- [ADR-001](adrs/adr-001.md) — binaries on GitHub Releases, not Pages

## Deliverables

- Live Download probe on EN and PT
- SmartScreen warning visible
- Picker tests still green
- Updated `memory/MEMORY.md` and `memory/task_05.md` when warranted
- `reports/task_05.md` final evidence report

## Tests

### Unit Tests

- [ ] Existing task_02 cases still pass after wiring (no rule changes).

### Integration Tests

- [ ] Built HTML contains Download with fallback href and SmartScreen wording in EN and PT.

### Platform or Manual Evidence

- [ ] Optional: with network, 404 leaves fallback href. If fetch cannot run, document limitation and rely on unit tests + default href.

### Verification Commands

- `pnpm --dir site test`
- `pnpm --dir site build`
- `pnpm test`

## Rollout

- N/A until task_06. Probe does not require a rebuild to pick up a future `.exe` once this is live.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Picker coverage remains ≥ 80% when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
