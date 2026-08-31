# additional-ui-languages tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Ship Spanish chrome the operator can pick and keep | US-01 | frontend | high | [] | pending |
| task_02 | Ship Simplified Chinese chrome the operator can pick and keep | US-02 | frontend | high | [task_01] | pending |

## Execution order

1. **task_01** - Spanish Settings choice, complete `es` dictionary, persist `'es'`, invalid locale no-op, session-safe switch, `Cuenta N`, `html lang` `es`.
2. **task_02** - Simplified Chinese Settings choice, complete `zh-Hans` dictionary, persist `'zh-Hans'`, `账号 N`, `html lang` `zh-Hans`, AGENTS.md four-dictionary rule.

**Roots:** task_01
**Leaves:** task_02
**Critical path:** task_01 → task_02
**Parallelizable:** none
**Spikes / blockers:** none

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| US-01 | task_01 | Operator can pick Spanish and keep it across reload without wiping sessions |
| US-02 | task_02 | Operator can pick Simplified Chinese (labeled 简体中文) and keep it across reload |

US-03 (confirms), US-06 (empty), US-07 (`html lang`), US-08 (default names) are covered per language inside those tasks.
US-04, US-05, F-05, F-06, G-03, G-04 land in task_01 and must stay green in task_02.
F-01/G-01 are task_01. F-02/G-02 are task_02.
F-03/F-04/F-07 grow in both.
Site, games, Traditional Chinese, auto-detect, isolation verify are PRD/TechSpec non-goals, not tasks.

## Tie-break rationale

Only one legal order: task_02 needs `isLocale`, Settings language buttons, and `Chrome.tsx` on `Locale` from task_01.
task_01's `Locale` is `'pt' | 'en' | 'es'` so dictionaries typecheck.
task_02 adds `'zh-Hans'` to match `.spec-finder/tasks/additional-ui-languages/_techspec.md` Contracts.
