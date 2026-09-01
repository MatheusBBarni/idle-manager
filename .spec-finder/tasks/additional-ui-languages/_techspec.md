# Additional UI languages - Technical Specification

## Context

- **PRD:** `.spec-finder/tasks/additional-ui-languages/_prd.md`
- Chrome locale is a workspace field with two dictionaries and a parse rule that keeps only `'en'` else `'pt'`.
- This design widens that seam to `'es'` and `'zh-Hans'` so those tags survive reload, without a new i18n stack or touching game partitions ([ADR-002](adrs/adr-002.md)).

### Evidence

| Kind | Finding/constraint | Source | Version/date | Design consequence |
|---|---|---|---|---|
| Repository | `Locale` is `'pt' \| 'en'`; `t()` indexes `{ en, pt }` | `src/shared/types.ts`, `src/shared/i18n.ts` | 2026-08-31 | Extend union and dictionaries in place |
| Repository | `parseSnapshot` is `en` else `pt`; `prefs/locale` assigns blindly | `src/shared/workspace.ts` | 2026-08-31 | Allowlist parse; invalid dispatch no-ops |
| Repository | Non-`pt` means English in `html lang`, HeroUI provider, and `nextAccountName` | `src/renderer/src/App.tsx`, `workspace.ts` | 2026-08-31 | Explicit maps for four locales |
| Repository | Vitest covers `src/shared` only; isolation verify is for partitions | `AGENTS.md` | 2026-08-31 | Unit tests + typecheck; no isolation gate |
| Official docs | `I18nProvider.locale` is a BCP 47 string | [React Aria I18nProvider](https://react-aria.adobe.com/I18nProvider) | 2026-08-31 | Map chrome locale to provider locale; do not add a library |
| Official docs | `html lang` is BCP 47; Simplified Chinese example is `zh-Hans` | [W3C language declarations](https://www.w3.org/International/questions/qa-html-language-declarations) | 2026-08-31 | `zh-Hans` is both persisted tag and document language |
| User decision | Persisted union `'pt' \| 'en' \| 'es' \| 'zh-Hans'` | TechSpec contract A | 2026-08-31 | Disk and `prefs/locale` contract |
| Inference | Four buttons in the existing Settings modal stay inside chrome overlay | `Dialogs.tsx` already sets overlay | 2026-08-31 | No extra overlay protocol |

## Technical Goals and Non-Goals

### Goals

- Allowlist `Locale` on snapshot, parse, and dispatch so `'es'` and `'zh-Hans'` round-trip - G-01, G-02, F-01, F-02
- Complete dictionaries for every `MessageKey` in all four locales - G-01, G-02, F-01, F-02, US-01, US-02, US-03, US-06
- Settings dispatches `prefs/locale` for all four, with names in their own language - F-03
- Document language and HeroUI `I18nProvider` follow `Locale` - F-04, US-07
- PT/EN dictionary values stay as they are except new language-name keys - G-03, F-05, US-04
- `prefs/locale` does not emit session wipe or status actions - G-04, F-06, US-05
- Generated default account names follow `Locale` - F-07, US-08
- Invalid locale never becomes a dictionary miss at runtime - failure policy A

### Non-Goals

- **Site, README, landing `Locale`** - PRD out of scope. Reconsider with product-website.
- **Game `WebContentsView` language, `Accept-Language`, spellcheck** - would change the game, not chrome.
- **OS auto-pick, new default `'pt'`** - PRD non-goal.
- **`'zh-Hant'`, `'es-419'`, other tags** - not in the union.
- **i18next, JSON packs, per-locale files, new packages** - ADR-002.
- **Rewriting typed names; locale telemetry** - PRD.
- **`pnpm verify:isolation` as a required gate** - partitions must not change.

## Requirement Traceability

| PRD ID | Technical obligation | Component/interface | Verification | Status/gap |
|---|---|---|---|---|
| G-01 | Full `es` dictionary including confirms | `i18n.ts` `es` | Vitest all keys; manual checklist | Design |
| G-02 | Full `zh-Hans` dictionary including confirms | `i18n.ts` `zh-Hans` | Vitest all keys; manual checklist | Design |
| G-03 | PT/EN values unchanged except `localeEs` / `localeZhHans` | `i18n.ts` `en`, `pt` | Vitest snapshot of existing PT/EN strings | Design |
| G-04 | Locale action does not change account status or wipe ids | `prefs/locale`, `accountIdsToWipe` | Vitest status unchanged; wipe list empty | Design |
| US-01 | Settings can dispatch `'es'` | `Dialogs.tsx`, `prefs/locale` | Unit: applyAction; checklist | Design |
| US-02 | Settings can dispatch `'zh-Hans'` | same | same | Design |
| US-03 | Confirm keys translated in `es` / `zh-Hans` | `confirmDeleteAccount`, `confirmClearSession`, `confirmDeleteTab` | Vitest not equal to `en`/`pt` | Design |
| US-04 | `'pt'` and `'en'` remain selectable | Settings + dictionaries | Vitest + checklist | Design |
| US-05 | Typed names and running/closed untouched | `prefs/locale` | Vitest | Design |
| US-06 | Empty-state keys in `es` / `zh-Hans` | `emptyTitle`, `emptyBody`, `noRunning*` | Vitest | Design |
| US-07 | `document.documentElement.lang` mapped from `Locale` | `chromeHtmlLang` | Unit map; checklist for live `lang` | Design |
| US-08 | Default name per locale when name omitted | `nextAccountName` | Vitest | Design |
| F-01..F-07 | Same as mapped goals/stories above | i18n + workspace + Settings + App | as above | Design |
| Constraint: isolation | No partition/session API change | `src/main` views | Review: no session language override | Design |
| Constraint: no game translate | No `Accept-Language` on account sessions | game views | Review | Design |
| Constraint: one Spanish | Tag is `'es'`, not `'es-419'` | `Locale` | Type + parse tests | Design |
| Constraint: Simplified labeled | `localeZhHans` is 简体中文 in every dictionary | `i18n.ts` | Vitest | Design |
| Constraint: no telemetry | No locale metrics | renderer/main | Review | Design |
| Constraint: same on macOS/Linux | Locale is snapshot state, not OS | workspace | Existing persist path | Design |

## Decision

Widen the existing snapshot locale seam ([ADR-002](adrs/adr-002.md)): one `Locale` allowlist, four dictionaries in `i18n.ts`, parse/dispatch guards, and small maps for `html lang`, HeroUI locale, and default account names.
Primary trade-off: `i18n.ts` grows.
Gives up split files, a translation runtime, and any Chromium language override.

### Alternatives rejected

- **Per-locale modules** - same contract, extra files.
- **i18next / JSON packs** - new dependency, no extra PRD coverage.

## Architecture

### Components

| Component | Existing/new | Responsibility | Inputs/outputs | Dependencies |
|---|---|---|---|---|
| `Locale`, `LOCALES`, `isLocale` | existing type, new allowlist | Public union and guard | unknown -> boolean | none |
| `i18n.ts` | existing | Dictionaries, `t`, lang maps | `Locale` + key -> string | `Locale` |
| `workspace.ts` | existing | parse allowlist, `prefs/locale` no-op, `nextAccountName` | snapshot JSON / action | `isLocale` |
| Settings | existing | Four language buttons | dispatch `prefs/locale` | `t`, `LOCALES` |
| `App.tsx` | existing | `html lang` + `I18nProvider` | `chromeHtmlLang` / `chromeAriaLocale` | i18n maps |
| Game views | existing, unchanged | Isolated site documents | none from locale | partitions |

### Data flow

```text
Settings button
  -> dispatch { type: 'prefs/locale', locale }
  -> applyAction: isLocale ? patch snapshot.locale : no-op
  -> persist workspace.json
  -> renderer t(locale, key)
  -> document.lang = chromeHtmlLang(locale)
  -> I18nProvider locale={chromeAriaLocale(locale)}
Game WebContentsView: no input from this path
```

### Impact

| Component/file | Impact | Risk | Required action |
|---|---|---|---|
| `src/shared/types.ts` | union + `isLocale` | High if omitted: parse still drops `es` | Change |
| `src/shared/i18n.ts` | two dictionaries + two name keys + maps | Incomplete copy | Change + tests |
| `src/shared/i18n.test.ts` | four-locale completeness | G-03 drift | Change |
| `src/shared/workspace.ts` | parse, reducer, names | Invalid IPC; English default names | Change + tests |
| `src/shared/workspace.test.ts` | allowlist, no-op, names, no wipe | Silent `pt` fallback | Change |
| `src/renderer/src/App.tsx` | lang/provider maps | leftover `pt-BR`/`en` | Change |
| `src/renderer/src/components/Dialogs.tsx` | four buttons | overlay already handled | Change |
| `src/renderer/src/components/Chrome.tsx` | `Locale` type | compile fail if left as `'pt'\|'en'` | Change |
| `site/**` | none | scope creep | Do not edit |
| `src/main/**` isolation | none | accidental Accept-Language | Do not edit |
| `AGENTS.md` | i18n key rule | future keys miss `es`/`zh-Hans` | Update one line |

## Contracts

### Public interfaces

```ts
export const LOCALES = ['pt', 'en', 'es', 'zh-Hans'] as const
export type Locale = (typeof LOCALES)[number]
export function isLocale(value: unknown): value is Locale
  // true iff value is one of LOCALES

export type MessageKey = keyof typeof en
export function t(locale: Locale, key: MessageKey): string
  // dictionaries[locale][key]; dictionaries: Record<Locale, Record<MessageKey, string>>

export function chromeHtmlLang(locale: Locale): string
  // 'pt' -> 'pt-BR' | 'en' -> 'en' | 'es' -> 'es' | 'zh-Hans' -> 'zh-Hans'

export function chromeAriaLocale(locale: Locale): string
  // 'pt' -> 'pt-BR' | 'en' -> 'en-US' | 'es' -> 'es' | 'zh-Hans' -> 'zh-Hans'

// WorkspaceAction existing member, payload now four tags:
{ type: 'prefs/locale'; locale: Locale }

function nextAccountName(existing: Account[], locale: Locale): string
  // n = existing.length + 1
  // pt: `Conta ${n}` | en: `Account ${n}` | es: `Cuenta ${n}` | zh-Hans: `账号 ${n}`
```

Added keys (all four dictionaries, same self-named values): `localeEs: 'Español'`, `localeZhHans: '简体中文'`.
Existing `localePt` / `localeEn` values stay.

### Data model

- `WorkspaceSnapshot.locale: Locale` remains the single stored chrome language.
- Ownership: main-process snapshot; renderer mirrors.
- Retention: same `workspace.json` / encrypted file; no schema `version` bump.
- Concurrency: single writer (`commit` in main).
- Compatibility: files with `'pt'` or `'en'` parse as today. `'es'` and `'zh-Hans'` now survive. Any other string becomes `'pt'`.

### Errors

| Name | Cause | Behavior |
|---|---|---|
| Invalid dispatch locale | `prefs/locale` payload fails `isLocale` | No-op; snapshot unchanged |
| Unknown disk locale | parse of non-allowlist string (including missing) | `locale: 'pt'` |
| Incomplete dictionary | missing key or locale at compile/test | `tsc` / Vitest fail; language must not be offered |

No user-visible error toast for invalid locale (same as other reducer no-ops).

### Changed boundaries

| Boundary | Current contract | Change | Failure behavior | Compatibility/migration |
|---|---|---|---|---|
| `Locale` / `workspace.json` `locale` | `'pt' \| 'en'` | add `'es'`, `'zh-Hans'` | unknown -> `'pt'` | old files valid; no version bump |
| `prefs/locale` | assigns any `Locale` | no-op if not `isLocale` | keep previous locale | renderer still sends typed actions |
| `parseSnapshot` | `'en'` else `'pt'` | `isLocale` else `'pt'` | junk -> `'pt'` | `'es'`/`'zh-Hans'` no longer lost |
| `t()` | `dictionaries[locale]` for two locales | four locales | type error if incomplete | callers already pass `snapshot.locale` |
| `html lang` / `I18nProvider` | pt vs en | four-way maps | n/a | pt/en mapping unchanged |
| Game session | no chrome language | still none | n/a | no migration |

## Failure and Edge Cases

| Failure mode | Detection | User/system behavior | Recovery/rollback | Evidence |
|---|---|---|---|---|
| Disk locale `'zh'` / `'es-419'` / `'zh-Hant'` / missing | `isLocale` false in parse | Chrome opens in Portuguese | Operator picks a valid language | parse unit tests |
| IPC `prefs/locale` with junk | `isLocale` false in reducer | No chrome change | Ignore | applyAction unit test |
| Dictionary missing a key | `tsc` / Vitest | Build fails; language not shipped | Fix copy | i18n tests |
| Operator cancels wipe confirm | existing dialog cancel | Account/tab remains | n/a | existing dialog path; copy only |
| Language switch while accounts running | `prefs/locale` only patches `locale` | Panels stay running/closed; names typed stay | Switch back | workspace test G-04 |
| Settings wrap of four buttons | visual | Still inside Settings modal overlay | n/a | overlay already used |

## Security, NFRs, and Operations

### Security and privacy

- Locale is not secret. Do not log extra telemetry.
- Do not send chrome locale to game partitions (fingerprint/language leak into the site).
- Invalid IPC locale is ignored (fail closed to previous locale).

### Compatibility, rollout, and rollback

- No snapshot `version` change.
- Rollout is the app release that contains both dictionaries.
- Rollback: hide Settings buttons; files with `'es'`/`'zh-Hans'` parse as `'pt'` only if the allowlist is reverted (document that risk).
- PT/EN copy freeze except the two new name keys.

### Observability

- No new metrics.
- Success signal is Vitest + typecheck + PRD manual checklist.

## Tests

- **Unit i18n:** every `LOCALES` x `MESSAGE_KEYS` non-empty; `es` and `zh-Hans` differ from `en` except the shared brand/unit/self-named locale labels; PT/EN existing keys equal current values except added name keys; confirm keys not equal to `en`/`pt`.
- **Unit parse:** `'es'` and `'zh-Hans'` round-trip; `'en'`/`'pt'` unchanged; `'zh'`, `'es-419'`, `null` -> `'pt'`.
- **Unit reducer:** `prefs/locale` valid patches locale only; invalid locale no-ops; `accountIdsToWipe` empty; running/closed unchanged; typed names unchanged.
- **Unit names:** omitted name yields `Conta n` / `Account n` / `Cuenta n` / `账号 n`.
- **Unit maps:** `chromeHtmlLang` / `chromeAriaLocale` tables above.
- **Integration / e2e:** none required in Vitest. PRD G-01/G-02/G-04 manual checklist on an existing workspace.
- **Gates:** `pnpm test` ; `pnpm typecheck`. Not `pnpm verify:isolation` unless partitions are touched.

## Sequencing

1. `LOCALES`, `Locale`, `isLocale`, parse allowlist, `prefs/locale` no-op, tests for parse/reducer - no dependencies.
2. Four dictionaries, new name keys, `t()`, `chromeHtmlLang`, `chromeAriaLocale`, i18n tests - depends on step 1 because `Record<Locale, …>`.
3. `nextAccountName` four-way map and tests - depends on step 1.
4. Settings four buttons, `App.tsx` maps, `Chrome.tsx` `Locale` type - depends on step 2 because `localeEs` / `localeZhHans`.
5. AGENTS.md i18n line: add keys to all four dictionaries - depends on step 2.

## Open Questions

- Non-blocking: who performs the PRD native-read pass of Spanish and Simplified Chinese confirms (product open question, not a design branch).

## Architecture Decision Records

- [ADR-001: Complete Spanish and Simplified Chinese chrome in one V1](adrs/adr-001.md) - product approach
- [ADR-002: Widen the existing chrome locale seam](adrs/adr-002.md) - this design
