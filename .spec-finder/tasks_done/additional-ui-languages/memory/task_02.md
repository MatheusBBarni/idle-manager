# Task Memory: task_02

## Objective Snapshot

- Ship Simplified Chinese chrome the operator can pick and keep (US-02). Depends on task_01.

## Important Decisions

- `LOCALES` is now `'pt' | 'en' | 'es' | 'zh-Hans'` to match TechSpec Contracts.
- Dictionary variable is `zhHans`; record key is `'zh-Hans'`.
- Picker label is `localeZhHans: '简体中文'` in all four dictionaries, not “Chinese”.
- `'zh'` still parses as `'pt'`; `'zh-Hans'` survives.
- Default nameless account is `账号 n`.
- AGENTS.md i18n line names all four dictionaries.

## Learnings

- task_01 tests that treated `'zh-Hans'` as invalid had to be rewritten so Spanish cases stay green and Simplified Chinese is allowlisted.

## Files / Surfaces

- `src/shared/types.ts`, `src/shared/i18n.ts`, `src/shared/i18n.test.ts`
- `src/shared/workspace.ts`, `src/shared/workspace.test.ts`
- `src/renderer/src/components/Dialogs.tsx`
- `AGENTS.md`

## Errors / Corrections

## Ready for Next Run

- Focused Vitest, `pnpm test`, and `pnpm typecheck` passed.
