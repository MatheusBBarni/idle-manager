# Workflow Memory

## Current State

- Packet `in-app-auto-update` task_01–task_04 completed. task_05 pending.

## Shared Decisions

- Graph: task_01 status+IPC, task_02 pack/feed spike, task_03 chrome strip, task_04 main updater, task_05 Windows `latest.yml`.
- task_03 and task_04 are parallelizable after task_01; numeric order still 03 then 04.
- ipc/preload owned by task_01 only.
- Windows Authenticode is an external ship gate (ADR-001), not a task.
- `reduceUpdateStatus` fail-closes to `idle` on `error` / `not-available` / `reset`. `later` is in-memory only.
- `idle` + `downloaded` → `ready`. Same-version `downloaded` while `later` stays `later`.

## Shared Learnings

- Main handles `ops:updateCommand`. Updater starts only packaged `win32` after chrome load. `electron-updater` 6.8.9 is a runtime dependency.
- Update status is not on `WorkspaceSnapshot`.
- Windows NSIS pack was not executed on this macOS host (no wine, no `dist/`). Feed names are from electron-builder 26.15.3 + `artifactName`.

## Open Risks

- G-01 packaged apply is dogfood, not CI.
- Per-machine NSIS/UAC on apply is unknown.
- First Windows pack should confirm `latest.yml` and `*.exe.blockmap` exist beside the NSIS exe; if either is missing, fail the release job rather than guessing new names.

## Handoffs

- task_05: pack change remains `none`. `electron-updater` is already a runtime dependency.
- task_05 feed globs (relative to `dist/`, same tree as `*.exe`): `latest.yml` and `*.exe.blockmap`. Expected names: `latest.yml` and `idle-manager-${version}-win-x64.exe.blockmap`. Fail-closed if missing.
- task_05 pack change: `none`. Do not add a `files` or `asarUnpack` glob. Production deps are copied by `computeNodeModuleFileSets` even though `files` is `out/**/*` + `package.json` (matcher adds `!**/node_modules/**`).
