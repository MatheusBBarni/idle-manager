---
status: completed
title: Ship Simplified Chinese chrome the operator can pick and keep
type: frontend
complexity: high
dependencies:
  - task_01
---

# Task 02: Ship Simplified Chinese chrome the operator can pick and keep

## Overview

An operator can pick Simplified Chinese in Settings and operate chrome in that language, including wipe/delete confirms.
Primary **US-02** (also F-02, G-02).
The picker label is 简体中文, not only “Chinese”.
`'zh-Hans'` survives parse.
Spanish from task_01 stays green.
This slice gives up Traditional Chinese, site copy, and game-document translation.

## Source Artifacts

- PRD: `.spec-finder/tasks/additional-ui-languages/_prd.md`
- TechSpec: `.spec-finder/tasks/additional-ui-languages/_techspec.md`

<critical>
- Read `.spec-finder/tasks/additional-ui-languages/_prd.md`, `.spec-finder/tasks/additional-ui-languages/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** task_01 complete and a workspace on Portuguese, English, or Spanish
- **When** the operator chooses Simplified Chinese in Settings
- **Then** chrome labels, empty states, Settings, and wipe/delete/clear-session confirms are Simplified Chinese
- **Given** Simplified Chinese is selected
- **When** Settings is open
- **Then** the choice is labeled 简体中文, not only “Chinese”
- **Given** disk JSON `locale: 'zh-Hans'`
- **When** `parseSnapshot` runs
- **Then** `locale` is `'zh-Hans'`
- **Given** disk JSON `locale: 'zh'`
- **When** `parseSnapshot` runs
- **Then** `locale` is `'pt'`
- **Given** Simplified Chinese is selected and no account name is typed
- **When** an account is created
- **Then** the default name is `账号 n`
- **Given** Simplified Chinese is selected
- **When** chrome applies language
- **Then** `chromeHtmlLang('zh-Hans')` is `'zh-Hans'` and `chromeAriaLocale('zh-Hans')` is `'zh-Hans'`
- **Given** Spanish was already selectable
- **When** this slice ships
- **Then** `'es'` still round-trips and Spanish tests stay green

## Out of Scope

- **Traditional Chinese `'zh-Hant'`** - PRD non-goal
- **Public site, README, landing locales** - PRD non-goal
- **Game WebContentsView language / Accept-Language** - PRD/TechSpec non-goal
- **Rewriting Spanish or PT/EN copy from task_01** - G-03
- **OS auto-pick, `'es-419'`** - PRD non-goal
- **`pnpm verify:isolation`** - TechSpec non-goal unless partitions change (they must not)

<requirements>
1. MUST extend `LOCALES` / `Locale` to `'pt' | 'en' | 'es' | 'zh-Hans'` matching TechSpec Contracts.
2. MUST parse `'zh-Hans'` through `parseSnapshot`; `'zh'` and other non-allowlist values still become `'pt'`; `'es'` still survives.
3. MUST no-op `prefs/locale` for values outside the four-tag allowlist; `'zh-Hans'` patches only `snapshot.locale`.
4. MUST add a complete `zh-Hans` dictionary for every `MessageKey` plus `localeZhHans: '简体中文'` in all four dictionaries (G-02, F-03).
5. MUST not change existing PT/EN/ES string values except adding `localeZhHans` (G-03).
6. MUST map `nextAccountName` for `'zh-Hans'` to `账号 ${n}` and keep task_01 names for pt/en/es (US-08).
7. MUST add a Settings control that dispatches `'zh-Hans'`, extend lang maps, and leave game sessions untouched (US-02, US-07).
8. MUST update the AGENTS.md i18n line so new keys are added to all four dictionaries.
9. SHOULD keep the Simplified Chinese control inside the existing Settings language row/wrap.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-02, F-02, G-02 | Simplified Chinese chrome | i18n tests + Settings dispatch |
| US-03 | Confirms in `zh-Hans` | confirm keys ≠ en/pt/es |
| US-06 | Empty-state keys in `zh-Hans` | i18n tests |
| US-07, F-04 | `zh-Hans` document language | unit maps |
| US-08, F-07 | `账号 n` | workspace name tests |
| F-03 | Label 简体中文 | `localeZhHans` identical across dictionaries |
| US-01, G-01 | Spanish remains | parse `'es'` + existing es tests |
| TechSpec Sequencing 2–5 | Dictionary, maps, Settings, AGENTS.md | this task |
| ADR-001 | Both languages in V1; Traditional out | no `'zh-Hant'` |
| ADR-002 | Existing seam only | no new package |

## Subtasks

- [x] 02.1 `'zh-Hans'` is on the allowlist and survives parse; `'zh'` does not.
- [x] 02.2 Every chrome string, including confirms and empty states, has Simplified Chinese copy; PT/EN/ES values stay.
- [x] 02.3 Nameless new accounts get `账号 n` when Simplified Chinese is selected.
- [x] 02.4 Settings offers 简体中文; lang maps include `zh-Hans`; Spanish still selectable.
- [x] 02.5 AGENTS.md i18n instruction names all four dictionaries.
- [x] 02.6 Focused Vitest and repository gates pass.

## Implementation Details

Follow `.spec-finder/tasks/additional-ui-languages/_techspec.md` Contracts for the full four-tag union, Architecture, Failure, and Sequencing 2–5.
Do not re-implement `'es'` except to keep it green.
Do not paste signatures here.

### Relevant Files

- `src/shared/types.ts` - after task_01: `'pt' | 'en' | 'es'`; add `'zh-Hans'`
- `src/shared/i18n.ts` - after task_01: `en`/`pt`/`es`; add `zh-Hans`, `localeZhHans`, map branches
- `src/shared/i18n.test.ts` - extend completeness to four locales
- `src/shared/workspace.ts` - parse/reducer/names after task_01; add `'zh-Hans'`
- `src/shared/workspace.test.ts` - add `'zh-Hans'` round-trip; `'zh'` still `'pt'`
- `src/renderer/src/components/Dialogs.tsx` - add Simplified Chinese button
- `src/renderer/src/App.tsx` - extend lang/provider maps

### Dependent Files

- `AGENTS.md` - line currently “add keys to both `en` and `pt`”; set to all four dictionaries
- `src/renderer/src/components/Chrome.tsx` - already `Locale` after task_01; no type fork
- `src/renderer/src/components/Stage.tsx` / `Sidebar.tsx` - `t(snapshot.locale, …)` follows the union

### Related ADRs

- [ADR-001: Complete Spanish and Simplified Chinese chrome in one V1](adrs/adr-001.md) - Chinese is Simplified only
- [ADR-002: Widen the existing chrome locale seam](adrs/adr-002.md) - hide a language if its dictionary fails tests; do not add a runtime

## Deliverables

- Simplified Chinese is a selectable, persistable chrome locale with complete copy
- Final `Locale` union matches TechSpec Contracts
- AGENTS.md i18n rule updated
- Unit tests listed below
- Updated `memory/MEMORY.md` and `memory/task_02.md` when warranted
- `reports/task_02.md` final evidence report

## Tests

### Unit Tests

- [x] Given disk JSON `locale: 'zh-Hans'`, when `parseSnapshot`, then `locale` is `'zh-Hans'`.
- [x] Given disk JSON `locale: 'zh'`, when `parseSnapshot`, then `locale` is `'pt'`.
- [x] Given disk JSON `locale: 'es'`, when `parseSnapshot`, then `locale` is `'es'`.
- [x] Given `prefs/locale` `'zh-Hans'`, when `applyAction`, then only `snapshot.locale` changes; `accountIdsToWipe` is `[]`.
- [x] Given Simplified Chinese and two existing accounts, when create without name, then name is `账号 3`.
- [x] Given every `MessageKey`, when `t('zh-Hans', key)`, then non-empty; keys not in the shared set differ from `t('en', key)`; confirm keys differ from en/pt/es.
- [x] Given `localeZhHans`, when read from all four dictionaries, then the value is `简体中文`.
- [x] Given `'zh-Hans'`, when `chromeHtmlLang` / `chromeAriaLocale`, then both are `'zh-Hans'`.
- [x] Given task_01 Spanish cases, when this slice’s tests run, then they still pass.

### Integration Tests

- [x] Not applicable. Vitest is `src/shared` only (`AGENTS.md`).

### Platform or Manual Evidence

- [x] PRD G-02 checklist on a real window if Electron can run; if the environment cannot launch the app, document that limitation and continue with the automated gate.

### Verification Commands

- `pnpm exec vitest run src/shared/i18n.test.ts src/shared/workspace.test.ts`
- `pnpm test` ; `pnpm typecheck`

## Rollout

- No snapshot `version` bump.
- Workspace files that already contain `'zh-Hans'` start surviving parse after this slice.
- `'zh'` on disk remains Portuguese.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for changed testable logic when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
