# In-app update — Technical Specification

## Context

- **PRD:** `.spec-finder/tasks/in-app-auto-update/_prd.md`
- Chrome has `getVersion` only; releases have no `latest.yml`. Selected design: electron-updater **6.x** in main, IPC side channel, StatusBar Apply/Later, attach feed metadata on GitHub Releases ([ADR-003](adrs/adr-003.md)).

### Evidence

| Kind | Finding/constraint | Source | Version/date | Design consequence |
|---|---|---|---|---|
| Repository | Workspace snapshot ≠ metrics; `OpsourceAPI` is the chrome contract | `ipc.ts`, `store.ts` | 2026-08-30 | Update is a side channel, not `WorkspaceAction` |
| Repository | StatusBar is footer chrome; overlays hide stage | `StatusBar.tsx`, `Stage.tsx` | 2026-08-30 | Put Apply/Later on the footer, `overlayOpen` unchanged |
| Repository | Main deps externalized; `files` is `out/**/*` + `package.json` | `electron.vite.config.ts`, `electron-builder.yml` | 2026-08-30 | Must pack `electron-updater` |
| Repository | Vitest = `src/shared/**/*.test.ts` | `vitest.config.ts` | 2026-08-30 | Status machine is shared-pure |
| Official docs | NSIS → electron-updater; inactive unless packaged | [auto-update](https://www.electron.build/docs/features/auto-update) | updater 6.8.9 / 2026-08-30 | No Squirrel; no dev-session live apply |
| Official docs | Builder 27 replaces `autoInstallOnAppQuit` | [v27](https://www.electron.build/docs/migration/v27-breaking-changes) | 2026-08-30 | Stay on builder 26 |
| User decision | Push+command; Apply-only install; attach `latest.yml`; shared tests | ADR-003 | 2026-08-30 | Locks this spec |
| Inference | `--publish never` still writes `latest.yml` in `dist/` | electron-builder publish docs | 2026-08-30 | Attach file; do not switch to `--publish always` |

## Technical Goals and Non-Goals

### Goals

- Main-only updater, packaged `win32`, GitHub provider — G-01, G-05, F-07
- `onUpdate` + `updateCommand('apply'\|'later')`; no snapshot fields — F-01–F-05, US-01–US-04
- `autoInstallOnAppQuit: false`; only Apply calls `quitAndInstall`; flush persist first — G-02, G-03, US-03
- StatusBar: getting / Apply+Later / version-only; never `overlayOpen` for this — G-04, F-01, F-06, US-05
- Shared status reduce + i18n PT/EN tests; `pnpm test` + `pnpm typecheck` — F-08
- Release attaches Windows `latest.yml` (+ blockmap); fail if missing — G-01
- Isolation / partitions / `workspace.ts` untouched — Constraints, `verify:isolation`

### Non-Goals

- electron-builder 27 / updater 7 / `autoInstallEvent` — ADR-003; separate migration
- Homegrown GitHub poll or spawning NSIS from renderer
- `checkForUpdatesAndNotify`, `electron-log`, `forceDevUpdateConfig` in production
- macOS zip/`latest-mac.yml`, Linux AppImage updater
- Overlay, Settings check-now, failure copy, website cutover
- Electron updater e2e CI job
- Putting update fields in `WorkspaceSnapshot` or `parseSnapshot`

## Requirement Traceability

| PRD ID | Technical obligation | Component/interface | Verification | Status/gap |
|---|---|---|---|---|
| G-01 | Packaged Win obtain+apply via GitHub feed | main updater + `latest.yml` | dogfood | CI cannot prove apply |
| G-02 | No install except `apply` | `autoInstallOnAppQuit: false` | unit: later≠apply; dogfood | — |
| G-03 | Flush snapshot/views before install | `saveSnapshot` + `flushAll` then `quitAndInstall` | review + dogfood | — |
| G-04 | Footer chrome only | `StatusBar.tsx` | dogfood | — |
| G-05 | Publisher verify on | win signing + default verify | ship review | signing env open |
| US-01 | Ready → Apply/Later, panels visible | `onUpdate` ready | unit reduce + dogfood | — |
| US-02 | Getting while running | phase `getting` | unit reduce | — |
| US-03 | Apply relaunch; idle work does not quit | `updateCommand('apply')` | dogfood | — |
| US-04 | Later hides rest of process; next launch may ready | phase `later` in-memory | unit reduce | — |
| US-05 | Non-ready → version-only | idle on error/non-win/unsigned fail | unit + dogfood | — |
| F-01–F-08 | As above + i18n keys | StatusBar, `i18n.ts` | `i18n.test.ts` | — |
| Constraints | No overlay; no telemetry; no jar wipe; PT/EN | ADR-003 | review | — |

## Decision

**electron-updater 6.x in main + IPC side channel** (ADR-003). Stay on electron-builder 26. GitHub is the feed via attached `latest.yml`. Apply is the only install. Shared reduce is the unit-tested contract. **Trade-off:** CI never downloads/applies; packing the externalized module is a build constraint.

### Alternatives rejected

- Homegrown poll/spawn — user B rejected
- Builder 27 upgrade — user C rejected

## Architecture

### Components

| Component | Existing/new | Responsibility | Inputs/outputs | Dependencies |
|---|---|---|---|---|
| `src/shared/updateStatus.ts` | new | reduce updater events → `UpdateStatus` | events in, status out | none |
| `src/main/updater.ts` | new | wire electron-updater 6; emit status; apply/later | GitHub feed | updater, persist flush |
| `src/main/index.ts` | existing | register IPC; start updater after window if packaged win32 | — | `updater.ts` |
| `src/shared/ipc.ts` + preload | existing | `onUpdate`, `updateCommand` | IPC | — |
| `store.ts` + `StatusBar.tsx` | existing | hold status; render getting/Apply/Later | `onUpdate` | i18n |
| `.github/workflows/release.yml` | existing | upload `latest.yml` / blockmap | dist | Windows job |
| `package.json` | existing | runtime dep `electron-updater` ^6 | — | builder 26 |

### Data flow

```
app ready && packaged && win32
        → checkForUpdates (autoDownload)
        → events → reduce → webContents.send('ops:update', status)
renderer onUpdate → StatusBar
        getting → copy
        ready → Apply / Later
        idle | later | error → version only
Apply → flush persist+views → quitAndInstall
Later → reduce later (in-memory)
Quit without Apply → no install; next launch may ready from cache
darwin/linux/dev → never check (idle)
```

### Impact

| Component/file | Impact | Risk | Required action |
|---|---|---|---|
| `updateStatus.ts` + test | new | wrong transitions | unit |
| `updater.ts` / `index.ts` | new wire | check in dev; steal quit | packaged win32 only; no notify API |
| `ipc.ts` / preload / `OpsourceAPI` | new methods | CJS preload drift | both files |
| `store.ts` / `App.tsx` | subscribe | leak listener | unsubscribe on unmount |
| `StatusBar.tsx` | buttons in h-8 | overflow | compact; no overlay |
| `i18n.ts` + test | keys | missing pt | both maps |
| `electron-builder.yml` / asar | include updater | missing module | files/asar unpack if needed |
| `release.yml` | extra assets | missing yml | fail-closed glob |
| `workspace.ts` / views / isolation | none | regression | do not touch |

## Contracts

### Public interfaces

```ts
export type UpdateStatus =
  | { phase: 'idle' }
  | { phase: 'getting' }
  | { phase: 'ready'; version: string }
  | { phase: 'later'; version: string }

export type UpdateCommand = 'apply' | 'later'

export type UpdateEvent =
  | { type: 'checking' }
  | { type: 'available'; version: string }
  | { type: 'not-available' }
  | { type: 'progress' }
  | { type: 'downloaded'; version: string }
  | { type: 'error' }
  | { type: 'later' }
  | { type: 'reset' }

export function reduceUpdateStatus(
  current: UpdateStatus,
  event: UpdateEvent
): UpdateStatus

// OpsourceAPI additions (preload + src/shared/ipc.ts)
onUpdate: (handler: (status: UpdateStatus) => void) => () => void
updateCommand: (command: UpdateCommand) => Promise<void>
```

`reduceUpdateStatus` (fail-closed to `idle` on `error` / `not-available` / `reset`):

| current | event | next |
|---|---|---|
| `idle` | `checking` \| `available` \| `progress` | `getting` |
| `getting` | `downloaded` + version | `ready` |
| `ready` | `later` | `later` |
| `later` | `downloaded` same version | `later` |
| `later` | `reset` (process start) | `idle` |
| any | `error` \| `not-available` | `idle` |
| `ready` | `apply` is **not** a reduce event (main installs) | — |

`updateCommand('later')` no-ops unless `phase === 'ready'`. `'apply'` no-ops unless `ready`.

IPC names: `ops:update` (push), `ops:updateCommand` (invoke).

### Data model

No snapshot schema. Later is process memory. Downloaded bits: electron-updater cache (OS userData), not `workspace.json`.

### Errors

| Case | Behavior |
|---|---|
| `!app.isPackaged` or `platform !== 'win32'` | never start updater; `idle` |
| Feed missing / network / signature mismatch | `error` → `idle`; no chrome copy |
| `apply` when not ready | resolve; no quit |
| `later` when not ready | resolve; no change |
| `quitAndInstall` throws | stay `ready`; no overlay |

### Changed boundaries

| Boundary | Current | Change | Failure | Compatibility |
|---|---|---|---|---|
| `OpsourceAPI` | version/platform/metrics | + `onUpdate`, `updateCommand` | missing preload = no UI | old clients N/A (same app) |
| GitHub Release assets | exe/dmg/AppImage/SHA256SUMS | + `latest.yml`, optional blockmap | missing yml fails Windows publish | installers unchanged |
| StatusBar | version string | getting / Apply / Later | overflow | no overlay |
| asar contents | no updater | electron-updater packed | runtime missing module | ship blocker |

## Failure and Edge Cases

| Failure mode | Detection | User/system behavior | Recovery/rollback | Evidence |
|---|---|---|---|---|
| Dev session | `isPackaged` false | idle | none | unit: no check |
| macOS/Linux | `platform` | idle | installer path | unit + US-05 |
| No `latest.yml` / 404 | updater error | idle | next launch retry | silent; dogfood |
| Signature fail | verify default on | idle | do not disable verify | G-05 |
| Later then crash | in-memory later lost | next launch may ready | OK per US-04 | unit later≠persist |
| Apply mid-save | debounce 250ms | flush before install | `saveSnapshot` + `flushAll` | G-03 |
| Per-machine UAC | NSIS dir | install may prompt or skip | open question | dogfood |
| Missing asar module | runtime throw | idle/error | fix files glob | pack inspect |

## Security, NFRs, and Operations

### Security and privacy

- Trust root: GitHub Release + Authenticode (ADR-001). Same-job `SHA256SUMS` is not the updater check; `latest.yml` sha512 + publisher verify are.
- No token in the client for the public repo.
- Game partitions untouched. Fail closed (idle) on verify/feed errors.
- Do not log cookie/session paths.

### Compatibility, rollout, and rollback

- Unsigned 0.2.0: one signed NSIS via existing download, then in-app apply.
- Rollout order: (1) signed Win CI + `latest.yml` on a tag, (2) client that only checks when packaged win32. Do not ship client against a tag with no yml.
- Rollback: ship next signed NSIS; do not `allowDowngrade`.
- Remove updater: drop IPC/dep; feed files can remain.

### Observability

- `console` on check/error in main. No telemetry. Dogfood G-01–G-04.

## Tests

- **Unit:** `reduceUpdateStatus` table above; later does not survive `reset`; error → idle. `src/shared/updateStatus.test.ts`.
- **Unit:** i18n keys for getting/apply/later exist in `en` and `pt` (`i18n.test.ts`).
- **Integration:** none in CI (no Electron updater job).
- **Platform / e2e:** G-01–G-04 dogfood on a tagged signed Windows build with `latest.yml`.
- **Gates:** `pnpm test` ; `pnpm typecheck` ; `pnpm verify:isolation` must stay green **without** partition changes.

## Sequencing

1. Shared `UpdateStatus` / `reduceUpdateStatus` + tests — no dependencies.
2. `OpsourceAPI` + preload + store subscribe — depends on 1 because UI consumes the type.
3. Main `updater.ts` + flush-then-apply; start only packaged win32 — depends on 2 because it must emit the contract.
4. StatusBar + i18n — depends on 2.
5. Pack `electron-updater` (files/asar) — depends on 3 because runtime import is external.
6. Release glob `latest.yml` + blockmap, fail-closed — depends on 5 because a client without a feed is a dead Apply.
7. Dogfood G-01 after a **signed** tag that includes yml — depends on 5–6 and ADR-001 signing.

## Open Questions

- Windows signing vendor/env (`WIN_CSC_LINK` or equivalent) — ship gate, not this design.
- Exact `dist/` filenames for `latest.yml` / blockmap on builder 26 NSIS (confirm on first pack).
- Per-user vs per-machine UAC on apply.

## Architecture Decision Records

- [ADR-001](adrs/adr-001.md) — Authenticode gate
- [ADR-002](adrs/adr-002.md) — chrome-strip MVP
- [ADR-003](adrs/adr-003.md) — electron-updater 6.x + IPC side channel
