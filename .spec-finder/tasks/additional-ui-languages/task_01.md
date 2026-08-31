---
status: pending
title: Ship Spanish chrome the operator can pick and keep
type: frontend
complexity: high
dependencies: []
---

# Task 01: Ship Spanish chrome the operator can pick and keep

## Overview

An operator on an existing workspace can pick Spanish in Settings and operate chrome in Spanish, including wipe/delete confirms.
Primary **US-01** (also F-01, G-01).
This slice also lands persist allowlist, invalid `prefs/locale` no-op, and session-safe switching so Spanish survives reload without touching jars.
It gives up Simplified Chinese (`zh-Hans`), site copy, and the AGENTS.md four-dictionary line.

## Source Artifacts

- PRD: `.spec-finder/tasks/additional-ui-languages/_prd.md`
- TechSpec: `.spec-finder/tasks/additional-ui-languages/_techspec.md`

<critical>
- Read `.spec-finder/tasks/additional-ui-languages/_prd.md`, `.spec-finder/tasks/additional-ui-languages/_techspec.md`, relevant packet ADRs, repository instructions, and current Git state before editing. These paths must contain the current packet slug in generated output.
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

- **Given** an existing workspace on Portuguese or English
- **When** the operator chooses Spanish in Settings
- **Then** chrome labels, empty states, Settings, and wipe/delete/clear-session confirms are Spanish
- **Given** Spanish is selected
- **When** the snapshot is parsed from disk JSON
- **Then** `locale` is `'es'`, not `'pt'`
- **Given** at least one running account and one closed account with typed names
- **When** locale changes to `'es'`
- **Then** running/closed state and typed names are unchanged and `accountIdsToWipe` is empty
- **Given** Spanish is selected and no account name is typed
- **When** an account is created
- **Then** the default name is `Cuenta n`
- **Given** Spanish is selected
- **When** chrome applies language
- **Then** `chromeHtmlLang('es')` is `'es'` and `chromeAriaLocale('es')` is `'es'`
- **Given** Portuguese or English is selected after this slice
- **When** chrome renders
- **Then** PT and EN copy match pre-slice values except the new `localeEs` key

## Out of Scope

- **Simplified Chinese `'zh-Hans'` dictionary, button, and parse survival** - task_02
- **AGENTS.md i18n line for four dictionaries** - task_02
- **Public site, README, landing locales** - PRD non-goal
- **Game WebContentsView language / Accept-Language** - PRD/TechSpec non-goal
- **OS auto-pick, Traditional Chinese, `'es-419'`** - PRD non-goal
- **Rewriting operator-typed names** - PRD non-goal
- **`pnpm verify:isolation`** - TechSpec non-goal unless partitions change (they must not)

<requirements>
1. MUST introduce `LOCALES` / `isLocale` and set `Locale` to `'pt' | 'en' | 'es'` only (TechSpec Contracts; `'zh-Hans'` is task_02).
2. MUST parse `'es'` through `parseSnapshot` and map any non-allowlist value (including `'zh-Hans'`, `'zh'`, `'es-419'`, missing) to `'pt'`.
3. MUST no-op `prefs/locale` when `isLocale` is false; a valid `'es'` patch must change only `snapshot.locale`.
4. MUST add a complete `es` dictionary for every existing `MessageKey` plus `localeEs: 'Español'` in all current dictionaries (G-01, F-03, G-03).
5. MUST keep existing PT and EN string values unchanged except adding `localeEs` (G-03).
6. MUST map `nextAccountName` for `'es'` to `Cuenta ${n}` and keep `Conta` / `Account` for pt/en (US-08).
7. MUST wire Settings to dispatch `'es'`, use `chromeHtmlLang` / `chromeAriaLocale` in App, and type Chrome locale as `Locale` (US-01, US-07).
8. SHOULD wrap extra Settings language buttons inside the existing Settings modal overlay rather than a new surface.
</requirements>

## Requirement Traceability

| Source ID/section | Task obligation | Evidence |
|---|---|---|
| US-01, F-01, G-01 | Spanish chrome including Settings | i18n tests + Settings dispatch `'es'` |
| US-03 | Spanish confirms | `es` confirm keys ≠ en/pt |
| US-04, F-05, G-03 | PT/EN still work; values frozen except `localeEs` | i18n tests |
| US-05, F-06, G-04 | Locale change does not wipe or change status | workspace tests |
| US-06 | Spanish empty-state keys | i18n tests |
| US-07, F-04 | `html lang` / HeroUI locale maps | unit maps + App uses them |
| US-08, F-07 | `Cuenta n` | workspace name tests |
| F-03 | Español self-name | `localeEs` identical across dictionaries |
| TechSpec Sequencing 1–4 (es only) | Allowlist, dictionaries, names, Settings/App | this task |
| ADR-002 | Widen existing seam; no new package | review: no i18next |

## Subtasks

- [ ] 01.1 Operator-visible Spanish locale exists on the snapshot allowlist and survives parse.
- [ ] 01.2 Invalid locale dispatch leaves chrome language unchanged; session status and typed names stay put.
- [ ] 01.3 Every chrome string, including confirms and empty states, has Spanish copy; PT/EN values stay.
- [ ] 01.4 Nameless new accounts get `Cuenta n` when Spanish is selected.
- [ ] 01.5 Settings offers Español; document language maps follow TechSpec for pt/en/es; Chrome uses `Locale`.
- [ ] 01.6 Focused Vitest and repository gates pass.

## Implementation Details

Follow `.spec-finder/tasks/additional-ui-languages/_techspec.md` Contracts (`LOCALES`, `isLocale`, `t`, `chromeHtmlLang`, `chromeAriaLocale`, `nextAccountName`), Architecture, Failure, and Sequencing 1–4 limited to `'es'`.
Do not add `'zh-Hans'` yet.
Do not paste those signatures here.

### Relevant Files

- `src/shared/types.ts` - `Locale` is `'pt' | 'en'` today; add allowlist + `'es'`
- `src/shared/i18n.ts` - `{ en, pt }` dictionaries and `t`; add `es`, name key, lang maps
- `src/shared/i18n.test.ts` - two-locale completeness; extend to `es` and PT/EN freeze
- `src/shared/workspace.ts` - `parseSnapshot` `en` else `pt`; `prefs/locale` assigns blindly; `nextAccountName` is pt vs else English
- `src/shared/workspace.test.ts` - no locale allowlist tests today; add parse/reducer/name/wipe cases
- `src/renderer/src/components/Dialogs.tsx` - two language buttons (`pt`, `en`)
- `src/renderer/src/App.tsx` - non-`pt` means `en` / `en-US`

### Dependent Files

- `src/renderer/src/components/Chrome.tsx` - `RecentlyClosed` props `locale: 'pt' | 'en'`; must accept `Locale` or `tsc` fails
- `src/renderer/src/components/Stage.tsx` / `Sidebar.tsx` - already `t(snapshot.locale, …)`; should compile once `Locale` and dictionaries match

### Related ADRs

- [ADR-001: Complete Spanish and Simplified Chinese chrome in one V1](adrs/adr-001.md) - product: Spanish is in V1; this task ships Spanish only
- [ADR-002: Widen the existing chrome locale seam](adrs/adr-002.md) - no new package, no site, no game language

## Deliverables

- Spanish is a selectable, persistable chrome locale with complete copy
- Unit tests listed below
- Updated `memory/MEMORY.md` and `memory/task_01.md` when warranted
- `reports/task_01.md` final evidence report

## Tests

### Unit Tests

- [ ] Given disk JSON `locale: 'es'`, when `parseSnapshot`, then `locale` is `'es'`.
- [ ] Given disk JSON `locale` `'zh'`, `'zh-Hans'`, `'es-419'`, or missing, when `parseSnapshot`, then `locale` is `'pt'`.
- [ ] Given `locale: 'en'`, when `parseSnapshot`, then `locale` is `'en'`.
- [ ] Given `prefs/locale` `'es'`, when `applyAction`, then only `snapshot.locale` changes; account status and names unchanged; `accountIdsToWipe` is `[]`.
- [ ] Given `prefs/locale` with `'zh-Hans'` or `'nope'`, when `applyAction`, then snapshot equals input.
- [ ] Given Spanish locale and two existing accounts, when create without name, then name is `Cuenta 3`.
- [ ] Given every `MessageKey`, when `t('es', key)`, then non-empty; keys not in the shared set differ from `t('en', key)`; confirm keys differ from pt/en.
- [ ] Given existing PT/EN keys except `localeEs`, when compared to pre-change values, then they match.
- [ ] Given `'pt' | 'en' | 'es'`, when `chromeHtmlLang` / `chromeAriaLocale`, then TechSpec tables hold (`pt` -> `pt-BR` / `pt-BR`, `en` -> `en` / `en-US`, `es` -> `es` / `es`).

### Integration Tests

- [ ] Not applicable. Vitest is `src/shared` only (`AGENTS.md`). Renderer wiring is typecheck plus the PRD checklist.

### Platform or Manual Evidence

- [ ] PRD G-01/G-04 checklist on a real window if Electron can run; if the environment cannot launch the app, document that limitation and continue with the automated gate.

### Verification Commands

- `pnpm exec vitest run src/shared/i18n.test.ts src/shared/workspace.test.ts`
- `pnpm test` ; `pnpm typecheck`

## Rollout

- No snapshot `version` bump.
- Existing `pt`/`en` workspace files stay valid.
- `'es'` appears on disk only after the operator picks Spanish.

## Success Criteria

- Mapped acceptance and requirements are satisfied with evidence.
- Focused tests and repository gate pass to terminal exit.
- Coverage meets repository policy or reaches 80% for changed testable logic when measurable.
- No unrelated file or approved behavior changes.
- Memory is current and the final report records exact evidence and unresolved risks.
