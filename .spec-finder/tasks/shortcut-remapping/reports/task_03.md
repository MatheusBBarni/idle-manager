# Task 03 Final Report: Ship Settings Shortcuts tab with capture and reset

## Outcome

- Verdict: completed
- Date: 2026-08-31
- Provider/session: pi-coding-agent (manual sf-batch-tasks)

## Changes

- `src/renderer/src/components/Dialogs.tsx` — Settings uses HeroUI `Tabs` for General vs Shortcuts; full catalog list; click-to-press capture; per-row reset; Escape cancels capture.
- `src/renderer/src/store.ts` — renderer-only `shortcutCapturing` flag.
- `src/renderer/src/components/Shell.tsx` — skip chrome dispatch while capturing.
- `src/shared/i18n.ts` — Shortcuts tab and related labels in `en`, `pt`, `es`, `zh-Hans`.
- `src/shared/i18n.test.ts` — locale coverage for new keys; non-English not leftover English.
- `src/shared/shortcuts.ts` / `shortcuts.test.ts` — `displayShortcutLabel` for the slot family.

Not changed: Plus `AccountModal`, partitions, interceptor attach points, game-list export, README / site keyboard pages.

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. HeroUI v3 compound Tabs for General vs Shortcuts | satisfied | `Dialogs.tsx` `Tabs.ListContainer` / `Tabs.List` / `Tabs.Tab` / `Tabs.Panel` |
| 2. Full catalog with current chords; loop vs chrome-only visible | satisfied | `SHORTCUT_COMMANDS` rows; `commandScope` labels `shortcutScopeLoop` / `shortcutScopeChrome` |
| 3. Capture requires platform mod; legal unique dispatches `prefs/shortcut`; illegal/duplicate/cancel leave row | satisfied | capture-phase listener; `shortcutConflict` / `canonicalizeShortcutChord`; Escape ends capture without dispatch |
| 4. Renderer-only capturing flag; Shell does not dispatch; overlay skip stays | satisfied | `store.shortcutCapturing`; Shell early return; interceptor overlay path untouched |
| 5. Per-row reset via `chord: null` | satisfied | Reset button dispatches `{ type: 'prefs/shortcut', command, chord: null }` |
| 6. Shortcuts copy in every `LOCALES` dictionary | satisfied | i18n test `translates Shortcuts tab copy in every locale without leftover English` |
| 7. MUST NOT log raw keys; MUST NOT change game-list export | satisfied | no key logging; `exportGameList` unchanged in this diff |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test src/shared/i18n.test.ts src/shared/shortcuts.test.ts src/shared/workspace.test.ts` | pass | 3 files, 61 tests, 241ms, 2026-08-31 |
| `pnpm test` | pass | 7 files, 82 tests, 273ms, 2026-08-31 |
| `pnpm typecheck` | pass | `TypeScript: No errors found` |
| Settings capture in a live window | not run | no Electron UI driver in this environment; automated gate used |
| README / site keyboard pages | review | those files not in the diff; still shipped defaults |

## Risks and Follow-ups

- G-04 click-press / Escape-without-close / duplicate refuse still needs a real Settings session.
- G-01 guest-focus after remap remains dogfood from task_02.
- Swapping two chords still needs a parking-spot chord (ADR-001; no unbind).

## Final Verdict

completed — Settings has a Shortcuts tab listing every documented action with capture and per-row reset, Shell ignores chrome chords while capturing, i18n covers all chrome locales, and focused Vitest plus typecheck passed; live Settings interaction was not driven here.
