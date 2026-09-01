# Workflow Memory

## Current State

- Packet `additional-ui-languages`: task_01 completed, task_02 implemented and verified.

## Shared Decisions

- Graph: task_01 Spanish chrome (US-01), then task_02 Simplified Chinese chrome (US-02).
- Final `Locale` is `'pt' | 'en' | 'es' | 'zh-Hans'` via `LOCALES` / `isLocale` in `src/shared/types.ts`.
- AGENTS.md i18n line names all four dictionaries.
- Settings language row uses `flex-wrap` inside the existing modal.
- Invalid `prefs/locale` no-ops by returning the input snapshot.
- No isolation-verify gate unless partitions change (they must not).

## Shared Learnings

- `chromeHtmlLang` / `chromeAriaLocale` live in `src/shared/i18n.ts`; App already consumes them.
- `'zh'` is not Simplified Chinese; only `'zh-Hans'` is allowlisted.

## Open Risks

- G-01/G-02 ship-time checklists need a real window; this run used Vitest + typecheck only.

## Handoffs

- Packet leaves: no further tasks. Native-read of Spanish and Simplified Chinese confirms remains a PRD open question.
