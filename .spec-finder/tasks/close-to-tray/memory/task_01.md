# Task Memory: task_01

## Objective Snapshot

- Settings Quit via `WindowCommand` `'quit'` and `beginQuit()`; Close unchanged.

## Important Decisions

- `ops:window` `'quit'` calls `beginQuit()` before the missing-window guard so Quit still exits without a `BrowserWindow`.
- `beginQuit()` only sets the in-memory quitting flag and `app.quit()`; it does not hide chrome.
- Exported `isQuitting()` from `src/main/appSession.ts` so task_02 can read the flag without a snapshot field.
- `trayRestore` is keys-only; Settings Quit is a General `Button` that calls `windowControl('quit')`.

## Learnings

- Preload already forwards the `WindowCommand` union; no extra API was required.
- Electron UI Quit was not exercised in this host session; automated gate is i18n + typecheck.

## Files / Surfaces

- `src/main/appSession.ts` — new; `isQuitting` / `beginQuit`
- `src/main/index.ts` — `'quit'` IPC branch
- `src/shared/ipc.ts` — `WindowCommand` includes `'quit'`
- `src/renderer/src/components/Settings.tsx` — Settings Quit
- `src/shared/i18n.ts` / `src/shared/i18n.test.ts` — `quit`, `trayRestore`

## Errors / Corrections

## Ready for Next Run

- task_02 owns Close intercept, Tray, and Apply `beginQuit` hook. Reuse `isQuitting`/`beginQuit`; do not re-own ipc/preload/`quit` keys.
