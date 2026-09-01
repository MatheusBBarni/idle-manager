# Game-list pack — Technical Specification

## Context

- **PRD:** `.spec-finder/tasks/config-import-export/_prd.md`
- Workspace export/import already replace the snapshot, including account metadata. This design adds a **second** document and IPC pair so a game-list file can only **append** `tab/create`s. Selected: helpers in `workspace.ts`, IPC twins, create-then-restore ([ADR-002](adrs/adr-002.md)).

### Evidence

| Kind | Finding/constraint | Source | Version/date | Design consequence |
|---|---|---|---|---|
| Repository | Import assigns `snapshotFromImport`; invalid parse → empty snapshot | `index.ts`, `parseSnapshot` | 2026-08-31 | Pack must not be workspace-shaped; do not reuse that assign |
| Repository | `tab/create` appends, empty accounts, steals `activeTabId` | `workspace.ts` | 2026-08-31 | Restore prior in-bar active after import |
| Repository | Vitest = `src/shared` only; isolation verify is partitions | `AGENTS.md` | 2026-08-31 | Prove pack in `workspace.test.ts`; do not run verify |
| Official docs | Save `{ canceled, filePath }`; open `{ canceled, filePaths }` | [dialog](https://www.electronjs.org/docs/latest/api/dialog) | Electron 37.10.3 | Clone existing dialog handlers |
| User decision | New IPC + `kind: 'game-list'`; create-then-restore; silent skip; `workspace.ts` | ADR-002 | 2026-08-31 | Locks this spec |
| Inference | Extra fields on a v1 workspace object would still parse | `parseSnapshot` ignores unknown keys | 2026-08-31 | Reject any document with `accounts` |

## Technical Goals and Non-Goals

### Goals

- Distinct pack schema and parse/export in `workspace.ts` — G-01, G-04, F-02, F-03, F-06
- New preload/IPC booleans; workspace channels unchanged — G-03, F-01, F-04, F-09
- Import = `commitAll` of `tab/create` (+ restore `tab/activate`) — G-02, F-05, F-07
- Fail closed: no `snapshotFromImport`, no snapshot assign, `false` — F-08, US-04, Constraints
- Settings + PT/EN strings distinct from workspace — F-10, US-08
- Unit-test pack contract; `pnpm test` + `pnpm typecheck` — G-01 file effect; dialogs are dogfood

### Non-Goals

- Changing `ops:export` / `ops:import`, `exportMetadata`, `parseSnapshot`, or adding a workspace-import confirm — PRD / ADR-001; reconsider if G-01 fails on wrong click
- New module, new `WorkspaceAction`, error dialog, empty-bar CTA, game picker
- `verify:isolation`, Electron unit tests, telemetry, README/site (PRD open)
- Cookie/partition IO on this path

## Requirement Traceability

| PRD ID | Technical obligation | Component/interface | Verification | Status/gap |
|---|---|---|---|---|
| G-01 | Pack tabs appear; zero accounts from file | `parseGameList` + `tab/create` | `workspace.test.ts`; dogfood handoff | Dialogs not in CI |
| G-02 | Existing tabs/accounts/active farm preserved | `gameListImportActions` restore activate | unit: accounts/tabs length + `activeTabId` | — |
| G-03 | Workspace export/import untouched | `ops:export` / `ops:import` | no edits; checklist | — |
| G-04 | One export of `visibleTabs` name+URL | `exportGameList` | unit | — |
| US-01 | Export in-bar only; cancel no-op; empty pack adds nothing | export + import of `tabs: []` | unit + dogfood cancel | Cancel not in CI |
| US-02 | Import adds tabs, no jars; keyboard can press Settings buttons | IPC + existing Settings overlay | unit; HeroUI button already keyboard | — |
| US-03 | Additive; prior tab+account remain | `commitAll` creates only | unit | — |
| US-04 | Cancel / junk / workspace JSON: no mutation | parse `[]` → no commit | unit; main catch | IO catch not in CI |
| US-05 | Re-import duplicates tabs | two `tab/create` same URL | unit | — |
| US-06 | Archived omitted | `visibleTabs` only | unit | — |
| US-07 | Four Settings actions | `Dialogs.tsx` | visual | — |
| US-08 | Distinct PT/EN keys | `i18n.ts` | `i18n.test.ts` | — |
| F-01–F-10 | As above | same | same | — |
| Constraints | No account fields; reject `accounts`; duplicates allowed; PT/EN; no bot/telemetry | schema + parse | unit | — |

## Decision

Approach A ([ADR-002](adrs/adr-002.md)): pack helpers in `workspace.ts`; `kind: 'game-list'` JSON; new IPC; `commitAll` of `tab/create` then restore active; silent skip of bad URLs; wrong documents return `false`. **Trade-off:** `workspace.ts` owns two documents; no user-visible error. **Gives up:** `gameList.ts`, bulk action, workspace-import guard.

### Alternatives rejected

- Kind flag on existing IPC — frozen workspace contract
- `src/shared/gameList.ts` — extra module
- Main-only parse — untested schema
- `tabs/importPack` / last-create stays active — forks create or hides the farm

## Architecture

### Components

| Component | Existing/new | Responsibility | Inputs/outputs | Dependencies |
|---|---|---|---|---|
| `workspace.ts` `exportGameList` / `parseGameList` / `gameListImportActions` | new fns | pack document + action list | snapshot/raw → pack / tabs / actions | `visibleTabs`, `isValidHttpUrl`, `tab/create` |
| `ipc.ts` `OpsourceAPI` | existing | `exportGameList` / `importGameList` | `Promise<boolean>` | preload |
| `preload/index.ts` | existing | `ops:exportGames` / `ops:importGames` | invoke | ipc |
| `index.ts` handlers | existing | dialog + IO + `commitAll` | boolean | workspace fns, `commitAll` |
| `Dialogs.tsx` Settings | existing | two buttons | i18n | `window.opsource` |
| `i18n.ts` | existing | PT/EN labels | keys | tests |
| `exportMetadata` / `ops:import` | existing | **unchanged** | — | — |

### Data flow

```
Export: Settings → exportGameList IPC → showSaveDialog
        → canceled? false
        → writeFile(JSON.stringify(exportGameList(snapshot))) → true | catch false

Import: Settings → importGameList IPC → showOpenDialog
        → canceled? false
        → read + JSON.parse (catch → false)
        → parseGameList → [] ? false
        → commitAll(gameListImportActions(snapshot, tabs)) → true
```

No path assigns `snapshot = snapshotFromImport(...)`.

### Impact

| Component/file | Impact | Risk | Required action |
|---|---|---|---|
| `src/shared/workspace.ts` | new types/fns | mix two documents | keep parse reject `accounts` |
| `src/shared/workspace.test.ts` | pack cases | miss restore-active | cover G-02 |
| `src/shared/ipc.ts`, preload, `index.d.ts` | API surface | renderer calls old names | add methods only |
| `src/main/index.ts` | two handlers | copy-paste assign-import | use `commitAll` |
| `Dialogs.tsx`, `i18n.ts`, `i18n.test.ts` | chrome | same label as workspace | distinct keys |
| `views.ts`, `persistence.ts`, isolation | none | accidental wipe | do not touch |

## Contracts

### Public interfaces

```ts
export type GameListTab = { name: string; baseUrl: string }

export type GameListExport = {
  version: 1
  kind: 'game-list'
  tabs: GameListTab[]
}

export function exportGameList(snapshot: WorkspaceSnapshot): GameListExport
export function parseGameList(raw: unknown): GameListTab[]
export function gameListImportActions(
  snapshot: WorkspaceSnapshot,
  tabs: GameListTab[]
): WorkspaceAction[]

// OpsourceAPI (additive)
exportGameList: () => Promise<boolean>
importGameList: () => Promise<boolean>
```

IPC: `ops:exportGames`, `ops:importGames`.  
`exportGameList(snapshot)`: `tabs` = `visibleTabs(snapshot)` mapped to `{ name, baseUrl }` in bar order. No other keys.

`parseGameList`: return `[]` unless `raw` is a record with `version === 1`, `kind === 'game-list'`, `Array.isArray(tabs)`, and **no** `accounts` own-property. Each row: `baseUrl` string passing `isValidHttpUrl`; `name` string (empty allowed). Skip other rows.

`gameListImportActions`: one `{ type: 'tab/create', name, baseUrl }` per tab (**no** `id`). If `snapshot.activeTabId` names a non-archived tab, append `{ type: 'tab/activate', id: that }`. Empty `tabs` → `[]`.

Dialogs (main, English titles matching today’s workspace handlers): save `defaultPath: 'idle-manager-games.json'`, open `properties: ['openFile']`, JSON filter. Return `false` when `canceled` or missing path.

### Data model

Pack is not `WorkspaceSnapshot`. Imported tabs are new UUID rows, `layout: 'grid'`, `accountOrder: []`, `archived: false`. No partition dirs created until the user later starts an account.

### Errors

| Name | Cause | Behavior |
|---|---|---|
| cancel | dialog `canceled` | `false`; no IO |
| unreadable | `JSON.parse` / `readFile` throw | `false`; snapshot unchanged |
| wrong-document | parse `[]` (workspace JSON, missing kind, `accounts` present, empty/invalid rows) | `false`; no `commitAll` |
| write-fail | `writeFile` throw | `false` |
| no-window | `mainWindow` null | `false` |

No thrown IPC errors for those cases (catch in handler).

### Changed boundaries

| Boundary | Current | Change | Failure | Compatibility |
|---|---|---|---|---|
| `OpsourceAPI` | export/import workspace only | + game list pair | `false` | additive |
| On-disk pack | none | `GameListExport` | ignored by `parseSnapshot` (no `accounts`) | workspace import of pack still wipes (unchanged) |
| `applyAction` | unchanged | import uses existing `tab/create` | — | — |

## Failure and Edge Cases

| Failure mode | Detection | User/system behavior | Recovery | Evidence |
|---|---|---|---|---|
| Cancel save/open | `canceled` | `false`; unchanged | retry | dogfood |
| Workspace JSON on game import | `accounts` or `kind` ≠ `game-list` | `false`; no replace | pick pack file | unit parse `[]` |
| Game pack on workspace import | existing `parseSnapshot` | **empty wipe** (status quo) | out of scope | ADR-001 |
| Bad JSON / empty file | parse throw / `[]` | `false` | retry | unit + catch |
| Row without http(s) | `isValidHttpUrl` | skip row | rest import | unit |
| Zero valid rows | `tabs.length === 0` | `false`; no commit | — | unit |
| Re-import | same URLs | new tab ids | user deletes extras | unit |
| No in-bar tabs export | `tabs: []` | file written `true` | import no-ops | unit |
| Prior active tab | `activeTabId` in-bar | restored after creates | farm stays visible | unit |

## Security, NFRs, and Operations

### Security and privacy

Pack must not serialize account ids, names, colors, URLs, or session data. `parseGameList` fail-closed if `accounts` is present. Do not log file contents. No `clearAccountSession` on this path. Game views stay sandboxed; chrome only triggers IPC.

### Compatibility, rollout, rollback

Additive API. No snapshot version bump. Remove handlers to roll back; leftover `.json` packs are inert. Workspace files remain `exportMetadata` v1.

### Observability

No new metrics. Handlers return boolean only (same as workspace). Persist via existing `scheduleSave` inside `commitAll`.

## Tests

- **Unit (`workspace.test.ts`):** export omits archived and all account keys; parse accepts only `kind: 'game-list'`; parse `[]` for workspace-shaped, missing kind, `accounts: {}`, null, `[]`; skip `javascript:` / empty URL; `gameListImportActions` creates N tabs, no account keys, restores `activeTabId` when set, leaves last create active when none; applying twice duplicates names/URLs with new ids.
- **Integration:** none in CI (dialog/IPC).
- **Platform / e2e:** G-01 dogfood handoff.
- **Gates:** `pnpm test` ; `pnpm typecheck`. Do **not** require `pnpm verify:isolation`.

## Sequencing

1. `GameListExport` + `exportGameList` / `parseGameList` / `gameListImportActions` + tests — no dependencies.
2. `OpsourceAPI` + preload + main handlers using `commitAll` — depends on 1 because handlers must not assign snapshot.
3. Settings buttons + i18n PT/EN + i18n tests — depends on 2 because buttons call the new methods.
4. `pnpm test` && `pnpm typecheck` — depends on 1–3.

## Open Questions

- Whether README/site mention the pack after G-01 (PRD; not required to implement).

## Architecture Decision Records

- [ADR-001: Settings game-list pack, additive load](adrs/adr-001.md) — product approach
- [ADR-002: Game-list helpers in workspace.ts, IPC twins, tab/create import](adrs/adr-002.md) — this design
