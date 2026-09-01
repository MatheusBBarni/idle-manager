---
status: pending
title: Ship Settings Shortcuts tab with capture and reset
type: frontend
complexity: high
dependencies:
  - task_02
---

# Task 03: Ship Settings Shortcuts tab with capture and reset

## Overview

An operator can open Settings → Shortcuts, see every documented action with its current chord, click a row and press a new modifier chord, and reset one row to the shipped default. Primary **US-01** (US-04, US-05, G-04). This slice gives up README/site custom-map copy.

## Source Artifacts

- PRD: `.spec-finder/tasks/shortcut-remapping/_prd.md`
- TechSpec: `.spec-finder/tasks/shortcut-remapping/_techspec.md`

<critical>
- Read `.spec-finder/tasks/shortcut-remapping/_prd.md`, `.spec-finder/tasks/shortcut-remapping/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** Settings is open
- **When** the operator opens the Shortcuts tab
- **Then** every documented catalog action is listed with its current chord, and loop vs chrome-only is visible
- **Given** Shortcuts is showing
- **When** the operator returns to General
- **Then** language, theme, startup, and import/export are still there
- **Given** capture is active on a row
- **When** a legal unused modifier chord is pressed
- **Then** `prefs/shortcut` stores it and the row shows the new chord
- **Given** capture is active
- **When** a taken chord, a bare letter, or Escape / leaving capture happens
- **Then** the row stays on its previous chord; Escape does not close Settings
- **Given** a remapped row
- **When** reset is pressed
- **Then** that command stores and displays the shipped default
- **Given** capture is active
- **When** a chrome chord would otherwise fire in Shell
- **Then** Shell does not dispatch

## Out of Scope

- **Changing README or `/en/keyboard/` / `/pt/keyboard/` to live maps** — PRD non-goal; keep defaults
- **Unbind, steal-on-conflict, OS-global, command palette** — PRD out of scope
- **Making chrome remaps work while a game is focused** — PRD / ADR-001
- **New interceptor attach points** — task_02
- **Gameplay automation** — product prohibition

<requirements>
1. MUST use HeroUI v3 compound `Tabs` (`Tabs.ListContainer` / `Tabs.List` / `Tabs.Tab` / `Tabs.Panel`) for General vs Shortcuts inside the existing Settings modal.
2. MUST list the full catalog with current chords from the snapshot map; loop vs chrome-only must be visible without inventing extra commands.
3. MUST capture in the renderer: require platform mod; dispatch `prefs/shortcut` only for legal unique chords; illegal/duplicate/cancel leave the row unchanged.
4. MUST add a renderer-only capturing flag so Shell does not dispatch while capturing; overlay skip for the loop interceptor stays.
5. MUST provide per-row reset via `prefs/shortcut` `chord: null`.
6. MUST add Shortcuts copy in every existing chrome locale in `src/shared/i18n.ts` (`LOCALES`).
7. MUST NOT log raw key events; MUST NOT change game-list export.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-01, F-01, F-02, G-04 | Shortcuts tab lists every documented action | Settings UI + i18n |
| US-04, F-04 | Taken/illegal/cancel leave row | capture + existing reducer no-op |
| US-05, F-05 | Per-row reset | `chord: null` from UI |
| F-03 | Click-press stores a legal chord | dispatch `prefs/shortcut` |
| Constraints | All chrome locales; overlay hide; no key log | i18n maps; existing overlay |
| TechSpec Sequencing 5 | Capture after Shell live path | capturing flag |

## Subtasks

- [ ] 03.1 Split Settings into General and Shortcuts panes with HeroUI Tabs; keep General prefs and import/export.
- [ ] 03.2 List the full catalog with current chords and a visible loop vs chrome-only distinction.
- [ ] 03.3 Capture a modifier chord, refuse illegal/duplicate, cancel on Escape without closing Settings.
- [ ] 03.4 Reset one row to the shipped default; block Shell dispatch while capturing.
- [ ] 03.5 Add i18n for all `LOCALES` and run focused Vitest plus `pnpm typecheck` to terminal exit.

## Implementation Details

Follow TechSpec Contracts (`displayShortcut`, capture vs overlay), Architecture (Settings Tabs, renderer capturing flag), Failure (capture vs modal ESC, duplicate), Sequencing step 5, ADR-001 (tab, no unbind), and ADR-002 (renderer capture). Do not paste those contracts here.

### Relevant Files

- `src/renderer/src/components/Dialogs.tsx` — replace read-only four-row list with Tabs + capture/reset
- `src/renderer/src/store.ts` — renderer-only capturing flag
- `src/renderer/src/components/Shell.tsx` — skip chrome dispatch while capturing
- `src/shared/i18n.ts` — Shortcuts tab and command labels for all `LOCALES`
- `src/shared/i18n.test.ts` — locale coverage for new keys

### Dependent Files

- `src/shared/shortcuts.ts` — catalog, `displayShortcut`, `shortcutConflict`
- `src/shared/workspace.ts` — `prefs/shortcut` already from task_01
- `src/renderer/src/components/Stage.tsx` — overlay already true when Settings is open
- `site/src/content/keyboard.ts` / `README.md` — do not update to live maps

### Related ADRs

- [ADR-001: Settings Shortcuts tab for documented modifier chords](adrs/adr-001.md) — tab, refuse duplicate, per-row reset
- [ADR-002: Shared shortcut catalog with dual dispatch paths](adrs/adr-002.md) — renderer capture; do not lift overlay skip

## Deliverables

- Settings Shortcuts tab with capture and reset
- Capturing flag so Shell does not fire during capture
- i18n keys in every chrome locale
- Updated `memory/MEMORY.md` and `memory/task_03.md` when warranted
- `reports/task_03.md` final evidence report

## Tests

### Unit Tests

- [ ] Given each `LOCALES` value, when Shortcuts strings are translated, then keys exist and non-English locales are not leftover English for new labels.
- [ ] Given `shortcutConflict` / `displayShortcut`, when a taken chord or slot occupancy is checked, then the occupying command is returned (helpers already in task_01; add UI-facing cases only if new wrappers appear).

### Integration Tests

- [ ] Not applicable — no Electron harness (TechSpec Tests). Settings capture is chrome React; prove i18n and helpers in Vitest.

### Platform or Manual Evidence

- [ ] Open Settings → Shortcuts, remap one loop row, reset it, refuse a duplicate, Escape cancels capture without closing Settings. If the desktop UI cannot be driven in this environment, document that limitation in the report and continue with the automated gate.
- [ ] Confirm README and site keyboard pages still show shipped defaults, not the remapped chord.

### Verification Commands

- `pnpm test src/shared/i18n.test.ts src/shared/shortcuts.test.ts src/shared/workspace.test.ts`
- `pnpm typecheck`

## Rollout

- Overlay already hides game views while Settings is open. No snapshot migration beyond task_01. Docs stay defaults.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and `pnpm typecheck` pass to terminal exit.
- Coverage meets repository policy or reaches 80% for new testable i18n/helper logic when measurable.
- No unrelated file or approved behavior changes (isolation, Plus dialog, public docs maps).
- Memory is current and the final report records exact evidence and unresolved risks.
