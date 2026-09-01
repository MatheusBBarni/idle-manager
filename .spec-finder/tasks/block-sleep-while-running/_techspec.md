# Block sleep while running — Technical Specification

## Context

- **PRD:** `.spec-finder/tasks/block-sleep-while-running/_prd.md`
- Seam: running accounts stay live, but nothing requests OS keep-awake. Selected design: **snapshot-derived `prevent-app-suspension` + status-bar hint, no new IPC** ([ADR-002](adrs/adr-002.md)).

### Evidence

| Kind | Finding/constraint | Source | Version/date | Design consequence |
|---|---|---|---|---|
| Repository | `status` persists; load can restore running | `workspace.ts` `parseSnapshot` | 2026-09-01 | Sync blocker after load, not only dispatch |
| Repository | Import-workspace bypasses `commit`; sessions start closed | `index.ts`, `snapshotFromImport` | 2026-09-01 | Sync that path too; expect stop |
| Repository | 7+ warning is derived; overlays hide views | `metricsDisplay.ts`, `Stage.tsx` | 2026-09-01 | Hint from predicate; footer only |
| Repository | Vitest = `src/shared`; isolation CLI | `vitest.config.ts` | 2026-09-01 | No Electron unit CI |
| Official docs | `prevent-app-suspension` = system awake, screen may off | [powerSaveBlocker](https://www.electronjs.org/docs/latest/api/power-save-blocker) | Electron 37 / 2026-09-01 | Never `prevent-display-sleep` |
| User decision | All-OS; hint from running; retry next sync; shared tests | TechSpec Qs + [ADR-002](adrs/adr-002.md) | 2026-09-01 | Locks this spec |
| Inference | Process exit usually drops the request | OS power request lifetime | 2026-09-01 | Still `stop` on `before-quit` (G-03) |

## Technical Goals and Non-Goals

### Goals

- One main `powerSaveBlocker` of type `prevent-app-suspension` while `hasRunningAccount` — G-01, F-01, F-05, US-01, US-04
- Same predicate drives the footer hint on every OS — G-02, F-02, F-07, US-02
- Stop when running set is empty and on `before-quit` — G-03, F-03, F-04, US-03, US-06
- No snapshot field, no `WorkspaceAction`, no `OpsourceAPI` change — F-06, Constraints
- Shared tests + four-locale key; isolation files untouched — Constraints, F-06

### Non-Goals

- `prevent-display-sleep`, power-plan edits, lid/Start→Sleep defeat
- Park, throttle, `backgroundThrottling: true`, `views.ts` isolation changes
- New IPC / persist / Settings toggle / tray / covering chrome
- Electron keep-awake tests in CI; Windows idle-timer spike as ship gate
- New packages, ffi/`SetThreadExecutionState` beside Electron
- macOS close-window (views gone, snapshot still running) as a special stop rule

## Requirement Traceability

| PRD ID | Technical obligation | Component/interface | Verification | Status/gap |
|---|---|---|---|---|
| G-01 | Blocker on while any running | `syncSleepBlock` | dogfood journal | not in CI |
| G-02 | Hint iff running ≥ 1 | `hasRunningAccount` + StatusBar | unit + chrome review | — |
| G-03 | Stop on empty set and quit | `stopSleepBlock` | review + journal | not in CI |
| US-01 | Overnight idle timer | same as G-01 | dogfood | — |
| US-02 | Footer hint, no overlay | StatusBar `role="status"` | unit i18n + review | — |
| US-03 | Last close releases | empty predicate → stop | unit predicate + journal | — |
| US-04 | Popped-out / other-tab / minimized count | predicate ignores `poppedOut` and visibility | unit | — |
| US-05 | Isolation + close unchanged | do not touch `views.ts` / partitions | `verify:isolation` | — |
| US-06 | Quit releases | `before-quit` → `stopSleepBlock` | review + journal | — |
| F-01–F-07 | As goals/stories | main + StatusBar + shared | same | — |
| Constraints | no pause/reload; no overlay; no telemetry; 4 locales; no power-plan; display may sleep | ADR-002 | review + i18n tests | — |

## Decision

**Snapshot-derived keep-awake** ([ADR-002](adrs/adr-002.md)): shared `hasRunningAccount`; main syncs a single `prevent-app-suspension` id after snapshot writes and load; StatusBar shows i18n hint from the same predicate; `stop` on empty and quit. **Trade-off:** hint can outpace a failed `start` until the next sync; G-01 is dogfood.

### Alternatives rejected

- Blocker inside `syncViews` — isolation-file risk; user A
- IPC `sleepBlocked` — extra contract; fights G-02 / failure A

## Architecture

### Components

| Component | Existing/new | Responsibility | Inputs/outputs | Dependencies |
|---|---|---|---|---|
| `hasRunningAccount` in `src/shared/workspace.ts` | existing file, new export | running set includes popped-out | snapshot → boolean | none |
| `src/main/sleepBlock.ts` | new | start/stop one blocker id | snapshot in | `powerSaveBlocker` |
| `src/main/index.ts` | existing | call sync on `commitAll`, load, import; stop on `before-quit` | snapshot | `sleepBlock.ts` |
| `StatusBar.tsx` | existing | hint when predicate true | snapshot | i18n |
| `src/shared/i18n.ts` | existing | `sleepBlocked` in four maps | locale → string | i18n tests |

### Data flow

```
loadSnapshot | commitAll | import-workspace
        → syncSleepBlock(snapshot)
             hasRunningAccount?
               yes + !isStarted → start('prevent-app-suspension')
                    fail → log, id=null (retry next sync)
               no  → stop if id set
renderer StatusBar: hasRunningAccount → t(sleepBlocked) else nothing
before-quit → stopSleepBlock
--verify-isolation → exit before load → never start
```

### Impact

| Component/file | Impact | Risk | Required action |
|---|---|---|---|
| `workspace.ts` + test | new predicate | popped-out excluded by mistake | unit: popped-out counts |
| `sleepBlock.ts` / `index.ts` | new wire | missed import path; double start | one id; all write paths |
| `StatusBar.tsx` | one span in h-8 | overflow | compact copy; no overlay |
| `i18n.ts` + test | four keys | missing locale | MESSAGE_KEYS + frozen maps |
| `views.ts` / partitions / IPC | none | isolation regression | do not touch |
| `parseSnapshot` | none | no new fields | — |

## Contracts

### Public interfaces

```ts
// src/shared/workspace.ts
export function hasRunningAccount(snapshot: WorkspaceSnapshot): boolean
// true iff some snapshot.accounts[id].status === 'running'
// poppedOut, tab, minimized window do not matter

// src/main/sleepBlock.ts
export function syncSleepBlock(snapshot: WorkspaceSnapshot): void
export function stopSleepBlock(): void
```

```ts
powerSaveBlocker.start('prevent-app-suspension') // only allowed type
powerSaveBlocker.stop(id)
powerSaveBlocker.isStarted(id)
```

i18n key `sleepBlocked` (all of `en` / `pt` / `es` / `zh-Hans`). EN: `Sleep blocked`.

StatusBar: when `hasRunningAccount(snapshot)`, render a footer `span` with `role="status"` and `t(locale, 'sleepBlocked')`. No button. No `overlayOpen`.

`OpsourceAPI`, `WorkspaceSnapshot`, `WorkspaceAction`: **unchanged**.

### Data model

No new persisted fields. Blocker id is process memory only.

### Errors

| Name | Behavior |
|---|---|
| `start` not `isStarted` | `console.error`; forget id; hint still on if running; retry next `syncSleepBlock` |
| `stop` on missing id | no-op |
| Isolation verify | never call start |

### Changed boundaries

None at IPC/snapshot. New internal main module only.

## Failure and Edge Cases

| Failure mode | Detection | User/system behavior | Recovery/rollback | Evidence |
|---|---|---|---|---|
| `start` refused | `!isStarted(id)` | hint still shown; sleep may still occur | retry next snapshot sync | log + dogfood |
| Last account closed | predicate false | hint gone; `stop` | — | unit + journal |
| App quit / crash | `before-quit` / process death | request released | OS drops on process exit | journal US-06 |
| Load with running accounts | `loadSnapshot` then sync | blocker on at launch | — | review |
| Import workspace | closed sessions | `stop` | — | predicate unit |
| `--verify-isolation` | early `app.exit` | no blocker | — | do not wire that path |
| User Start→Sleep / lid | OS | may still sleep | out of scope | PRD |
| macOS window closed, accounts still running | snapshot | blocker stays | quit or close accounts | non-goal |

## Security, NFRs, and Operations

### Security and privacy

No new privileges, network, or telemetry. Do not inspect game documents.

### Compatibility, rollout, and rollback

All OS get the same behavior; Windows journal is G-01. Revert files; no migration.

### Observability

Failed `start` → `console.error` (same style as persist failures). No metrics channel.

## Tests

- **Unit:** `hasRunningAccount` — 0 running → false; 1 running → true; popped-out running → true; all closed → false. i18n: `sleepBlocked` on all four locales; EN frozen string `Sleep blocked`.
- **Integration:** none (no Electron in Vitest).
- **Platform / e2e:** G-01/G-03 overnight journal (PRD); not a CI gate.
- **Gates:** `pnpm test` ; `pnpm typecheck` ; `pnpm verify:isolation` (must stay green; this packet must not edit isolation).

## Sequencing

1. Shared `hasRunningAccount` + i18n key + tests — no dependencies.
2. `sleepBlock.ts` + `index.ts` sync/stop — depends on step 1 (predicate).
3. StatusBar hint — depends on step 1 (can proceed in parallel with step 2).

## Open Questions

- None material. Hint wording beyond the EN contract string is polish.

## Architecture Decision Records

- [ADR-001: Running-bound keep-awake](adrs/adr-001.md) — product approach
- [ADR-002: Snapshot-derived keep-awake](adrs/adr-002.md) — this design
