---
status: pending
title: Ship PT+EN keyboard docs pages
type: frontend
complexity: high
dependencies:
  - task_01
---

# Task 03: Ship PT+EN keyboard docs pages

## Overview

A visitor can open a shareable keyboard docs page in PT or EN and read the same four account-loop binds. Primary **F-09** (US-06 docs-page acceptance, G-04). The player landing may link here; it must not embed the bind list. This slice does not change the Electron shell.

## Source Artifacts

- PRD: `.spec-finder/tasks/keyboard-shortcuts/_prd.md`
- TechSpec: `.spec-finder/tasks/keyboard-shortcuts/_techspec.md`

<critical>
- Read `.spec-finder/tasks/keyboard-shortcuts/_prd.md`, `.spec-finder/tasks/keyboard-shortcuts/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** I open `{base}/en/keyboard/` or `{base}/pt/keyboard/`
- **When** I read the page
- **Then** I see create, previous, next, and start with the four frozen accelerators (`Mod+Shift+N`, `Mod+Shift+[`, `Mod+Shift+]`, `Mod+Enter`)
- **Given** the player landing in that locale
- **When** I look for Keyboard
- **Then** I can follow a nav (or equivalent) link to the docs page, and the landing body does not list those binds
- **Given** the public URL map
- **When** the site builds
- **Then** both locale docs pages exist; there is no `/docs` hub or extra article routes

## Out of Scope

- **Electron interceptor and Settings/README** — task_01 / task_02
- **Keyboard bind list as a landing section** — ADR-004 non-goal
- **Changelog, `/docs` index, more articles** — PRD out of scope
- **Download probe, SmartScreen, isolation copy rewrite** — product-website packet
- **Remapping instructions** — PRD out of scope

<requirements>
1. MUST add Astro pages at `site/src/pages/en/keyboard.astro` and `site/src/pages/pt/keyboard.astro` so build output is `{base}/en/keyboard/` and `{base}/pt/keyboard/` (`trailingSlash: always`).
2. MUST keep bind copy in `site/src/content/keyboard.ts` (both locales), not as a list inside `landing.ts`.
3. MUST list only the four frozen chords from ADR-003 / TechSpec Contracts.
4. MUST add a Keyboard **link** on the existing landing chrome to the locale docs page; MUST NOT render the bind list on the landing.
5. MUST keep the docs pages keyboard-reachable (semantic HTML, locale switch or link back to the landing).
6. SHOULD add `site/src/content/keyboard.copy.test.ts` so both locales include the four accelerator substrings.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| F-09, US-06 (docs page), G-04 | PT+EN `/keyboard/` pages | built HTML + copy tests |
| ADR-004 | Docs pages, not a landing section | new routes; landing has link only |
| TechSpec Sequencing 5 | Docs pages after chords frozen | depends on task_01 |
| TechSpec Contracts URLs | `{base}/en/keyboard/`, `{base}/pt/keyboard/` | Astro output |

## Subtasks

- [ ] 03.1 Add PT and EN keyboard docs copy and a copy test.
- [ ] 03.2 Ship `en/keyboard` and `pt/keyboard` pages that render that copy.
- [ ] 03.3 Link the existing landing chrome to the locale docs page without listing binds on the landing.
- [ ] 03.4 Build the site and confirm both URLs exist and landing HTML has no bind table.

## Implementation Details

Follow TechSpec Contracts (public docs URLs, display strings), Architecture site rows, Sequencing step 5, and ADR-004. Do not add a Keyboard **section** of binds to `Landing.astro`.

### Relevant Files

- `site/src/content/keyboard.ts` — create
- `site/src/content/keyboard.copy.test.ts` — create
- `site/src/pages/en/keyboard.astro` — create
- `site/src/pages/pt/keyboard.astro` — create
- `site/src/content/landing.ts` — nav label only
- `site/src/layouts/Landing.astro` — nav link only

### Dependent Files

- `site/src/pages/en/index.astro` — still mounts `Landing`; do not put docs copy here
- `site/src/pages/pt/index.astro` — same
- `src/` Electron tree — do not edit
- `site/astro.config.mjs` — existing `base` / i18n; do not change unless required for the new pages

### Related ADRs

- [ADR-004: PT+EN keyboard docs pages](adrs/adr-004.md) — `/en/keyboard/` and `/pt/keyboard/`
- [ADR-003: Loop-only main before-input interceptor](adrs/adr-003.md) — frozen chords
- [ADR-002](adrs/adr-002.md) — Settings/README remainder; site surface superseded

## Deliverables

- `{base}/en/keyboard/` and `{base}/pt/keyboard/` in the static build
- Landing link to those pages; no bind list on the landing
- Copy tests + site build evidence
- Updated `memory/MEMORY.md` and `memory/task_03.md` when warranted
- `reports/task_03.md` final evidence report

## Tests

### Unit Tests

- [ ] Given `keyboard.en` and `keyboard.pt`, when copy tests run, then both include the four accelerator substrings (`Shift+N`, `[`, `]`, `Enter` or the exact glyphs chosen).
- [ ] Given `landing` copy, when serialized, then it does not contain the create-account chord table (no `Shift+N` bind list on the marketing page).

### Integration Tests

- [ ] After `pnpm --dir site build`, EN and PT keyboard HTML exist under `base` and include the four binds.
- [ ] Built landing HTML links to the locale `keyboard/` path and does not include the four-bind list.

### Platform or Manual Evidence

- [ ] Not applicable for Electron. If a browser pass cannot run, cite built HTML `href`/`path` and continue.

### Verification Commands

- `pnpm --dir site test`
- `pnpm --dir site build`

## Rollout

- Site copy deploys with the existing Pages pipeline (product-website task_06). New public URLs per locale. Sync with Settings/README if chords ever change.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- `pnpm --dir site test` and `pnpm --dir site build` pass to terminal exit.
- Docs pages exist; landing has a link and no bind list; Electron `src/` untouched.
- Memory is current and the final report records exact evidence and unresolved risks.
