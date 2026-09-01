# Workflow Memory

## Current State

- Packet `additional-ui-languages`: task_01 implemented and verified; task_02 pending.

## Shared Decisions

- Graph: task_01 Spanish chrome (US-01), then task_02 Simplified Chinese chrome (US-02).
- task_01 `Locale` is `'pt' | 'en' | 'es'` so dictionaries typecheck; task_02 adds `'zh-Hans'` to match TechSpec Contracts.
- AGENTS.md i18n line is owned by task_02.
- `Chrome.tsx` `RecentlyClosed` locale type is owned by task_01 (now `Locale`).
- No isolation-verify gate unless partitions change (they must not).
- Invalid `prefs/locale` no-ops by returning the input snapshot; `'zh-Hans'` is invalid until task_02.

## Shared Learnings

- `LOCALES` / `isLocale` live in `src/shared/types.ts`. Parse and reducer both use `isLocale`.
- `chromeHtmlLang` / `chromeAriaLocale` live in `src/shared/i18n.ts`; App already consumes them.
- Settings language row uses `flex-wrap` inside the existing modal.

## Open Risks

- G-01/G-02 ship-time checklists need a real window; this run used Vitest + typecheck only.

## Handoffs

- task_02: add `'zh-Hans'` to `LOCALES`, complete dictionary + `localeZhHans: '简体中文'`, parse survival, `账号 n`, Settings button, lang maps, AGENTS.md four-dictionary line. Keep `'es'` tests green. Do not change PT/EN/ES strings except adding `localeZhHans`.
