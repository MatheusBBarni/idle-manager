# in-app-auto-update tasks

Canonical execution order. Numeric IDs are the run order. Parallelizable tasks still keep these IDs.

| ID | Title | Primary slice | Type | Complexity | Dependencies | Status |
|---|---|---|---|---|---|---|
| task_01 | Lock idle/getting/ready/later and the update IPC types | US-05 | backend | medium | [] | completed |
| task_02 | Spike pack/feed artifact names | G-01 | spike | medium | [] | completed |
| task_03 | Show Apply/Later on the chrome strip | US-01 | frontend | high | [task_01] | completed |
| task_04 | Obtain and apply from packaged Windows | US-03 | backend | high | [task_01] | completed |
| task_05 | Attach Windows latest.yml on GitHub Releases | G-01 | infra | medium | [task_02, task_04] | completed |

## Execution order

1. **task_01** — Shared `reduceUpdateStatus` plus `OpsourceAPI` `onUpdate` / `updateCommand` in preload (no main updater yet).
2. **task_02** — Spike: exact Windows `latest.yml`/blockmap names and whether current `files` packs `electron-updater`.
3. **task_03** — StatusBar getting / Apply+Later / version-only from `onUpdate` (PT/EN).
4. **task_04** — Packaged win32 electron-updater 6.x; Apply flush+install; quit does not install.
5. **task_05** — Release job attaches Windows feed metadata (fail-closed) and asar includes the updater.

**Roots:** task_01, task_02  
**Leaves:** task_03, task_05  
**Critical path:** task_01 → task_04 → task_05  
**Parallelizable:** {task_01, task_02} as roots; {task_03, task_04} after task_01 — numeric order still 03 then 04.  
**Spikes / blockers:** task_02 is the spike. Windows Authenticode (ADR-001) is an external ship gate, not a task; it blocks dogfood G-01 only.

## Slices

| Primary | Tasks | Outcome |
|---|---|---|
| US-05 | task_01 | Chrome can only become Apply when reduce says `ready`; empty paths stay idle |
| G-01 | task_02, task_05 | Feed artifacts named and attached so Apply is not a dead button |
| US-01 | task_03 | Operator sees ready Apply/Later on the footer without covering the farm |
| US-03 | task_04 | Operator Apply relaunches on the new version; other quits do not install |

US-02 (getting while running) is task_04 emit + task_03 copy.  
US-04 (Later this session) is task_01 reduce + task_03 hide + task_04 in-memory.  
F-01–F-08 and G-02–G-05 are covered inside those slices, not as extra tasks.  
Isolation / `workspace.ts` / game-view preload are non-changes on every task.

## Tie-break rationale

task_01 before task_02: status/IPC unlocks chrome and main. task_03 before task_04: chrome is user-visible without a live feed. ipc/preload owned only by task_01 so task_03 and task_04 do not double-write that contract.
