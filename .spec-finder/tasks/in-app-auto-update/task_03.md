---
status: pending
title: Show Apply/Later on the chrome strip
type: frontend
complexity: high
dependencies:
  - task_01
---

# Task 03: Show Apply/Later on the chrome strip

## Overview

A Windows operator sees a quiet getting state, then Apply and Later on the footer, without covering game panels. Primary **US-01** (also F-01, F-02 copy, F-05, F-08, G-04). This slice binds `onUpdate` to StatusBar. It gives up main electron-updater and the GitHub feed.

## Source Artifacts

- PRD: `.spec-finder/tasks/in-app-auto-update/_prd.md`
- TechSpec: `.spec-finder/tasks/in-app-auto-update/_techspec.md`

<critical>
- Read `.spec-finder/tasks/in-app-auto-update/_prd.md`, `.spec-finder/tasks/in-app-auto-update/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** `onUpdate` reports `getting`
- **When** the operator looks at the footer
- **Then** quiet getting copy is visible and game panels are not covered (`overlayOpen` unchanged)
- **Given** `onUpdate` reports `ready`
- **When** the operator looks at the footer
- **Then** Apply and Later are visible next to version; panels stay visible
- **Given** Apply/Later is showing
- **When** the operator chooses Later
- **Then** chrome sends `updateCommand('later')` and the footer returns to version-only for `later` or `idle`
- **Given** `idle` or `later`
- **When** the operator looks at the footer
- **Then** only the existing version treatment shows (no Apply)
- **Given** locale `en` or `pt`
- **When** getting/Apply/Later render
- **Then** both maps have keys

## Out of Scope

- **electron-updater, quitAndInstall, win32 gate** — task_04
- **latest.yml CI** — task_05
- **Blocking overlay, Settings check-now, nag, failure copy** — PRD out of scope
- **Changing `Stage.tsx` overlay rules** — G-04; footer must not use dialog overlay
- **workspace.ts / isolation** — do not touch

<requirements>
1. MUST subscribe to `onUpdate` in chrome (mirror `onMetrics`) and unsubscribe on teardown.
2. MUST render getting / Apply+Later / version-only per TechSpec Architecture data flow; `later` and `idle` look like today’s version-only footer.
3. MUST call `updateCommand('later')` from Later and `updateCommand('apply')` from Apply; do not set `overlayOpen` for this UI.
4. MUST add PT and EN strings for getting, apply, and later; extend `i18n.test.ts` so both maps stay aligned.
5. SHOULD keep the footer `h-8` usable (compact controls) rather than introducing a covering dialog.
6. MUST NOT start electron-updater or edit `release.yml`.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-01, F-01, G-04 | Ready on footer, panels visible | StatusBar; no Stage overlay |
| US-02, F-02 | Getting copy while running | StatusBar `getting` |
| US-04, F-05 | Later hides Apply | `updateCommand('later')` |
| US-05, F-06 | idle/later → version only | StatusBar branch |
| F-08 | EN+PT | i18n tests |
| ADR-002 | Chrome strip, not overlay | no new dialog id |

## Subtasks

- [ ] 03.1 Hold `UpdateStatus` on the renderer store and subscribe in `App.tsx`.
- [ ] 03.2 Render getting / Apply / Later on `StatusBar.tsx` without a modal.
- [ ] 03.3 Add EN+PT keys and i18n tests.
- [ ] 03.4 Run `pnpm test` (i18n + existing shared) and `pnpm typecheck` to terminal exit.

## Implementation Details

Follow TechSpec Architecture (StatusBar, store), Contracts (status phases), Sequencing step 4, ADR-002. Do not paste interfaces.

### Relevant Files

- `src/renderer/src/store.ts` — add update status; do not put it on snapshot
- `src/renderer/src/App.tsx` — `onUpdate` subscribe (existing `onMetrics` pattern)
- `src/renderer/src/components/StatusBar.tsx` — footer UI
- `src/shared/i18n.ts` — EN+PT keys
- `src/shared/i18n.test.ts` — key parity

### Dependent Files

- `src/shared/ipc.ts` / `src/preload/index.ts` — task_01 contract; do not reshape
- `src/renderer/src/components/Stage.tsx` — do not set overlay for updates
- `src/main/updater.ts` — does not exist until task_04; UI must tolerate idle forever

### Related ADRs

- [ADR-002: Chrome-strip Apply/Later MVP](adrs/adr-002.md) — non-covering footer
- [ADR-003: electron-updater 6.x main process + IPC side channel](adrs/adr-003.md) — consume IPC only

## Deliverables

- Footer getting / Apply / Later
- PT/EN copy tests
- Updated `memory/MEMORY.md` and `memory/task_03.md` when warranted
- `reports/task_03.md` final evidence report

## Tests

### Unit Tests

- [ ] Given `en` and `pt`, when looking up getting/apply/later keys, then both locales return non-empty strings and `MESSAGE_KEYS` stays a bijection (extend existing i18n tests).

### Integration Tests

- [ ] Not applicable — no renderer Vitest env (`vitest.config.ts` is `src/shared/**/*.test.ts` only).

### Platform or Manual Evidence

- [ ] G-04: StatusBar controls do not use `dialog` / `overlayOpen`. If UI cannot be launched here, document that and continue with typecheck + i18n tests.

### Verification Commands

- `pnpm test src/shared/i18n.test.ts src/shared/updateStatus.test.ts`
- `pnpm typecheck`

## Rollout

- N/A — chrome-only; Apply no-ops until task_04. Rollback is revert StatusBar/store/i18n.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and `pnpm typecheck` pass to terminal exit.
- Coverage meets repository policy or 80% for new i18n keys when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
