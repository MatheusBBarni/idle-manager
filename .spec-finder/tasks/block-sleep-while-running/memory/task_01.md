# Task Memory: task_01

## Objective Snapshot

Ship `hasRunningAccount` plus StatusBar `sleepBlocked` hint from the running set. No OS keep-awake.

## Important Decisions

- Predicate is `status === 'running'` only; `poppedOut` and tab visibility are ignored, matching TechSpec Contracts.
- Hint is a compact `span role="status"` after the running-count text inside the existing `h-8` footer. No button, no `overlayOpen`.
- Copy: EN `Sleep blocked`; PT `Suspensão bloqueada`; ES `Suspensión bloqueada`; zh-Hans `已阻止休眠`.

## Learnings

- StatusBar already counted running accounts; the hint must still call `hasRunningAccount` rather than that local count so task_02 can share the same export.
- Vitest cannot prove StatusBar `role="status"` or overlay behavior; gates are `pnpm test` + `pnpm typecheck`.

## Files / Surfaces

- `src/shared/workspace.ts` — `hasRunningAccount`
- `src/shared/workspace.test.ts` — empty / one running / popped-out running / all closed
- `src/shared/i18n.ts` + `i18n.test.ts` — `sleepBlocked` in four maps; EN frozen
- `src/renderer/src/components/StatusBar.tsx` — footer hint

## Errors / Corrections

- None.

## Ready for Next Run

- Predicate is exported. Do not create `sleepBlock.ts` or call `powerSaveBlocker` in this task.
