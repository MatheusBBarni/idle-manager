# Task Memory: task_04

## Objective Snapshot

- Packaged win32 electron-updater 6.x; Apply flush+install; quit does not install.

## Important Decisions

- Start only after chrome `did-finish-load` so `onUpdate` is subscribed.
- `autoInstallOnAppQuit = false`; never call `checkForUpdatesAndNotify`; do not set `verifyUpdateCodeSignature`.
- ESM import uses default-export destructure (`electron-builder#7976`).
- `quitAndInstall` throw stays `ready` (no error reduce).
- apply/later no-op unless `phase === 'ready'`.

## Learnings

- Runtime dep is `electron-updater` 6.8.9. Packing glob is still `none` per task_02.

## Files / Surfaces

- `src/main/updater.ts`
- `src/main/index.ts`
- `package.json` / `pnpm-lock.yaml`

## Errors / Corrections

## Ready for Next Run

- Done. task_05 attaches `latest.yml` / blockmap. G-01 remains dogfood after signing.
