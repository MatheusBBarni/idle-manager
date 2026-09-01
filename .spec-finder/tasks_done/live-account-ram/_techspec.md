# Live-account RAM — Technical Specification

## Context

- **PRD:** `.spec-finder/tasks/live-account-ram/_prd.md`
- Seam: `syncViews` / `applyStage` keep every running `WebContentsView` in the chrome tree (off-stage only `setVisible(false)`), with process-wide anti-backgrounding switches. Selected design: **don't-paint** off-stage and minimized chrome, **spike-gated and fail-closed**, no public contract change ([ADR-002](adrs/adr-002.md)).

### Evidence

| Kind | Finding/constraint | Source | Version/date | Design consequence |
|---|---|---|---|---|
| Repository | Running → live view; close destroys view; off-stage stays a child | `src/main/views.ts` | 2026-08-31 | Diet = detach, not destroy |
| Repository | Three switches keep renderers hot | `src/main/index.ts` | 2026-08-31 | Do not remove them in V1 |
| Repository | Vitest is `src/shared` only; isolation is Electron CLI | `package.json`, `partition.test.ts` | 2026-08-31 | No new Electron CI |
| Official docs | `backgroundThrottling: false` is window-global; affects Page Visibility | [webContents](https://raw.githubusercontent.com/electron/electron/v37.10.3/docs/api/web-contents.md) | 37.10.3 | No per-view throttle |
| Official docs | Windows Page Visibility ignores occlusion; throttling-off stays `visible` | [BrowserWindow](https://raw.githubusercontent.com/electron/electron/v37.10.3/docs/api/browser-window.md) | 37.10.3 | No blur-as-occlusion |
| Official docs | `--disable-renderer-backgrounding` is process-global | [command-line-switches](https://raw.githubusercontent.com/electron/electron/v37.10.3/docs/api/command-line-switches.md) | 37.10.3 | Switch surgery is approach B (rejected) |
| User decision | Main-process only; always-on; spike fail-closed; existing gates; don't-paint | ADR-002 | 2026-08-31 | Locks this spec |
| Inference | Detach may free GPU/compositor more than JS heap | Hidden views still run | 2026-08-31 | Spike must measure Task Manager, not status-bar sum alone |

## Technical Goals and Non-Goals

### Goals

- Paint a running non-popped-out view only when it has a current stage panel and the chrome window is visible and not minimized — G-01, F-01
- Keep `webContents` alive (no destroy, no reload, no partition merge, no throttling/visibility flags changed) — G-02, F-02, F-04
- Close remains `destroyView` + persist jar — F-03, US-03
- No IPC, snapshot, metrics, preload, or chrome change — G-03, F-05
- Spike then fail-closed per knob; existing gates only — PRD stop rule

### Non-Goals

- Auto-sleep, discard, Park state, live cap, pressure chrome, metrics redesign — PRD out of scope
- Removing the three Chromium switches or setting `backgroundThrottling: true` — G-02
- Treating `blur` as occlusion; Windows covered-but-visible window — no API
- Dieting a fully on-stage grid (second monitor) — known limit of don't-paint
- Dieting popped-out `BrowserWindow`s in V1
- New packages, IPC, `--verify-live-diet`, `executeJavaScript` into game origins
- Cache/`js-flags` heap caps — rejected approach C
- Usage telemetry

## Requirement Traceability

| PRD ID | Technical obligation | Component/interface | Verification | Status/gap |
|---|---|---|---|---|
| G-01 | Don't-paint off-stage + minimized chrome after passing spike | `applyStage` + window minimize/hide | Windows spike + dogfood journal | Not in CI |
| G-02 | No throttle/visibility/reload/destroy for running | `views.ts` flags unchanged; no `loadURL` for RAM | Spike fixture; dogfood | Guest games not in CI |
| G-03 | No new chrome/verbs | renderer untouched | review | — |
| US-01 | 3–6 running + other apps | same as G-01 | dogfood | — |
| US-02 | Hidden/other-tab still tick | detach ≠ destroy | spike fixture + dogfood | — |
| US-03 | Close drops live cost, keeps login | `destroyView` + persist partition | existing workspace tests + dogfood | — |
| US-04 | Jars stay distinct | `partitionForAccount` unchanged | `pnpm verify:isolation` | — |
| F-01–F-05 | As goals/stories | `views.ts` | same | — |
| Constraints | persist per account id; no pause/discard/reload; close-without-wipe; Windows measure; no telemetry; not a bot; no new overlay | ADR-002 | isolation + review | — |

## Decision

Don't-paint diet ([ADR-002](adrs/adr-002.md)): keep today's always-awake flags; detach (don't destroy) views that are off-stage or whose chrome window is minimized/hidden; spike each knob on Windows; ship only knobs that drop Task Manager working set without flipping visibility or clamping timers. **Trade-off:** on-stage tiles stay expensive; CI does not prove RAM.

### Alternatives rejected

- Relax backgrounding switches — user rejected; G-02 risk
- Cache/V8 caps — user rejected
- Best-effort land without spike — user rejected
- New live-diet CLI / metrics shape — contract A

## Architecture

### Components

| Component | Existing/new | Responsibility | Inputs/outputs | Dependencies |
|---|---|---|---|---|
| `src/main/views.ts` `applyStage` | existing | Paint vs detach running views | `StageReport`, window visible/minimized | `chromeWindow`, `live` map |
| `src/main/index.ts` window events | existing | Notify stage to re-apply on minimize/restore/show/hide | window events | `applyStage` |
| Command-line switches | existing | Unchanged timer/visibility contract | process start | Chromium |
| `src/main/isolationVerify.ts` | existing | Unchanged jar proof | `--verify-isolation` | partitions |
| Renderer / IPC / snapshot | existing | Unchanged | — | — |

### Data flow

```
syncViews: running ⇔ live WebContentsView (unchanged create/destroy)
        │
applyStage / window minimize|restore|show|hide
        │
        ├─ poppedOut → paint in pop window (no V1 diet)
        ├─ has panel && !overlay && bounds ok && chrome visible && !minimized
        │     → addChildView, setBounds, setVisible(true)
        └─ else
              → setVisible(false), removeChildView if attached
              → webContents stays; no reload; throttling stays false
```

```
Windows spike (pre-ship)
  fixture page (not game origin)
  Knob1 off-stage detach → Task Manager + interval + visibilityState
  Knob2 minimize/hide    → same
  fail knob → do not ship that knob
```

### Impact

| Component/file | Impact | Risk | Required action |
|---|---|---|---|
| `src/main/views.ts` | Paint policy | Visibility/timer regression | Spike; fail-closed |
| `src/main/index.ts` | Minimize/show listeners only | Missed restore → blank panels | Re-`applyStage` on restore/show |
| `src/main/metrics.ts` | None | Status bar still understates GPU | Dogfood uses Task Manager |
| `isolationVerify.ts` | None | Must stay green | `pnpm verify:isolation` |
| Renderer, `workspace.ts`, IPC | None | Accidental Park/metrics | Do not touch |

## Contracts

### Public interfaces

No change to `OpsourceAPI`, `WorkspaceSnapshot`, `WorkspaceAction`, `MetricsPayload`, `StageReport`, `partitionForAccount`, or `--verify-isolation`.

Internal paint predicate (not exported, not IPC):

```ts
function shouldPaintGameView(args: {
  poppedOut: boolean
  panel: PanelGeometry | undefined
  overlayOpen: boolean
  chromeVisible: boolean
  chromeMinimized: boolean
}): boolean
```

- `true` iff `poppedOut` is false **and** `panel` is defined **and** `!overlayOpen` **and** `panel.contents.width >= 8` **and** `panel.contents.height >= 8` **and** `chromeVisible` **and** `!chromeMinimized`.
- `poppedOut === true` is handled by the pop-out path (always paint in the pop window); this predicate is not used there.

### Data model

No new persisted fields. `live` map remains `accountId → WebContentsView` for `status === 'running'` only.

### Errors

No new user-facing errors. Spike failure is a **non-ship**, not a runtime dialog.

### Changed boundaries

| Boundary | Current contract | Change | Failure behavior | Compatibility/migration |
|---|---|---|---|---|
| `applyStage` off-stage | `setVisible(false)`, remains child | also `removeChildView` if knob 1 passed | If visibility/timers break, do not ship knob | none |
| Chrome minimized/hidden | views stay in tree | detach if knob 2 passed | Restore must re-attach | none |
| Running account process | alive until close | unchanged | crash → existing `restartView` | none |

## Failure and Edge Cases

| Failure mode | Detection | User/system behavior | Recovery/rollback | Evidence |
|---|---|---|---|---|
| Spike: no Task Manager drop | journal vs baseline | no diet ships | none | spike notes |
| Spike: `visibilityState !== 'visible'` or interval stalls | fixture | that knob does not ship | do not enable throttling | spike notes |
| Restore shows empty holes | operator | re-`applyStage` on restore/show | revert if sticky | dogfood |
| Renderer crash after detach | `render-process-gone` | existing `restartView` | unchanged | existing path |
| Isolation leak | cookies/`localStorage` cross-jar | must not occur | revert diet | `pnpm verify:isolation` |
| Overlay open | `overlayOpen` | don't-paint (same as hide) | re-paint when closed | existing Stage report |

## Security, NFRs, and Operations

### Security and privacy

Game views stay `sandbox: true`, no Node, no preload, no diet `executeJavaScript` on game origins. Spike uses a local fixture (same class as `opsource-iso`). Partitions stay `persist:opsource-account-{accountId}`.

### Compatibility, rollout, and rollback

Always-on after a passing knob. No schema migration. Windows is the spike/dogfood OS; macOS/Linux keep the same paint rules if shipped, without claiming G-01. Rollback: revert `views.ts` / window listeners.

### Observability

No new logs of URLs or keys. Existing 1s metrics IPC unchanged. G-01 evidence is Task Manager + packet journal.

## Tests

- **Unit:** existing `src/shared/**/*.test.ts` (workspace close, partitions, layout panels). No Electron in Vitest. No new required helper test (evidence A).
- **Integration:** none new.
- **Platform:** Windows spike journal (two knobs) before production diet; G-01/G-02 dogfood after.
- **Gates:** `pnpm test` ; `pnpm typecheck` ; `pnpm verify:isolation`

## Sequencing

1. Windows spike journal for knob 1 and knob 2 — no production diet yet.
2. If a knob passed, change `applyStage` (and minimize/show re-apply) **only for that knob** — depends on step 1 because fail-closed.
3. Run existing gates — depends on step 2 because isolation must not regress.
4. Windows dogfood G-01/G-02 — depends on step 2 because only a shipped knob can be judged.

If step 1 fails both knobs, stop. Do not invent Park.

## Open Questions

- Numeric Task Manager baseline (filled by spike/G-01 journal, not a design branch).
- Whether GPU working set drops enough on minimize when Page Visibility stays `visible` (knob 2 may no-op; then ship knob 1 only).

## Architecture Decision Records

- [ADR-001: Invisible live-farm diet](adrs/adr-001.md) — product approach
- [ADR-002: Don't-paint live views](adrs/adr-002.md) — spike-gated detach, flags unchanged
