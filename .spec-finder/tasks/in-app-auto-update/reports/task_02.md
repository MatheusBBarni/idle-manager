# Task 02 Final Report: Spike pack/feed artifact names

## Outcome

- Verdict: completed
- Date: 2026-08-30
- Provider/session: manual `sf-batch-tasks` (Pi)

## Changes

- `.spec-finder/tasks/in-app-auto-update/memory/MEMORY.md` — two task_05 handoff strings
- `.spec-finder/tasks/in-app-auto-update/memory/task_02.md` — spike notes
- No application source or CI edits

## Requirements

| Requirement | Status | Evidence |
|---|---|---|
| 1. Glob for Windows feed metadata | satisfied | `latest.yml` + `*.exe.blockmap` (see Handoffs) |
| 2. Whether current `files` packs `electron-updater` as a runtime dep | satisfied | pack change `none`; production-dep collector |
| 3. Promote both answers to `memory/MEMORY.md` Handoffs | satisfied | MEMORY.md task_05 bullets |
| 4. Prefer real `dist/` listing when possible | satisfied with gap | pack not run; docs+source used |
| 5. No src/CI mutation | satisfied | git paths are packet memory/report only |

## Verification

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm typecheck` | pass | `TypeScript: No errors found` |
| `pnpm dist:win` / `--win --dir` | not run | Darwin host; `wine` absent; no `dist/` |
| electron-builder 26.15.3 `getUpdateInfoFileName` | Windows → `latest.yml` | `updateInfoBuilder.js` osSuffix empty on WINDOWS |
| `createBlockmap` | `{installer}.blockmap` | `BLOCK_MAP_FILE_SUFFIX = ".blockmap"`; NSIS default `differentialPackage !== false` |
| `--publish never` still writes yml | yes | `createUpdateInfoTasks` has no isPublish guard; repo `publish.provider: github` keeps configs |
| `artifactName` | `idle-manager-${version}-win-x64.exe` | `electron-builder.yml` `${name}-${version}-${os}-${arch}.${ext}` |
| `files` + node_modules | `files` excludes `node_modules`; production deps still packed | `fileMatcher.js` inserts `!**/node_modules/**`; `computeNodeModuleFileSets` copies `package.json` dependencies |
| `externalizeDepsPlugin` | leaves runtime `require()` | electron-vite docs: `dependencies` external on main/preload |

## Risks and Follow-ups

- First tagged Windows pack must list `dist/` and confirm both feed files. If names differ, change globs rather than shipping a dead Apply.
- If `electron-updater` were added only as a devDependency, it would **not** pack. task_04 must use `dependencies`.
- asarUnpack not required from source inspection; unpack only if dogfood hits asar-fs errors.

## Final Verdict

task_02 is completed: task_05 should attach `dist/latest.yml` and `dist/*.exe.blockmap` (fail-closed) and make **no** `files`/`asarUnpack` change. A Windows pack was not run on this Mac; names are from electron-builder 26.15.3 plus this repo’s `artifactName`.
