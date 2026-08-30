---
status: completed
title: Ship the English isolation landing
type: frontend
complexity: high
dependencies: []
---

# Task 01: Ship the English isolation landing

## Overview

A multi-account idle player can open the English player page and read that Idle manager is a local isolated-session shell, not a bot. Primary **US-01** (F-01, F-02, G-01, US-07). This slice creates `site/` and the `/en/` document. It gives up Portuguese routes, privacy/MIT, the Releases probe, and Pages deploy.

## Source Artifacts

- PRD: `.spec-finder/tasks/product-website/_prd.md`
- TechSpec: `.spec-finder/tasks/product-website/_techspec.md`

<critical>
- Read `.spec-finder/tasks/product-website/_prd.md`, `.spec-finder/tasks/product-website/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** the repository has no public HTML seam today
- **When** `pnpm --dir site build` completes
- **Then** the build emits an English landing under the project `base` whose first content names Idle manager as a local multi-account shell and states it does not automate play, inject cheats, spoof fingerprints, use proxies, or share one cookie jar
- **Given** I cannot use a mouse
- **When** I move through that English page with the keyboard
- **Then** I can read the isolation claim (US-07 for this locale)

## Out of Scope

- **Portuguese routes and `/` → `/en/`** — task_03
- **Privacy copy, MIT LICENSE, source link** — task_04
- **Releases API probe and SmartScreen warning** — task_05
- **GitHub Pages workflow** — task_06
- **Electron renderer, partitions, root Vitest include** — PRD / AGENTS.md non-goals
- **HeroUI/React on the site, Astro SSR** — TechSpec non-goals

<requirements>
1. MUST add a static Astro app at `site/` with `site` and `base` as specified in TechSpec Contracts (Public URLs) so English output lives under `/idle-manager/en/`.
2. MUST render isolation-vs-bot copy in the first screen of English content (US-01, F-02); no `pnpm dev` as the player path.
3. MUST keep the site out of Electron (`src/main`, `src/renderer`, partitions untouched).
4. MUST not add third-party analytics pixels (G-04 for this slice: empty head of trackers).
5. SHOULD use semantic HTML and keyboard-reachable in-page links (US-07); language switch and Download probe wait for later tasks.
6. SHOULD merge `site/package.json` scripts if that file already exists (task_02 may add a test script).
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-01, F-01, F-02, G-01 | English landing isolation claim | Built `/en/` HTML |
| US-07, F-09 | Keyboard-readable English page | Semantic HTML; keyboard pass |
| G-04 | No extra pixels on this page | HTML head |
| TechSpec Architecture `site/` | New Astro static app | `site/` create |
| ADR-003 | Project Pages `base`, no SSR, no HeroUI | astro config |
| AGENTS.md | Do not hitch root `pnpm test` | vitest.config.ts unchanged |

## Subtasks

- [x] 01.1 Create `site/` package so Astro static build runs with pnpm without changing root Electron scripts.
- [x] 01.2 Configure public `site`/`base` and English route so output matches TechSpec Public URLs for `/en/`.
- [x] 01.3 Ship English isolation-vs-bot copy as the first content on that route.
- [x] 01.4 Keep meaningful images (if any) text-equivalent and controls reachable without a mouse.
- [x] 01.5 Confirm root `pnpm test` still only runs `src/shared/**/*.test.ts` and isolation code is untouched.

## Implementation Details

Follow TechSpec Architecture (`site/` Astro, static only), Contracts (Public URLs), Sequencing step 1 (English half; PT/redirect in task_03). Do not paste those contracts here.

### Relevant Files

- `site/package.json` — create (or merge scripts if present)
- `site/astro.config.mjs` — create; `site` + `base` per TechSpec
- `site/tsconfig.json` — create
- `site/src/layouts/Landing.astro` — create; shared shell for later locales
- `site/src/pages/en/index.astro` — create; English landing
- `site/src/pages/index.astro` — do **not** add `/` → `/en/` here (task_03)

### Dependent Files

- `vitest.config.ts` — must remain `src/shared/**/*.test.ts` only
- `package.json` (repo root) — do not replace Electron scripts
- `site/src/pages/pt/index.astro` — created in task_03 against this layout

### Related ADRs

- [ADR-003: Astro `site/` on project GitHub Pages with locale prefixes](adrs/adr-003.md) — `site/` location, `base`, static-only

## Deliverables

- `site/` builds English landing under `/idle-manager/en/`
- Isolation-vs-bot copy visible without GitHub README
- Root Electron test/isolation gates unchanged
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [x] Not applicable for copy-only HTML beyond build output; picker tests are task_02.

### Integration Tests

- [x] After `pnpm --dir site build`, output includes an English index under `base` whose text includes the product name and the not-a-bot claim.

### Platform or Manual Evidence

- [x] Keyboard pass on the English page, or document that only build HTML was inspected if no browser is available, then continue with the automated gate.

### Verification Commands

- `pnpm --dir site build`
- `pnpm test`

## Rollout

- N/A — not published until task_06. Do not enable GitHub Pages in this slice.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage policy: not measurable for static copy; no new shared logic required.
- No unrelated file or approved behavior changes (especially partitions).
- Memory is current and the final report records exact evidence and unresolved risks.
