# Task Memory: task_04

## Objective Snapshot

Keyboard trio plus bind list (US-04). Implemented.

## Important Decisions

- Loop commands: `account-stop-tab` Mod+W, `account-stop-farm` Mod+Shift+W, `account-restore-last` Mod+Shift+Enter.
- Settings labels reuse `stopTab` / `stopFarm` / `restoreLastSet` so the catalog matches sidebar and README.
- `actionsForCommand` returns `stopTab` whenever `liveTab()` exists (preventDefault even if the reducer no-ops). `stopFarm` and `restoreLastSet` always emit; reducer identity covers empty farms.
- Not added to chrome scope. No Start all command. No `globalShortcut`.

## Learnings

- Guest-focus (G-04) cannot be proven in node Vitest; matcher + typecheck + i18n are the CI gate.

## Files / Surfaces

- `src/shared/shortcuts.ts`, `src/shared/shortcuts.test.ts`
- `src/main/accountLoop.ts`
- `src/renderer/src/components/Settings.tsx`
- `src/shared/accountLoop.test.ts`
- `README.md`

## Errors / Corrections

- None.

## Ready for Next Run

- Packet complete. Guest-focus dogfood remains.
