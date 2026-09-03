# Task Memory: task_02

## Objective Snapshot

- win32 Close with a live farm hides to Tray; empty Close quits; restore/quit on tray; Apply uses `beginQuit`.

## Important Decisions

- `trayReady` starts true only on win32 (no probe Tray) so the first Close can dismiss without flashing an icon. Construct failure at Close calls `noteTrayReady(false)` and does not preventDefault.
- Close interceptor lives on `BrowserWindow` `'close'` in `index.ts`; hide/skipTaskbar/Tray live in `appSession`.
- Tray is created only while dismissed; click and `trayRestore` call `restoreMainWindow()`; tray Quit calls `beginQuit()`.
- Apply calls `beginQuit()` then `quitAndInstall()` so the interceptor sees quitting before updater closes windows.

## Learnings

- `autoInstallOnAppQuit` is false; `quitAndInstall` runs `install()` synchronously then `app.quit()` on `setImmediate`. `beginQuit` also `app.quit()`s; install still runs in the same turn after `beginQuit` returns.
- This host is darwin: Close-to-tray is not intercepted; Windows dogfood was not run.

## Files / Surfaces

- `src/shared/trayPolicy.ts` / `src/shared/trayPolicy.test.ts`
- `src/main/appSession.ts` — hide, tray, restore, `interceptClose`
- `src/main/index.ts` — `'close'` preventDefault; `syncDismissedSession` after snapshot writes
- `src/main/updater.ts` — Apply `beginQuit` then install

## Errors / Corrections

## Ready for Next Run

- task_03 should call `restoreMainWindow()` on `second-instance` when dismissed; otherwise focus. Do not reimplement tray.
