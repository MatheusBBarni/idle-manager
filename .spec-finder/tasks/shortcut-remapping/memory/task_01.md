# Task Memory: task_01

## Objective Snapshot

- Persist full shortcut map, catalog, `prefs/shortcut`, parse/export fallbacks. Leave live listeners frozen.

## Important Decisions

- Catalog order is `SHORTCUT_COMMANDS` (TechSpec union order). Later duplicate identity falls back to that command’s shipped default.
- `account-slot` stores canonical `key: '1'`; matcher accepts digits `1`–`9` at the stored shift/alt.
- `tab-next` inverted-shift match runs only after exact chrome matches, still returning `tab-next`.
- Platform mod is implied and not stored. Reducer illegal chords are empty/invalid `{key,shift,alt}` (and non-digit slot keys).
- Live interceptor (`matchAccountLoopChord`) and `Shell.tsx` were not wired; `ACCOUNT_LOOP_SHORTCUTS` still feeds the read-only Settings list.

## Learnings

- `occupyingIdentities` returns a `Set`; use iteration, not `Array.prototype.some`.

## Files / Surfaces

- `src/shared/shortcuts.ts` (new)
- `src/shared/shortcuts.test.ts` (new)
- `src/shared/types.ts` — `shortcuts` on `WorkspaceSnapshot`
- `src/shared/workspace.ts` — parse, empty, export, `prefs/shortcut`
- `src/shared/workspace.test.ts` — parse/apply/export cases

## Errors / Corrections

- First conflict helper used `.some` on a `Set`; tests caught it; switched to `for…of`.

## Ready for Next Run

- Done. task_02 consumes `getSnapshot().shortcuts` via `matchShortcut` scopes.
