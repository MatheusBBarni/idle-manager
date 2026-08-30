# Task Memory: task_03

## Objective Snapshot

- StatusBar getting / Apply+Later / version-only from `onUpdate`; Later command; PT/EN.

## Important Decisions

- Update status lives on the Zustand store, not the workspace snapshot.
- Apply/Later only render for `phase === 'ready'`. `later` and `idle` keep the existing version-only footer.
- Footer uses compact HeroUI `Button` (`h-6`); no dialog, no `overlayOpen`.
- `updateCommand` rejections are swallowed until task_04 registers the main handler.

## Learnings

- Renderer Vitest env does not exist; G-04 is source review + typecheck, not a launched UI.

## Files / Surfaces

- `src/renderer/src/store.ts`
- `src/renderer/src/App.tsx`
- `src/renderer/src/components/StatusBar.tsx`
- `src/shared/i18n.ts`
- `src/shared/i18n.test.ts`

## Errors / Corrections

## Ready for Next Run

- Done. Main must emit `onUpdate` and handle `updateCommand` in task_04.
