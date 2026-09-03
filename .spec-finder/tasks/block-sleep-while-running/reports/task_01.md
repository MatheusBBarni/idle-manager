# Task 01 Final Report: Show sleep-blocked hint from the running set

## Outcome

- Verdict: completed
- Date: 2026-09-03
- Provider/session: pi / manual sf-batch-tasks

## Changes

- `src/shared/workspace.ts` — export `hasRunningAccount(snapshot)` true iff some account `status === 'running'`
- `src/shared/workspace.test.ts` — empty false; one running true; popped-out running true; all closed false
- `src/shared/i18n.ts` — `sleepBlocked` in `en`, `pt`, `es`, `zh-Hans`; EN `Sleep blocked`
- `src/shared/i18n.test.ts` — EN frozen string; non-en non-empty and distinct; complete-dictionary alignment
- `src/renderer/src/components/StatusBar.tsx` — footer `span role="status"` from the predicate; hidden at zero running

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Export `hasRunningAccount` true iff some account `status === 'running'`; ignore `poppedOut` and visibility | satisfied | `src/shared/workspace.ts`; popped-out running unit is true |
| 2. Unit-test 0 running → false; 1 running → true; popped-out running → true; all closed → false | satisfied | `workspace.test.ts` `hasRunningAccount` describe (4 tests) in `pnpm test` |
| 3. Footer hint from that predicate with `role="status"`; MUST NOT set `overlayOpen` or add a dialog | satisfied | `StatusBar.tsx` `{sleepBlocked ? <span role="status">…`; grep `overlayOpen` in StatusBar: no matches; no Dialog |
| 4. `sleepBlocked` in four locales; EN `Sleep blocked`; i18n tests aligned | satisfied | `i18n.ts` four maps; `t('en', 'sleepBlocked') === 'Sleep blocked'`; pt/es/zh-Hans differ; `i18n.test.ts` passed |
| 5. MUST NOT add workspace / `parseSnapshot` fields or `WorkspaceAction` variants | satisfied | `git diff` only adds the predicate helper; no type/action/parse changes |
| 6. MUST NOT create `src/main/sleepBlock.ts` or call `powerSaveBlocker` | satisfied | no `sleepBlock.ts`; no `powerSaveBlocker` in this diff |
| 7. SHOULD keep existing `h-8` footer compact (text span, no button) | satisfied | hint is a text `span` in the existing `h-8` footer |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test` | passed | Vitest 9 files / 94 tests (workspace 37, i18n 11) |
| `pnpm typecheck` | passed | `TypeScript: No errors found` |
| StatusBar `role="status"` / no overlay | review only | Vitest is `src/shared/**/*.test.ts` only; no packaged UI pass. Source shows `role="status"` and no `overlayOpen`. |

## Risks and Follow-ups

- Hint can appear before task_02 starts `prevent-app-suspension` (ADR-002 / task rollout).
- Packaged chrome review for G-02 is not in CI.
- Overnight idle-timer proof remains G-01 dogfood for task_02, not this slice.

## Final Verdict

task_01 completed: `hasRunningAccount` is unit-tested including popped-out running, four-locale `sleepBlocked` copy is aligned with EN `Sleep blocked`, and StatusBar shows a compact `role="status"` hint without overlay or OS keep-awake.
