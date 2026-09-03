# Task 01 Final Report: Add Settings Quit that always exits

## Outcome

- Verdict: completed
- Date: 2026-09-03
- Provider/session: pi / manual sf-batch-tasks

## Changes

- `src/shared/ipc.ts` — `WindowCommand` includes `'quit'`
- `src/main/appSession.ts` — new; `isQuitting()` plus `beginQuit()` (`isQuitting=true` then `app.quit()`)
- `src/main/index.ts` — `ops:window` `'quit'` calls `beginQuit()` even if `mainWindow` is missing; min/max/close unchanged
- `src/renderer/src/components/Settings.tsx` — General Settings control calls `windowControl('quit')`
- `src/shared/i18n.ts` — `quit` and `trayRestore` in en, pt, es, zh-Hans
- `src/shared/i18n.test.ts` — frozen EN/PT maps plus four-locale presence test

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Add `'quit'` to `WindowCommand`; handle `ops:window` `'quit'` with `beginQuit()` | satisfied | `ipc.ts` union; `index.ts` `'quit'` branch before missing-window return |
| 2. Implement `beginQuit()` so a later Close interceptor can see quitting; do not hide | satisfied | `appSession.ts` sets flag then `app.quit()`; no hide/skipTaskbar |
| 3. Settings control calls `windowControl('quit')` while the window is open | satisfied | `Settings.tsx` General `Button` `onPress` → `window.opsource.windowControl('quit')` |
| 4. i18n keys `quit` and `trayRestore` in four locales; extend frozen dictionaries | satisfied | `i18n.ts` four maps; `i18n.test.ts` frozen EN/PT plus dedicated test; `pnpm test` |
| 5. Keep Close / Minimize / Maximize handlers unchanged | satisfied | `'min'`/`'max'`/`'close'` branches unchanged after the `'quit'` early return |
| 6. MUST NOT add snapshot fields or `WorkspaceAction`s for quit or dismiss | satisfied | diff is ipc/i18n/Settings/appSession/index only; no `workspace.ts` |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm test` | passed | Vitest 9 files / 97 tests (`i18n.test.ts` 13 tests) |
| `pnpm typecheck` | passed | `TypeScript: No errors found`; `windowControl('quit')` type-checks |
| Settings Quit in a live Electron session | not run | Host session did not launch the app; Electron Quit is outside Vitest |

## Risks and Follow-ups

- Live Settings Quit (start ≥1 account, Quit, process exits) was not exercised here.
- Close still quits as today; tray intercept is task_02.
- `trayRestore` is unused until task_02.

## Final Verdict

task_01 completed: `'quit'` is a typed window command that always calls `beginQuit()`, Settings exposes that control, four-locale `quit`/`trayRestore` keys are frozen and tested, and Close is unchanged.
