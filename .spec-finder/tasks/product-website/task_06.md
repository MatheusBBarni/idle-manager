---
status: pending
title: Publish the site with GitHub Pages Actions
type: infra
complexity: medium
dependencies:
  - task_03
  - task_04
  - task_05
---

# Task 06: Publish the site with GitHub Pages Actions

## Overview

An operator can deploy the static player site to project GitHub Pages from this repo so G-01’s public URL can go live. Primary **F-01** (G-01 operator). The site, locales, privacy, LICENSE, and Download probe already exist. Enabling Pages in GitHub Settings is rollout, not a code gate.

## Source Artifacts

- PRD: `.spec-finder/tasks/product-website/_prd.md`
- TechSpec: `.spec-finder/tasks/product-website/_techspec.md`

<critical>
- Read `.spec-finder/tasks/product-website/_prd.md`, `.spec-finder/tasks/product-website/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
- Treat this task's numeric ID as its canonical execution position; every declared dependency must already be completed and have a lower numeric ID.
- Use `sf-memory`; read `memory/MEMORY.md` and `memory/task_06.md` before editing and update memory before finishing.
- Implement only this task; preserve unrelated work and do not absorb follow-up scope.
- Reference TechSpec Contracts, Architecture, and Sequencing instead of duplicating interfaces or architecture.
- Run focused tests and the exact repository verification gate to terminal exit. If they fail, fix in scope and re-run until clean. Do not stop to ask whether to proceed.
- Ambiguity and spec conflicts are decisions, not halt conditions. Resolve them against the TechSpec, this task's requirements, and ADRs; record the pick in memory; continue.
- Missing Git HEAD or checkpoint unavailability is not an implementation blocker.
- Do not change lifecycle status or write the final report when Spec Finder owns those phases.
</critical>

## Acceptance

- **Given** `site/` builds locally
- **When** the Pages workflow file is added per TechSpec Architecture
- **Then** a `main` push (or `workflow_dispatch`) can build `site/` and deploy to GitHub Pages with `pages: write` and `id-token: write`, without a GitHub token for the Releases API and without changing Electron isolation tests
- **Given** GitHub Pages is later enabled (Settings)
- **When** the workflow succeeds
- **Then** the public origin matches TechSpec Public URLs (`https://matheusbarni.github.io/idle-manager/`)

## Out of Scope

- **Clicking Settings → Pages in GitHub** — rollout note; cannot be the automated gate
- **Custom domain** — PRD/TechSpec non-goal
- **Changing Download picker rules** — task_02/task_05
- **Touching `src/main` partitions** — AGENTS.md
- **Publishing a Windows Release** — product launch gate, not this workflow

<requirements>
1. MUST add a GitHub Actions workflow that builds `site/` and deploys to Pages using the approach in TechSpec Architecture (Pages workflow / ADR-003).
2. MUST request `contents: read`, `pages: write`, `id-token: write`; MUST NOT store a GitHub token for the public Releases GET.
3. MUST build with the same `base` as TechSpec Public URLs.
4. MUST leave root `pnpm test` and `pnpm verify:isolation` unchanged and green.
5. SHOULD support `workflow_dispatch` as well as push to `main`.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| F-01, G-01 | Deployable public URL | Workflow file |
| ADR-003 | Actions + `withastro/action` path | Workflow YAML |
| TechSpec Sequencing 5–7 | Action then Settings enable | Workflow + rollout |
| AGENTS.md | Isolation gate untouched | `pnpm test` |

## Subtasks

- [ ] 06.1 Add `.github/workflows/` deploy job for `site/` → Pages.
- [ ] 06.2 Set permissions and no secret for the Releases probe.
- [ ] 06.3 Confirm `pnpm --dir site build` still succeeds and root tests are unchanged.
- [ ] 06.4 Record in the report that Settings → Pages → GitHub Actions is required for the URL to serve.

## Implementation Details

Follow TechSpec Architecture (Pages workflow), Sequencing steps 5–7, ADR-003 follow-ups. Do not paste a full YAML replica of Astro’s docs; implement the obligations.

### Relevant Files

- `.github/workflows/deploy.yml` — create (name may vary; one Pages deploy workflow)
- `site/astro.config.mjs` — must already have `site`/`base`; do not break it

### Dependent Files

- `src/main/isolationVerify.ts` — do not edit
- `vitest.config.ts` — do not add site tests to root

### Related ADRs

- [ADR-003](adrs/adr-003.md) — Actions deploy, Pages source = GitHub Actions

## Deliverables

- Pages workflow in git
- Local site build still green; root tests green
- Updated `memory/MEMORY.md` and `memory/task_06.md` when warranted
- `reports/task_06.md` final evidence report including Settings enablement leftover

## Tests

### Unit Tests

- [ ] Not applicable — workflow YAML.

### Integration Tests

- [ ] `pnpm --dir site build` still emits `/en/` and `/pt/` under `base`.

### Platform or Manual Evidence

- [ ] Workflow cannot be proven live without GitHub. Document that limitation and continue with local build + YAML review. Enabling Pages in Settings is rollout.

### Verification Commands

- `pnpm --dir site build`
- `pnpm test`

## Rollout

- After merge: GitHub repo Settings → Pages → Source = GitHub Actions. Until then the workflow exists but the URL may 404.
- Rollback: disable Pages or revert the workflow; Electron app unchanged.
- Do not publish installer binaries onto Pages.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage N/A for YAML.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks (Settings enablement).
