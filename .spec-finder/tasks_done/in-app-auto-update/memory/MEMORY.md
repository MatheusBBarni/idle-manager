# Workflow Memory

## Current State

- Packet `in-app-auto-update` task_01–task_05 completed.

## Shared Decisions

- Graph: task_01 status+IPC, task_02 pack/feed spike, task_03 chrome strip, task_04 main updater, task_05 Windows `latest.yml`.
- ipc/preload owned by task_01 only.
- Windows Authenticode is an external ship gate (ADR-001), not a task.
- `reduceUpdateStatus` fail-closes to `idle` on `error` / `not-available` / `reset`. `later` is in-memory only.
- `idle` + `downloaded` → `ready`. Same-version `downloaded` while `later` stays `later`.
- Pack change for `electron-updater`: `none`. Feed globs: `latest.yml` and `*.exe.blockmap`.

## Shared Learnings

- Main handles `ops:updateCommand`. Updater starts only packaged `win32` after chrome load. `electron-updater` 6.8.9 is a runtime dependency.
- Update status is not on `WorkspaceSnapshot`.
- Windows NSIS pack was not executed on this macOS host (no wine, no `dist/`). Feed names are from electron-builder 26.15.3 + `artifactName`.
- Windows feed uploads are two fail-closed artifact steps so a missing yml or blockmap fails the build job.

## Open Risks

- G-01 packaged apply is dogfood, not CI. Needs a signed tagged Windows release.
- Per-machine NSIS/UAC on apply is unknown.
- First Windows pack should confirm `latest.yml` and `*.exe.blockmap` exist beside the NSIS exe.

## Handoffs
