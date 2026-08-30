# Workflow Memory

## Current State

- Packet `in-app-auto-update` task_01 completed. task_02–task_05 pending.

## Shared Decisions

- Graph: task_01 status+IPC, task_02 pack/feed spike, task_03 chrome strip, task_04 main updater, task_05 Windows `latest.yml`.
- task_03 and task_04 are parallelizable after task_01; numeric order still 03 then 04.
- ipc/preload owned by task_01 only.
- Windows Authenticode is an external ship gate (ADR-001), not a task.
- `reduceUpdateStatus` fail-closes to `idle` on `error` / `not-available` / `reset`. `later` is in-memory only.
- `idle` + `downloaded` → `ready`. Same-version `downloaded` while `later` stays `later`.

## Shared Learnings

- No main `ops:updateCommand` handler yet; preload invoke is typed only. task_04 must register it.
- Update status is not on `WorkspaceSnapshot`.

## Open Risks

- G-01 packaged apply is dogfood, not CI.
- `electron-builder.yml` `files` may omit `electron-updater` until task_02/task_05 decide the glob.
- Per-machine NSIS/UAC on apply is unknown.

## Handoffs

- task_03: subscribe `window.opsource.onUpdate`; send `updateCommand('apply' | 'later')`; channels `ops:update` / `ops:updateCommand`.
- task_04: emit reduced `UpdateStatus` over `ops:update`; enforce apply/later no-op unless `ready`.
