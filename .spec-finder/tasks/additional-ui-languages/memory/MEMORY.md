# Workflow Memory

## Current State

- Packet `additional-ui-languages` tasks written: task_01 pending, task_02 pending.

## Shared Decisions

- Graph: task_01 Spanish chrome (US-01), then task_02 Simplified Chinese chrome (US-02).
- task_01 `Locale` is `'pt' | 'en' | 'es'` so dictionaries typecheck; task_02 adds `'zh-Hans'` to match TechSpec Contracts.
- AGENTS.md i18n line is owned by task_02.
- `Chrome.tsx` `RecentlyClosed` locale type is owned by task_01.
- No isolation-verify gate unless partitions change (they must not).

## Shared Learnings

## Open Risks

- G-01/G-02 ship-time checklists need a real window; CI may only have Vitest + typecheck.

## Handoffs
