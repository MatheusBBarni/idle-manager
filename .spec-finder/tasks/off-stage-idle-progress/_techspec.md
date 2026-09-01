# Off-stage idle progress — Technical Specification

## Context

- **PRD:** `.spec-finder/tasks/off-stage-idle-progress/_prd.md`
- Seam: `applyStage` hides running `WebContentsView`s with `setVisible(false)` when there is no panel (other tab) or `overlayOpen`. Selected design: **shared placement predicate**, **local-origin fixture**, **off-screen park preferred**, **production hide only if a knob passes** ([ADR-002](adrs/adr-002.md)).

### Evidence

| Kind | Finding/constraint | Source | Version/date | Design consequence |
|---|---|---|---|---|
| Repository | Other-tab / overlay → `setVisible(false)`; contents live until close | `src/main/views.ts` `applyStage` | 2026-09-01 | Keep-alive = placement, not destroy |
| Repository | Vitest = `src/shared`; isolation CLI; no Electron unit CI | `vitest.config.ts`, `package.json` | 2026-09-01 | Predicate unit-tested; fixture not CI |
| Repository | RAM don’t-paint spike never passed; production still attach-and-hide | `running-session-performance` task_03 | 2026-08-31 | Do not revive a RAM diet |
| Official docs | Throttling-off keeps **window** visibility `visible`; window-global since 28 | [webContents](https://www.electronjs.org/docs/latest/api/web-contents) | Electron 37.10.3 | Keep flags; they do not document view hide |
| Official docs | `setVisible(false)` = hide from display only | [View](https://www.electronjs.org/docs/latest/api/view) | 37.10.3 | Must measure view-level visibility |
| User decision | No IPC; spike-gated stop; local fixture host-OK; park-first | TechSpec Qs + [ADR-002](adrs/adr-002.md) | 2026-09-01 | Locks this spec |
| Inference | Park with ≥ 8×8 avoids today’s tiny-bounds hide | `applyStage` `< 8` | 2026-09-01 | Park size floor = 8 |

## Technical Goals and Non-Goals

### Goals

- Keep running `webContents` alive without `document.hidden` / stalled timers when off-stage or overlay-hidden — G-01, G-02, F-01, F-02
- Returning to a running account must not reload — F-03, US-03
- Close remains `destroyView`; partitions unchanged — F-04, F-05, US-04, US-05
- No new chrome, IPC, or snapshot fields — G-03, F-06
- Ship production placement only after a passing local fixture — failure policy

### Non-Goals

- RAM don’t-paint / Task Manager diet — other packet; not a pass criterion
- Game `executeJavaScript`, inject, bots — PRD
- Always-paint over dialogs — PRD
- New IPC, `StageReport` fields, persisted flags — user contracts A
- Electron unit CI, Windows-only fixture host — user evidence A
- Single-layout / minimize as success gates — PRD
- Removing Chromium anti-throttle switches or setting game `backgroundThrottling: true`

## Requirement Traceability

| PRD ID | Technical obligation | Component/interface | Verification | Status/gap |
|---|---|---|---|---|
| G-01 | Other-tab running views use a passing keep-alive placement | `gameViewPlacement` + `applyStage` | fixture + Windows journal | Journal not CI |
| G-02 | Overlay uses the same placement, not on-stage paint | same | fixture + journal | same |
| G-03 | No live-cue chrome | no renderer work | review | — |
| US-01 | No panel → park/detach, not destroy | `applyStage` | fixture + journal | — |
| US-02 | `overlayOpen` → park/detach, chrome usable | `applyStage` | fixture (no cover) | — |
| US-03 | No reload on re-paint | live map unchanged | journal + no `loadURL` on show | — |
| US-04 | Close → `destroyView` | `syncViews` | existing workspace tests | — |
| US-05 | `partitionForAccount` unchanged | session | `pnpm verify:isolation` | — |
| F-01–F-06 | As goals/stories | views + shared predicate | same | — |
| Constraints | persist per id; no pause/discard; no inject; overlay may hide for chrome | ADR-002 | isolation + review | — |

## Decision

**Off-screen park, spike-gated** ([ADR-002](adrs/adr-002.md)): derive `paint` vs `park` in shared code from today’s `StageReport` + popped-out; measure three knobs on a local fixture; change production `applyStage` only for a passing keep-alive knob (park preferred, then detach). **Trade-off:** if no knob passes, production hide stays as today and this packet stops.

### Alternatives rejected

- Detach-first — user chose park; RAM overlap
- Flags only — hide surface unchanged
- Visibility IPC / game JS — forbidden contracts

## Architecture

### Components

| Component | Existing/new | Responsibility | Inputs/outputs | Dependencies |
|---|---|---|---|---|
| `src/shared/gameViewPlacement.ts` | new, small | `gameViewPlacement` | StageReport + poppedOut → `'paint' \| 'park'` | tests |
| `src/main/views.ts` `applyStage` | existing | Paint vs park/detach after spike | live map, `StageReport` | predicate, Electron View |
| Local fixture page | new, spike-only | visibility + interval + cover probes | `executeJavaScript` on **local** origin | isolationVerify pattern |
| `src/main/index.ts` switches | existing | Unchanged anti-throttle | — | — |
| `workspace.ts` / preload / chrome | existing | Unchanged | — | — |

### Data flow

```
ops:reportStage (unchanged StageReport)
  → applyStage
  → for each live running view (not popped-out):
       placement = gameViewPlacement({ poppedOut, overlayOpen, panel })
       paint  → addChildView, setVisible(true), bounds = panel.contents
       park   → (if park shipped) addChildView, setVisible(true), off-chrome bounds ≥ 8×8
                (if detach shipped) removeChildView, do not setVisible(false)
                (if none shipped) today's setVisible(false)
  → popped-out: setVisible(true) in extra window (today)
syncViews: running ⇔ live view; closed → destroyView (today)
```

### Impact

| Component/file | Impact | Risk | Required action |
|---|---|---|---|
| `gameViewPlacement.ts` + test | new | Wrong overlay/other-tab mapping | unit tests |
| `views.ts` | production only after fixture | Freeze or cover dialogs | fail-closed knobs |
| isolationVerify / partitions | none expected | accidental session change | `verify:isolation` if `views.ts` ships |
| renderer / IPC / snapshot | none | scope creep | do not edit |

## Contracts

### Public interfaces

`OpsourceAPI`, `StageReport`, `MetricsPayload`, and `parseSnapshot` **unchanged**.

```ts
export type GameViewPlacement = 'paint' | 'park'

export function gameViewPlacement(input: {
  poppedOut: boolean
  overlayOpen: boolean
  panel: { contents: { width: number; height: number } } | null
}): GameViewPlacement {
  if (input.poppedOut) return 'paint'
  const c = input.panel?.contents
  const onStage = Boolean(c && c.width >= 8 && c.height >= 8)
  if (!input.overlayOpen && onStage) return 'paint'
  return 'park'
}
```

- `'paint'`: on-stage panel, no overlay, or popped-out.
- `'park'`: other-tab (no/too-small panel) or confirm overlay. Never means destroy.
- Park bounds (main only, not IPC): `x: -10000, y: -10000`, width/height `max(lastContents, 8)` (fallback 800×600). Must not enter the `< 8` hide branch.
- Fixture pass (per knob): `document.visibilityState === 'visible'` **and** `setInterval` still increments over ≥ 2s **and** the game view does not cover the stage/overlay. Local privileged origin only.
- Ship rule: if baseline (`setVisible(false)`) already passes, **do not** change production hide. Else ship park if it passes, else detach if it passes, else **no** production change.

### Data model

No new persisted fields. Live map unchanged (`running` ⇔ view).

### Errors

No new user-facing errors. Fixture fail → that knob does not ship. All knobs fail → stop; do not throw at runtime.

### Changed boundaries

| Boundary | Current | Change | Failure | Compat |
|---|---|---|---|---|
| `applyStage` off-stage / overlay | `setVisible(false)`, stay child | park or detach if shipped | leave current | none |
| IPC / snapshot | as today | none | — | — |

## Failure and Edge Cases

| Failure mode | Detection | User/system behavior | Recovery/rollback | Evidence |
|---|---|---|---|---|
| Baseline already visible+ticking | fixture | no `applyStage` change | none | fixture journal |
| Park fails visibility/interval/cover | fixture | try detach | — | fixture |
| Detach fails too | fixture | production hide unchanged; packet stops | product ADR | fixture |
| Park covers dialog | cover probe | fail park | do not ship park | fixture |
| Return reloads | operator | forbidden | revert knob | G-01 journal |
| Renderer crash while parked | `render-process-gone` | existing `restartView` | unchanged | existing |
| Isolation leak | cross-jar | must not occur | revert `views.ts` | `verify:isolation` |
| Game self-pause despite fixture pass | in-game journal | G-01 miss; no inject | product ADR | dogfood |
| Tiny bounds `< 8` | placement | treat as park, not paint | — | unit |

## Security, NFRs, and Operations

### Security and privacy

Game views stay sandboxed, no preload, no game JS. Fixture `executeJavaScript` only on a local privileged origin (same class as `isolationVerify`). No telemetry.

### Compatibility, rollout, and rollback

Desktop app; no schema. Predicate can land before production paint. macOS may run the fixture; G-01 still Windows games. Rollback: revert `applyStage` (and optional predicate). Do not weaken isolation on any OS.

### Observability

No new URL logs. Spike notes in packet memory. G-01/G-02 = operator in-game journal.

## Tests

- **Unit:** `gameViewPlacement` — popped-out → paint; panel ≥ 8×8, `overlayOpen` false → paint; no panel → park; overlay true → park; 7×7 panel → park
- **Integration:** none new
- **Platform:** local fixture journal (baseline / park / detach) before production `applyStage`; Windows in-game journal after a shipped knob (not CI)
- **Gates:** `pnpm test` ; `pnpm typecheck` ; `pnpm verify:isolation` when `views.ts` production paint ships

## Sequencing

1. `gameViewPlacement` + unit tests — no production `applyStage` change.
2. Local fixture journal for baseline, park, detach — depends on step 1 only for the predicate under test; must not ship hide yet.
3. Production `applyStage` **only** for the ship rule in Contracts — depends on step 2 because fail-closed.
4. Existing gates — depend on steps 1 and 3 (3 skipped if no knob shipped).
5. Windows G-01/G-02 dogfood — depends on step 3 if a knob shipped; otherwise the packet has already stopped.

## Open Questions

- Exact park width/height when `lastBounds` is missing — non-blocking; default 800×600 at (−10000, −10000).
- Numeric fixture interval (≥ 2s) — non-blocking floor.

## Architecture Decision Records

- [ADR-001: Invisible keep-alive, same workflow](adrs/adr-001.md) — product approach
- [ADR-002: Off-screen park, spike-gated keep-alive](adrs/adr-002.md) — this design
