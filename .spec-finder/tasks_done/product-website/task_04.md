---
status: completed
title: Ship privacy copy, MIT LICENSE, and source link
type: frontend
complexity: medium
dependencies:
  - task_01
  - task_03
---

# Task 04: Ship privacy copy, MIT LICENSE, and source link

## Overview

A player can read privacy that separates app-local sessions from site host IP logs and the GitHub API GET, open source on GitHub, and see MIT. Primary **US-05** (F-06, F-07, US-04 source path). Both locales already exist (task_03). Download probe is task_05; this slice may mention that the page will request GitHub’s API so US-05 is true when the probe lands.

## Source Artifacts

- PRD: `.spec-finder/tasks/product-website/_prd.md`
- TechSpec: `.spec-finder/tasks/product-website/_techspec.md`

<critical>
- Read `.spec-finder/tasks/product-website/_prd.md`, `.spec-finder/tasks/product-website/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** English and Portuguese landings from task_03
- **When** I read privacy on either locale
- **Then** I see that game sessions stay on the device, that the public host may log IPs for security, and that the page may GET GitHub’s Releases API, with no extra tracking pixels
- **Given** I look for provenance
- **When** I follow source / license
- **Then** I reach the GitHub repo and the project is MIT via a root `LICENSE` file

## Out of Scope

- **Implementing the Releases fetch** — task_05
- **Pages workflow** — task_06
- **Analytics pixels** — PRD non-goal (must stay absent)
- **Code signing / known publisher** — PRD non-goal

<requirements>
1. MUST add privacy copy on EN and PT covering app-local sessions, Pages/host IP logging, and the GitHub API GET (US-05, F-07, G-04).
2. MUST add root `LICENSE` MIT matching `package.json` (TechSpec F-07 / sequencing step 2).
3. MUST add a GitHub source link on both locales (US-04, F-06); no macOS/Linux installer buttons.
4. MUST not add third-party analytics pixels.
5. SHOULD keep privacy and source keyboard-reachable.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-05, F-07, G-04 | Privacy copy; no pixels | HTML both locales |
| US-04, F-06 | Source link; no other-OS installers | HTML |
| TechSpec Sequencing 2 | MIT LICENSE | `LICENSE` create |
| README Privacy | Claims stay aligned | Copy review |

## Subtasks

- [x] 04.1 Add MIT `LICENSE` at repo root if missing.
- [x] 04.2 Add PT and EN privacy text (app vs host IP vs GitHub API).
- [x] 04.3 Add source link to `https://github.com/MatheusBBarni/idle-manager` on both locales.
- [x] 04.4 Rebuild and confirm no tracker snippets in emitted HTML.

## Implementation Details

Follow TechSpec Security/privacy, Sequencing steps 2–3, Public URLs (`source`). Do not paste the privacy essay from the PRD; implement the obligations.

### Relevant Files

- `LICENSE` — create (MIT)
- `site/src/layouts/Landing.astro` — privacy + source
- `site/src/pages/en/index.astro` — if copy is page-local
- `site/src/pages/pt/index.astro` — Portuguese privacy/source

### Dependent Files

- `package.json` — license field already MIT; do not contradict LICENSE
- task_05 will add Download warning next to source/download region

### Related ADRs

- [ADR-002: Dual-state player page](adrs/adr-002.md) — PT+EN, no extra trackers
- [ADR-003](adrs/adr-003.md) — site is not Electron
- [ADR-004](adrs/adr-004.md) — privacy must mention GitHub API GET

## Deliverables

- Privacy + source on both locales; MIT `LICENSE`
- Build HTML without extra pixels
- Updated `memory/MEMORY.md` and `memory/task_04.md` when warranted
- `reports/task_04.md` final evidence report

## Tests

### Unit Tests

- [ ] Not applicable — copy and license file.

### Integration Tests

- [ ] Built EN and PT HTML include source URL and privacy mentions of local sessions and GitHub API.
- [ ] `LICENSE` exists at repo root and states MIT.

### Platform or Manual Evidence

- [ ] Confirm no analytics scripts in emitted HTML (grep). Continue if no browser.

### Verification Commands

- `pnpm --dir site build`
- `pnpm test`

## Rollout

- N/A for Pages. LICENSE may make GitHub `license` metadata populate after push (ops, not this task’s CI).

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage not measurable for copy/LICENSE.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
