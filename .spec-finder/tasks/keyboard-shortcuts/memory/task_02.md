# Task Memory: task_02

## Objective Snapshot

- Read-only Settings list + README Keyboard rows for the four loop chords.

## Important Decisions

- Settings shows platform glyphs (`⌘⇧N` on darwin, `Ctrl+Shift+N` elsewhere) from i18n keys; README keeps the existing `Mod+` table convention.
- Chord glyph keys are identical in PT/EN and listed in the i18n `shared` set so the all-keys test still passes.
- No remapping controls; list is a `<ul>` of labels + `<kbd>`.

## Learnings

## Files / Surfaces

- `src/shared/i18n.ts`, `src/shared/i18n.test.ts`
- `src/renderer/src/components/Dialogs.tsx` (`SettingsModal`)
- `README.md` Keyboard table
- `src/main/` and `site/` untouched

## Errors / Corrections

## Ready for Next Run

- Four accelerators match task_01 / ADR-003 for task_03 docs copy.
