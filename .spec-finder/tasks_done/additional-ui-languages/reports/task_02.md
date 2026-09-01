# Task 02 Final Report: Ship Simplified Chinese chrome the operator can pick and keep

## Outcome

- Verdict: completed
- Date: 2026-08-31
- Provider/session: pi-coding-agent (manual sf-batch-tasks)

## Changes

- `src/shared/types.ts` — `LOCALES` includes `'zh-Hans'`.
- `src/shared/i18n.ts` — complete `zh-Hans` dictionary; `localeZhHans: '简体中文'` in all four dictionaries; lang maps for `'zh-Hans'`.
- `src/shared/i18n.test.ts` — four-locale completeness, confirm distinctness, `简体中文` label, zh-Hans lang maps; Spanish tests kept.
- `src/shared/workspace.ts` — `账号 n` default name.
- `src/shared/workspace.test.ts` — parse `'zh-Hans'`, `'zh'` → `'pt'`, `'es'` still round-trips, locale patch without wipe, `账号 3`.
- `src/renderer/src/components/Dialogs.tsx` — 简体中文 button in the existing Settings wrap.
- `AGENTS.md` — i18n keys go in all four dictionaries.

Not changed: `src/main/**`, partitions, `site/**`, PT/EN/ES copy except `localeZhHans`.

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. `LOCALES` / `Locale` is `'pt' \| 'en' \| 'es' \| 'zh-Hans'` | satisfied | `src/shared/types.ts` |
| 2. Parse `'zh-Hans'`; `'zh'` → `'pt'`; `'es'` still survives | satisfied | workspace tests parse zh-Hans, unknown `zh`/`es-419`, Spanish parse still present |
| 3. Invalid locale no-op; `'zh-Hans'` patches only `snapshot.locale` | satisfied | `no-ops invalid locale dispatch`; `patches only locale for Simplified Chinese...` wipe list empty |
| 4. Complete `zh-Hans` dictionary plus `localeZhHans: '简体中文'` in all four | satisfied | i18n completeness + `names Simplified Chinese 简体中文 in every dictionary` |
| 5. PT/EN/ES values unchanged except `localeZhHans` | satisfied | PT/EN freeze still passes; Spanish completeness and Español label still pass; only new key is `localeZhHans` |
| 6. `nextAccountName` `'zh-Hans'` → `账号 n`; keep pt/en/es names | satisfied | `账号 3` test; existing `Cuenta 3` / Conta / Account tests still pass |
| 7. Settings dispatches `'zh-Hans'`; lang maps; sessions untouched | satisfied | Dialogs button; `chromeHtmlLang('zh-Hans')` / `chromeAriaLocale` both `'zh-Hans'`; no `src/main` edits |
| 8. AGENTS.md i18n line names all four dictionaries | satisfied | `AGENTS.md` UI section |
| 9. Control stays in existing Settings language wrap | satisfied | extra button in the same `flex-wrap` row |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm exec vitest run src/shared/i18n.test.ts src/shared/workspace.test.ts` | pass | 2 files, 41 tests, 233ms, 2026-08-31 21:14:57 |
| `pnpm test` | pass | 6 files, 67 tests, 252ms, 2026-08-31 21:14:59 |
| `pnpm typecheck` | pass | `TypeScript: No errors found` |
| PRD G-02 live window | not run | Darwin agent session; no Electron window launched; automated gate used |

## Risks and Follow-ups

- Native-read of Simplified Chinese confirms is still the PRD open question.
- G-01/G-02 checklist on a real window is still needed at ship.

## Final Verdict

completed — Simplified Chinese is a selectable, persistable chrome locale labeled 简体中文, with a complete dictionary, allowlisted `'zh-Hans'` parse, `账号 n` defaults, Settings/App maps, and AGENTS.md four-dictionary rule; Spanish tests stayed green; focused Vitest, `pnpm test` (67), and typecheck passed.
