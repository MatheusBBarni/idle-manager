# Task Memory: task_03

## Objective Snapshot

- Settings Shortcuts tab with capture, reset, and capturing guard.

## Important Decisions

- HeroUI v3 compound `Tabs` (`ListContainer` / `List` / `Tab` / `Panel`) split General vs Shortcuts. General keeps language, theme, startup, import/export.
- Capture is a window `keydown` listener in the capture phase. Escape `preventDefault`s and `isKeyboardDismissDisabled` keeps Settings open.
- Renderer-only `shortcutCapturing` in Zustand; Shell returns before chrome `matchShortcut`. Overlay skip for the loop interceptor is unchanged (Settings already sets overlay).
- Illegal chords (no platform mod, modifier-only keys, non-digit slot keys) leave the row unchanged and stay in capture. Duplicates set a taken hint and do not dispatch.
- Per-row reset dispatches `prefs/shortcut` with `chord: null`.
- Slot family display uses `displayShortcutLabel` (`Ctrl+1…9`).

## Learnings

- Modal ESC is `Modal.Backdrop isKeyboardDismissDisabled`. Capture-phase listeners still needed so Escape does not fall through.

## Files / Surfaces

- `src/renderer/src/components/Dialogs.tsx`
- `src/renderer/src/store.ts`
- `src/renderer/src/components/Shell.tsx`
- `src/shared/i18n.ts` / `src/shared/i18n.test.ts`
- `src/shared/shortcuts.ts` (`displayShortcutLabel`)

## Errors / Corrections

## Ready for Next Run

- Packet leaf. No further tasks in this packet.
