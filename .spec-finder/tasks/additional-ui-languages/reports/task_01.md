# Task 01 Final Report: Ship Spanish chrome the operator can pick and keep

## Outcome

- Verdict: completed
- Date: 2026-08-31
- Provider/session: pi-coding-agent (manual sf-batch-tasks)

## Changes

- `src/shared/types.ts` — `LOCALES` is `pt | en | es`; added `isLocale`.
- `src/shared/i18n.ts` — complete `es` dictionary; `localeEs: 'Español'` in en/pt/es; `chromeHtmlLang` / `chromeAriaLocale`.
- `src/shared/i18n.test.ts` — Spanish completeness, confirm distinctness, PT/EN freeze except `localeEs`, lang maps.
- `src/shared/workspace.ts` — parse allowlist, invalid `prefs/locale` no-op, `Cuenta n`.
- `src/shared/workspace.test.ts` — parse `'es'`, junk → `'pt'`, locale patch without wipe, invalid no-op, default names.
- `src/renderer/src/App.tsx` — document language and HeroUI locale via the maps.
- `src/renderer/src/components/Dialogs.tsx` — Español button in the existing Settings wrap.
- `src/renderer/src/components/Chrome.tsx` — `RecentlyClosed` accepts `Locale`.

Not changed: `src/main/**`, partitions, `site/**`, AGENTS.md (task_02), `'zh-Hans'`.

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. `LOCALES` / `isLocale`; `Locale` is `'pt' \| 'en' \| 'es'` | satisfied | `src/shared/types.ts`; `'zh-Hans'` is not in `LOCALES` |
| 2. Parse `'es'`; non-allowlist including `'zh-Hans'`, `'zh'`, `'es-419'`, missing → `'pt'` | satisfied | workspace tests `parses Spanish locale from disk JSON` and `maps unknown disk locales...` |
| 3. Invalid `prefs/locale` no-op; valid `'es'` changes only locale | satisfied | `patches only locale for Spanish...`; `no-ops invalid locale dispatch including zh-Hans` |
| 4. Complete `es` dictionary plus `localeEs: 'Español'` in all current dictionaries | satisfied | i18n tests completeness + `names Spanish Español in every current dictionary` |
| 5. PT/EN values unchanged except `localeEs` | satisfied | `keeps existing Portuguese and English strings except localeEs` |
| 6. `nextAccountName` Spanish `Cuenta n`; keep Conta / Account | satisfied | `names a nameless third account Cuenta 3...`; `keeps Conta and Account...` |
| 7. Settings dispatches `'es'`; App uses lang maps; Chrome uses `Locale` | satisfied | Dialogs Español `prefs/locale` `'es'`; App `chromeHtmlLang` / `chromeAriaLocale`; Chrome `Locale` |
| 8. Extra language button stays in existing Settings overlay | satisfied | `flex-wrap` on the existing language row; no new surface |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm exec vitest run src/shared/i18n.test.ts src/shared/workspace.test.ts` | pass | 2 files, 35 tests, 229ms, 2026-08-31 21:09:49 |
| `pnpm test` | pass | 6 files, 61 tests, 244ms, 2026-08-31 21:09:52 |
| `pnpm typecheck` | pass | `TypeScript: No errors found` |
| PRD G-01/G-04 live window | not run | Darwin agent session; no Electron window launched; automated gate used |

## Risks and Follow-ups

- Native-read of Spanish confirms is still the PRD open question; unit tests only prove non-empty and not equal to en/pt.
- `'zh-Hans'` still parses as `'pt'` until task_02.
- G-01 checklist on a real window is still needed at ship.

## Final Verdict

completed — Spanish is a selectable, persistable chrome locale with a complete dictionary, allowlisted parse, session-safe `prefs/locale`, `Cuenta n` defaults, and Settings/App wiring; focused Vitest, `pnpm test` (61), and typecheck passed.
