# Running-session performance — Technical Specification

## Context

- **PRD:** `.spec-finder/tasks/running-session-performance/_prd.md`
- Seam: `ops:metrics` under-counts (no GPU; chrome rAF as `fps`); `applyStage` hides off-stage views but leaves them as children. Selected design: **widen `MetricsPayload`**, **chrome warning without a stage overlay**, **spike-gated don’t-paint** ([ADR-002](adrs/adr-002.md)).

### Evidence

| Kind | Finding/constraint | Source | Version/date | Design consequence |
|---|---|---|---|---|
| Repository | `AggregateMetrics` = renderer-sum + `fps` from chrome rAF | `types.ts`, `metrics.ts`, `Shell.tsx` | 2026-08-31 | Widen payload; stop rAF meter |
| Repository | Off-stage: `setVisible(false)`, still a child | `views.ts` `applyStage` | 2026-08-31 | Diet = detach, not destroy |
| Repository | Confirm dialogs set `overlayOpen` → hide game views | `Stage.tsx` | 2026-08-31 | Start warning must not use that modal |
| Repository | Vitest = `src/shared`; isolation CLI | `package.json` | 2026-08-31 | No new Electron CI |
| Official docs | `getAppMetrics()` includes `type: GPU` | [ProcessMetric](https://www.electronjs.org/docs/latest/api/structures/process-metric) | Electron 37 | GPU fields nullable |
| Official docs | `backgroundThrottling: false` keeps visibility `visible`; window-global since 28 | [webContents](https://www.electronjs.org/docs/latest/api/web-contents) | 37.10.3 | Do not throttle games |
| User decision | Widen payload; no new persist; split fail-closed; shared tests; design A | TechSpec Qs + [ADR-002](adrs/adr-002.md) | 2026-08-31 | Locks this spec |
| Inference | Detach may cut compositor more than JS heap | Hidden views still run | 2026-08-31 | Spike uses Task Manager, not status-bar sum alone |

## Technical Goals and Non-Goals

### Goals

- Collect whole-app + GPU cost on existing `ops:metrics` — G-03, F-05
- Stop publishing chrome rAF as `fps` — F-05, US-05
- Derive 7th-running warning without snapshot fields or stage overlay — G-04, F-06
- Don’t-paint off-stage / minimized chrome only after a passing Windows spike; `webContents` stay alive — G-01, G-02, F-01, F-07
- Close remains `destroyView`; partitions unchanged — F-03, F-04

### Non-Goals

- Park, auto-sleep, hard cap, telemetry, game `executeJavaScript` — PRD
- New IPC channel, persisted warning flag, Electron unit CI — user decisions
- Removing the three Chromium switches or `backgroundThrottling: true` on games — G-02
- Dieting on-stage grids or popped-out windows — known don’t-paint limit
- Blur-as-occlusion — Windows has no API
- New packages

## Requirement Traceability

| PRD ID | Technical obligation | Component/interface | Verification | Status/gap |
|---|---|---|---|---|
| G-01 | Don’t-paint after passing spike | `applyStage` + window events | Windows journal | Not in CI |
| G-02 | No throttle/reload/destroy for running | flags unchanged | spike fixture + dogfood | Guest games not in CI |
| G-03 | GPU + process totals in chrome | `MetricsPayload` / status / sidebar | shared tests + journal vs Task Manager | GPU may be null |
| G-04 | Warn at 7th running start, never block | `shouldWarnRunningStart` | shared tests + chrome review | — |
| US-01 | 3–6 + other apps | diet if passed | dogfood | — |
| US-02 | Hidden still ticks | detach ≠ destroy | spike + dogfood | — |
| US-03 | Close drops live, keeps login | `destroyView` | workspace tests | — |
| US-04 | Jars distinct | `partitionForAccount` | `pnpm verify:isolation` | — |
| US-05 | Actable cost, no fake FPS | status/sidebar | unit + review | — |
| US-06 | 7th warned, 4th not | warning predicate | unit | — |
| F-01–F-07 | As goals/stories | metrics + views + chrome | same | — |
| Constraints | persist per id; no pause; close-without-wipe; Windows measure; no overlay over stage; no telemetry/bot | ADR-002 | isolation + review | — |

## Decision

**Metrics chrome + don’t-paint diet** ([ADR-002](adrs/adr-002.md)): widen `MetricsPayload` on `ops:metrics`; drop the chrome rAF loop; show GPU/process totals in status (and per-account renderer stats as today); warn in **status/sidebar** when a start would make running count ≥ 7; don’t-paint via `removeChildView` only for knobs that pass a Windows spike. **Trade-off:** G-01 not in CI; warning is not a modal (would hide views).

### Alternatives rejected

- New `ops:diagnostics` — extra stream
- Persist dismissed warning — user chose nothing new on disk
- All-or-nothing packet — contradicts F-07
- Shell-only diet — does not cheapen game renderers
- Throttle hidden games — G-02

## Architecture

### Components

| Component | Existing/new | Responsibility | Inputs/outputs | Dependencies |
|---|---|---|---|---|
| `src/shared/types.ts` `MetricsPayload` | existing | Contract | GPU-nullable aggregates | renderer, metrics |
| `src/shared/metricsDisplay.ts` (new, small) | new | `shouldWarnRunningStart`, optional format helpers | running count → boolean | chrome, tests |
| `src/main/metrics.ts` | existing | `app.getAppMetrics()` by `type` | `MetricsPayload` | `liveViews` |
| `src/main/index.ts` | existing | 1s send; no rAF listener required | `ops:metrics` | chrome |
| `src/renderer/.../Shell.tsx` | existing | Remove rAF FPS loop | — | — |
| StatusBar / Sidebar | existing | Show process/GPU; warning text | store metrics + running count | i18n |
| `src/main/views.ts` | existing | Paint vs detach after spike | `StageReport`, window vis | live map |
| `isolationVerify.ts` | existing | Unchanged | CLI | partitions |

### Data flow

```
collectMetrics(live, getAppMetrics)
  → perAccount from Tab pids (as today)
  → aggregate.memoryBytes / cpu from all processes
  → gpu* from type === 'GPU' or null
  → fps: null (no chrome rAF)
  → ops:metrics → Zustand → StatusBar/Sidebar

account/setStatus running
  → if shouldWarnRunningStart(currentRunning) → chrome warning visible
  → start still commits (never blocked)

syncViews: running ⇔ live WebContentsView
applyStage / minimize|restore|show|hide
  → shouldPaintGameView ? addChildView+bounds : setVisible(false)+removeChildView
  → webContents alive; throttling stays false
```

### Impact

| Component/file | Impact | Risk | Required action |
|---|---|---|---|
| `types.ts` / `metrics.ts` | Contract | Fake-low GPU | null not 0 when missing |
| `Shell.tsx` | Remove rAF | Status FPS empty | don’t substitute chrome rAF |
| StatusBar / Sidebar / i18n | Copy | Overlay temptation | status/sidebar only |
| `views.ts` / `index.ts` | Paint policy | Visibility/timer regression | spike fail-closed |
| `workspace.ts` | None | Accidental persist | do not add fields |

## Contracts

### Public interfaces

`OpsourceAPI` methods unchanged (`onMetrics` still `MetricsPayload`).

```ts
export type AccountMetrics = {
  cpu: number
  memoryBytes: number
  lastActivityAt: number | null
}

export type AggregateMetrics = {
  cpu: number
  memoryBytes: number
  gpuCpu: number | null
  gpuMemoryBytes: number | null
  fps: number | null
  uptimeMs: number
}

export type MetricsPayload = {
  at: number
  perAccount: Record<string, AccountMetrics>
  aggregate: AggregateMetrics
}

export const RUNNING_START_WARN_AFTER = 6

export function shouldWarnRunningStart(runningCountBeforeStart: number): boolean {
  return runningCountBeforeStart >= RUNNING_START_WARN_AFTER
}
```

- `memoryBytes` / `cpu` on aggregate = **all** `getAppMetrics()` processes (not renderer-sum only).
- `gpu*` = the `type === 'GPU'` process, or `null` if absent (never `0` as a stand-in).
- `fps` is `null` in V1 (no chrome rAF; no game instrumentation). Status must not display a fabricated FPS.
- `shouldWarnRunningStart(6)` is true (this start is the 7th). Starts at 0–5 running are silent. Never throws; never blocks `account/setStatus`.

Internal paint predicate (not IPC), same as `live-account-ram`:

```ts
function shouldPaintGameView(args: {
  poppedOut: boolean
  panel: PanelGeometry | undefined
  overlayOpen: boolean
  chromeVisible: boolean
  chromeMinimized: boolean
}): boolean
```

`true` iff not popped-out **and** panel defined **and** `!overlayOpen` **and** contents ≥ 8×8 **and** chrome visible **and** not minimized.

### Data model

No new persisted fields. `parseSnapshot` unchanged.

### Errors

No new user-facing errors. Missing GPU → `null` + i18n omitted/unknown, not a dialog. Spike failure → non-ship of that knob, not a runtime error.

### Changed boundaries

| Boundary | Current | Change | Failure | Compat |
|---|---|---|---|---|
| `AggregateMetrics` | renderer-sum + fps number | whole-app + gpu nullables + fps null | omit GPU | in-app only; ship renderer+main together |
| `ops:fps` | chrome rAF | unused / ignore | — | stop sending |
| Start warning | none | status/sidebar when predicate true | start still happens | no snapshot |
| `applyStage` off-stage | hide, stay child | also `removeChildView` if knob passed | skip knob | none |
| Chrome minimized | views in tree | detach if knob 2 passed | re-apply on restore | none |

## Failure and Edge Cases

| Failure mode | Detection | Behavior | Recovery | Evidence |
|---|---|---|---|---|
| No GPU process | `type !== 'GPU'` | `gpu* = null`; chrome omits GPU line | none | unit |
| Spike: no Task Manager drop / visibility/interval fail / not Windows | journal | that knob does not ship | paint policy unchanged | spike notes |
| Restore blank panels | operator | re-`applyStage` on restore/show | revert knob 2 | dogfood |
| Renderer crash after detach | `render-process-gone` | existing `restartView` | unchanged | existing |
| Isolation leak | cross-jar | must not occur | revert diet | `verify:isolation` |
| Warning as Modal | review | forbidden (`overlayOpen` hides games) | use status/sidebar | review |
| Start all crossing 7 | running count | warn, still start all | — | unit + review |

## Security, NFRs, and Operations

### Security and privacy

Game views stay sandboxed, no preload, no diet JS on game origins. Spike fixture only. No telemetry. Metrics are local IPC.

### Compatibility, rollout, and rollback

Desktop app: ship main+renderer together. No schema migration. Metrics always on. Diet always-on only after passing knobs; macOS/Linux may share paint rules without claiming G-01. Rollback: revert payload consumers and/or `views.ts`.

### Observability

No new URL/key logs. Existing 1s metrics. G-01 evidence = Task Manager + journal.

## Tests

- **Unit:** `shouldWarnRunningStart` (0–5 false, 6+ true); aggregate shape (gpu null vs number; fps null); i18n keys in `en`/`pt`/`es`/`zh-Hans`; existing workspace/partition/layout tests
- **Integration:** none new
- **Platform:** Windows spike journal (knob 1 off-stage detach, knob 2 minimize/hide) before production diet; G-01–G-03 dogfood after
- **Gates:** `pnpm test` ; `pnpm typecheck` ; `pnpm verify:isolation` when `views.ts` / partitions change

## Sequencing

1. `MetricsPayload` + `collectMetrics` + chrome display + remove rAF + warning predicate — no diet.
2. Windows spike journal for don’t-paint knobs — independent of step 1 for measurement, but chrome totals help the journal; do not change production paint yet.
3. If a knob passed, `applyStage` / window listeners **only for that knob** — depends on step 2 because fail-closed.
4. Existing gates — depends on steps 1 and 3.
5. Windows dogfood G-01–G-04 — depends on step 1 always; step 3 only if a knob shipped.

If step 2 fails both knobs, stop diet. Metrics + warning remain.

## Open Questions

- Numeric Task Manager baseline (journal, not a design branch).
- Whether status shows one “RAM” (process total) plus optional GPU, or two lines — non-blocking layout.

## Architecture Decision Records

- [ADR-001: Honest cost, then quieter farm](adrs/adr-001.md) — product approach
- [ADR-002: Metrics chrome + don’t-paint](adrs/adr-002.md) — this design
