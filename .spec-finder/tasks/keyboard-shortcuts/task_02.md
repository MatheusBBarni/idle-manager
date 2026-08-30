---
status: pending
title: Show loop binds in Settings and README
type: frontend
complexity: medium
dependencies:
  - task_01
---

# Task 02: Show loop binds in Settings and README

## Overview

An operator can find the four account-loop chords without asking someone: a read-only list in existing Settings (PT and EN) and matching README Keyboard rows. Primary **US-06** (F-08, F-10, G-04). This slice does not attach input handlers or add site docs pages.

## Source Artifacts

- PRD: `.spec-finder/tasks/keyboard-shortcuts/_prd.md`
- TechSpec: `.spec-finder/tasks/keyboard-shortcuts/_techspec.md`

<critical>
- Read `.spec-finder/tasks/keyboard-shortcuts/_prd.md`, `.spec-finder/tasks/keyboard-shortcuts/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** task_01 chords are frozen and I open Settings
- **When** I look for keyboard shortcuts
- **Then** I see a read-only PT or EN list of create, previous, next, and start matching app locale, with no remapping controls
- **Given** the README Keyboard table
- **When** I read it
- **Then** it lists the same four accelerators as Settings (`Mod+Shift+N`, `Mod+Shift+[`, `Mod+Shift+]`, `Mod+Enter`)

## Out of Scope

- **Main interceptor / matcher** — task_01
- **Keyboard docs pages (`/en/keyboard/`, `/pt/keyboard/`)** — task_03
- **Remapping, command palette, first-use toast** — PRD out of scope
- **Changing Plus dialog, theme, export, or locale controls** — existing Settings behavior stays

<requirements>
1. MUST add PT and EN i18n keys for the four loop binds and a Settings heading so `src/shared/i18n.test.ts` still passes (`MESSAGE_KEYS` both locales).
2. MUST render a read-only list inside the existing Settings modal (`Dialogs.tsx` `SettingsModal`); no new dialog id.
3. MUST append the four rows to `README.md` Keyboard using the same actions as TechSpec Contracts display strings.
4. MUST not register chords in `Shell.tsx` or change `src/main` input routing.
5. SHOULD keep the Settings overlay behavior unchanged (`overlayOpen` already hides game views).
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-06, F-08, G-04 | Settings read-only list PT/EN | Settings UI + i18n tests |
| F-10 | README Keyboard table | README rows |
| ADR-002 | README + Settings; no remapping | no keymap UI |
| TechSpec Sequencing 3–4 | i18n/Settings then README | this task |
| i18n convention | both `en` and `pt` | `i18n.test.ts` |

## Subtasks

- [ ] 02.1 Add PT/EN strings for the four binds and a shortcuts heading.
- [ ] 02.2 Show those strings as a read-only list in existing Settings.
- [ ] 02.3 Add the same four rows to README Keyboard.
- [ ] 02.4 Keep Settings locale/theme/export controls and `i18n.test.ts` green.

## Implementation Details

Follow TechSpec Contracts display strings, Architecture Settings row, Sequencing steps 3–4, and ADR-002. Do not paste accelerator tables from the TechSpec into this file beyond the acceptance chords.

### Relevant Files

- `src/shared/i18n.ts` — add keys in `en` and `pt`
- `src/shared/i18n.test.ts` — existing all-keys test must stay green
- `src/renderer/src/components/Dialogs.tsx` — `SettingsModal` list
- `README.md` — Keyboard table

### Dependent Files

- `src/main/accountLoop.ts` / `src/shared/accountLoop.ts` — chords already shipped in task_01; copy must match, not reimplement
- `site/` — task_03; do not edit here

### Related ADRs

- [ADR-002](adrs/adr-002.md) — Settings list in V1; no remapping
- [ADR-003: Loop-only main before-input interceptor](adrs/adr-003.md) — frozen chords

## Deliverables

- Settings shows the four binds in the active locale
- README Keyboard lists the same four
- Updated `memory/MEMORY.md` and `memory/task_02.md` when warranted
- `reports/task_02.md` final evidence report

## Tests

### Unit Tests

- [ ] Given every new `MessageKey`, when `t('en')` and `t('pt')`, then both are non-empty (existing `i18n.test.ts` loop).
- [ ] Given Portuguese Settings copy, when rendered keys for create/prev/next/start, then they are not leftover English UI words if the existing PT hygiene test is extended.

### Integration Tests

- [ ] Not applicable — no Electron Settings harness.

### Platform or Manual Evidence

- [ ] Open Settings in the app (or inspect the modal JSX) and confirm the list is read-only. If the app cannot be launched here, cite the JSX + i18n keys in the report and continue with `pnpm test` / `pnpm typecheck`.

### Verification Commands

- `pnpm test src/shared/i18n.test.ts`
- `pnpm typecheck`

## Rollout

- Docs: README ships with the app repo; no installer migration. Keep Settings, README, and (later) keyboard docs pages in sync when chords change.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- `pnpm test src/shared/i18n.test.ts` and `pnpm typecheck` pass to terminal exit.
- Coverage for new i18n keys is the existing exhaustive key test.
- No interceptor or `site/` file changes.
- Memory is current and the final report records exact evidence and unresolved risks.
