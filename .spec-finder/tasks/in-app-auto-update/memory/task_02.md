# Task Memory: task_02

## Objective Snapshot

- Spike: Windows feed artifact names and whether current pack includes `electron-updater`.

## Important Decisions

- Feed globs for task_05 (relative to `dist/`): `latest.yml` and `*.exe.blockmap`.
- Pack change: `none`. `files` excludes `node_modules`, but electron-builder 26 still copies production `dependencies` via `computeNodeModuleFileSets`. Once task_04 adds `electron-updater` as a runtime dep, it lands in the asar. No extra `files`/`asarUnpack` entry.
- Windows NSIS pack was not run here (macOS host, no wine, no `dist/`). Names come from builder 26.15.3 source + `electron-builder.yml` `artifactName`.

## Learnings

- `--publish never` still writes update info (`createUpdateInfoTasks` is not gated on publish).
- Windows channel file has no OS suffix: `latest.yml` (not `latest-win.yml`).
- Blockmap default on: NSIS `differentialPackage !== false` → `{installer}.blockmap`.

## Files / Surfaces

- `electron-builder.yml` (read)
- `electron.vite.config.ts` (read)
- `.github/workflows/release.yml` (read)
- app-builder-lib 26.15.3 `updateInfoBuilder.js`, `NsisTarget.js`, `fileMatcher.js`, `appFileCopier.js`

## Errors / Corrections

## Ready for Next Run

- Done. task_05 consumes the two handoff strings.
