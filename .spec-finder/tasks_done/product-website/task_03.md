---
status: completed
title: Ship the Portuguese landing and locale links
type: frontend
complexity: medium
dependencies:
  - task_01
---

# Task 03: Ship the Portuguese landing and locale links

## Overview

A player can read the same isolation claims in Portuguese at `/pt/` and switch locale via links. `/idle-manager/` redirects to `/en/`. Primary **US-06** (F-08). Depends on the English `site/` from task_01. Probe and privacy sections are later tasks.

## Source Artifacts

- PRD: `.spec-finder/tasks/product-website/_prd.md`
- TechSpec: `.spec-finder/tasks/product-website/_techspec.md`

<critical>
- Read `.spec-finder/tasks/product-website/_prd.md`, `.spec-finder/tasks/product-website/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** task_01 English landing exists
- **When** `pnpm --dir site build` completes
- **Then** output includes `/idle-manager/pt/` with the same isolation-vs-bot claims in Portuguese, locale links between `/en/` and `/pt/` (prefixed with `base`), and `/idle-manager/` redirects to `/idle-manager/en/`
- **Given** I open the Portuguese page
- **When** I follow the English locale link
- **Then** I reach the English landing (and the reverse)

## Out of Scope

- **Privacy, LICENSE, source** — task_04
- **Releases probe** — task_05
- **Pages Action** — task_06
- **`Accept-Language` negotiation** — TechSpec non-goal
- **App `src/shared/i18n.ts`** — chrome strings, not this site

<requirements>
1. MUST add Portuguese landing at TechSpec Public URLs `/pt/` with isolation-vs-bot claims aligned to English (US-06, F-08).
2. MUST redirect `/idle-manager/` to `/idle-manager/en/` (TechSpec closed default locale).
3. MUST use `prefixDefaultLocale` / locale prefixes per ADR-003; language switch is `<a>` links, not client storage.
4. MUST prefix internal links with `base`.
5. SHOULD keep keyboard access to locale links (US-07).
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-06, F-08, G-01 | PT + EN claims | Built `/pt/` and `/en/` |
| TechSpec Public URLs | `/` → `/en/` | Build or astro i18n redirect |
| ADR-003 | Locale prefixes, links not JS store | HTML `<a>` |
| US-07 | Locale links keyboard-reachable | HTML |

## Subtasks

- [x] 03.1 Enable Astro i18n so `en` and `pt` are prefixed and `/` goes to `/en/`.
- [x] 03.2 Ship Portuguese isolation-vs-bot copy matching English claims.
- [x] 03.3 Add locale links on both landings using `base`-prefixed hrefs.
- [x] 03.4 Rebuild and confirm `/en/`, `/pt/`, and root redirect in output.

## Implementation Details

Follow TechSpec Contracts (Public URLs), Architecture (i18n routes), Sequencing step 1 remainder. Do not copy config snippets from the TechSpec.

### Relevant Files

- `site/astro.config.mjs` — add i18n locales / prefixDefaultLocale
- `site/src/pages/pt/index.astro` — create
- `site/src/layouts/Landing.astro` — locale `<a>` links
- `site/src/pages/en/index.astro` — keep claims; link to PT
- `site/src/pages/index.astro` — create redirect if not handled by i18n

### Dependent Files

- `site/src/lib/selectWindowsDownload.ts` — unused here; do not wire fetch
- task_04/task_05 will extend both locale pages/layout

### Related ADRs

- [ADR-003: Astro `site/` on project GitHub Pages with locale prefixes](adrs/adr-003.md) — `/en/`, `/pt/`, `/` → `/en/`

## Deliverables

- PT landing + locale links + root redirect
- `pnpm --dir site build` shows both locales under `base`
- Updated `memory/MEMORY.md` and `memory/task_03.md` when warranted
- `reports/task_03.md` final evidence report

## Tests

### Unit Tests

- [ ] Not applicable — routing/copy; picker remains task_02.

### Integration Tests

- [x] Build output contains Portuguese and English indexes under `base`.
- [x] Root path redirects or rewrites to `/en/` as configured.

### Platform or Manual Evidence

- [x] Follow locale links in build HTML hrefs (prefixed). If no browser, cite emitted HTML and continue.

### Verification Commands

- `pnpm --dir site build`
- `pnpm test`

## Rollout

- N/A — not published until task_06.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage not measurable for static copy.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
