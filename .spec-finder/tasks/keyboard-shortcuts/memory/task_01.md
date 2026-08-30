# Task Memory: task_01

## Objective Snapshot

- Ship matcher + main interceptor for create / next / prev / start.

## Important Decisions

- Matcher accepts `{` / `}` as well as `[` / `]` for prev/next: US QWERTY Shift+[ reports `key: '{'`.
- `preventDefault` only after a match that produces at least one `commit` action (no-tab / empty order / no active start target do not swallow keys).
- Chrome editable skip uses a last-known `executeJavaScript` probe (sync `preventDefault` cannot await). Overlay skip is `StageReport.overlayOpen` mirrored in main.
- `account/create` activate-if-empty rule left unchanged; keyboard path is create then activate with `newId()`.

## Learnings

- Guest-focus routing is not covered by Vitest; G-01 remains dogfood.

## Files / Surfaces

- `src/shared/accountLoop.ts`, `src/shared/accountLoop.test.ts`
- `src/shared/workspace.test.ts` (G-05)
- `src/main/accountLoop.ts`
- `src/main/views.ts` (`attachSessionHandlers` after `touch`)
- `src/main/index.ts` (chrome attach, `bindAccountLoop`, overlay flag)
- `Shell.tsx` / `AccountModal` untouched

## Errors / Corrections

## Ready for Next Run

- Chords frozen for task_02 / task_03 copy: `Mod+Shift+N`, `Mod+Shift+[`, `Mod+Shift+]`, `Mod+Enter`.
