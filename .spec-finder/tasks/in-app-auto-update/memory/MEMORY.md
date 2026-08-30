# Workflow Memory

## Current State

- Packet `in-app-auto-update` tasks generated 2026-08-30: task_01–task_05 pending.
- No implementation started.

## Shared Decisions

- Graph: task_01 status+IPC, task_02 pack/feed spike, task_03 chrome strip, task_04 main updater, task_05 Windows `latest.yml`.
- task_03 and task_04 are parallelizable after task_01; numeric order still 03 then 04.
- ipc/preload owned by task_01 only.
- Windows Authenticode is an external ship gate (ADR-001), not a task.

## Shared Learnings

## Open Risks

- G-01 packaged apply is dogfood, not CI.
- `electron-builder.yml` `files` may omit `electron-updater` until task_02/task_05 decide the glob.
- Per-machine NSIS/UAC on apply is unknown.

## Handoffs
