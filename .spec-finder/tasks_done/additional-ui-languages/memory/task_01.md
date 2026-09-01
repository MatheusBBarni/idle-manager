# Task Memory: task_01

## Objective Snapshot

- Ship Spanish chrome the operator can pick and keep (US-01).

## Important Decisions

- `Locale` for this slice is `'pt' | 'en' | 'es'` via `LOCALES` + `isLocale` in `src/shared/types.ts`. `'zh-Hans'` stays off the allowlist until task_02.
- Invalid `prefs/locale` (including `'zh-Hans'` and `'nope'`) returns the same snapshot object.
- `localeEs` is `'Español'` in en/pt/es. Spanish `recolor` is `Color de cuenta` so it is not identical to English `Color`.
- Settings keeps the extra Español button inside the existing modal with `flex-wrap`.
- App uses `chromeHtmlLang` / `chromeAriaLocale` instead of a pt-vs-else branch.

## Learnings

- `Chrome.tsx` `RecentlyClosed` was hardcoded `'pt' | 'en'`; it now takes `Locale` so `tsc` accepts `'es'`.

## Files / Surfaces

- `src/shared/types.ts`, `src/shared/i18n.ts`, `src/shared/i18n.test.ts`
- `src/shared/workspace.ts`, `src/shared/workspace.test.ts`
- `src/renderer/src/App.tsx`, `src/renderer/src/components/Dialogs.tsx`, `src/renderer/src/components/Chrome.tsx`

## Errors / Corrections

## Ready for Next Run

- Run focused Vitest then `pnpm test` and `pnpm typecheck`.
- Do not add `'zh-Hans'` here.
